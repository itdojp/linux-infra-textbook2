# 第14章：監視とログ - システムの可観測性

## 14.1 はじめに：見えないものは管理できない

「サーバーが落ちました！」

深夜2時、緊急の電話で起こされたエンジニア。しかし、何が原因でサーバーが停止したのか分からない。ログはどこ？CPU使用率は？メモリは足りていた？ディスクは？

このような「事後の調査」から、「事前の予防」へ。さらには「リアルタイムの対応」へ。システム監視の進化は、私たちの睡眠時間を守り、サービスの品質を向上させてきました。

本章では、「システムの可観測性（Observability）」という概念を通じて、現代のインフラ監視の本質を学びます。

## 14.2 「動いているか分からない」という恐怖からの脱却

### 監視の進化

#### 第1世代：死活監視（1990年代）
```bash
# 単純なping監視
while true; do
    if ! ping -c 1 server.example.com > /dev/null 2>&1; then
        echo "Server is down!" | mail -s "Alert" admin@example.com
    fi
    sleep 60
done
```

問題点は次のとおりです。
- サーバーは生きているが、サービスは死んでいる場合を検出できない
- 原因が分からない
- 予防ができない

#### 第2世代：リソース監視（2000年代）
```bash
# Nagios/Zabbixによる監視
# CPU、メモリ、ディスクの閾値監視
if [ $(cpu_usage) -gt 80 ]; then
    send_alert "CPU usage is high"
fi
```

改善点は次のとおりです。
- リソースの状態が分かる
- 閾値によるアラート

課題は次のとおりです。
- 閾値の設定が難しい
- 相関関係が見えない
- 根本原因の特定が困難

#### 第3世代：可観測性（2010年代〜）
```text
Observability = Metrics + Logs + Traces

システムの内部状態を、外部からの観測によって理解できる能力
```

## 14.3 メトリクス、ログ、トレースの三本柱

### メトリクス（Metrics）- 数値で見る健康状態

#### 基本的なメトリクス収集
```bash
# prometheus_setup.sh - Prometheusによるメトリクス収集
cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
  
  - job_name: 'application'
    static_configs:
      - targets: ['app1:8080', 'app2:8080']
    metrics_path: '/metrics'
EOF

# Node Exporterの起動（システムメトリクス）
docker run -d \
    --name node-exporter \
    -p 9100:9100 \
    -v "/:/host:ro,rslave" \
    quay.io/prometheus/node-exporter:latest \
    --path.rootfs=/host

# Prometheusの起動
docker run -d \
    --name prometheus \
    -p 9090:9090 \
    -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus
```

#### カスタムメトリクスの実装
```python
# app_metrics.py - アプリケーションメトリクス
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import time

# メトリクスの定義
request_count = Counter('http_requests_total', 
                       'Total HTTP requests', 
                       ['method', 'endpoint', 'status'])

request_duration = Histogram('http_request_duration_seconds',
                           'HTTP request latency',
                           ['method', 'endpoint'])

active_users = Gauge('active_users', 'Number of active users')

# メトリクスの記録
@app.route('/api/users')
@request_duration.labels(method='GET', endpoint='/api/users').time()
def get_users():
    request_count.labels(method='GET', endpoint='/api/users', status=200).inc()
    # 実際の処理
    return jsonify(users)

# メトリクスエンドポイント
@app.route('/metrics')
def metrics():
    return generate_latest()
```

### ログ（Logs）- 詳細な出来事の記録

#### 構造化ログの実装
```python
# structured_logging.py
import json
import logging
import time
import uuid
from datetime import datetime

class StructuredLogger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)
        handler = logging.StreamHandler()
        handler.setFormatter(self.JsonFormatter())
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    class JsonFormatter(logging.Formatter):
        def format(self, record):
            log_obj = {
                'timestamp': datetime.utcnow().isoformat(),
                'level': record.levelname,
                'logger': record.name,
                'message': record.getMessage(),
                'module': record.module,
                'function': record.funcName,
                'line': record.lineno
            }
            
            # 追加のコンテキスト情報
            if hasattr(record, 'user_id'):
                log_obj['user_id'] = record.user_id
            if hasattr(record, 'order_id'):
                log_obj['order_id'] = record.order_id
            if hasattr(record, 'request_id'):
                log_obj['request_id'] = record.request_id
            if hasattr(record, 'duration'):
                log_obj['duration'] = record.duration
            
            return json.dumps(log_obj)

# 使用例
logger = StructuredLogger(__name__).logger

def perform_order_processing(order_id):
    # デモ用のスタブ（実運用ではビジネスロジックに置き換える）
    time.sleep(0.1)
    return {"order_id": order_id, "status": "ok"}

def process_order(order_id, user_id):
    start_time = time.time()
    logger.info("Processing order", extra={
        'user_id': user_id,
        'order_id': order_id,
        'request_id': str(uuid.uuid4())
    })
    
    try:
        # 注文処理
        result = perform_order_processing(order_id)
        
        duration = time.time() - start_time
        logger.info("Order processed successfully", extra={
            'user_id': user_id,
            'order_id': order_id,
            'duration': duration,
            'status': 'success'
        })
        
    except Exception as e:
        logger.error("Order processing failed", extra={
            'user_id': user_id,
            'order_id': order_id,
            'error': str(e),
            'status': 'failed'
        })
        raise

if __name__ == "__main__":
    process_order(order_id="order-123", user_id="user-456")
```

#### ログ集約システム（ELK Stack）
```yaml
# docker-compose-elk.yml
version: '3.7'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
      - "5000:5000/tcp"
      - "5000:5000/udp"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  filebeat:
    image: docker.elastic.co/beats/filebeat:7.15.0
    user: root
    volumes:
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - logstash

volumes:
  elasticsearch-data:
```

### トレース（Traces）- リクエストの旅路を追跡

#### 分散トレーシングの実装
```python
# distributed_tracing.py - OpenTelemetryによるトレーシング
from opentelemetry import trace
from opentelemetry.exporter.jaeger import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

# トレーサーの設定
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Jaegerエクスポーターの設定
jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)

# スパンプロセッサーの追加
span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

# 自動計装
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()

# カスタムスパン
@app.route('/api/process')
def process_request():
    with tracer.start_as_current_span("process_request") as span:
        span.set_attribute("user.id", get_user_id())
        
        # データベース操作
        with tracer.start_as_current_span("database_query"):
            data = fetch_from_database()
        
        # 外部API呼び出し
        with tracer.start_as_current_span("external_api_call"):
            result = call_external_api(data)
        
        # 結果の処理
        with tracer.start_as_current_span("process_result"):
            processed = process_data(result)
        
        return jsonify(processed)
```

## 14.4 予防的メンテナンスと迅速な障害対応

### 異常検知システムの構築

```python
# anomaly_detection.py - 機械学習による異常検知
import numpy as np
from sklearn.ensemble import IsolationForest
from prometheus_api_client import PrometheusConnect
import pandas as pd

class AnomalyDetector:
    def __init__(self, prometheus_url):
        self.prom = PrometheusConnect(url=prometheus_url)
        self.model = IsolationForest(contamination=0.1)
        
    def fetch_metrics(self, query, start_time, end_time):
        """Prometheusからメトリクスを取得"""
        result = self.prom.custom_query_range(
            query=query,
            start_time=start_time,
            end_time=end_time,
            step='1m'
        )
        return result
    
    def prepare_features(self, metrics_data):
        """特徴量の準備"""
        features = []
        
        for metric in metrics_data:
            values = [float(v[1]) for v in metric['values']]
            
            # 統計的特徴量
            features.append({
                'mean': np.mean(values),
                'std': np.std(values),
                'max': np.max(values),
                'min': np.min(values),
                'percentile_95': np.percentile(values, 95),
                'rate_of_change': np.mean(np.diff(values))
            })
        
        return pd.DataFrame(features)
    
    def train(self, historical_data):
        """正常時のデータで学習"""
        features = self.prepare_features(historical_data)
        self.model.fit(features)
    
    def detect_anomalies(self, current_data):
        """異常を検知"""
        features = self.prepare_features(current_data)
        predictions = self.model.predict(features)
        
        anomalies = []
        for i, pred in enumerate(predictions):
            if pred == -1:  # 異常
                anomalies.append({
                    'metric': current_data[i]['metric'],
                    'severity': self.calculate_severity(features.iloc[i]),
                    'timestamp': datetime.now()
                })
        
        return anomalies
    
    def calculate_severity(self, feature_row):
        """異常の深刻度を計算"""
        # 平均からの乖離度に基づいて深刻度を決定
        deviation = abs(feature_row['mean'] - feature_row['percentile_95'])
        
        if deviation > feature_row['std'] * 3:
            return 'critical'
        elif deviation > feature_row['std'] * 2:
            return 'warning'
        else:
            return 'info'

# 使用例
detector = AnomalyDetector('http://prometheus:9090')

# 正常時のデータで学習
historical_metrics = detector.fetch_metrics(
    'rate(http_requests_total[5m])',
    datetime.now() - timedelta(days=7),
    datetime.now() - timedelta(days=1)
)
detector.train(historical_metrics)

# リアルタイム監視
while True:
    current_metrics = detector.fetch_metrics(
        'rate(http_requests_total[5m])',
        datetime.now() - timedelta(minutes=10),
        datetime.now()
    )
    
    anomalies = detector.detect_anomalies(current_metrics)
    
    for anomaly in anomalies:
        if anomaly['severity'] == 'critical':
            send_alert(anomaly)
    
    time.sleep(60)
```

### インシデント対応の自動化

```python
# incident_response.py - 自動インシデント対応
import boto3
from datetime import datetime
import requests

class IncidentResponder:
    def __init__(self):
        self.ec2 = boto3.client('ec2')
        self.sns = boto3.client('sns')
        self.ssm = boto3.client('ssm')
        
    def respond_to_high_cpu(self, instance_id, cpu_usage):
        """高CPU使用率への対応"""
        print(f"High CPU detected on {instance_id}: {cpu_usage}%")
        
        # 1. スナップショットの作成（証拠保全）
        self.create_snapshot(instance_id)
        
        # 2. プロセス情報の収集
        process_info = self.collect_process_info(instance_id)
        
        # 3. 自動スケーリング
        if cpu_usage > 90:
            self.scale_horizontally(instance_id)
        
        # 4. 通知
        self.notify_team(
            f"High CPU Alert: {instance_id}",
            f"CPU: {cpu_usage}%\nTop processes:\n{process_info}"
        )
    
    def respond_to_disk_full(self, instance_id, disk_usage):
        """ディスク容量不足への対応"""
        print(f"Disk full on {instance_id}: {disk_usage}%")
        
        # 1. 一時ファイルのクリーンアップ
        self.cleanup_temp_files(instance_id)
        
        # 2. 古いログのアーカイブ
        self.archive_old_logs(instance_id)
        
        # 3. EBSボリュームの拡張
        if disk_usage > 95:
            self.expand_ebs_volume(instance_id)
    
    def collect_process_info(self, instance_id):
        """SSMを使用してプロセス情報を収集"""
        response = self.ssm.send_command(
            InstanceIds=[instance_id],
            DocumentName="AWS-RunShellScript",
            Parameters={
                'commands': [
                    'ps aux --sort=-%cpu | head -10',
                    'free -m',
                    'df -h'
                ]
            }
        )
        
        # コマンド実行結果を取得
        command_id = response['Command']['CommandId']
        output = self.ssm.get_command_invocation(
            CommandId=command_id,
            InstanceId=instance_id
        )
        
        return output['StandardOutputContent']
    
    def scale_horizontally(self, instance_id):
        """水平スケーリングの実行"""
        # Auto Scalingグループの特定
        asg = self.get_auto_scaling_group(instance_id)
        
        if asg:
            # 希望容量を増やす
            current_capacity = asg['DesiredCapacity']
            new_capacity = min(current_capacity + 1, asg['MaxSize'])
            
            self.autoscaling.set_desired_capacity(
                AutoScalingGroupName=asg['AutoScalingGroupName'],
                DesiredCapacity=new_capacity
            )
            
            print(f"Scaled ASG from {current_capacity} to {new_capacity}")
    
    def create_playbook(self, incident_type):
        """インシデント対応プレイブックの生成"""
        playbooks = {
            'high_cpu': [
                "1. CPU使用率の詳細を確認（top, htop）",
                "2. 高負荷プロセスの特定",
                "3. アプリケーションログの確認",
                "4. 必要に応じてプロセスの再起動",
                "5. スケーリングの検討"
            ],
            'memory_leak': [
                "1. メモリ使用状況の確認（free -m）",
                "2. メモリリークの疑いがあるプロセスの特定",
                "3. ヒープダンプの取得",
                "4. アプリケーションの再起動",
                "5. 根本原因の調査"
            ],
            'disk_full': [
                "1. ディスク使用状況の確認（df -h）",
                "2. 大きなファイルの特定（du -sh）",
                "3. 不要なログファイルの削除",
                "4. ログローテーションの確認",
                "5. ディスク容量の拡張"
            ]
        }
        
        return playbooks.get(incident_type, ["インシデントタイプが不明です"])
```

## 14.5 演習：障害の予兆を発見する

### 演習1：メトリクス収集システムの構築

```bash
# monitoring_stack_setup.sh
cat > monitoring_stack_setup.sh << 'EOF'
#!/bin/bash

echo "=== Setting up Monitoring Stack ==="

# Prometheusの設定
cat > prometheus.yml << 'PROMETHEUS'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
PROMETHEUS

# アラートルールの定義
cat > alert_rules.yml << 'ALERTS'
groups:
  - name: system
    interval: 30s
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% (current value: {{ $value }}%)"

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 90% (current value: {{ $value }}%)"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Disk space is below 10% (current value: {{ $value }}%)"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.job }} on {{ $labels.instance }} is down"
ALERTS

# Grafanaダッシュボード
cat > dashboard.json << 'DASHBOARD'
{
  "dashboard": {
    "title": "System Overview",
    "panels": [
      {
        "title": "CPU Usage",
        "targets": [
          {
            "expr": "100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "refId": "A"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "refId": "A"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Network I/O",
        "targets": [
          {
            "expr": "rate(node_network_receive_bytes_total[5m])",
            "refId": "A",
            "legendFormat": "Receive"
          },
          {
            "expr": "rate(node_network_transmit_bytes_total[5m])",
            "refId": "B",
            "legendFormat": "Transmit"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
DASHBOARD

# Docker Composeファイル
cat > docker-compose-monitoring.yml << 'COMPOSE'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro

volumes:
  prometheus-data:
  grafana-data:
COMPOSE

# 起動スクリプト
cat > start_monitoring.sh << 'START'
#!/bin/bash
docker compose -f docker-compose-monitoring.yml up -d
echo "Monitoring stack is starting..."
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3000 (admin/admin)"
echo "Alertmanager: http://localhost:9093"
START

chmod +x start_monitoring.sh
./start_monitoring.sh
EOF

chmod +x monitoring_stack_setup.sh
```

### 演習2：ログ分析パイプラインの構築

```python
# log_analysis_pipeline.py
import re
import json
from datetime import datetime
from collections import defaultdict
from elasticsearch import Elasticsearch
import matplotlib.pyplot as plt

class LogAnalyzer:
    def __init__(self, es_host='localhost:9200'):
        self.es = Elasticsearch([es_host])
        self.patterns = {
            'error': re.compile(r'ERROR|CRITICAL|FATAL', re.I),
            'warning': re.compile(r'WARN|WARNING', re.I),
            'ip_address': re.compile(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'),
            'response_time': re.compile(r'response_time=(\d+\.?\d*)'),
            'status_code': re.compile(r'status[_-]?code["\s:=]+(\d{3})')
        }
    
    def parse_log_line(self, line):
        """ログ行をパース"""
        parsed = {
            'timestamp': self.extract_timestamp(line),
            'level': self.extract_log_level(line),
            'ip_addresses': self.patterns['ip_address'].findall(line),
            'message': line
        }
        
        # レスポンスタイムの抽出
        rt_match = self.patterns['response_time'].search(line)
        if rt_match:
            parsed['response_time'] = float(rt_match.group(1))
        
        # ステータスコードの抽出
        sc_match = self.patterns['status_code'].search(line)
        if sc_match:
            parsed['status_code'] = int(sc_match.group(1))
        
        return parsed
    
    def extract_timestamp(self, line):
        """タイムスタンプの抽出"""
        # ISO形式
        iso_pattern = r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}'
        match = re.search(iso_pattern, line)
        if match:
            return datetime.fromisoformat(match.group())
        
        # 一般的なログ形式
        log_pattern = r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'
        match = re.search(log_pattern, line)
        if match:
            return datetime.strptime(match.group(), '%Y-%m-%d %H:%M:%S')
        
        return datetime.now()
    
    def extract_log_level(self, line):
        """ログレベルの抽出"""
        if self.patterns['error'].search(line):
            return 'ERROR'
        elif self.patterns['warning'].search(line):
            return 'WARNING'
        else:
            return 'INFO'
    
    def analyze_patterns(self, logs):
        """ログパターンの分析"""
        analysis = {
            'error_rate': 0,
            'avg_response_time': 0,
            'status_codes': defaultdict(int),
            'top_ips': defaultdict(int),
            'error_patterns': defaultdict(int)
        }
        
        total_logs = len(logs)
        error_count = 0
        response_times = []
        
        for log in logs:
            # エラー率
            if log['level'] == 'ERROR':
                error_count += 1
                # エラーパターンの抽出
                error_msg = log['message'].lower()
                if 'timeout' in error_msg:
                    analysis['error_patterns']['timeout'] += 1
                elif 'connection refused' in error_msg:
                    analysis['error_patterns']['connection_refused'] += 1
                elif 'out of memory' in error_msg:
                    analysis['error_patterns']['out_of_memory'] += 1
            
            # レスポンスタイム
            if 'response_time' in log:
                response_times.append(log['response_time'])
            
            # ステータスコード
            if 'status_code' in log:
                analysis['status_codes'][log['status_code']] += 1
            
            # IPアドレス
            for ip in log['ip_addresses']:
                analysis['top_ips'][ip] += 1
        
        # 集計
        analysis['error_rate'] = (error_count / total_logs) * 100 if total_logs > 0 else 0
        analysis['avg_response_time'] = sum(response_times) / len(response_times) if response_times else 0
        
        # Top 10 IPアドレス
        analysis['top_ips'] = dict(sorted(analysis['top_ips'].items(), 
                                        key=lambda x: x[1], 
                                        reverse=True)[:10])
        
        return analysis
    
    def detect_anomalies(self, logs, window_size=100):
        """異常なパターンの検出"""
        anomalies = []
        
        for i in range(len(logs) - window_size):
            window = logs[i:i+window_size]
            
            # エラー率の急上昇
            error_count = sum(1 for log in window if log['level'] == 'ERROR')
            error_rate = error_count / window_size
            
            if error_rate > 0.1:  # 10%以上のエラー率
                anomalies.append({
                    'type': 'high_error_rate',
                    'timestamp': window[-1]['timestamp'],
                    'error_rate': error_rate,
                    'severity': 'critical' if error_rate > 0.2 else 'warning'
                })
            
            # レスポンスタイムの異常
            response_times = [log['response_time'] for log in window if 'response_time' in log]
            if response_times:
                avg_rt = sum(response_times) / len(response_times)
                if avg_rt > 1000:  # 1秒以上
                    anomalies.append({
                        'type': 'slow_response',
                        'timestamp': window[-1]['timestamp'],
                        'avg_response_time': avg_rt,
                        'severity': 'warning'
                    })
        
        return anomalies
    
    def visualize_analysis(self, analysis):
        """分析結果の可視化"""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 10))
        
        # エラーパターン
        if analysis['error_patterns']:
            ax1.bar(analysis['error_patterns'].keys(), 
                   analysis['error_patterns'].values())
            ax1.set_title('Error Patterns')
            ax1.set_xlabel('Error Type')
            ax1.set_ylabel('Count')
        
        # ステータスコード分布
        if analysis['status_codes']:
            ax2.pie(analysis['status_codes'].values(), 
                   labels=analysis['status_codes'].keys(), 
                   autopct='%1.1f%%')
            ax2.set_title('Status Code Distribution')
        
        # Top IPアドレス
        if analysis['top_ips']:
            ips = list(analysis['top_ips'].keys())[:5]
            counts = [analysis['top_ips'][ip] for ip in ips]
            ax3.barh(ips, counts)
            ax3.set_title('Top 5 IP Addresses')
            ax3.set_xlabel('Request Count')
        
        # メトリクスサマリー
        metrics_text = f"""
        Error Rate: {analysis['error_rate']:.2f}%
        Avg Response Time: {analysis['avg_response_time']:.2f}ms
        Total Status Codes: {sum(analysis['status_codes'].values())}
        """
        ax4.text(0.1, 0.5, metrics_text, fontsize=12, verticalalignment='center')
        ax4.set_title('Summary Metrics')
        ax4.axis('off')
        
        plt.tight_layout()
        plt.savefig('log_analysis_report.png')
        plt.show()

# 使用例
analyzer = LogAnalyzer()

# ログファイルの読み込みと分析
with open('application.log', 'r') as f:
    logs = [analyzer.parse_log_line(line) for line in f]

# パターン分析
analysis = analyzer.analyze_patterns(logs)
print("Analysis Results:", json.dumps(analysis, indent=2))

# 異常検出
anomalies = analyzer.detect_anomalies(logs)
for anomaly in anomalies:
    print(f"Anomaly detected: {anomaly}")

# 可視化
analyzer.visualize_analysis(analysis)
```

### 演習3：分散トレーシングの実装

```python
# distributed_tracing_demo.py
from flask import Flask, request, jsonify
import requests
import time
import random
from opentelemetry import trace
from opentelemetry.exporter.jaeger import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
import logging

# アプリケーションの設定
app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# トレーシングの設定
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)

span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

# 自動計装
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()

# サービスのシミュレーション
class MicroserviceSimulator:
    def __init__(self, service_name):
        self.service_name = service_name
        self.tracer = trace.get_tracer(service_name)
    
    def process_request(self, request_id):
        """リクエストの処理をシミュレート"""
        with self.tracer.start_as_current_span(f"{self.service_name}_process") as span:
            span.set_attribute("request.id", request_id)
            span.set_attribute("service.name", self.service_name)
            
            # 処理時間のシミュレート
            processing_time = random.uniform(0.1, 0.5)
            time.sleep(processing_time)
            
            # エラーのシミュレート（5%の確率）
            if random.random() < 0.05:
                span.set_status(trace.Status(trace.StatusCode.ERROR))
                span.record_exception(Exception(f"Random error in {self.service_name}"))
                raise Exception(f"Error in {self.service_name}")
            
            return {
                "service": self.service_name,
                "processing_time": processing_time,
                "status": "success"
            }

# APIゲートウェイ
@app.route('/api/order', methods=['POST'])
def create_order():
    with tracer.start_as_current_span("create_order") as span:
        order_data = request.json
        order_id = order_data.get('order_id', 'unknown')
        
        span.set_attribute("order.id", order_id)
        span.set_attribute("order.amount", order_data.get('amount', 0))
        
        try:
            # 在庫確認サービス
            with tracer.start_as_current_span("check_inventory"):
                inventory_response = requests.post(
                    'http://localhost:5001/inventory/check',
                    json={'order_id': order_id, 'items': order_data.get('items', [])}
                )
                inventory_result = inventory_response.json()
            
            # 決済サービス
            with tracer.start_as_current_span("process_payment"):
                payment_response = requests.post(
                    'http://localhost:5002/payment/process',
                    json={'order_id': order_id, 'amount': order_data.get('amount', 0)}
                )
                payment_result = payment_response.json()
            
            # 配送サービス
            with tracer.start_as_current_span("arrange_shipping"):
                shipping_response = requests.post(
                    'http://localhost:5003/shipping/arrange',
                    json={'order_id': order_id, 'address': order_data.get('address', '')}
                )
                shipping_result = shipping_response.json()
            
            return jsonify({
                'order_id': order_id,
                'status': 'completed',
                'inventory': inventory_result,
                'payment': payment_result,
                'shipping': shipping_result
            })
            
        except Exception as e:
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR))
            return jsonify({'error': str(e)}), 500

# 在庫確認サービス
inventory_service = MicroserviceSimulator("inventory_service")

@app.route('/inventory/check', methods=['POST'])
def check_inventory():
    data = request.json
    return jsonify(inventory_service.process_request(data['order_id']))

# 決済サービス
payment_service = MicroserviceSimulator("payment_service")

@app.route('/payment/process', methods=['POST'])
def process_payment():
    data = request.json
    return jsonify(payment_service.process_request(data['order_id']))

# 配送サービス
shipping_service = MicroserviceSimulator("shipping_service")

@app.route('/shipping/arrange', methods=['POST'])
def arrange_shipping():
    data = request.json
    return jsonify(shipping_service.process_request(data['order_id']))

# トレース分析エンドポイント
@app.route('/api/trace/analyze/<trace_id>')
def analyze_trace(trace_id):
    """トレースの分析結果を返す"""
    # 実際の実装では、Jaegerからトレースデータを取得
    analysis = {
        'trace_id': trace_id,
        'total_duration': 1234,  # ms
        'service_count': 4,
        'span_count': 12,
        'error_count': 0,
        'critical_path': [
            {'service': 'api_gateway', 'duration': 10},
            {'service': 'inventory_service', 'duration': 423},
            {'service': 'payment_service', 'duration': 567},
            {'service': 'shipping_service', 'duration': 234}
        ],
        'bottleneck': 'payment_service'
    }
    return jsonify(analysis)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### 演習4：予測的アラートシステム

```python
# predictive_alerting.py
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.preprocessing import StandardScaler
import pandas as pd
from datetime import datetime, timedelta

class PredictiveAlerting:
    def __init__(self, lookback_hours=24, forecast_hours=6):
        self.lookback_hours = lookback_hours
        self.forecast_hours = forecast_hours
        self.scaler = StandardScaler()
        self.models = {}
        
    def train_models(self, historical_data):
        """各メトリクスに対してARIMAモデルを訓練"""
        for metric_name, time_series in historical_data.items():
            # データの準備
            df = pd.DataFrame(time_series)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df.set_index('timestamp', inplace=True)
            
            # ARIMAモデルの訓練
            model = ARIMA(df['value'], order=(2, 1, 2))
            fitted_model = model.fit()
            
            self.models[metric_name] = fitted_model
            
            logging.info(f"Trained ARIMA model for {metric_name}")
    
    def predict_future(self, metric_name, current_value):
        """将来の値を予測"""
        if metric_name not in self.models:
            return None
        
        model = self.models[metric_name]
        
        # 予測
        forecast = model.forecast(steps=self.forecast_hours)
        
        # 信頼区間の計算
        forecast_df = pd.DataFrame({
            'forecast': forecast,
            'timestamp': pd.date_range(
                start=datetime.now(),
                periods=self.forecast_hours,
                freq='H'
            )
        })
        
        return forecast_df
    
    def detect_future_anomalies(self, predictions, thresholds):
        """予測値から将来の異常を検出"""
        future_alerts = []
        
        for metric_name, forecast_df in predictions.items():
            threshold = thresholds.get(metric_name, {})
            
            for idx, row in forecast_df.iterrows():
                predicted_value = row['forecast']
                timestamp = row['timestamp']
                
                # 閾値チェック
                if 'max' in threshold and predicted_value > threshold['max']:
                    future_alerts.append({
                        'metric': metric_name,
                        'predicted_value': predicted_value,
                        'threshold': threshold['max'],
                        'predicted_time': timestamp,
                        'severity': 'warning',
                        'message': f"{metric_name} is predicted to exceed {threshold['max']} at {timestamp}"
                    })
                
                if 'critical' in threshold and predicted_value > threshold['critical']:
                    future_alerts[-1]['severity'] = 'critical'
        
        return future_alerts
    
    def generate_recommendations(self, future_alerts):
        """予測されるアラートに基づいて推奨アクションを生成"""
        recommendations = []
        
        for alert in future_alerts:
            if alert['metric'] == 'cpu_usage':
                if alert['severity'] == 'critical':
                    recommendations.append({
                        'action': 'scale_out',
                        'urgency': 'high',
                        'deadline': alert['predicted_time'] - timedelta(hours=1),
                        'details': 'Add 2 more instances to handle predicted CPU load'
                    })
                else:
                    recommendations.append({
                        'action': 'optimize',
                        'urgency': 'medium',
                        'deadline': alert['predicted_time'] - timedelta(hours=2),
                        'details': 'Review and optimize CPU-intensive processes'
                    })
            
            elif alert['metric'] == 'memory_usage':
                recommendations.append({
                    'action': 'clear_cache',
                    'urgency': 'medium',
                    'deadline': alert['predicted_time'] - timedelta(hours=1),
                    'details': 'Clear application caches and restart services'
                })
            
            elif alert['metric'] == 'disk_usage':
                recommendations.append({
                    'action': 'cleanup',
                    'urgency': 'low',
                    'deadline': alert['predicted_time'] - timedelta(hours=4),
                    'details': 'Archive old logs and clean temporary files'
                })
        
        return recommendations

# 使用例
predictor = PredictiveAlerting()

# 履歴データの準備（実際にはPrometheusなどから取得）
historical_data = {
    'cpu_usage': [
        {'timestamp': datetime.now() - timedelta(hours=i), 
         'value': 50 + 10 * np.sin(i/6) + np.random.normal(0, 5)}
        for i in range(168, 0, -1)  # 過去1週間
    ],
    'memory_usage': [
        {'timestamp': datetime.now() - timedelta(hours=i),
         'value': 60 + 5 * np.sin(i/12) + np.random.normal(0, 3)}
        for i in range(168, 0, -1)
    ]
}

# モデルの訓練
predictor.train_models(historical_data)

# 予測の実行
predictions = {}
for metric in ['cpu_usage', 'memory_usage']:
    predictions[metric] = predictor.predict_future(metric, None)

# 閾値の設定
thresholds = {
    'cpu_usage': {'max': 80, 'critical': 90},
    'memory_usage': {'max': 85, 'critical': 95}
}

# 将来の異常を検出
future_alerts = predictor.detect_future_anomalies(predictions, thresholds)

# 推奨アクションの生成
recommendations = predictor.generate_recommendations(future_alerts)

# 結果の表示
for alert in future_alerts:
    print(f"Predicted Alert: {alert}")

for rec in recommendations:
    print(f"Recommendation: {rec}")
```

### 演習5：統合監視ダッシュボード

```html
<!-- monitoring_dashboard.html -->
<!DOCTYPE html>
<html>
<head>
    <title>System Monitoring Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <style>
        .dashboard {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            padding: 20px;
        }
        .metric-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
        }
        .alert {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .alert-critical {
            background: #ffebee;
            color: #c62828;
        }
        .alert-warning {
            background: #fff3e0;
            color: #ef6c00;
        }
        .alert-info {
            background: #e3f2fd;
            color: #1565c0;
        }
    </style>
</head>
<body>
    <h1>System Monitoring Dashboard</h1>
    
    <div class="dashboard">
        <div class="metric-card">
            <h3>CPU Usage</h3>
            <div class="metric-value" id="cpu-value">0%</div>
            <canvas id="cpu-chart"></canvas>
        </div>
        
        <div class="metric-card">
            <h3>Memory Usage</h3>
            <div class="metric-value" id="memory-value">0%</div>
            <canvas id="memory-chart"></canvas>
        </div>
        
        <div class="metric-card">
            <h3>Request Rate</h3>
            <div class="metric-value" id="request-value">0 req/s</div>
            <canvas id="request-chart"></canvas>
        </div>
        
        <div class="metric-card">
            <h3>Error Rate</h3>
            <div class="metric-value" id="error-value">0%</div>
            <canvas id="error-chart"></canvas>
        </div>
    </div>
    
    <div class="alerts" id="alerts-container">
        <h2>Active Alerts</h2>
    </div>
    
    <script>
        // チャートの初期化
        const charts = {};
        const chartData = {
            cpu: [],
            memory: [],
            requests: [],
            errors: []
        };
        
        function initChart(canvasId, label) {
            const ctx = document.getElementById(canvasId).getContext('2d');
            return new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: label,
                        data: [],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
        
        // チャートの初期化
        charts.cpu = initChart('cpu-chart', 'CPU Usage %');
        charts.memory = initChart('memory-chart', 'Memory Usage %');
        charts.requests = initChart('request-chart', 'Requests/sec');
        charts.errors = initChart('error-chart', 'Error Rate %');
        
        // データの更新
        function updateDashboard() {
            $.ajax({
                url: '/api/metrics',
                success: function(data) {
                    // 値の更新
                    $('#cpu-value').text(data.cpu.toFixed(1) + '%');
                    $('#memory-value').text(data.memory.toFixed(1) + '%');
                    $('#request-value').text(data.requests + ' req/s');
                    $('#error-value').text(data.errorRate.toFixed(2) + '%');
                    
                    // チャートの更新
                    const timestamp = new Date().toLocaleTimeString();
                    
                    updateChart(charts.cpu, timestamp, data.cpu);
                    updateChart(charts.memory, timestamp, data.memory);
                    updateChart(charts.requests, timestamp, data.requests);
                    updateChart(charts.errors, timestamp, data.errorRate);
                    
                    // アラートの更新
                    updateAlerts(data.alerts);
                }
            });
        }
        
        function updateChart(chart, label, value) {
            chart.data.labels.push(label);
            chart.data.datasets[0].data.push(value);
            
            // 最大30点のデータを保持
            if (chart.data.labels.length > 30) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            
            chart.update();
        }
        
        function updateAlerts(alerts) {
            const container = $('#alerts-container');
            container.empty();
            container.append('<h2>Active Alerts</h2>');
            
            if (alerts.length === 0) {
                container.append('<p>No active alerts</p>');
            } else {
                alerts.forEach(alert => {
                    const alertDiv = $('<div>')
                        .addClass('alert')
                        .addClass('alert-' + alert.severity)
                        .text(alert.message);
                    container.append(alertDiv);
                });
            }
        }
        
        // 定期的な更新
        setInterval(updateDashboard, 1000);
        updateDashboard();
    </script>
</body>
</html>
```

## 14.6 まとめ：可観測性がもたらす安心

### システム監視の進化

本章で学んだ可観測性の概念は、以下の進化をもたらしました。

1. **受動的から能動的へ**：障害が起きてから対応するのではなく、予兆を検知して予防
2. **部分から全体へ**：個別のメトリクスではなく、システム全体の健康状態を把握
3. **現在から未来へ**：現在の状態だけでなく、将来の問題を予測
4. **手動から自動へ**：人間の判断を待たずに、自動的に対処

### 三本柱の重要性

- **メトリクス**：システムの健康状態を数値で把握
- **ログ**：何が起きたかの詳細な記録
- **トレース**：リクエストの全体像を理解

これらを組み合わせることで、システムの完全な可観測性を実現できます。

### 次章への展望

監視によって問題を検知できるようになりました。最終章では、これらすべてを「自動化」する方法を学びます。

Infrastructure as Codeによって、手作業を排除し、再現可能で監査可能なインフラを実現します。現代のインフラエンジニアリングの集大成を、次章で探求しましょう。

---

## 第14章 演習問題

### 問題1：基本理解の確認

以下の空欄を埋めてください。

1. システムの可観測性（Observability）は、（　　　）、（　　　）、（　　　）の三本柱で構成されています。

2. Prometheusは（　　　）型のメトリクス収集システムで、定期的にターゲットから（　　　）してデータを収集します。

3. 分散トレーシングにおいて、一つのリクエストの処理全体を（　　　）と呼び、その中の個々の処理単位を（　　　）と呼びます。

### 問題2：概念の理解

次の質問に答えてください。

1. **従来の閾値ベースの監視と、機械学習を使った異常検知の違いを説明してください。それぞれの利点と欠点も含めて述べてください。**

2. **構造化ログの重要性について説明し、非構造化ログと比較した際の利点を3つ挙げてください。**

3. **メトリクス、ログ、トレースの使い分けについて、具体的なトラブルシューティングのシナリオを例に説明してください。**

### 問題3：実践的な課題

以下の要件を満たす監視システムを設計してください。

**要件：**
- マイクロサービスアーキテクチャ（API Gateway、3つのバックエンドサービス）
- 各サービスのCPU、メモリ、レスポンスタイムを監視
- エラー率が5%を超えたらアラート
- 分散トレーシングによるボトルネックの特定
- ログの集約と分析

必要なツールと設定の概要を記述してください。

### 問題4：アラート設計

次のメトリクスに対して、適切なアラートルールを設計してください。

1. CPU使用率
2. メモリ使用率
3. ディスク使用率
4. HTTPエラー率
5. レスポンスタイム

各アラートについて、閾値、評価期間、深刻度を設定してください。

### 問題5：ログ分析

以下のようなログエントリがあります。
```text
2024-03-15 10:23:45 ERROR [user-service] Failed to connect to database: Connection timeout
2024-03-15 10:23:46 WARN [api-gateway] Retry attempt 1 for user-service
2024-03-15 10:23:47 ERROR [user-service] Failed to connect to database: Connection timeout
2024-03-15 10:23:48 WARN [api-gateway] Retry attempt 2 for user-service
2024-03-15 10:23:49 INFO [user-service] Successfully connected to database
2024-03-15 10:23:50 INFO [api-gateway] Request completed in 5023ms
```

このログから読み取れる問題と、改善提案を述べてください。

### 問題6：パフォーマンス分析

分散トレーシングの結果、以下のような処理時間が記録されました。
- API Gateway: 10ms
- User Service: 200ms
  - Database Query: 180ms
- Order Service: 300ms
  - External API Call: 250ms
- Notification Service: 50ms

ボトルネックを特定し、改善策を提案してください。

### 問題7：予測的監視

過去1週間のCPU使用率データから、毎日午後2時にピークが発生することが分かりました。この情報を使って、予測的なスケーリング戦略を設計してください。

### 問題8：発展的課題

1. **SLI（Service Level Indicator）、SLO（Service Level Objective）、SLA（Service Level Agreement）の関係を説明し、具体的なWebサービスを例にそれぞれを定義してください。**

2. **カオスエンジニアリングと可観測性の関係について説明し、監視システムを使ったカオスエンジニアリング実験の設計例を示してください。**
