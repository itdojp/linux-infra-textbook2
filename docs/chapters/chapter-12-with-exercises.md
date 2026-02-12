# 第12章：AWSという巨大なデータセンター

## 12.1 はじめに：コンピューティングの民主化

かつて、強力なコンピューティング能力を持つことは、大企業や研究機関の特権でした。サーバーを購入し、データセンターを建設し、専門スタッフを雇用する。これには莫大な初期投資が必要でした。

2006年、Amazon Web Services（AWS）の登場により、この状況は劇的に変わりました。クレジットカード一枚で、世界中のデータセンターにアクセスし、必要な分だけコンピューティングリソースを使えます。まさに「コンピューティングの民主化」が実現したのです。

本章では、このクラウドコンピューティングの仕組みと、それを支えるLinux技術について深く探求します。

> ⚠️ 注意  
> 本章の `aws ...` コマンド例は AWS CLI を前提とします。手元で試す場合は、AWS アカウントの用意と、AWS CLI のインストール・認証情報の設定が必要です。コマンドによってはリソース作成が行われ、課金が発生する場合があるため、実行前に内容を確認してください。

## 12.2 オンプレミスからクラウドへの必然的な流れ

### オンプレミス時代の課題

#### 2000年代初頭のIT部門の悩み
```text
【サーバー購入の流れ】
1. 需要予測（3年後を想定）
2. 予算申請（6ヶ月）
3. 調達手続き（3ヶ月）
4. 納品・設置（1ヶ月）
5. OS・ミドルウェア設定（1ヶ月）
合計：約1年

【結果】
- 予測が外れて容量不足 → サービス停止
- 予測が外れて容量過剰 → 投資の無駄
- ピーク時に合わせた設計 → 平常時は90%が遊休
```

### クラウドが解決した問題

#### 弾力性（Elasticity）の実現
```bash
# 従来：物理サーバーの追加
# 期間：数週間〜数ヶ月
# コスト：数百万円

# AWS：EC2インスタンスの追加
# 期間：数分
# コスト：使った分だけ（時間単位）
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t3.medium \
    --count 10
```

#### 実際の利用パターン
```text
オンプレミス：
容量 ━━━━━━━━━━━━━━━━━━━━  ← 最大需要に合わせた固定容量
需要 ～～～～╱╲～～～～╱╲～～～  ← 実際の需要（変動）
     　　　無駄　　　無駄

クラウド：
容量 ～～～～╱╲～～～～╱╲～～～  ← 需要に合わせて自動調整
需要 ～～～～╱╲～～～～╱╲～～～  ← ぴったりフィット
```

## 12.3 IaaSの本質 - 計算資源の抽象化

### Infrastructure as a Service（IaaS）とは

物理的なハードウェアを意識することなく、必要な計算資源を利用できるサービスモデルです。

![従来インフラ vs クラウド(IaaS)比較]({{ '/assets/images/diagrams/chapter-12/cloud-infrastructure-comparison.svg' | relative_url }})

### EC2（Elastic Compute Cloud）の仕組み

#### インスタンスという抽象化
```bash
# 物理サーバーの詳細を知る必要なし
# 必要なのは「どれくらいの性能か」だけ

# t3.micro: 2 vCPU, 1GB RAM（開発・テスト用）
aws ec2 run-instances --instance-type t3.micro ...

# c5.24xlarge: 96 vCPU, 192GB RAM（高性能計算用）
aws ec2 run-instances --instance-type c5.24xlarge ...

# 同じAPIで、まったく異なる規模のリソースを利用可能
```

#### 実際の抽象化の例
```bash
# リージョンとアベイラビリティゾーン
$ aws ec2 describe-regions
{
    "Regions": [
        {"RegionName": "us-east-1", "Endpoint": "ec2.us-east-1.amazonaws.com"},
        {"RegionName": "eu-west-1", "Endpoint": "ec2.eu-west-1.amazonaws.com"},
        {"RegionName": "ap-northeast-1", "Endpoint": "ec2.ap-northeast-1.amazonaws.com"}
    ]
}

# 世界中のデータセンターを同じインターフェースで利用
```

### ストレージの抽象化

#### EBS（Elastic Block Store）
```bash
# 物理的なディスクを意識せず、必要な容量とパフォーマンスを指定

# 汎用SSD（gp3）
aws ec2 create-volume \
    --size 100 \
    --volume-type gp3 \
    --iops 3000 \
    --throughput 125

# 高性能SSD（io2）
aws ec2 create-volume \
    --size 100 \
    --volume-type io2 \
    --iops 64000
```

#### S3（Simple Storage Service）
```bash
# 無限に拡張可能なオブジェクトストレージ
# ファイルシステムの制限から解放

# 1KBのファイルも
aws s3 cp small.txt s3://my-bucket/

# 5TBのファイルも同じインターフェース
aws s3 cp huge-file.zip s3://my-bucket/ --storage-class GLACIER
```

## 12.4 スケーラビリティとコスト最適化

### 自動スケーリングの実現

#### Auto Scalingグループの設定
```bash
# 起動設定の作成
aws autoscaling create-launch-configuration \
    --launch-configuration-name my-lc \
    --image-id ami-12345678 \
    --instance-type t3.micro \
    --key-name my-key \
    --security-groups sg-12345678 \
    --user-data file://userdata.sh

# Auto Scalingグループの作成
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name my-asg \
    --launch-configuration-name my-lc \
    --min-size 2 \
    --max-size 10 \
    --desired-capacity 4 \
    --target-group-arns arn:aws:elasticloadbalancing:...
```

#### スケーリングポリシー
```bash
# CPU使用率に基づくスケーリング
aws autoscaling put-scaling-policy \
    --auto-scaling-group-name my-asg \
    --policy-name scale-up \
    --scaling-adjustment 2 \
    --adjustment-type ChangeInCapacity \
    --cooldown 300

# CloudWatchアラームと連携
aws cloudwatch put-metric-alarm \
    --alarm-name high-cpu \
    --alarm-description "Alarm when CPU exceeds 70%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 70 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:autoscaling:...
```

### コスト最適化の戦略

#### 1. 適切なインスタンスタイプの選択
```bash
# インスタンスタイプ別の特徴
t3.nano    # 最小・バースト可能（$0.0052/時）
t3.micro   # 開発・テスト用（$0.0104/時）
m5.large   # 汎用バランス型（$0.096/時）
c5.large   # CPU最適化（$0.085/時）
r5.large   # メモリ最適化（$0.126/時）
g4dn.xlarge # GPU搭載（$0.526/時）
```

#### 2. リザーブドインスタンスとスポットインスタンス
```bash
# オンデマンド（通常価格）
aws ec2 run-instances --instance-type m5.large  # $0.096/時

# リザーブドインスタンス（1年前払いで40%割引）
aws ec2 purchase-reserved-instances-offering \
    --reserved-instances-offering-id offering-12345678 \
    --instance-count 10

# スポットインスタンス（最大90%割引、ただし中断の可能性）
aws ec2 request-spot-instances \
    --spot-price "0.03" \
    --instance-count 5 \
    --type "one-time" \
    --launch-specification file://spec.json
```

#### 3. 自動的なコスト管理
```python
# cost_optimizer.py - コスト最適化スクリプト
import boto3
from datetime import datetime, timedelta

ec2 = boto3.client('ec2')
cloudwatch = boto3.client('cloudwatch')

def get_underutilized_instances():
    """CPU使用率が低いインスタンスを検出"""
    instances = []
    
    # 実行中のインスタンスを取得
    response = ec2.describe_instances(
        Filters=[{'Name': 'instance-state-name', 'Values': ['running']}]
    )
    
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instance_id = instance['InstanceId']
            
            # 過去1週間のCPU使用率を確認
            cpu_stats = cloudwatch.get_metric_statistics(
                Namespace='AWS/EC2',
                MetricName='CPUUtilization',
                StartTime=datetime.now() - timedelta(days=7),
                EndTime=datetime.now(),
                Period=3600,
                Statistics=['Average'],
                Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}]
            )
            
            if cpu_stats['Datapoints']:
                avg_cpu = sum(d['Average'] for d in cpu_stats['Datapoints']) / len(cpu_stats['Datapoints'])
                if avg_cpu < 10:  # 10%未満
                    instances.append({
                        'InstanceId': instance_id,
                        'InstanceType': instance['InstanceType'],
                        'AverageCPU': avg_cpu
                    })
    
    return instances

# 実行
underutilized = get_underutilized_instances()
for inst in underutilized:
    print(f"Instance {inst['InstanceId']} ({inst['InstanceType']}) - Avg CPU: {inst['AverageCPU']:.2f}%")
    print("  → Consider downsizing or terminating")
```

## 12.5 物理サーバーとの責任分界点を理解

### 責任共有モデル

AWSとユーザーの責任範囲は明確に分かれています：

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         AWSの責任範囲
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ ・物理的セキュリティ                    │
│ ・ハードウェアの保守                    │
│ ・ネットワークインフラ                  │
│ ・仮想化層                              │
│ ・AWSサービスのソフトウェア             │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         ユーザーの責任範囲
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ ・OSのパッチ適用                        │
│ ・アプリケーションの管理                │
│ ・データの暗号化                        │
│ ・ネットワークトラフィックの保護        │
│ ・アクセス管理                          │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 実践的な責任分担

#### システム管理タスクの例
```bash
# ユーザーの責任：OSアップデート
#!/bin/bash
# os_update.sh - 定期的なOSアップデート

if command -v dnf >/dev/null 2>&1; then
    # Amazon Linux 2023（dnf）
    sudo dnf update -y
elif command -v apt-get >/dev/null 2>&1; then
    # Ubuntu/Debian（apt）
    sudo apt-get update
    sudo apt-get upgrade -y
else
    echo "Unsupported OS (no dnf/apt-get found)" >&2
    exit 1
fi

# 再起動が必要な場合の判定
if [ -f /var/run/reboot-required ]; then
    echo "Reboot required. Scheduling reboot..."
    sudo shutdown -r +5 "System will reboot in 5 minutes for updates"
fi
```

#### セキュリティグループの管理
```bash
# ユーザーの責任：ネットワークアクセス制御

# 必要最小限のポートのみ開放
aws ec2 create-security-group \
    --group-name web-sg \
    --description "Security group for web servers"

# HTTPとHTTPSのみ許可
aws ec2 authorize-security-group-ingress \
    --group-name web-sg \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name web-sg \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

# SSHは特定のIPからのみ
aws ec2 authorize-security-group-ingress \
    --group-name web-sg \
    --protocol tcp \
    --port 22 \
    --cidr 203.0.113.0/24  # 管理用ネットワークのみ
```

## 12.6 演習：物理サーバーとの責任分界点を理解

### 演習1：EC2インスタンスの起動と管理

```bash
# ec2_lifecycle.sh - EC2インスタンスのライフサイクル管理
cat > ec2_lifecycle.sh << 'EOF'
#!/bin/bash

# 設定
REGION="ap-northeast-1"
KEY_NAME="my-key"
SECURITY_GROUP="my-sg"
INSTANCE_TYPE="t3.micro"

# 全コマンドで同一リージョンを使用
export AWS_DEFAULT_REGION="$REGION"

# 1. キーペアの作成（初回のみ）
echo "Creating key pair..."
aws ec2 create-key-pair \
    --key-name $KEY_NAME \
    --query 'KeyMaterial' \
    --output text > ${KEY_NAME}.pem
chmod 400 ${KEY_NAME}.pem

# 2. セキュリティグループの作成
echo "Creating security group..."
SG_ID=$(aws ec2 create-security-group \
    --group-name $SECURITY_GROUP \
    --description "Demo security group" \
    --query 'GroupId' \
    --output text)

# SSHアクセスを許可
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

# 3. 最新のAmazon Linux 2023 AMIを取得
echo "Getting latest AMI..."
AMI_ID=$(aws ssm get-parameter \
    --region $REGION \
    --name "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64" \
    --query 'Parameter.Value' \
    --output text)

# 4. ユーザーデータスクリプトの作成
cat > userdata.sh << 'USERDATA'
#!/bin/bash
dnf update -y
dnf install -y nginx
systemctl start nginx
systemctl enable nginx
echo "<h1>Hello from AWS EC2</h1>" > /usr/share/nginx/html/index.html
USERDATA

# 5. インスタンスの起動
echo "Launching instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $SG_ID \
    --user-data file://userdata.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=demo-instance}]" \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "Instance ID: $INSTANCE_ID"

# 6. インスタンスの状態確認
echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# 7. パブリックIPの取得
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "Instance is running at: $PUBLIC_IP"
echo "SSH: ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP"
EOF

chmod +x ec2_lifecycle.sh
```

### 演習2：自動スケーリングの実装

```bash
# autoscaling_demo.sh
cat > autoscaling_demo.sh << 'EOF'
#!/bin/bash

# Auto Scalingの設定デモ

# 1. 起動テンプレートの作成
cat > launch_template.json << 'JSON'
{
    "LaunchTemplateName": "web-server-template",
    "LaunchTemplateData": {
        "ImageId": "ami-0abcdef1234567890",
        "InstanceType": "t3.micro",
        "KeyName": "my-key",
        "SecurityGroupIds": ["sg-12345678"],
        "UserData": "IyEvYmluL2Jhc2gKYXB0LWdldCB1cGRhdGUgLXkKYXB0LWdldCBpbnN0YWxsIC15IG5naW54",
        "TagSpecifications": [{
            "ResourceType": "instance",
            "Tags": [{"Key": "Name", "Value": "AutoScaled-Instance"}]
        }]
    }
}
JSON

aws ec2 create-launch-template --cli-input-json file://launch_template.json

# 2. Auto Scalingグループの作成
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name demo-asg \
    --launch-template "LaunchTemplateName=web-server-template,Version=\$Latest" \
    --min-size 2 \
    --max-size 10 \
    --desired-capacity 3 \
    --vpc-zone-identifier "subnet-12345,subnet-67890" \
    --health-check-type ELB \
    --health-check-grace-period 300

# 3. スケーリングポリシーの設定
# スケールアウトポリシー
aws autoscaling put-scaling-policy \
    --auto-scaling-group-name demo-asg \
    --policy-name scale-out \
    --policy-type TargetTrackingScaling \
    --target-tracking-configuration file://scale_out_policy.json

# scale_out_policy.json
cat > scale_out_policy.json << 'JSON'
{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
        "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
}
JSON

# 4. 負荷テストスクリプト
cat > load_test.sh << 'LOAD'
#!/bin/bash
# 負荷を生成してAuto Scalingをトリガー
TARGETS=$(aws autoscaling describe-auto-scaling-groups \
    --auto-scaling-group-names demo-asg \
    --query 'AutoScalingGroups[0].Instances[*].InstanceId' \
    --output text)

for instance in $TARGETS; do
    IP=$(aws ec2 describe-instances \
        --instance-ids $instance \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text)
    
    echo "Generating load on $IP..."
    for i in {1..100}; do
        curl -s http://$IP/ > /dev/null &
    done
done

echo "Load test running. Monitor Auto Scaling activity:"
echo "aws autoscaling describe-scaling-activities --auto-scaling-group-name demo-asg"
LOAD

chmod +x load_test.sh
EOF

chmod +x autoscaling_demo.sh
```

### 演習3：コスト分析と最適化

```bash
# cost_analysis.sh
cat > cost_analysis.sh << 'EOF'
#!/bin/bash

echo "=== AWS Cost Analysis ==="

# 1. 現在実行中のインスタンスのコスト計算
echo "Current running instances:"
aws ec2 describe-instances \
    --filters "Name=instance-state-name,Values=running" \
    --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,LaunchTime,Tags[?Key==`Name`].Value|[0]]' \
    --output table

# 2. 月間推定コスト
cat > calculate_monthly_cost.py << 'PYTHON'
#!/usr/bin/env python3
import boto3
from datetime import datetime

# インスタンスタイプ別の時間単価（東京リージョン）
HOURLY_RATES = {
    "t3.nano": 0.0052,
    "t3.micro": 0.0104,
    "t3.small": 0.0208,
    "t3.medium": 0.0416,
    "t3.large": 0.0832,
    "m5.large": 0.124,
    "m5.xlarge": 0.248,
    "c5.large": 0.107,
    "c5.xlarge": 0.214
}

ec2 = boto3.client('ec2')

# 実行中のインスタンスを取得
response = ec2.describe_instances(
    Filters=[{'Name': 'instance-state-name', 'Values': ['running']}]
)

total_hourly_cost = 0
total_monthly_cost = 0

print("\n=== Instance Cost Breakdown ===")
for reservation in response['Reservations']:
    for instance in reservation['Instances']:
        instance_id = instance['InstanceId']
        instance_type = instance['InstanceType']
        launch_time = instance['LaunchTime']
        
        # 実行時間を計算
        running_hours = (datetime.now(launch_time.tzinfo) - launch_time).total_seconds() / 3600
        
        # コスト計算
        hourly_rate = HOURLY_RATES.get(instance_type, 0.1)  # デフォルト
        instance_cost = running_hours * hourly_rate
        monthly_estimate = hourly_rate * 24 * 30
        
        print(f"\nInstance: {instance_id}")
        print(f"  Type: {instance_type}")
        print(f"  Running hours: {running_hours:.1f}")
        print(f"  Cost so far: ${instance_cost:.2f}")
        print(f"  Monthly estimate: ${monthly_estimate:.2f}")
        
        total_hourly_cost += hourly_rate
        total_monthly_cost += monthly_estimate

print(f"\n=== Total Costs ===")
print(f"Hourly rate: ${total_hourly_cost:.2f}")
print(f"Daily estimate: ${total_hourly_cost * 24:.2f}")
print(f"Monthly estimate: ${total_monthly_cost:.2f}")
print(f"Yearly estimate: ${total_monthly_cost * 12:.2f}")
PYTHON

python3 calculate_monthly_cost.py

# 3. コスト最適化の推奨事項
echo -e "\n=== Cost Optimization Recommendations ==="

# 未使用のEBSボリューム
echo -e "\n1. Unattached EBS Volumes:"
aws ec2 describe-volumes \
    --filters "Name=status,Values=available" \
    --query 'Volumes[*].[VolumeId,Size,VolumeType,CreateTime]' \
    --output table

# 未使用のElastic IP
echo -e "\n2. Unassociated Elastic IPs:"
aws ec2 describe-addresses \
    --query 'Addresses[?AssociationId==null].[PublicIp,AllocationId]' \
    --output table

# 古いスナップショット
echo -e "\n3. Old Snapshots (>30 days):"
CUTOFF_DATE=$(date -u -d '30 days ago' +%Y-%m-%d)
aws ec2 describe-snapshots \
    --owner-ids self \
    --query "Snapshots[?StartTime<'$CUTOFF_DATE'].[SnapshotId,StartTime,VolumeSize]" \
    --output table
EOF

chmod +x cost_analysis.sh
```

### 演習4：災害復旧（DR）戦略の実装

```bash
# disaster_recovery.sh
cat > disaster_recovery.sh << 'EOF'
#!/bin/bash

echo "=== Disaster Recovery Setup ==="

# 1. マルチリージョンバックアップ
PRIMARY_REGION="ap-northeast-1"  # 東京
DR_REGION="ap-southeast-1"       # シンガポール

# AMIの作成とコピー
echo "Creating AMI from running instance..."
INSTANCE_ID="i-1234567890abcdef0"

# AMIの作成
AMI_ID=$(aws ec2 create-image \
    --instance-id $INSTANCE_ID \
    --name "DR-backup-$(date +%Y%m%d-%H%M%S)" \
    --description "Disaster recovery backup" \
    --no-reboot \
    --query 'ImageId' \
    --output text)

echo "Created AMI: $AMI_ID"

# AMIが利用可能になるまで待機
aws ec2 wait image-available --image-ids $AMI_ID

# 別リージョンへコピー
echo "Copying AMI to DR region..."
DR_AMI_ID=$(aws ec2 copy-image \
    --source-image-id $AMI_ID \
    --source-region $PRIMARY_REGION \
    --region $DR_REGION \
    --name "DR-copy-$(date +%Y%m%d-%H%M%S)" \
    --query 'ImageId' \
    --output text)

echo "DR AMI created: $DR_AMI_ID in $DR_REGION"

# 2. RDSの自動バックアップ設定
cat > rds_backup_config.json << 'JSON'
{
    "DBInstanceIdentifier": "production-db",
    "BackupRetentionPeriod": 7,
    "PreferredBackupWindow": "03:00-04:00",
    "PreferredMaintenanceWindow": "sun:04:00-sun:05:00"
}
JSON

aws rds modify-db-instance --cli-input-json file://rds_backup_config.json

# 3. S3クロスリージョンレプリケーション
cat > s3_replication.json << 'JSON'
{
    "Role": "arn:aws:iam::123456789012:role/replication-role",
    "Rules": [{
        "ID": "ReplicateAll",
        "Priority": 1,
        "Status": "Enabled",
        "Filter": {},
        "Destination": {
            "Bucket": "arn:aws:s3:::dr-backup-bucket",
            "ReplicationTime": {
                "Status": "Enabled",
                "Time": {
                    "Minutes": 15
                }
            },
            "Metrics": {
                "Status": "Enabled",
                "EventThreshold": {
                    "Minutes": 15
                }
            }
        }
    }]
}
JSON

aws s3api put-bucket-replication \
    --bucket production-bucket \
    --replication-configuration file://s3_replication.json

# 4. 自動フェイルオーバースクリプト
cat > failover.sh << 'FAILOVER'
#!/bin/bash
# 災害時のフェイルオーバー手順

DR_REGION="ap-southeast-1"
DR_AMI_ID="ami-0987654321"

echo "Starting failover to DR region..."

# 1. DRリージョンでインスタンスを起動
aws ec2 run-instances \
    --region $DR_REGION \
    --image-id $DR_AMI_ID \
    --instance-type m5.large \
    --count 3 \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=DR-Instance}]'

# 2. Route 53のDNSレコードを更新
aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890ABC \
    --change-batch file://dns_failover.json

echo "Failover completed. Services are now running in $DR_REGION"
FAILOVER

chmod +x failover.sh
EOF

chmod +x disaster_recovery.sh
```

### 演習5：インフラストラクチャのコード化（IaC）

```bash
# infrastructure_as_code.sh
cat > infrastructure_as_code.sh << 'EOF'
#!/bin/bash

echo "=== Infrastructure as Code with CloudFormation ==="

# 1. VPCとネットワークのテンプレート
cat > network-stack.yaml << 'YAML'
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Network infrastructure for web application'

Parameters:
  EnvironmentName:
    Description: Environment name prefix
    Type: String
    Default: Production

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-VPC

  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.1.0/24
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Public-Subnet-1

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [1, !GetAZs '']
      CidrBlock: 10.0.2.0/24
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Public-Subnet-2

  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.11.0/24
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Private-Subnet-1

  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [1, !GetAZs '']
      CidrBlock: 10.0.12.0/24
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Private-Subnet-2

  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-IGW

  InternetGatewayAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref InternetGateway
      VpcId: !Ref VPC

  NatGateway1EIP:
    Type: AWS::EC2::EIP
    DependsOn: InternetGatewayAttachment
    Properties:
      Domain: vpc

  NatGateway1:
    Type: AWS::EC2::NatGateway
    Properties:
      AllocationId: !GetAtt NatGateway1EIP.AllocationId
      SubnetId: !Ref PublicSubnet1

Outputs:
  VPC:
    Description: VPC ID
    Value: !Ref VPC
    Export:
      Name: !Sub ${EnvironmentName}-VPC-ID

  PublicSubnets:
    Description: Public subnets
    Value: !Join [",", [!Ref PublicSubnet1, !Ref PublicSubnet2]]
    Export:
      Name: !Sub ${EnvironmentName}-PUBLIC-SUBNETS

  PrivateSubnets:
    Description: Private subnets
    Value: !Join [",", [!Ref PrivateSubnet1, !Ref PrivateSubnet2]]
    Export:
      Name: !Sub ${EnvironmentName}-PRIVATE-SUBNETS
YAML

# 2. アプリケーションスタックのテンプレート
cat > application-stack.yaml << 'YAML'
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Web application with Auto Scaling and Load Balancer'

Parameters:
  EnvironmentName:
    Description: Environment name prefix
    Type: String
    Default: Production
  
  InstanceType:
    Description: EC2 instance type
    Type: String
    Default: t3.micro
    AllowedValues:
      - t3.micro
      - t3.small
      - t3.medium
      - m5.large
      - m5.xlarge

Resources:
  WebServerSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for web servers
      VpcId: 
        Fn::ImportValue: !Sub ${EnvironmentName}-VPC-ID
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          SourceSecurityGroupId: !Ref LoadBalancerSecurityGroup
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          SourceSecurityGroupId: !Ref LoadBalancerSecurityGroup

  LoadBalancerSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for load balancer
      VpcId: 
        Fn::ImportValue: !Sub ${EnvironmentName}-VPC-ID
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0

  LaunchTemplate:
    Type: AWS::EC2::LaunchTemplate
    Properties:
      LaunchTemplateName: !Sub ${EnvironmentName}-LaunchTemplate
      LaunchTemplateData:
        ImageId: ami-0abcdef1234567890
        InstanceType: !Ref InstanceType
        SecurityGroupIds:
          - !Ref WebServerSecurityGroup
        UserData:
          Fn::Base64: !Sub |
            #!/bin/bash
            yum update -y
            yum install -y httpd
            systemctl start httpd
            systemctl enable httpd
            echo "<h1>Hello from ${AWS::Region}</h1>" > /var/www/html/index.html

  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub ${EnvironmentName}-ALB
      Subnets:
        Fn::Split:
          - ','
          - Fn::ImportValue: !Sub ${EnvironmentName}-PUBLIC-SUBNETS
      SecurityGroups:
        - !Ref LoadBalancerSecurityGroup

  TargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: !Sub ${EnvironmentName}-TG
      Port: 80
      Protocol: HTTP
      VpcId:
        Fn::ImportValue: !Sub ${EnvironmentName}-VPC-ID
      HealthCheckPath: /
      HealthCheckProtocol: HTTP
      HealthCheckIntervalSeconds: 30
      HealthCheckTimeoutSeconds: 5
      HealthyThresholdCount: 2
      UnhealthyThresholdCount: 5

  AutoScalingGroup:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      AutoScalingGroupName: !Sub ${EnvironmentName}-ASG
      VPCZoneIdentifier:
        Fn::Split:
          - ','
          - Fn::ImportValue: !Sub ${EnvironmentName}-PRIVATE-SUBNETS
      LaunchTemplate:
        LaunchTemplateId: !Ref LaunchTemplate
        Version: !GetAtt LaunchTemplate.LatestVersionNumber
      MinSize: 2
      MaxSize: 10
      DesiredCapacity: 4
      TargetGroupARNs:
        - !Ref TargetGroup
      HealthCheckType: ELB
      HealthCheckGracePeriod: 300
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Instance
          PropagateAtLaunch: true

  ScalingPolicy:
    Type: AWS::AutoScaling::ScalingPolicy
    Properties:
      AutoScalingGroupName: !Ref AutoScalingGroup
      PolicyType: TargetTrackingScaling
      TargetTrackingConfiguration:
        PredefinedMetricSpecification:
          PredefinedMetricType: ASGAverageCPUUtilization
        TargetValue: 70.0

Outputs:
  LoadBalancerURL:
    Description: URL of the load balancer
    Value: !Join ['', ['http://', !GetAtt ApplicationLoadBalancer.DNSName]]
YAML

# 3. スタックのデプロイスクリプト
cat > deploy_infrastructure.sh << 'DEPLOY'
#!/bin/bash

ENV_NAME=${1:-Production}

echo "Deploying infrastructure for environment: $ENV_NAME"

# ネットワークスタックのデプロイ
echo "Deploying network stack..."
aws cloudformation create-stack \
    --stack-name ${ENV_NAME}-Network \
    --template-body file://network-stack.yaml \
    --parameters ParameterKey=EnvironmentName,ParameterValue=$ENV_NAME

# 完了を待つ
aws cloudformation wait stack-create-complete \
    --stack-name ${ENV_NAME}-Network

# アプリケーションスタックのデプロイ
echo "Deploying application stack..."
aws cloudformation create-stack \
    --stack-name ${ENV_NAME}-Application \
    --template-body file://application-stack.yaml \
    --parameters ParameterKey=EnvironmentName,ParameterValue=$ENV_NAME

# 完了を待つ
aws cloudformation wait stack-create-complete \
    --stack-name ${ENV_NAME}-Application

# 出力値の取得
echo "Infrastructure deployed successfully!"
aws cloudformation describe-stacks \
    --stack-name ${ENV_NAME}-Application \
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
    --output text
DEPLOY

chmod +x deploy_infrastructure.sh
EOF

chmod +x infrastructure_as_code.sh
```

## 12.7 AWSとLinuxの融合

### Amazon Linux 2023

AWSが提供する、AWS環境に最適化されたLinuxディストリビューション：

```bash
# Amazon Linux 2023の特徴（例）
# 1. OS情報の確認
$ cat /etc/os-release

# 2. AWS CLI（AMIによりプリインストール）
$ aws --version

# 3. cloud-initによる初期設定
$ cat /etc/cloud/cloud.cfg
# EC2用に最適化された設定

# 4. dnf（RPM）によるパッケージ管理
$ sudo dnf update -y
$ sudo dnf install -y nginx
```

### Systems Manager（SSM）

エージェントベースの管理ツール：

```bash
# SSMエージェントの確認
$ sudo systemctl status amazon-ssm-agent

# セッションマネージャーでのリモートアクセス（SSHキー不要）
$ aws ssm start-session --target i-1234567890abcdef0

# パッチ管理
$ aws ssm create-patch-baseline \
    --name "CustomLinuxPatchBaseline" \
    --operating-system "AMAZON_LINUX_2023" \
    --approval-rules file://approval-rules.json
```

## 12.8 まとめ：クラウドという新しいコンピューティングパラダイム

### AWSがもたらした変革

本章で学んだAWSは、以下の変革をもたらしました：

1. **所有から利用へ**：資産としてのサーバーから、サービスとしてのコンピューティングへ
2. **固定から弾力へ**：静的なインフラから、動的にスケールするインフラへ
3. **手動から自動へ**：手作業での管理から、コードによる自動化へ
4. **単一から分散へ**：1つのデータセンターから、グローバルな分散システムへ

### 責任共有モデルの重要性

クラウドを使いこなすには：
- **AWSが管理する部分**と**ユーザーが管理する部分**の明確な理解
- 従来のインフラ管理スキルは依然として重要
- 新しいクラウドネイティブなスキルの習得も必要

### 次章への展望

物理的な制約から解放されたクラウド環境では、ネットワークも仮想化されています。次章では、この仮想ネットワークの設計と実装について学びます。

VPCという仮想的なデータセンターネットワークを、どのように設計し、セキュアに構築するか。クラウド時代のネットワーキングの本質を探求していきましょう。

---

## 第12章 演習問題

### 問題1：基本理解の確認

以下の空欄を埋めてください。

1. AWS EC2における「インスタンス」とは、（　　　）化されたサーバーのことで、必要に応じて（　　　）や（　　　）できます。

2. AWS の責任共有モデルにおいて、（　　　）の管理はAWSの責任、（　　　）の管理はユーザーの責任です。

3. Auto Scalingでは、（　　　）メトリクスに基づいて、自動的にインスタンス数を（　　　）したり（　　　）したりできます。

### 問題2：概念の理解

次の質問に答えてください。

1. **オンプレミスからクラウドへの移行により解決された課題を3つ挙げ、それぞれについて説明してください。**

2. **EC2のインスタンスタイプ（t3、m5、c5、r5など）の違いと、それぞれの使用場面を説明してください。**

3. **リザーブドインスタンス、スポットインスタンス、オンデマンドインスタンスの違いと、それぞれの適切な使用場面を説明してください。**

### 問題3：実践的な課題

以下の要件を満たすAWSインフラストラクチャを設計してください：

**要件：**
- Webアプリケーション用のインフラ
- 高可用性（複数のアベイラビリティゾーン）
- 自動スケーリング（最小2台、最大10台）
- セキュアなネットワーク設計
- コスト効率的

必要なAWSサービスと設定を記述してください。

### 問題4：責任分界点

以下の項目について、AWS責任共有モデルにおいて、誰の責任か答えてください（AWS/ユーザー）：

1. EC2インスタンスのOSパッチ適用
2. データセンターの物理的セキュリティ
3. セキュリティグループの設定
4. ハイパーバイザーの保守
5. アプリケーションのバックアップ
6. ネットワークインフラストラクチャ

### 問題5：コスト最適化

月間100万PVのWebサイトを運用しています。現在、m5.large（$0.124/時）のインスタンスを10台常時稼働させています。

1. 現在の月間コストを計算してください。
2. コストを削減する方法を3つ提案してください。
3. それぞれの方法で、どの程度のコスト削減が見込めるか概算してください。

### 問題6：トラブルシューティング

EC2インスタンスにSSH接続できない状況です。考えられる原因と確認すべき項目を5つ挙げてください。

### 問題7：自動化

毎日深夜2時にEC2インスタンスのバックアップ（AMI作成）を行い、7日以上古いAMIを自動削除するスクリプトを作成してください。

### 問題8：発展的課題

1. **マルチリージョン災害復旧（DR）戦略を設計してください。RPO（Recovery Point Objective）1時間、RTO（Recovery Time Objective）15分を目標とします。**

2. **Infrastructure as Code（IaC）のメリットとデメリットを説明し、CloudFormationとTerraformの違いについて述べてください。**
