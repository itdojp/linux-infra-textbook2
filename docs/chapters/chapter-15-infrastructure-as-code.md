---
layout: book
order: 17
title: "第15章：自動化への道 - Infrastructure as Code"
---

# 第15章：自動化への道 - Infrastructure as Code

## 📚 この章の前提知識
- ✅ **必要**: 第12-14章のAWSクラウド技術の理解
- ✅ **必要**: YAMLやJSONの基本的な読み書き
- ✅ **推奨**: Gitの基本操作
- ❌ **不要**: 高度なプログラミングスキル

## 🎯 この章の目標
- Infrastructure as Code（IaC）の概念とメリットを理解する
- Terraformの基本的な使い方をマスターする
- コードでインフラを管理するベストプラクティスを学ぶ

## 🚀 この章でできるようになること
- TerraformでAWSリソースをコードで管理できる
- インフラのバージョン管理と変更追跡ができる
- チームでのインフラ共有とコラボレーションができる

## 15.1 はじめに：手作業からの解放

深夜3時。新しいサーバーを追加する必要が生じました。従来なら：

1. 管理コンソールにログイン
2. サーバーの設定を一つずつ入力
3. ネットワーク設定を手動で構成
4. ソフトウェアをインストール
5. 設定ファイルを編集
6. サービスを起動

眠い目をこすりながらの作業。一つでも間違えれば、サービスに影響が出るかもしれない。

しかし今は違います。

```bash
terraform apply
```

たった一つのコマンドで、複雑なインフラストラクチャが正確に、再現可能な形で構築される。これがInfrastructure as Code（IaC）の世界です。

## 15.2 手作業の限界と人的ミスの排除

### 手作業の問題点

#### 実例：ある企業の悲劇
```
2019年某日、大手企業のインフラエンジニアAさんの作業記録：

09:00 - 本番サーバー#1の設定変更開始
09:30 - 本番サーバー#2の設定変更開始
09:45 - 本番サーバー#3の設定変更開始
        → あれ？#2の設定、一つ抜けてない？
10:00 - サービス障害発生
        → #2だけ設定が異なり、ロードバランサーから外れる
10:30 - 原因特定、手動で修正
11:00 - サービス復旧

損失：1時間のダウンタイム、信頼の失墜
```

### 人的ミスの分類と対策

#### 1. 設定ミス
```yaml
# 手作業での典型的なミス
server1: memory=8GB, cpu=4
server2: memory=8GB, cpu=4
server3: memory=8G, cpu=4  # 単位の誤り！

# IaCでの防止
variable "server_config" {
  type = object({
    memory = string
    cpu    = number
  })
  default = {
    memory = "8GB"
    cpu    = 4
  }
  
  validation {
    condition     = can(regex("^[0-9]+[GM]B$", var.server_config.memory))
    error_message = "Memory must be in format like '8GB' or '512MB'."
  }
}
```

#### 2. 手順の抜け漏れ
```bash
# 手作業の手順書（人間はミスをする）
1. サーバーを作成
2. セキュリティグループを設定
3. ソフトウェアをインストール
4. 設定ファイルを編集
5. 監視設定を追加 ← よく忘れられる

# IaCでは依存関係が明確
resource "aws_instance" "web" {
  # ...
}

resource "aws_cloudwatch_metric_alarm" "cpu" {
  # EC2インスタンスに自動的に紐付けられる
  dimensions = {
    InstanceId = aws_instance.web.id
  }
}
```

#### 3. 環境間の差異
```hcl
# 環境ごとの設定を変数で管理
variable "environment" {
  type = string
}

locals {
  instance_type = {
    dev  = "t3.micro"
    stg  = "t3.small"
    prod = "t3.large"
  }
}

resource "aws_instance" "app" {
  instance_type = local.instance_type[var.environment]
  # 環境に応じて自動的に適切なサイズが選択される
}
```

## 15.3 宣言的設定と冪等性

### 宣言的 vs 命令的

#### 命令的アプローチ（従来のスクリプト）
```bash
# 命令的：「どうやって」作るかを記述
#!/bin/bash
# サーバーが既に存在するかチェックしない
# 2回実行すると2台作られる！
aws ec2 run-instances --instance-type t3.micro --count 1

# ファイアウォールルールを追加
# 既に存在していてもエラーチェックなし
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
```

#### 宣言的アプローチ（IaC）
```hcl
# 宣言的：「何が」欲しいかを記述
resource "aws_instance" "web" {
  instance_type = "t3.micro"
  count         = 1
  
  # タグで識別
  tags = {
    Name = "WebServer"
  }
}

# 何度実行しても結果は同じ（冪等性）
# - 存在しなければ作成
# - 存在すれば何もしない
# - 設定が違えば修正
```

### 冪等性の重要性

#### 冪等性とは
```
f(x) = f(f(x)) = f(f(f(x))) = ...

何度実行しても同じ結果になる性質
```

#### 実例で理解する冪等性
```python
# 冪等でない操作
counter += 1  # 実行するたびに値が変わる

# 冪等な操作
counter = 10  # 何度実行しても counter は 10

# インフラでの冪等性
desired_state = {
    'servers': 3,
    'load_balancer': 1,
    'database': 'mysql'
}

current_state = get_current_infrastructure()
if current_state != desired_state:
    apply_changes(desired_state)
# 既に望む状態なら何もしない
```

### 状態管理の仕組み

#### Terraformの状態管理
```hcl
# terraform.tfstate - 現在の状態を記録
{
  "version": 4,
  "terraform_version": "1.0.0",
  "resources": [
    {
      "mode": "managed",
      "type": "aws_instance",
      "name": "web",
      "provider": "provider[\"registry.terraform.io/hashicorp/aws\"]",
      "instances": [
        {
          "attributes": {
            "id": "i-1234567890abcdef0",
            "instance_type": "t3.micro",
            "public_ip": "203.0.113.10",
            "tags": {
              "Name": "WebServer"
            }
          }
        }
      ]
    }
  ]
}
```

#### 状態の同期
```bash
# 実際のインフラと状態ファイルの差分を確認
terraform plan

# 差分があれば表示される
# ~ resource "aws_instance" "web" {
#     ~ instance_type = "t3.micro" -> "t3.small"
#   }

# 差分を適用
terraform apply
```

## 15.4 再現可能で監査可能なインフラ

### バージョン管理との統合

#### Gitによるインフラコードの管理
```bash
# ディレクトリ構造
infrastructure/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
├── modules/
│   ├── vpc/
│   ├── compute/
│   └── database/
└── .gitignore

# バージョン管理
git add .
git commit -m "Add auto-scaling configuration for production"
git push origin main
```

#### コードレビューによる品質保証
```yaml
# .github/workflows/terraform-pr.yml
name: Terraform Pull Request Check

on:
  pull_request:
    paths:
      - 'infrastructure/**'

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v1
      
      - name: Terraform Format Check
        run: terraform fmt -check -recursive
      
      - name: Terraform Init
        run: terraform init
      
      - name: Terraform Validate
        run: terraform validate
      
      - name: Terraform Plan
        run: terraform plan -out=tfplan
      
      - name: Post Plan to PR
        uses: actions/github-script@v6
        with:
          script: |
            const plan = require('fs').readFileSync('tfplan.txt', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Terraform Plan\n\`\`\`\n${plan}\n\`\`\``
            });
```

### 監査証跡（Audit Trail）

#### 変更履歴の完全な記録
```bash
# すべての変更がGitに記録される
git log --oneline infrastructure/

# 出力例：
# a1b2c3d Add ALB for high availability
# d4e5f6g Increase instance size for production
# g7h8i9j Add CloudWatch alarms
# j1k2l3m Initial infrastructure setup

# 特定の変更の詳細を確認
git show a1b2c3d

# 誰が、いつ、何を、なぜ変更したかが明確
```

#### コンプライアンス対応
```hcl
# ポリシーの強制
resource "aws_s3_bucket" "data" {
  bucket = "company-sensitive-data"
  
  # 暗号化を強制
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
  
  # バージョニングを有効化
  versioning {
    enabled = true
  }
  
  # ロギングを有効化
  logging {
    target_bucket = aws_s3_bucket.logs.id
    target_prefix = "s3-access-logs/"
  }
  
  # パブリックアクセスをブロック
  public_access_block {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }
  
  # タグによる管理
  tags = {
    Environment = var.environment
    Compliance  = "GDPR"
    Owner       = "DataTeam"
    CreatedBy   = "Terraform"
  }
}
```

### ドリフト検出と修正

#### 手動変更の検出
```bash
# 実際のインフラとコードの差異を検出
terraform plan -refresh-only

# ドリフトが検出された場合の出力例：
# Note: Objects have changed outside of Terraform
# 
# aws_security_group.web has been changed:
#   ~ ingress = [
#       + {
#           + from_port   = 8080
#           + to_port     = 8080
#           + protocol    = "tcp"
#           + cidr_blocks = ["0.0.0.0/0"]
#         },
#     ]

# ドリフトの修正（コードに合わせる）
terraform apply -refresh-only
```

## 15.5 演習：手作業から自動化への段階的移行

### 演習1：既存インフラのコード化

```bash
# import_existing_infra.sh
cat > import_existing_infra.sh << 'EOF'
#!/bin/bash

echo "=== Importing Existing Infrastructure to Terraform ==="

# 1. 既存リソースの調査
echo "Discovering existing resources..."

# EC2インスタンスの一覧取得
instances=$(aws ec2 describe-instances \
    --query 'Reservations[*].Instances[*].[InstanceId,Tags[?Key==`Name`].Value|[0]]' \
    --output text)

# 2. Terraformコードの生成
cat > main.tf << 'TF'
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}
TF

# 3. 各インスタンスのインポート
while IFS=$'\t' read -r instance_id name; do
    echo "Importing instance: $instance_id ($name)"
    
    # Terraformリソース定義を追加
    cat >> main.tf << TF

resource "aws_instance" "$name" {
  # Imported resource
}
TF
    
    # 実際のインポート
    terraform import "aws_instance.$name" "$instance_id"
done <<< "$instances"

# 4. 設定の詳細を取得して更新
echo "Updating resource configurations..."
terraform plan
EOF

chmod +x import_existing_infra.sh
```

### 演習2：モジュール化による再利用性向上

```hcl
# modules/web-server/main.tf
variable "instance_count" {
  description = "Number of instances"
  type        = number
  default     = 1
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

# Launch Template
resource "aws_launch_template" "web" {
  name_prefix   = "${var.environment}-web-"
  image_id      = data.aws_ami.amazon_linux_2.id
  instance_type = var.instance_type
  
  vpc_security_group_ids = [aws_security_group.web.id]
  
  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y nginx
    systemctl start nginx
    systemctl enable nginx
    
    # カスタムページ
    cat > /usr/share/nginx/html/index.html <<-HTML
    <h1>Welcome to ${var.environment} environment</h1>
    <p>Server: $(hostname)</p>
    <p>Instance Type: ${var.instance_type}</p>
    HTML
  EOF
  )
  
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.environment}-web-server"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "web" {
  name               = "${var.environment}-web-asg"
  vpc_zone_identifier = var.subnet_ids
  target_group_arns  = [aws_lb_target_group.web.arn]
  health_check_type  = "ELB"
  health_check_grace_period = 300
  
  min_size         = var.instance_count
  max_size         = var.instance_count * 3
  desired_capacity = var.instance_count
  
  launch_template {
    id      = aws_launch_template.web.id
    version = "$Latest"
  }
  
  tag {
    key                 = "Name"
    value               = "${var.environment}-web-asg"
    propagate_at_launch = false
  }
}

# Application Load Balancer
resource "aws_lb" "web" {
  name               = "${var.environment}-web-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids
  
  enable_deletion_protection = var.environment == "production"
  
  tags = {
    Name        = "${var.environment}-web-alb"
    Environment = var.environment
  }
}

# Output
output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = aws_lb.web.dns_name
}

output "autoscaling_group_name" {
  description = "Name of the Auto Scaling group"
  value       = aws_autoscaling_group.web.name
}
```

### 演習3：CI/CDパイプラインの構築

```yaml
# .gitlab-ci.yml - GitLab CI/CD設定
stages:
  - validate
  - plan
  - apply
  - destroy

variables:
  TF_ROOT: ${CI_PROJECT_DIR}/infrastructure
  TF_STATE_NAME: ${CI_PROJECT_NAME}-${CI_ENVIRONMENT_NAME}

before_script:
  - cd ${TF_ROOT}
  - terraform init
    -backend-config="bucket=terraform-state-bucket"
    -backend-config="key=${TF_STATE_NAME}/terraform.tfstate"
    -backend-config="region=ap-northeast-1"

validate:
  stage: validate
  script:
    - terraform fmt -check -recursive
    - terraform validate
    - tflint
    - checkov -d . --framework terraform
  rules:
    - if: $CI_MERGE_REQUEST_ID

plan:development:
  stage: plan
  script:
    - terraform workspace select development || terraform workspace new development
    - terraform plan -var-file=environments/development.tfvars -out=plan.tfplan
    - terraform show -no-color plan.tfplan > plan.txt
  artifacts:
    paths:
      - ${TF_ROOT}/plan.tfplan
      - ${TF_ROOT}/plan.txt
    expire_in: 7 days
  environment:
    name: development
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"

apply:development:
  stage: apply
  script:
    - terraform workspace select development
    - terraform apply -auto-approve plan.tfplan
  dependencies:
    - plan:development
  environment:
    name: development
    on_stop: destroy:development
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
      when: manual

plan:production:
  stage: plan
  script:
    - terraform workspace select production || terraform workspace new production
    - terraform plan -var-file=environments/production.tfvars -out=plan.tfplan
    - terraform show -no-color plan.tfplan > plan.txt
  artifacts:
    paths:
      - ${TF_ROOT}/plan.tfplan
      - ${TF_ROOT}/plan.txt
    expire_in: 7 days
  environment:
    name: production
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

apply:production:
  stage: apply
  script:
    - terraform workspace select production
    - terraform apply -auto-approve plan.tfplan
    # 適用後の検証
    - ./scripts/validate_deployment.sh
  dependencies:
    - plan:production
  environment:
    name: production
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
  only:
    - main

destroy:development:
  stage: destroy
  script:
    - terraform workspace select development
    - terraform destroy -auto-approve -var-file=environments/development.tfvars
  environment:
    name: development
    action: stop
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
      when: manual
```

### 演習4：ポリシーアズコード

```hcl
# policy.sentinel - Sentinelポリシー
import "tfplan/v2" as tfplan
import "tfconfig/v2" as tfconfig

# ポリシー1: インスタンスタイプの制限
instance_type_allowed = rule {
    all tfplan.resource_changes as _, rc {
        rc.type is not "aws_instance" or
        rc.change.after.instance_type in [
            "t3.micro",
            "t3.small",
            "t3.medium",
            "m5.large",
            "m5.xlarge"
        ]
    }
}

# ポリシー2: 必須タグの確認
mandatory_tags = rule {
    all tfplan.resource_changes as _, rc {
        rc.mode is not "managed" or
        rc.change.after.tags is null or
        all [
            "Environment",
            "Owner",
            "CostCenter",
            "Project"
        ] as required_tag {
            required_tag in keys(rc.change.after.tags)
        }
    }
}

# ポリシー3: 暗号化の強制
encryption_required = rule {
    all tfplan.resource_changes as _, rc {
        rc.type is not "aws_s3_bucket" or
        rc.change.after.server_side_encryption_configuration is not null
    }
}

# ポリシー4: パブリックアクセスの禁止
no_public_access = rule {
    all tfplan.resource_changes as _, rc {
        rc.type is not "aws_s3_bucket" or
        (rc.change.after.acl is "private" and
         rc.change.after.public_access_block is not null and
         rc.change.after.public_access_block[0].block_public_acls is true)
    }
}

# メインルール
main = rule {
    instance_type_allowed and
    mandatory_tags and
    encryption_required and
    no_public_access
}
```

### 演習5：災害復旧の自動化

```hcl
# disaster_recovery.tf - 災害復旧の自動化
module "primary_region" {
  source = "./modules/regional-infrastructure"
  
  region      = "ap-northeast-1"
  environment = var.environment
  vpc_cidr    = "10.0.0.0/16"
  
  enable_backup = true
  backup_retention_days = 30
}

module "dr_region" {
  source = "./modules/regional-infrastructure"
  
  region      = "ap-southeast-1"
  environment = "${var.environment}-dr"
  vpc_cidr    = "10.1.0.0/16"
  
  # DRリージョンは最小構成
  instance_count = var.dr_mode ? var.instance_count : 0
  instance_type  = var.dr_mode ? var.instance_type : "t3.micro"
}

# クロスリージョンレプリケーション
resource "aws_s3_bucket_replication_configuration" "dr" {
  role   = aws_iam_role.replication.arn
  bucket = module.primary_region.s3_bucket_id
  
  rule {
    id     = "dr-replication"
    status = "Enabled"
    
    destination {
      bucket        = module.dr_region.s3_bucket_arn
      storage_class = "STANDARD_IA"
    }
  }
}

# RDSの自動バックアップ
resource "aws_db_instance" "primary" {
  identifier = "${var.environment}-database"
  
  # スナップショットからの復元をサポート
  snapshot_identifier = var.restore_from_snapshot
  
  # 自動バックアップ
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  
  # 最終スナップショットの作成
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.environment}-database-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
}

# DR切り替えスクリプト
resource "null_resource" "dr_failover_script" {
  provisioner "local-exec" {
    command = <<-EOT
      cat > failover_to_dr.sh << 'EOF'
      #!/bin/bash
      echo "Starting failover to DR region..."
      
      # 1. Route 53の切り替え
      aws route53 change-resource-record-sets \
        --hosted-zone-id ${aws_route53_zone.main.id} \
        --change-batch '{
          "Changes": [{
            "Action": "UPSERT",
            "ResourceRecordSet": {
              "Name": "${var.domain_name}",
              "Type": "A",
              "AliasTarget": {
                "HostedZoneId": "${module.dr_region.alb_zone_id}",
                "DNSName": "${module.dr_region.alb_dns_name}",
                "EvaluateTargetHealth": true
              }
            }
          }]
        }'
      
      # 2. DRインスタンスの起動
      terraform apply -var="dr_mode=true" -auto-approve
      
      echo "Failover completed!"
      EOF
      
      chmod +x failover_to_dr.sh
    EOT
  }
}

# 監視とアラート
resource "aws_cloudwatch_metric_alarm" "dr_health" {
  alarm_name          = "${var.environment}-dr-health"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "This metric monitors DR region health"
  
  dimensions = {
    TargetGroup  = module.dr_region.target_group_arn_suffix
    LoadBalancer = module.dr_region.alb_arn_suffix
  }
  
  alarm_actions = [aws_sns_topic.alerts.arn]
}
```

## 15.6 IaCのベストプラクティス

### コード構造とモジュール設計

```bash
# 推奨されるディレクトリ構造
.
├── README.md
├── .gitignore
├── .pre-commit-config.yaml
├── environments/
│   ├── dev/
│   │   ├── backend.tf
│   │   ├── main.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars
│   │   └── variables.tf
│   ├── staging/
│   └── production/
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── outputs.tf
│   │   ├── variables.tf
│   │   └── README.md
│   ├── compute/
│   ├── database/
│   └── monitoring/
├── policies/
│   ├── security.sentinel
│   └── cost.sentinel
└── scripts/
    ├── setup.sh
    └── validate.sh
```

### セキュリティのベストプラクティス

```hcl
# secrets.tf - シークレット管理
# 1. 環境変数から取得
variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# 2. AWS Secrets Managerの使用
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "rds/production/password"
}

# 3. 暗号化されたtfvarsファイル
# terraform.tfvars.encrypted（git-cryptで暗号化）
db_password = "encrypted_value_here"

# 4. リソースでの使用
resource "aws_db_instance" "main" {
  password = var.db_password  # または data.aws_secretsmanager_secret_version.db_password.secret_string
}

# 5. 出力時の保護
output "db_endpoint" {
  value       = aws_db_instance.main.endpoint
  description = "Database endpoint"
}

output "db_password" {
  value       = var.db_password
  description = "Database password"
  sensitive   = true  # terraformの出力で表示されない
}
```

### テストの自動化

```go
// terraform_test.go - Terratest による自動テスト
package test

import (
    "testing"
    "time"
    
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/gruntwork-io/terratest/modules/aws"
    "github.com/stretchr/testify/assert"
)

func TestWebServerModule(t *testing.T) {
    t.Parallel()
    
    // Terraform オプションの設定
    terraformOptions := &terraform.Options{
        TerraformDir: "../modules/web-server",
        
        Vars: map[string]interface{}{
            "environment":    "test",
            "instance_count": 2,
            "instance_type":  "t3.micro",
        },
    }
    
    // テスト終了時にリソースを削除
    defer terraform.Destroy(t, terraformOptions)
    
    // Terraform init と apply
    terraform.InitAndApply(t, terraformOptions)
    
    // ALBのDNS名を取得
    albDNS := terraform.Output(t, terraformOptions, "load_balancer_dns")
    
    // ALBが正しく動作しているか確認
    url := fmt.Sprintf("http://%s", albDNS)
    expectedStatus := 200
    maxRetries := 30
    timeBetweenRetries := 10 * time.Second
    
    http_helper.HttpGetWithRetryWithCustomValidation(
        t,
        url,
        nil,
        maxRetries,
        timeBetweenRetries,
        func(status int, body string) bool {
            return status == expectedStatus
        },
    )
    
    // Auto Scaling Groupの確認
    asgName := terraform.Output(t, terraformOptions, "autoscaling_group_name")
    asg := aws.GetAutoScalingGroup(t, asgName, "ap-northeast-1")
    
    assert.Equal(t, int64(2), *asg.DesiredCapacity)
    assert.Equal(t, int64(2), *asg.MinSize)
    assert.Equal(t, int64(6), *asg.MaxSize)
}
```

### コスト最適化

```hcl
# cost_optimization.tf
# 1. 適切なインスタンスタイプの選択
locals {
  # 環境に応じたインスタンスタイプ
  instance_types = {
    dev  = "t3.micro"     # $0.0104/hour
    stg  = "t3.small"     # $0.0208/hour
    prod = "m5.large"     # $0.096/hour
  }
}

# 2. オートスケーリングによる最適化
resource "aws_autoscaling_schedule" "scale_down_nights" {
  scheduled_action_name  = "scale-down-nights"
  autoscaling_group_name = aws_autoscaling_group.web.name
  
  # 夜間は最小構成に
  min_size         = 1
  max_size         = 3
  desired_capacity = 1
  
  # 毎日19:00に実行（JST）
  recurrence = "0 10 * * *"  # UTC
}

resource "aws_autoscaling_schedule" "scale_up_mornings" {
  scheduled_action_name  = "scale-up-mornings"
  autoscaling_group_name = aws_autoscaling_group.web.name
  
  # 朝は通常構成に
  min_size         = 2
  max_size         = 10
  desired_capacity = 3
  
  # 毎日8:00に実行（JST）
  recurrence = "0 23 * * *"  # UTC
}

# 3. スポットインスタンスの活用
resource "aws_autoscaling_group" "spot" {
  mixed_instances_policy {
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.web.id
      }
      
      override {
        instance_type = "t3.medium"
      }
      
      override {
        instance_type = "t3a.medium"  # AMD版
      }
    }
    
    instances_distribution {
      on_demand_percentage_above_base_capacity = 0
      spot_allocation_strategy                 = "lowest-price"
      spot_instance_pools                      = 2
    }
  }
}

# 4. コストアラート
resource "aws_budgets_budget" "monthly" {
  name              = "${var.environment}-monthly-budget"
  budget_type       = "COST"
  limit_amount      = var.monthly_budget_limit
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "FORECASTED"
    subscriber_email_addresses = [var.finance_email]
  }
}
```

## 15.7 まとめ：コードがインフラになる時代

### Infrastructure as Codeがもたらした革命

本書の最終章で学んだIaCは、インフラ管理に以下の革命をもたらしました：

1. **再現性**：同じコードから同じインフラが生成される
2. **バージョン管理**：インフラの変更履歴が追跡可能
3. **協働作業**：コードレビューによる品質向上
4. **自動化**：人的ミスの排除と効率化
5. **スケール**：1台でも1000台でも同じ労力

### 手作業から自動化への旅

```
1990年代：物理サーバーの手動設定
    ↓
2000年代：設定管理ツール（Puppet、Chef）
    ↓
2010年代：クラウドとIaC（Terraform、CloudFormation）
    ↓
2020年代：GitOps、Policy as Code
    ↓
未来：AI駆動の自律的インフラ？
```

### インフラエンジニアの新しい役割

もはやインフラエンジニアは、サーバーラックの前で作業する人ではありません。

現代のインフラエンジニアは：
- **アーキテクト**：システム全体を設計する
- **プログラマー**：インフラをコードで表現する
- **SRE**：信頼性とパフォーマンスを追求する
- **セキュリティエンジニア**：脅威から守る
- **コスト最適化エンジニア**：効率的な運用を実現する

### 本書を終えて

15章にわたる長い旅、お疲れさまでした。

Linuxの基礎から始まり、コンテナ、クラウド、そしてInfrastructure as Codeまで、現代のインフラ技術の全体像を学んできました。

しかし、これは終わりではなく始まりです。技術は日々進化し、新しいツールやプラクティスが生まれています。

本書で学んだ「なぜ」の視点を持ち続けることで、新しい技術にも対応できるはずです。

**最後に**

```bash
#!/bin/bash
echo "Congratulations! You are now an Infrastructure Engineer."
echo "May your servers be stable and your deployments be smooth."
echo "Happy coding!"
```

インフラエンジニアとしての素晴らしいキャリアを歩まれることを願っています。