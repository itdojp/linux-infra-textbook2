# 第12章：AWSという巨大なデータセンター

## 12.1 はじめに：コンピューティングの民主化

かつて、強力なコンピューティング能力を持つことは、大企業や研究機関の特権でした。サーバーを購入し、データセンターを建設し、専門スタッフを雇用する。これには莫大な初期投資が必要でした。

2006年、Amazon Web Services（AWS）の登場により、この状況は劇的に変わりました。クレジットカード一枚で、世界中のデータセンターにアクセスし、必要な分だけコンピューティングリソースを使える。まさに「コンピューティングの民主化」が実現したのです。

本章では、このクラウドコンピューティングの仕組みと、それを支えるLinux技術について深く探求していきます。

> ⚠️ 注意
> 本章の `aws ...` コマンド例は AWS CLI を前提とします。手元で試す場合は、AWS アカウントの用意と、AWS CLI のインストール・認証情報の設定が必要です。コマンドによってはリソース作成が行われ、課金が発生する場合があるため、実行前に内容を確認してください。可能であれば検証専用アカウントまたは隔離された sandbox 環境を用意し、リージョンを固定したうえで、演習後に EC2 / ELB / Auto Scaling / AMI などの不要リソースを削除してください。
> 可能であれば root ユーザーや長期アクセスキーを常用せず、IAM Identity Center や `AssumeRole` による一時認証情報で演習する方が安全です。

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

**本章のコマンド例について**：
本章で示すコマンド例は、AWS CLI (Command Line Interface)を使用しています。AWS CLIは、Linuxシステム上でAWSサービスを操作するためのコマンドラインツールです。
これらのコマンドを実行するには、事前にAWS CLIのインストールと設定（認証情報の設定）が必要です。

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
AZ="${AZ:-ap-northeast-1a}"

# 汎用SSD（gp3）
aws ec2 create-volume \
    --size 100 \
    --volume-type gp3 \
    --availability-zone "$AZ" \
    --iops 3000 \
    --throughput 125

# 高性能SSD（io2）
aws ec2 create-volume \
    --size 100 \
    --volume-type io2 \
    --availability-zone "$AZ" \
    --iops 64000
```

注記: EBS ボリュームはアタッチ先 EC2 と同じ Availability Zone に作成する必要があります。既存インスタンスへ接続する場合は、先に `describe-instances` で AZ を確認してから `AZ` を合わせてください。

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
# Launch Template の作成
LT_VERSION=$(aws ec2 create-launch-template \
    --launch-template-name my-web-template \
    --launch-template-data '{
      "ImageId":"ami-12345678",
      "InstanceType":"t3.micro",
      "KeyName":"my-key",
      "SecurityGroupIds":["sg-12345678"],
      "UserData":"'"$(base64 -w0 userdata.sh)"'"
    }' \
    --query 'LaunchTemplateVersion.VersionNumber' \
    --output text)

# Auto Scalingグループの作成
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name my-asg \
    --launch-template "LaunchTemplateName=my-web-template,Version=${LT_VERSION}" \
    --min-size 2 \
    --max-size 10 \
    --desired-capacity 4 \
    --vpc-zone-identifier "subnet-0123456789abcdef0,subnet-0fedcba9876543210" \
    --target-group-arns arn:aws:elasticloadbalancing:...
```

注記: 手動演習では `Version=$Latest` でも構いませんが、CI/CD や複数人運用では意図しないテンプレート更新を拾わないよう、検証済みの明示バージョンを固定する方が安全です。

注記: AWS 公式では Launch Configuration の代わりに Launch Template の利用が推奨されています。既存環境の保守で Launch Configuration を見かけることはありますが、新規構築や更新時は Launch Template を前提にしてください。特に新しい EC2 インスタンスタイプへの追随や新規アカウントでの制約を考えると、演習でも Launch Template を基準に読む方が安全です。確認先: https://docs.aws.amazon.com/autoscaling/ec2/userguide/migrate-to-launch-templates.html

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
VPC_ID="${VPC_ID:?VPC_ID を設定してください}"
WEB_CIDR="${WEB_CIDR:-203.0.113.4/32}"
SG_ID=$(aws ec2 create-security-group \
    --group-name web-sg \
    --description "Security group for web servers" \
    --vpc-id "$VPC_ID" \
    --query 'GroupId' \
    --output text)

# HTTPとHTTPSのみ許可
aws ec2 authorize-security-group-ingress \
    --group-id "$SG_ID" \
    --protocol tcp \
    --port 80 \
    --cidr "$WEB_CIDR"

aws ec2 authorize-security-group-ingress \
    --group-id "$SG_ID" \
    --protocol tcp \
    --port 443 \
    --cidr "$WEB_CIDR"

# SSHは特定のIPからのみ
aws ec2 authorize-security-group-ingress \
    --group-id "$SG_ID" \
    --protocol tcp \
    --port 22 \
    --cidr 203.0.113.0/24  # 管理用ネットワークのみ
```

注記: ここでは「自分の端末や踏み台からだけ閲覧する検証用途」を前提に `WEB_CIDR` を狭くしています。公開 Web サービスとして外部公開する場合でも、必要性を確認したうえで ALB/WAF や CIDR allowlist を併用し、演習後は rule を戻してください。

## 12.6 演習：物理サーバーとの責任分界点を理解

### 演習1：EC2インスタンスの起動と管理

> ⚠️ 注意
> この演習は検証専用の AWS アカウントまたは sandbox 環境で行い、実行前に `AWS_PROFILE` と `AWS_DEFAULT_REGION` が意図した環境を指していることを確認してください。`my-key` / `my-sg` のような固定名は再実行時に衝突しやすいため、一意なサフィックスを付ける運用が安全です。SSH の許可範囲も `0.0.0.0/0` のままではなく、自端末や踏み台のグローバル IP に限定し、演習後は key pair / security group / instance を削除してください。

開始前チェック:

- `aws sts get-caller-identity` で、意図した AWS アカウントを見ていることを確認します。
- `echo "${AWS_PROFILE:-default} ${AWS_DEFAULT_REGION:-<unset>}"` と `aws ec2 describe-subnets --subnet-ids "$SUBNET_ID" --query 'Subnets[0].[VpcId,CidrBlock,MapPublicIpOnLaunch,AvailabilityZone]' --output table` で、使う資格情報・リージョン・subnet の前提を確認します。
- `aws ec2 describe-vpcs --vpc-ids "$VPC_ID" --query 'Vpcs[0].CidrBlock' --output text` で VPC の CIDR を確認し、`SSH_CIDR` / `HTTP_CIDR` が意図した範囲だけを許可することを確認します。

```bash
# ec2_lifecycle.sh - EC2インスタンスのライフサイクル管理
cat > ec2_lifecycle.sh << 'EOF'
#!/bin/bash
set -euo pipefail

# 設定
REGION="ap-northeast-1"
KEY_NAME="my-key"
SECURITY_GROUP="my-sg"
INSTANCE_TYPE="t3.micro"
SSH_CIDR="${SSH_CIDR:-203.0.113.4/32}"
HTTP_CIDR="${HTTP_CIDR:-$SSH_CIDR}"
PEM_PATH="${KEY_NAME}.pem"
TMP_PEM="${PEM_PATH}.tmp"
VPC_ID="${VPC_ID:-}"
SUBNET_ID="${SUBNET_ID:-}"

if [ -z "$VPC_ID" ] || [ -z "$SUBNET_ID" ]; then
    echo "VPC_ID と SUBNET_ID を事前に設定してください。例: export VPC_ID=vpc-xxxxxxxx SUBNET_ID=subnet-yyyyyyyy" >&2
    exit 1
fi

# 全コマンドで同一リージョンを使用
export AWS_DEFAULT_REGION="$REGION"

SUBNET_VPC_ID=$(aws ec2 describe-subnets \
    --subnet-ids "$SUBNET_ID" \
    --query 'Subnets[0].VpcId' \
    --output text)
if [ "$SUBNET_VPC_ID" != "$VPC_ID" ]; then
    echo "SUBNET_ID=$SUBNET_ID は VPC_ID=$VPC_ID に属していません（実際: $SUBNET_VPC_ID）。" >&2
    exit 1
fi

# 1. キーペアの作成（初回のみ）
KEY_CREATED=0
if aws ec2 describe-key-pairs --key-names "$KEY_NAME" >/dev/null 2>&1; then
    echo "Key pair already exists: $KEY_NAME"
    if [ ! -f "$PEM_PATH" ]; then
        echo "PEM が手元にない場合は SSH できないため、新しい KEY_NAME で再実行してください。" >&2
        exit 1
    fi
else
    echo "Creating key pair..."
    aws ec2 create-key-pair \
        --key-name "$KEY_NAME" \
        --query 'KeyMaterial' \
        --output text > "$TMP_PEM"
    mv "$TMP_PEM" "$PEM_PATH"
    chmod 400 "$PEM_PATH"
    KEY_CREATED=1
fi

# 2. セキュリティグループの作成
echo "Creating security group..."
SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=$SECURITY_GROUP" "Name=vpc-id,Values=$VPC_ID" \
    --query 'SecurityGroups[0].GroupId' \
    --output text 2>/dev/null || true)

if [ -n "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
    SG_CREATED=0
    echo "Using existing security group: $SG_ID"
else
    SG_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP \
        --description "Demo security group" \
        --vpc-id "$VPC_ID" \
        --query 'GroupId' \
        --output text)
    SG_CREATED=1
fi

# 既存ルールを確認し、追加した場合だけ cleanup 対象にする
rule_exists() {
    local port="$1"
    local cidr="$2"
    aws ec2 describe-security-groups \
        --group-ids "$SG_ID" \
        --query 'SecurityGroups[0].IpPermissions' \
        --output json | jq -e --argjson port "$port" --arg cidr "$cidr" '
            .[]
            | select(.IpProtocol == "tcp" and .FromPort == $port and .ToPort == $port)
            | .IpRanges[]?
            | select(.CidrIp == $cidr)
        ' >/dev/null
}

SSH_RULE_CREATED=0
if rule_exists 22 "$SSH_CIDR"; then
    echo "SSH rule already exists for $SSH_CIDR"
else
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 22 \
        --cidr "$SSH_CIDR"
    SSH_RULE_CREATED=1
fi

HTTP_RULE_CREATED=0
if rule_exists 80 "$HTTP_CIDR"; then
    echo "HTTP rule already exists for $HTTP_CIDR"
else
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 80 \
        --cidr "$HTTP_CIDR"
    HTTP_RULE_CREATED=1
fi

# 設定した ingress を確認
aws ec2 describe-security-groups \
    --group-ids "$SG_ID" \
    --query 'SecurityGroups[0].IpPermissions[*].{From:FromPort,To:ToPort,Cidr:IpRanges[*].CidrIp}' \
    --output table

# 3. 最新のAmazon Linux 2023 AMIを取得
echo "Getting latest AMI..."
AMI_ID=$(aws ssm get-parameter \
    --region $REGION \
    --name "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64" \
    --query 'Parameter.Value' \
    --output text)

# 注記: ここでは手動演習を優先して AWS 提供の最新パラメータを参照しています。
# 継続運用や自動化では、動作確認済みの AMI ID を固定するか、自組織で承認した
# SSM Parameter 名へ昇格してから参照する方が再現しやすくなります。

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
    --subnet-id "$SUBNET_ID" \
    --security-group-ids $SG_ID \
    --associate-public-ip-address \
    --user-data file://userdata.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=demo-instance}]" \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "Instance ID: $INSTANCE_ID"

# 6. インスタンスの状態確認
echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# 6-2. ステータスチェック完了を待機
echo "Waiting for instance status checks to pass..."
aws ec2 wait instance-status-ok --instance-ids $INSTANCE_ID

# 7. パブリックIPの取得
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" = "None" ]; then
    echo "Public IP が取得できませんでした。SUBNET_ID が public subnet か、auto-assign public IP が有効か確認してください。" >&2
    exit 1
fi

echo "Instance is running at: $PUBLIC_IP"
echo "SSH: ssh -i $PEM_PATH ec2-user@$PUBLIC_IP"

cat > .ec2-demo.env <<STATE
INSTANCE_ID=$INSTANCE_ID
SG_ID=$SG_ID
SG_CREATED=$SG_CREATED
SSH_RULE_CREATED=$SSH_RULE_CREATED
HTTP_RULE_CREATED=$HTTP_RULE_CREATED
KEY_NAME=$KEY_NAME
PEM_PATH=$PEM_PATH
KEY_CREATED=$KEY_CREATED
STATE
EOF

chmod +x ec2_lifecycle.sh
```

注記: `ec2-user` は Amazon Linux 系の既定例です。Ubuntu 系 AMI では `ubuntu`、Debian 系では `admin` など、接続ユーザー名が異なる場合があります。選択した AMI の公式ドキュメントやコンソール表示でログインユーザー名を確認してください。SSH で接続する場合は、Internet Gateway に到達できる public subnet を `SUBNET_ID` に指定し、public IP の自動割り当て設定も確認してください。

注記: `instance-running` になっても、cloud-init や `UserData` の処理、`nginx` の起動がまだ終わっていない場合があります。`instance-status-ok` の完了後も、必要に応じて 1〜2 分待ってから `curl http://$PUBLIC_IP` や `systemctl status nginx` で確認してください。

注記: `dnf update -y` は起動時間を延ばし、演習結果を時点依存にします。手順理解を優先するハンズオンではそのままでもよいですが、繰り返し実施する検証や教材運用では、AMI と主要パッケージの版を固定するか、更新済み AMI を事前に用意する方が再現しやすくなります。

注記: `run-instances` が失敗して `.ec2-demo.env` を書く前に終了した場合でも、この演習で新規作成した key pair や security group は残ることがあります。再試行前に `aws ec2 describe-key-pairs --key-names "$KEY_NAME"` や `aws ec2 describe-security-groups --group-ids "$SG_ID"` で残存を確認し、不要なら手動で削除してください。

後始末の例:

```bash
# cleanup_ec2_demo.sh
source ./.ec2-demo.env
aws ec2 terminate-instances --instance-ids "$INSTANCE_ID"
aws ec2 wait instance-terminated --instance-ids "$INSTANCE_ID"
if [ "${SSH_RULE_CREATED:-0}" = "1" ]; then
    aws ec2 revoke-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 22 --cidr "$SSH_CIDR" || true
fi
if [ "${HTTP_RULE_CREATED:-0}" = "1" ]; then
    aws ec2 revoke-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80 --cidr "$HTTP_CIDR" || true
fi
if [ "$SG_CREATED" = "1" ]; then
    aws ec2 delete-security-group --group-id "$SG_ID"
fi
if [ "${KEY_CREATED:-0}" = "1" ]; then
    aws ec2 delete-key-pair --key-name "$KEY_NAME"
    rm -f "$PEM_PATH"
fi
rm -f userdata.sh ec2_lifecycle.sh .ec2-demo.env
```

注記: key pair とセキュリティグループは、この演習で新規作成したときだけ cleanup で削除します。既存資産を再利用した場合は、後始末で共用リソースを消さないよう `.ec2-demo.env` の `KEY_CREATED` と `SG_CREATED` を確認してください。インスタンス起動前に `describe-security-groups` の出力で 22/80 の許可 CIDR が意図どおりか確認し、広すぎる場合は `SSH_CIDR` / `HTTP_CIDR` を絞ってから進めてください。再実行時に `InvalidPermission.Duplicate` が出る場合は、同じ ingress ルールが既に存在していないかを確認します。`DependencyViolation` が出る場合は、ENI や ALB がセキュリティグループを掴んでいないかを確認します。`.ec2-demo.env` を残しておくと、別シェルでも cleanup 対象を再取得しやすくなります。

### 演習2：自動スケーリングの実装

注記: ここで使う `ImageId` はリージョンや時点によって変わります。実運用や再現性を重視する検証では、AWS Systems Manager Parameter Store などで公開される AMI パラメータを参照してください。また、`UserData` のパッケージマネージャは OS に合わせて `dnf` / `apt-get` を選びます。

```bash
# autoscaling_demo.sh
cat > autoscaling_demo.sh << 'EOF'
#!/bin/bash

# Auto Scalingの設定デモ

# 1. 起動テンプレートの作成
# 注記: `my-key`, `sg-12345678`, `subnet-12345,subnet-67890` は説明用プレースホルダです。
# 実行前に、自分の key pair 名、アプリ用 security group ID、利用する subnet IDs へ置き換えてください。
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

確認の目安:

- `rg -n 'ami-0abcdef|my-key|sg-12345678|subnet-12345|subnet-67890' launch_template.json` で、説明用プレースホルダが残っていないことを確認してから `create-launch-template` を実行します。
- 到達確認方式は、public subnet + Public IP、ALB 経由、踏み台経由、SSM Session Manager 経由のどれを使うか先に固定します。private subnet 前提で Public IP を期待すると、後続の load test がそのまま失敗します。

注記: `UserData` を Base64 文字列で直書きすると、OS ごとの差分や変更履歴を追いにくくなります。実運用では平文の `userdata.sh` を別ファイルで管理し、`base64 -w0 userdata.sh` で埋め込む方が検証しやすくなります。あわせて、選択した AMI に合わせて `apt-get` / `dnf` を一致させてください。

LT_VERSION=$(aws ec2 create-launch-template --cli-input-json file://launch_template.json --query 'LaunchTemplateVersion.VersionNumber' --output text)
echo "Launch Template version: $LT_VERSION"

# 2. Auto Scalingグループの作成
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name demo-asg \
    --launch-template "LaunchTemplateName=web-server-template,Version=$LT_VERSION" \
    --min-size 2 \
    --max-size 10 \
    --desired-capacity 3 \
    --vpc-zone-identifier "subnet-12345,subnet-67890" \
    --health-check-type EC2 \
    --health-check-grace-period 300

ORIG_MIN=2
ORIG_MAX=10
ORIG_DESIRED=3
cat > .asg-demo.env <<EOF
ORIG_MIN=$ORIG_MIN
ORIG_MAX=$ORIG_MAX
ORIG_DESIRED=$ORIG_DESIRED
EOF

# 3. スケーリングポリシーの設定
# `put-scaling-policy` で参照する前に設定ファイルを作成する
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

# スケールアウトポリシー
aws autoscaling put-scaling-policy \
    --auto-scaling-group-name demo-asg \
    --policy-name scale-out \
    --policy-type TargetTrackingScaling \
    --target-tracking-configuration file://scale_out_policy.json

# 4. 負荷テストスクリプト
cat > load_test.sh << 'LOAD'
#!/bin/bash
# 負荷を生成してAuto Scalingをトリガー
DESIRED_CAPACITY=3

echo "Waiting for ${DESIRED_CAPACITY} instances to reach InService..."
while true; do
    IN_SERVICE=$(aws autoscaling describe-auto-scaling-groups \
        --auto-scaling-group-names demo-asg \
        --query "length(AutoScalingGroups[0].Instances[?LifecycleState=='InService'])" \
        --output text)
    if [ "${IN_SERVICE:-0}" -ge "$DESIRED_CAPACITY" ]; then
        break
    fi
    sleep 15
done

TARGETS=$(aws autoscaling describe-auto-scaling-groups \
    --auto-scaling-group-names demo-asg \
    --query 'AutoScalingGroups[0].Instances[*].InstanceId' \
    --output text)

for instance in $TARGETS; do
    aws ec2 wait instance-status-ok --instance-ids $instance
    IP=$(aws ec2 describe-instances \
        --instance-ids $instance \
        --query 'Reservations[0].Instances[0].PublicIpAddress' \
        --output text)
    if [ -z "$IP" ] || [ "$IP" = "None" ]; then
        echo "Public IP が取得できませんでした。public subnet / ALB / 踏み台 / SSM 前提のどれで到達確認するかを先に決めてください。" >&2
        exit 1
    fi

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

注記: この簡易演習では ALB / target group を作成していないため、Auto Scaling Group のヘルスチェックは `EC2` に寄せています。ELB ヘルスチェックを使う場合は、先に load balancer と target group を作成し、`create-auto-scaling-group` で関連付けてください。

注記: `load_test.sh` は各インスタンスへ直接 `curl` する最小例です。利用する subnet が private subnet の場合は Public IP が付かないため、そのままでは到達確認できません。public subnet での検証、ALB 経由、踏み台ホスト経由、SSM Session Manager 経由のいずれで疎通確認するかを先に固定してください。

確認の目安:

- `aws ec2 describe-launch-templates --launch-template-names web-server-template`
- `aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names demo-asg`
- `aws autoscaling describe-scaling-activities --auto-scaling-group-name demo-asg`

演習後は、Auto Scaling グループ、起動テンプレート、作成した AMI、セキュリティグループ、負荷分散関連リソースが残っていないことも確認してください。
注記: `.asg-demo.env` には rollback 用の元設定を保存しています。rollback が必要なら cleanup の前に使い、確認後に削除してください。

後始末の例:

```bash
aws autoscaling delete-auto-scaling-group --auto-scaling-group-name demo-asg --force-delete
while [ "$(aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names demo-asg --query 'length(AutoScalingGroups)' --output text)" != "0" ]; do
    sleep 15
done
aws ec2 delete-launch-template --launch-template-name web-server-template
rm -f launch_template.json scale_out_policy.json load_test.sh autoscaling_demo.sh .asg-demo.env
```

注記: `--force-delete` は Auto Scaling グループ配下のインスタンスを強制終了するため、共有環境や本番相当環境では使わず、検証専用環境でだけ使ってください。`delete-launch-template` が `ResourceInUse` で失敗する場合は、Auto Scaling グループがまだ完全には削除されていないか、他の環境が同じテンプレートを参照していないかを確認します。
注記: Target Tracking ポリシーを作成した場合は、cleanup 後に `aws autoscaling describe-policies --auto-scaling-group-name demo-asg` と `aws cloudwatch describe-alarms --alarm-name-prefix TargetTracking-demo-asg` で関連ポリシーや CloudWatch alarm が残っていないことも確認してください。

Rollback の例:

```bash
source ./.asg-demo.env
aws autoscaling update-auto-scaling-group \
    --auto-scaling-group-name demo-asg \
    --min-size "$ORIG_MIN" \
    --max-size "$ORIG_MAX" \
    --desired-capacity "$ORIG_DESIRED"
aws autoscaling describe-scaling-activities --auto-scaling-group-name demo-asg
```

注記: `ORIG_MIN` / `ORIG_MAX` / `ORIG_DESIRED` は別シェルへ引き継がれないため、rollback を後から実行する場合は `source ./.asg-demo.env` で退避値を読み戻してください。

確認の目安:

- `aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names demo-asg --query 'length(AutoScalingGroups)' --output text`
- `aws ec2 describe-instances --filters 'Name=tag:Name,Values=AutoScaled-Instance' 'Name=instance-state-name,Values=pending,running,stopping,stopped' --query 'Reservations[].Instances[].InstanceId' --output text`

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

注記: ここでの時間単価は説明用の固定値です。実際の料金はリージョン、購入オプション、時点で変わるため、見積りや予算管理では AWS Pricing と Cost Explorer を確認してください。Cost Explorer は有効化後の準備時間が必要で、データも少なくとも 24 時間単位で更新されます。学習用途では、事前に AWS Budgets で上限通知を設定してから進める方が安全です。

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
set -euo pipefail

echo "=== Disaster Recovery Setup ==="

# 1. マルチリージョンバックアップ
PRIMARY_REGION="ap-northeast-1"  # 東京
DR_REGION="ap-southeast-1"       # シンガポール

# 注記: `AWS_DEFAULT_REGION` が別リージョンを向いていると、
# create-image / wait image-available / modify-db-instance などが意図しないリージョンへ作用します。
# 実行前に `export AWS_DEFAULT_REGION=$PRIMARY_REGION` で明示するか、
# 各コマンドへ `--region` を付けて対象リージョンを固定してください。

# AMIの作成とコピー
echo "Creating AMI from running instance..."
INSTANCE_ID="i-1234567890abcdef0"

# AMIの作成
AMI_ID=$(aws ec2 create-image \
    --region $PRIMARY_REGION \
    --instance-id $INSTANCE_ID \
    --name "DR-backup-$(date +%Y%m%d-%H%M%S)" \
    --description "Disaster recovery backup" \
    --no-reboot \
    --query 'ImageId' \
    --output text)

echo "Created AMI: $AMI_ID"

# AMIが利用可能になるまで待機
aws ec2 wait image-available --region $PRIMARY_REGION --image-ids $AMI_ID

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
aws ec2 wait image-available --region $DR_REGION --image-ids $DR_AMI_ID

# 2. RDSの自動バックアップ設定
cat > rds_backup_config.json << 'JSON'
{
    "DBInstanceIdentifier": "production-db",
    "BackupRetentionPeriod": 7,
    "PreferredBackupWindow": "03:00-04:00",
    "PreferredMaintenanceWindow": "sun:04:00-sun:05:00"
}
JSON

aws rds modify-db-instance --region $PRIMARY_REGION --cli-input-json file://rds_backup_config.json

# 3. S3クロスリージョンレプリケーション
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
aws s3api head-bucket --region $PRIMARY_REGION --bucket production-bucket
aws s3api head-bucket --region $DR_REGION --bucket dr-backup-bucket

# 前提: source / destination bucket の versioning を有効化
aws s3api put-bucket-versioning \
    --region $PRIMARY_REGION \
    --bucket production-bucket \
    --versioning-configuration Status=Enabled

aws s3api put-bucket-versioning \
    --region $DR_REGION \
    --bucket dr-backup-bucket \
    --versioning-configuration Status=Enabled

# レプリケーション用 IAM ロールの存在確認
aws iam get-role --role-name replication-role >/dev/null

cat > s3_replication.json << 'JSON'
{
    "Role": "arn:aws:iam::ACCOUNT_ID_PLACEHOLDER:role/replication-role",
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

sed -i "s/ACCOUNT_ID_PLACEHOLDER/$ACCOUNT_ID/" s3_replication.json

aws s3api put-bucket-replication \
    --region $PRIMARY_REGION \
    --bucket production-bucket \
    --replication-configuration file://s3_replication.json

# 設定確認
aws s3api get-bucket-versioning --region $PRIMARY_REGION --bucket production-bucket
aws s3api get-bucket-versioning --region $DR_REGION --bucket dr-backup-bucket
aws s3api get-bucket-replication --region $PRIMARY_REGION --bucket production-bucket

TEST_KEY="replication-check-$(date +%Y%m%d-%H%M%S).txt"
echo "replication-check $(date -u +%FT%TZ)" > /tmp/$TEST_KEY
aws s3 cp /tmp/$TEST_KEY s3://production-bucket/$TEST_KEY --region $PRIMARY_REGION
echo "テストオブジェクトを投入しました。一定時間後に aws s3 ls s3://dr-backup-bucket/$TEST_KEY --region $DR_REGION で複製を確認してください。"

# 4. 自動フェイルオーバースクリプト
cat > failover.sh << 'FAILOVER'
#!/bin/bash
set -euo pipefail
# 災害時のフェイルオーバー手順

DR_REGION="ap-southeast-1"
DR_AMI_ID="ami-0987654321"

echo "Starting failover to DR region..."

# 1. DRリージョンでインスタンスを起動
DR_INSTANCE_IDS=$(aws ec2 run-instances \
    --region $DR_REGION \
    --image-id $DR_AMI_ID \
    --instance-type m5.large \
    --count 3 \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=DR-Instance}]' \
    --query 'Instances[*].InstanceId' \
    --output text)

cleanup_dr_instances() {
    if [ -n "${DR_INSTANCE_IDS:-}" ]; then
        aws ec2 terminate-instances --region "$DR_REGION" --instance-ids $DR_INSTANCE_IDS >/dev/null || true
        aws ec2 wait instance-terminated --region "$DR_REGION" --instance-ids $DR_INSTANCE_IDS || true
    fi
}

trap cleanup_dr_instances EXIT INT TERM

aws ec2 wait instance-status-ok --region $DR_REGION --instance-ids $DR_INSTANCE_IDS

# 2. DR側のヘルスゲートを確認
TARGET_GROUP_ARN="${TARGET_GROUP_ARN:-}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-}"

if [ -n "$TARGET_GROUP_ARN" ]; then
    for instance_id in $DR_INSTANCE_IDS; do
        aws elbv2 wait target-in-service             --region $DR_REGION             --target-group-arn "$TARGET_GROUP_ARN"             --targets Id="$instance_id"
    done
fi

if [ -n "$HEALTHCHECK_URL" ] && ! curl -fsS "$HEALTHCHECK_URL" >/dev/null; then
    echo "DR health check failed. Keep Route 53 on primary region." >&2
    exit 1
fi

# 3. Route 53のDNSレコードを更新
CHANGE_ID=$(aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890ABC \
    --change-batch file://dns_failover.json \
    --query 'ChangeInfo.Id' \
    --output text)

for attempt in $(seq 1 20); do
    STATUS=$(aws route53 get-change --id "$CHANGE_ID" --query 'ChangeInfo.Status' --output text)
    if [ "$STATUS" = "INSYNC" ]; then
        break
    fi
    sleep 15
done

if [ "${STATUS:-PENDING}" != "INSYNC" ]; then
    echo "DNS change did not reach INSYNC within timeout. Keep primary record and start failback / cleanup." >&2
    exit 1
fi

trap - EXIT INT TERM

echo "Failover completed. Services are now running in $DR_REGION"
FAILOVER

chmod +x failover.sh
EOF

chmod +x disaster_recovery.sh
```

確認の目安:

- `aws ec2 describe-images --region $PRIMARY_REGION --image-ids $AMI_ID --query 'Images[0].[State,CreationDate]' --output table`
- `aws ec2 describe-images --region $DR_REGION --image-ids $DR_AMI_ID --query 'Images[0].[State,CreationDate]' --output table`
- `aws rds describe-db-instances --region $PRIMARY_REGION --db-instance-identifier production-db --query 'DBInstances[0].[BackupRetentionPeriod,PreferredBackupWindow]' --output table`
- `aws s3api get-bucket-versioning --region $PRIMARY_REGION --bucket production-bucket`
- `aws s3api get-bucket-replication --region $PRIMARY_REGION --bucket production-bucket`
- `TARGET_GROUP_ARN` を使う場合は `aws elbv2 describe-target-health --region $DR_REGION --target-group-arn "$TARGET_GROUP_ARN"` で全ターゲットが `healthy` になっていることを確認してから DNS を切り替えます。

注記: `instance-status-ok` は EC2 インスタンスの基礎ヘルスであり、アプリケーションの起動完了や ALB 配下の target health までは保証しません。`HEALTHCHECK_URL` または target group の確認に失敗した場合は DNS を切り替えず、DR 側インスタンスを停止または terminate してから primary 側の復旧状況を再確認してください。

後始末 / rollback の例:

```bash
PRIMARY_SNAPSHOT_IDS=$(aws ec2 describe-images \
    --region $PRIMARY_REGION \
    --image-ids $AMI_ID \
    --query 'Images[0].BlockDeviceMappings[].Ebs.SnapshotId' \
    --output text)
DR_SNAPSHOT_IDS=$(aws ec2 describe-images \
    --region $DR_REGION \
    --image-ids $DR_AMI_ID \
    --query 'Images[0].BlockDeviceMappings[].Ebs.SnapshotId' \
    --output text)

aws ec2 deregister-image --region $PRIMARY_REGION --image-id $AMI_ID
aws ec2 deregister-image --region $DR_REGION --image-id $DR_AMI_ID
for snap in $PRIMARY_SNAPSHOT_IDS; do aws ec2 delete-snapshot --region $PRIMARY_REGION --snapshot-id "$snap"; done
for snap in $DR_SNAPSHOT_IDS; do aws ec2 delete-snapshot --region $DR_REGION --snapshot-id "$snap"; done
aws s3api delete-bucket-replication --region $PRIMARY_REGION --bucket production-bucket
aws rds modify-db-instance --region $PRIMARY_REGION --db-instance-identifier production-db --backup-retention-period 1 --apply-immediately

PRIMARY_CHANGE_ID=$(aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890ABC \
    --change-batch file://dns_primary.json \
    --query 'ChangeInfo.Id' \
    --output text)
for attempt in $(seq 1 20); do
    PRIMARY_STATUS=$(aws route53 get-change --id "$PRIMARY_CHANGE_ID" --query 'ChangeInfo.Status' --output text)
    if [ "$PRIMARY_STATUS" = "INSYNC" ]; then
        break
    fi
    sleep 15
done
if [ "${PRIMARY_STATUS:-PENDING}" != "INSYNC" ]; then
    echo "Primary DNS change did not reach INSYNC within timeout. Stop cleanup and investigate Route 53 state." >&2
    exit 1
fi
dig +short www.example.com
```

注記: S3 レプリケーションは source / destination の両 bucket で versioning が有効であること、IAM ロールに `s3:GetReplicationConfiguration` / `s3:ReplicateObject` などの権限があることが前提です。失敗した場合は `get-bucket-versioning`、`get-bucket-replication`、CloudTrail を順に確認してください。

注記: `replication-role` の ARN は、実行中アカウントの `ACCOUNT_ID` から組み立てています。別アカウントへ複製する場合は、destination bucket policy、KMS キー権限、IAM ロールの trust / permission policy も別途揃っている必要があります。

注記: 実際に failover を実行した場合は、AMI / snapshot だけでなく Route 53 のレコードも primary 側へ戻し、DR リージョンで `Name=DR-Instance` などのタグを付けて起動したインスタンスも `terminate-instances` と `wait instance-terminated` で明示的に停止してください。DNS を戻す前に、`dig` やアプリケーションの疎通確認で primary 側が復旧していることを確認する方が安全です。

注記: rollback をより確実にするには、演習前に `aws rds describe-db-instances`、`aws s3api get-bucket-versioning`、`aws s3api get-bucket-replication` の出力を保存し、その値へ戻せるようにしておく方が安全です。疎通確認用のオブジェクトは `replication-check/` のような専用 prefix に限定し、演習後に source / destination の両 bucket で削除確認まで行ってください。
注記: DNS failback も手順化し、`dns_primary.json` を使った Route 53 更新後に `get-change` が `INSYNC` になること、`dig` やアプリケーションの `/health` で primary 側へ戻ったことを確認してください。

### 演習5：インフラストラクチャのコード化（IaC）

```bash
# infrastructure_as_code.sh
cat > infrastructure_as_code.sh << 'EOF'
#!/bin/bash
set -euo pipefail

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

  AllowedIngressCidr:
    Description: ALB へ到達を許可する送信元 CIDR（例: 203.0.113.10/32）
    Type: String
    Default: 203.0.113.10/32

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
      # 注記: ここでは CIDR allowlist を前提にしています。公開検証でも 0.0.0.0/0 のまま残さず、
      # 自端末や踏み台のグローバル IP へ絞り込んでください。公開用途では WAF や internal ALB への置き換えも検討します。
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: !Ref AllowedIngressCidr
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: !Ref AllowedIngressCidr

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
set -euo pipefail

ENV_NAME=${1:-Production}
AWS_REGION=$(aws configure get region)

if [ -z "${AWS_REGION:-}" ]; then
    echo "Set AWS default region before running this script." >&2
    exit 1
fi

aws sts get-caller-identity >/dev/null

echo "Deploying infrastructure for environment: $ENV_NAME in region: $AWS_REGION"

# 事前検証
aws cloudformation validate-template --template-body file://network-stack.yaml
aws cloudformation validate-template --template-body file://application-stack.yaml

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
    --query 'Stacks[0].Outputs' \
    --output table
DEPLOY

chmod +x deploy_infrastructure.sh
EOF

chmod +x infrastructure_as_code.sh
```

注記: Application stack は Network stack の export 値に依存します。後始末では Application stack を先に削除し、その完了を待ってから Network stack を削除してください。

注記: `deploy_infrastructure.sh` は AWS CLI の default region を参照します。実行前に `aws sts get-caller-identity` と `aws configure get region` が期待するアカウント / リージョンを返すことを確認してください。

注記: template に IAM role や policy を含める場合は、`create-stack` / `deploy` に `--capabilities CAPABILITY_NAMED_IAM` も必要です。ハンズオンでは最小構成なら不要ですが、テンプレートを拡張したあとに `InsufficientCapabilitiesException` が出たら、先に IAM リソースの有無を確認してください。

注記: `validate-template` は YAML / JSON 構文や CloudFormation テンプレートとしての基本妥当性を確認するもので、実際の reachability や ALB の HTTP 応答までは保証しません。`LoadBalancerURL` が出力されても、疎通確認は `curl` や target health の確認まで別途行ってください。

注記: `wait stack-create-complete` が失敗した場合は、すぐ再実行せずに `aws cloudformation describe-stack-events --stack-name ${ENV_NAME}-Application --max-items 20` や `... ${ENV_NAME}-Network ...` で直近の失敗リソースを確認してください。`ROLLBACK_COMPLETE` や `CREATE_FAILED` の stack を残したまま再試行すると、同じ stack 名や export 名が衝突することがあります。

注記: `create-stack` は同名 stack が残っている状態では再実行できません。2 回目以降の更新や review 用差分確認では `aws cloudformation deploy --stack-name ... --template-file ... --capabilities CAPABILITY_NAMED_IAM --no-execute-changeset` で change set を確認するか、運用後差分は `aws cloudformation detect-stack-drift --stack-name ${ENV_NAME}-Application` で確認してください。

後始末の例:

```bash
ENV_NAME=${1:-Production}
aws cloudformation delete-stack --stack-name "${ENV_NAME}-Application"
aws cloudformation wait stack-delete-complete --stack-name "${ENV_NAME}-Application"
aws cloudformation delete-stack --stack-name "${ENV_NAME}-Network"
aws cloudformation wait stack-delete-complete --stack-name "${ENV_NAME}-Network"
rm -f network-stack.yaml application-stack.yaml deploy_infrastructure.sh
```

注記: この最小例では `LaunchTemplate.LatestVersionNumber` を使っていますが、実運用や review では承認済み version を固定する方が安全です。たとえば `LaunchTemplateVersion` を `Parameters` で受け、`Version: !Ref LaunchTemplateVersion` のように明示 version を渡す形へ寄せると、review 外の Launch Template 更新を Auto Scaling Group が拾いにくくなります。`aws cloudformation validate-template --template-body file://application-stack.yaml` や `aws cloudformation deploy --no-execute-changeset ...` で参照 version を確認してから適用してください。

注記: delete wait が失敗した場合は、`aws cloudformation describe-stack-events --stack-name "${ENV_NAME}-Application" --max-items 20` で削除失敗リソースを確認し、依存する ENI や security group、手動で追加した付帯リソースが残っていないかを先に確認してください。削除後は `aws cloudformation describe-stacks --stack-name "${ENV_NAME}-Application"` や `list-exports` が失敗することを確認し、stack / export が残っていないことも見てください。

注記: `delete-stack` が成功しても、`DeletionPolicy: Retain` / `Snapshot` を持つリソースや、`DELETE_FAILED` のまま残った NAT Gateway / EIP / 非空 S3 bucket / RDS snapshot までは自動で片付きません。演習後は stack events と残存リソースを確認し、継続課金要因を個別に棚卸ししてください。
注記: post-delete verify では、`aws ec2 describe-nat-gateways --filter Name=state,Values=available,pending,deleting`、`aws ec2 describe-addresses --query 'Addresses[*].[AllocationId,AssociationId,PublicIp]' --output table`、`aws cloudformation list-exports` を実行し、stack 削除後も課金対象や export 名が残っていないことを確認してください。

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

注記: `create-patch-baseline` だけではノードへ自動適用されません。`Patch Group` で対象ノードを束ねるか、Maintenance Window または `AWS-RunPatchBaseline` 実行まで含めて初めて運用フローになります。

確認の目安:

- `aws ssm describe-instance-patch-states --instance-ids i-1234567890abcdef0`
- `aws ssm describe-instance-patches --instance-id i-1234567890abcdef0 --filters Key=State,Values=Installed`
- `aws ssm get-patch-baseline --baseline-id pb-xxxxxxxx`

注記: `describe-instance-patch-states` を確認するときは、association や compliance が成功していても `MissingCount` と `InstalledPendingRebootCount` が残っていないかを別途確認してください。再起動待ちや未適用が残ると、運用上は「完了」でも実体は揃っていないことがあります。

後始末の例:

```bash
aws ssm deregister-patch-baseline-for-patch-group \
  --baseline-id pb-xxxxxxxx \
  --patch-group "AL2023-DEV"
aws ssm delete-patch-baseline --baseline-id pb-xxxxxxxx
```

注記: Maintenance Window や patch association を併用した場合は、baseline を消す前に関連する Window / Target / Task / Association も先に外してください。association や Window が残ったままだと、次回実行で想定外の baseline が再利用されることがあります。

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
