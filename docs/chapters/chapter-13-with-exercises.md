# 第13章：仮想ネットワークの設計と実装

## 13.1 はじめに：物理的制約からの解放

従来のデータセンターでは、ネットワークケーブルを物理的に配線し、スイッチやルーターを設置する必要がありました。新しいネットワークセグメントを追加するには、機器の購入、ラックへの設置、ケーブリング作業が必要で、数週間かかることも珍しくありませんでした。

クラウドの仮想ネットワークは、この物理的制約から私たちを解放しました。数クリック、あるいは数行のコードで、完全に隔離されたネットワーク環境を作成できます。この革命的な変化が、どのような技術によって実現されているのか、本章で詳しく見ていきましょう。

> ⚠️ 注意  
> 本章の `aws ...` コマンド例は AWS CLI を前提とします。手元で試す場合は、AWS アカウントの用意と、AWS CLI のインストール・認証情報の設定が必要です。コマンドによってはリソース作成が行われ、課金が発生する場合があるため、実行前に内容を確認してください。

## 13.2 物理的制約からの解放

### 従来のネットワーク構築の課題

#### 物理ネットワークの制約
```text
【従来のネットワーク拡張プロセス】
1. 要件定義（2週間）
   - 必要なポート数、帯域幅の計算
   - セキュリティ要件の確認

2. 機器調達（4週間）
   - スイッチ、ルーター、ファイアウォールの選定
   - 見積もり、承認、発注

3. 物理作業（1週間）
   - ラックスペースの確保
   - 機器の設置
   - ケーブリング

4. 設定作業（1週間）
   - VLAN設定
   - ルーティング設定
   - セキュリティ設定

合計：約2ヶ月
```

### 仮想ネットワークの革新

#### Software Defined Network（SDN）の概念

![SDN物理・仮想ネットワーク分離]({{ '/assets/images/diagrams/chapter-13/sdn-physical-virtual-network.svg' | relative_url }})

### AWSにおける実装：VPC

#### 5分で構築できる企業ネットワーク
```bash
# 1. VPCの作成（仮想データセンター）
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# 2. サブネットの作成（ネットワークセグメント）
aws ec2 create-subnet --vpc-id vpc-12345 --cidr-block 10.0.1.0/24
aws ec2 create-subnet --vpc-id vpc-12345 --cidr-block 10.0.2.0/24

# 3. インターネットゲートウェイの接続
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway --vpc-id vpc-12345 --internet-gateway-id igw-12345

# 4. ルーティング設定
aws ec2 create-route-table --vpc-id vpc-12345
aws ec2 create-route --route-table-id rtb-12345 --destination-cidr-block 0.0.0.0/0 --gateway-id igw-12345

# 完了！企業グレードのネットワークが稼働
```

## 13.3 SDNとVPCの仕組み

### VPC（Virtual Private Cloud）の構造

#### 論理的な隔離

![VPCによる論理的隔離]({{ '/assets/images/diagrams/chapter-13/vpc-logical-isolation.svg' | relative_url }})

### ネットワーク仮想化の技術

#### VXLAN（Virtual Extensible LAN）

![VXLANパケット構造]({{ '/assets/images/diagrams/chapter-13/vxlan-packet-structure.svg' | relative_url }})

### 実践的なVPC設計

#### マルチティアアーキテクチャ
```yaml
# vpc-architecture.yaml - CloudFormationテンプレート
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Multi-tier VPC architecture'

Parameters:
  EnvironmentName:
    Type: String
    Default: Production

Resources:
  # VPC本体
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-VPC

  # パブリックサブネット（Web層）
  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.1.0/24
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Public-Subnet-AZ1

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [1, !GetAZs '']
      CidrBlock: 10.0.2.0/24
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Public-Subnet-AZ2

  # プライベートサブネット（アプリケーション層）
  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.11.0/24
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Private-Subnet-AZ1

  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [1, !GetAZs '']
      CidrBlock: 10.0.12.0/24
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Private-Subnet-AZ2

  # データベースサブネット（データ層）
  DatabaseSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.21.0/24
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Database-Subnet-AZ1

  DatabaseSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [1, !GetAZs '']
      CidrBlock: 10.0.22.0/24
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Database-Subnet-AZ2

  # インターネットゲートウェイ
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

  # NATゲートウェイ用のElastic IP
  NatGateway1EIP:
    Type: AWS::EC2::EIP
    DependsOn: InternetGatewayAttachment
    Properties:
      Domain: vpc

  NatGateway2EIP:
    Type: AWS::EC2::EIP
    DependsOn: InternetGatewayAttachment
    Properties:
      Domain: vpc

  # NATゲートウェイ
  NatGateway1:
    Type: AWS::EC2::NatGateway
    Properties:
      AllocationId: !GetAtt NatGateway1EIP.AllocationId
      SubnetId: !Ref PublicSubnet1

  NatGateway2:
    Type: AWS::EC2::NatGateway
    Properties:
      AllocationId: !GetAtt NatGateway2EIP.AllocationId
      SubnetId: !Ref PublicSubnet2

  # ルートテーブル
  PublicRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Public-Routes

  DefaultPublicRoute:
    Type: AWS::EC2::Route
    DependsOn: InternetGatewayAttachment
    Properties:
      RouteTableId: !Ref PublicRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway

  PublicSubnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref PublicRouteTable
      SubnetId: !Ref PublicSubnet1

  PublicSubnet2RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref PublicRouteTable
      SubnetId: !Ref PublicSubnet2

  # プライベートルートテーブル
  PrivateRouteTable1:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Private-Routes-AZ1

  DefaultPrivateRoute1:
    Type: AWS::EC2::Route
    Properties:
      RouteTableId: !Ref PrivateRouteTable1
      DestinationCidrBlock: 0.0.0.0/0
      NatGatewayId: !Ref NatGateway1

  PrivateSubnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref PrivateRouteTable1
      SubnetId: !Ref PrivateSubnet1

  DatabaseSubnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref PrivateRouteTable1
      SubnetId: !Ref DatabaseSubnet1
```

## 13.4 セキュアで柔軟なネットワーク設計

### ゼロトラストネットワークの実装

#### セキュリティグループによるマイクロセグメンテーション
```bash
# Web層のセキュリティグループ
aws ec2 create-security-group \
    --group-name web-sg \
    --description "Security group for web servers" \
    --vpc-id vpc-12345

# インターネットからのHTTP/HTTPSのみ許可
aws ec2 authorize-security-group-ingress \
    --group-id sg-web \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-web \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

# アプリケーション層のセキュリティグループ
aws ec2 create-security-group \
    --group-name app-sg \
    --description "Security group for application servers" \
    --vpc-id vpc-12345

# Web層からのみアクセス許可
aws ec2 authorize-security-group-ingress \
    --group-id sg-app \
    --protocol tcp \
    --port 8080 \
    --source-group sg-web

# データベース層のセキュリティグループ
aws ec2 create-security-group \
    --group-name db-sg \
    --description "Security group for database servers" \
    --vpc-id vpc-12345

# アプリケーション層からのみアクセス許可
aws ec2 authorize-security-group-ingress \
    --group-id sg-db \
    --protocol tcp \
    --port 3306 \
    --source-group sg-app
```

### ネットワークACLによる追加の防御層

```bash
# network_acl_setup.sh - サブネットレベルのファイアウォール
cat > network_acl_setup.sh << 'EOF'
#!/bin/bash

VPC_ID="vpc-12345"
PUBLIC_SUBNET_ID="subnet-public"
PRIVATE_SUBNET_ID="subnet-private"

# パブリックサブネット用NACL
PUBLIC_NACL=$(aws ec2 create-network-acl \
    --vpc-id $VPC_ID \
    --query 'NetworkAcl.NetworkAclId' \
    --output text)

# インバウンドルール
# HTTP許可
aws ec2 create-network-acl-entry \
    --network-acl-id $PUBLIC_NACL \
    --rule-number 100 \
    --protocol tcp \
    --rule-action allow \
    --ingress \
    --port-range From=80,To=80 \
    --cidr-block 0.0.0.0/0

# HTTPS許可
aws ec2 create-network-acl-entry \
    --network-acl-id $PUBLIC_NACL \
    --rule-number 110 \
    --protocol tcp \
    --rule-action allow \
    --ingress \
    --port-range From=443,To=443 \
    --cidr-block 0.0.0.0/0

# エフェメラルポート（戻りトラフィック用）
aws ec2 create-network-acl-entry \
    --network-acl-id $PUBLIC_NACL \
    --rule-number 200 \
    --protocol tcp \
    --rule-action allow \
    --ingress \
    --port-range From=1024,To=65535 \
    --cidr-block 0.0.0.0/0

# アウトバウンドルール
# すべて許可（簡略化のため）
aws ec2 create-network-acl-entry \
    --network-acl-id $PUBLIC_NACL \
    --rule-number 100 \
    --protocol -1 \
    --rule-action allow \
    --egress \
    --cidr-block 0.0.0.0/0

# NACLをサブネットに関連付け
aws ec2 associate-network-acl \
    --network-acl-id $PUBLIC_NACL \
    --subnet-id $PUBLIC_SUBNET_ID
EOF
```

### VPCピアリングとTransit Gateway

#### 複数VPC間の接続
```bash
# VPCピアリング接続の作成
aws ec2 create-vpc-peering-connection \
    --vpc-id vpc-11111 \
    --peer-vpc-id vpc-22222 \
    --peer-region ap-northeast-1

# ピアリング接続の承認
aws ec2 accept-vpc-peering-connection \
    --vpc-peering-connection-id pcx-12345

# ルーティングの追加
aws ec2 create-route \
    --route-table-id rtb-11111 \
    --destination-cidr-block 10.1.0.0/16 \
    --vpc-peering-connection-id pcx-12345
```

#### Transit Gatewayによるハブ&スポーク構成
```python
# transit_gateway_setup.py
import boto3

ec2 = boto3.client('ec2')

# Transit Gatewayの作成
tgw_response = ec2.create_transit_gateway(
    Description='Central hub for VPC connectivity',
    Options={
        'AmazonSideAsn': 64512,
        'DefaultRouteTableAssociation': 'enable',
        'DefaultRouteTablePropagation': 'enable',
        'DnsSupport': 'enable',
        'VpnEcmpSupport': 'enable'
    },
    TagSpecifications=[{
        'ResourceType': 'transit-gateway',
        'Tags': [{'Key': 'Name', 'Value': 'CentralHub-TGW'}]
    }]
)

tgw_id = tgw_response['TransitGateway']['TransitGatewayId']

# 各VPCをTransit Gatewayに接続
vpcs = ['vpc-11111', 'vpc-22222', 'vpc-33333']

for vpc_id in vpcs:
    # サブネット情報を取得
    subnets = ec2.describe_subnets(
        Filters=[{'Name': 'vpc-id', 'Values': [vpc_id]}]
    )['Subnets']
    
    subnet_ids = [s['SubnetId'] for s in subnets[:2]]  # 2つのAZを使用
    
    # アタッチメントの作成
    attachment = ec2.create_transit_gateway_vpc_attachment(
        TransitGatewayId=tgw_id,
        VpcId=vpc_id,
        SubnetIds=subnet_ids,
        TagSpecifications=[{
            'ResourceType': 'transit-gateway-attachment',
            'Tags': [{'Key': 'Name', 'Value': f'{vpc_id}-attachment'}]
        }]
    )
    
    print(f"Created attachment for {vpc_id}: {attachment['TransitGatewayVpcAttachment']['TransitGatewayAttachmentId']}")
```

## 13.5 演習：マルチティアアーキテクチャの構築

### 演習1：基本的なVPC構築

```bash
# basic_vpc_setup.sh
cat > basic_vpc_setup.sh << 'EOF'
#!/bin/bash

echo "=== Basic VPC Setup ==="

# 変数定義
REGION="ap-northeast-1"
VPC_CIDR="10.0.0.0/16"
PUBLIC_SUBNET_CIDR="10.0.1.0/24"
PRIVATE_SUBNET_CIDR="10.0.2.0/24"

# 1. VPCの作成
echo "Creating VPC..."
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block $VPC_CIDR \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=Demo-VPC}]" \
    --query 'Vpc.VpcId' \
    --output text)

echo "Created VPC: $VPC_ID"

# DNSサポートを有効化
aws ec2 modify-vpc-attribute \
    --vpc-id $VPC_ID \
    --enable-dns-hostnames

# 2. サブネットの作成
echo "Creating subnets..."

# パブリックサブネット
PUBLIC_SUBNET_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block $PUBLIC_SUBNET_CIDR \
    --availability-zone ${REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=Public-Subnet}]" \
    --query 'Subnet.SubnetId' \
    --output text)

# プライベートサブネット
PRIVATE_SUBNET_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block $PRIVATE_SUBNET_CIDR \
    --availability-zone ${REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=Private-Subnet}]" \
    --query 'Subnet.SubnetId' \
    --output text)

# 3. インターネットゲートウェイ
echo "Creating Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=Demo-IGW}]" \
    --query 'InternetGateway.InternetGatewayId' \
    --output text)

aws ec2 attach-internet-gateway \
    --vpc-id $VPC_ID \
    --internet-gateway-id $IGW_ID

# 4. ルートテーブルの設定
echo "Configuring route tables..."

# パブリックルートテーブル
PUBLIC_RT_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=Public-RT}]" \
    --query 'RouteTable.RouteTableId' \
    --output text)

# デフォルトルートの追加
aws ec2 create-route \
    --route-table-id $PUBLIC_RT_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IGW_ID

# サブネットとの関連付け
aws ec2 associate-route-table \
    --subnet-id $PUBLIC_SUBNET_ID \
    --route-table-id $PUBLIC_RT_ID

# 5. セキュリティグループの作成
echo "Creating security groups..."

# Webサーバー用セキュリティグループ
WEB_SG_ID=$(aws ec2 create-security-group \
    --group-name web-sg \
    --description "Security group for web servers" \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=Web-SG}]" \
    --query 'GroupId' \
    --output text)

# ルールの追加
aws ec2 authorize-security-group-ingress \
    --group-id $WEB_SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $WEB_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $WEB_SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr $(curl -s https://checkip.amazonaws.com)/32

echo "VPC setup completed!"
echo "VPC ID: $VPC_ID"
echo "Public Subnet: $PUBLIC_SUBNET_ID"
echo "Private Subnet: $PRIVATE_SUBNET_ID"
echo "Web Security Group: $WEB_SG_ID"
EOF

chmod +x basic_vpc_setup.sh
```

### 演習2：高可用性ネットワーク設計

```bash
# ha_network_setup.sh
cat > ha_network_setup.sh << 'EOF'
#!/bin/bash

echo "=== High Availability Network Setup ==="

# マルチAZ構成の自動構築
create_ha_network() {
    local vpc_cidr="10.0.0.0/16"
    local region=$(aws ec2 describe-availability-zones --query 'AvailabilityZones[0].RegionName' --output text)
    
    # VPCの作成
    vpc_id=$(aws ec2 create-vpc \
        --cidr-block $vpc_cidr \
        --query 'Vpc.VpcId' \
        --output text)
    
    echo "Created VPC: $vpc_id"
    
    # 利用可能なAZを取得
    azs=($(aws ec2 describe-availability-zones \
        --filters "Name=state,Values=available" \
        --query 'AvailabilityZones[*].ZoneName' \
        --output text))
    
    # 各AZにサブネットを作成
    for i in {0..1}; do
        az=${azs[$i]}
        
        # パブリックサブネット
        public_cidr="10.0.$((i+1)).0/24"
        public_subnet=$(aws ec2 create-subnet \
            --vpc-id $vpc_id \
            --cidr-block $public_cidr \
            --availability-zone $az \
            --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=Public-$az}]" \
            --query 'Subnet.SubnetId' \
            --output text)
        
        # プライベートサブネット
        private_cidr="10.0.$((i+11)).0/24"
        private_subnet=$(aws ec2 create-subnet \
            --vpc-id $vpc_id \
            --cidr-block $private_cidr \
            --availability-zone $az \
            --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=Private-$az}]" \
            --query 'Subnet.SubnetId' \
            --output text)
        
        # データベースサブネット
        db_cidr="10.0.$((i+21)).0/24"
        db_subnet=$(aws ec2 create-subnet \
            --vpc-id $vpc_id \
            --cidr-block $db_cidr \
            --availability-zone $az \
            --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=Database-$az}]" \
            --query 'Subnet.SubnetId' \
            --output text)
        
        echo "Created subnets in $az"
        
        # Elastic IPとNATゲートウェイ
        eip_alloc=$(aws ec2 allocate-address \
            --domain vpc \
            --query 'AllocationId' \
            --output text)
        
        nat_gw=$(aws ec2 create-nat-gateway \
            --subnet-id $public_subnet \
            --allocation-id $eip_alloc \
            --tag-specifications "ResourceType=nat-gateway,Tags=[{Key=Name,Value=NAT-$az}]" \
            --query 'NatGateway.NatGatewayId' \
            --output text)
        
        echo "Created NAT Gateway in $az: $nat_gw"
    done
}

# フェイルオーバーテスト
test_failover() {
    echo "Testing network failover..."
    
    # プライマリNATゲートウェイを無効化
    primary_nat=$(aws ec2 describe-nat-gateways \
        --filter "Name=tag:Name,Values=NAT-*a" \
        --query 'NatGateways[0].NatGatewayId' \
        --output text)
    
    echo "Simulating failure of primary NAT Gateway: $primary_nat"
    
    # ルートテーブルの更新
    # （実際の障害時は自動的に切り替わるが、ここでは手動でシミュレート）
}

# メイン処理
create_ha_network
EOF

chmod +x ha_network_setup.sh
```

### 演習3：ネットワークセキュリティの実装

```bash
# network_security.sh
cat > network_security.sh << 'EOF'
#!/bin/bash

echo "=== Network Security Implementation ==="

# WAFの設定
setup_waf() {
    echo "Setting up Web Application Firewall..."
    
    # IPセットの作成（ブロックリスト）
    ipset_id=$(aws wafv2 create-ip-set \
        --name blocked-ips \
        --scope REGIONAL \
        --ip-address-version IPV4 \
        --addresses 192.0.2.0/24 198.51.100.0/24 \
        --query 'Summary.Id' \
        --output text)
    
    # ルールグループの作成
    cat > waf-rules.json << 'JSON'
{
    "Name": "CustomRuleGroup",
    "Scope": "REGIONAL",
    "Capacity": 100,
    "Rules": [
        {
            "Name": "RateLimitRule",
            "Priority": 1,
            "Statement": {
                "RateBasedStatement": {
                    "Limit": 1000,
                    "AggregateKeyType": "IP"
                }
            },
            "Action": {
                "Block": {}
            },
            "VisibilityConfig": {
                "SampledRequestsEnabled": true,
                "CloudWatchMetricsEnabled": true,
                "MetricName": "RateLimitRule"
            }
        },
        {
            "Name": "SQLInjectionRule",
            "Priority": 2,
            "Statement": {
                "SqliMatchStatement": {
                    "FieldToMatch": {
                        "AllQueryArguments": {}
                    },
                    "TextTransformations": [
                        {
                            "Priority": 0,
                            "Type": "URL_DECODE"
                        },
                        {
                            "Priority": 1,
                            "Type": "HTML_ENTITY_DECODE"
                        }
                    ]
                }
            },
            "Action": {
                "Block": {}
            },
            "VisibilityConfig": {
                "SampledRequestsEnabled": true,
                "CloudWatchMetricsEnabled": true,
                "MetricName": "SQLInjectionRule"
            }
        }
    ]
}
JSON
    
    aws wafv2 create-rule-group --cli-input-json file://waf-rules.json
}

# VPCフローログの設定
setup_flow_logs() {
    echo "Setting up VPC Flow Logs..."
    
    vpc_id=$1
    
    # S3バケットの作成
    bucket_name="vpc-flow-logs-$(date +%s)"
    aws s3 mb s3://$bucket_name
    
    # フローログの作成
    aws ec2 create-flow-logs \
        --resource-type VPC \
        --resource-ids $vpc_id \
        --traffic-type ALL \
        --log-destination-type s3 \
        --log-destination s3://$bucket_name/flow-logs/ \
        --log-format '${srcaddr} ${dstaddr} ${srcport} ${dstport} ${protocol} ${packets} ${bytes} ${action}'
    
    # 分析用のAthenaテーブル作成
    cat > create_athena_table.sql << 'SQL'
CREATE EXTERNAL TABLE IF NOT EXISTS vpc_flow_logs (
    srcaddr string,
    dstaddr string,
    srcport int,
    dstport int,
    protocol int,
    packets bigint,
    bytes bigint,
    action string
)
PARTITIONED BY (dt string)
STORED AS PARQUET
LOCATION 's3://BUCKET_NAME/flow-logs/'
SQL
}

# プライベートリンクの設定
setup_privatelink() {
    echo "Setting up VPC PrivateLink..."
    
    # S3用のVPCエンドポイント
    aws ec2 create-vpc-endpoint \
        --vpc-id $VPC_ID \
        --service-name com.amazonaws.${REGION}.s3 \
        --route-table-ids $PRIVATE_RT_ID
    
    # EC2用のインターフェースエンドポイント
    aws ec2 create-vpc-endpoint \
        --vpc-id $VPC_ID \
        --service-name com.amazonaws.${REGION}.ec2 \
        --vpc-endpoint-type Interface \
        --subnet-ids $PRIVATE_SUBNET_ID \
        --security-group-ids $ENDPOINT_SG_ID
}

# セキュリティグループの自動監査
audit_security_groups() {
    echo "Auditing Security Groups..."
    
    # 過度に緩いルールを検出
    aws ec2 describe-security-groups \
        --query 'SecurityGroups[?IpPermissions[?IpProtocol==`-1` && contains(IpRanges[].CidrIp, `0.0.0.0/0`)]].[GroupId,GroupName]' \
        --output table
    
    echo "Security groups with overly permissive rules detected above"
}

# メイン処理
setup_waf
setup_flow_logs "vpc-12345"
setup_privatelink
audit_security_groups
EOF

chmod +x network_security.sh
```

### 演習4：ハイブリッドクラウドネットワーク

```bash
# hybrid_cloud_network.sh
cat > hybrid_cloud_network.sh << 'EOF'
#!/bin/bash

echo "=== Hybrid Cloud Network Setup ==="

# Site-to-Site VPNの設定
setup_vpn() {
    local vpc_id=$1
    local on_premise_cidr="192.168.0.0/16"
    local customer_gateway_ip="203.0.113.1"  # オンプレミスのパブリックIP
    
    # カスタマーゲートウェイの作成
    cgw_id=$(aws ec2 create-customer-gateway \
        --type ipsec.1 \
        --public-ip $customer_gateway_ip \
        --bgp-asn 65000 \
        --tag-specifications "ResourceType=customer-gateway,Tags=[{Key=Name,Value=OnPremise-CGW}]" \
        --query 'CustomerGateway.CustomerGatewayId' \
        --output text)
    
    # 仮想プライベートゲートウェイの作成
    vgw_id=$(aws ec2 create-vpn-gateway \
        --type ipsec.1 \
        --amazon-side-asn 64512 \
        --tag-specifications "ResourceType=vpn-gateway,Tags=[{Key=Name,Value=AWS-VGW}]" \
        --query 'VpnGateway.VpnGatewayId' \
        --output text)
    
    # VPCにアタッチ
    aws ec2 attach-vpn-gateway \
        --vpc-id $vpc_id \
        --vpn-gateway-id $vgw_id
    
    # VPN接続の作成
    vpn_id=$(aws ec2 create-vpn-connection \
        --type ipsec.1 \
        --customer-gateway-id $cgw_id \
        --vpn-gateway-id $vgw_id \
        --options "{\"StaticRoutesOnly\":false}" \
        --tag-specifications "ResourceType=vpn-connection,Tags=[{Key=Name,Value=OnPremise-VPN}]" \
        --query 'VpnConnection.VpnConnectionId' \
        --output text)
    
    echo "VPN Connection created: $vpn_id"
    
    # VPN設定のダウンロード
    aws ec2 describe-vpn-connections \
        --vpn-connection-ids $vpn_id \
        --query 'VpnConnections[0].CustomerGatewayConfiguration' \
        --output text > vpn-config.xml
    
    echo "VPN configuration saved to vpn-config.xml"
}

# Direct Connectの仮想インターフェース設定
setup_direct_connect_vif() {
    echo "Setting up Direct Connect Virtual Interface..."
    
    # 仮想インターフェースの作成（実際にはDirect Connect接続が必要）
    cat > vif-config.json << 'JSON'
{
    "connectionId": "dxcon-12345678",
    "vlan": 100,
    "customerAddress": "192.168.1.1/30",
    "amazonAddress": "192.168.1.2/30",
    "addressFamily": "ipv4",
    "customerAsn": 65000,
    "mtu": 1500,
    "virtualInterfaceName": "Production-VIF"
}
JSON
    
    # aws directconnect create-private-virtual-interface --cli-input-json file://vif-config.json
}

# Transit VPNによる複数サイト接続
setup_transit_vpn() {
    echo "Setting up Transit VPN for multiple sites..."
    
    # Transit Gatewayの作成
    tgw_id=$(aws ec2 create-transit-gateway \
        --description "Central hub for hybrid connectivity" \
        --options '{
            "AmazonSideAsn": 64512,
            "DefaultRouteTableAssociation": "enable",
            "DefaultRouteTablePropagation": "enable",
            "VpnEcmpSupport": "enable"
        }' \
        --tag-specifications "ResourceType=transit-gateway,Tags=[{Key=Name,Value=Hybrid-TGW}]" \
        --query 'TransitGateway.TransitGatewayId' \
        --output text)
    
    # 各サイトのVPN接続をTransit Gatewayに接続
    sites=("Tokyo" "Osaka" "Nagoya")
    for site in "${sites[@]}"; do
        echo "Connecting $site site to Transit Gateway..."
        # VPN接続の作成（省略）
    done
}

# メイン処理
VPC_ID="vpc-12345"
setup_vpn $VPC_ID
# setup_direct_connect_vif
setup_transit_vpn
EOF

chmod +x hybrid_cloud_network.sh
```

### 演習5：ネットワークパフォーマンス最適化

```bash
# network_optimization.sh
cat > network_optimization.sh << 'EOF'
#!/bin/bash

echo "=== Network Performance Optimization ==="

# Enhanced Networkingの有効化
enable_enhanced_networking() {
    instance_id=$1
    
    # SR-IOVの有効化
    aws ec2 modify-instance-attribute \
        --instance-id $instance_id \
        --sriov-net-support simple
    
    # Elastic Network Adapter (ENA)の確認
    ena_support=$(aws ec2 describe-instances \
        --instance-ids $instance_id \
        --query 'Reservations[0].Instances[0].EnaSupport' \
        --output text)
    
    if [ "$ena_support" != "True" ]; then
        echo "Enabling ENA support..."
        aws ec2 modify-instance-attribute \
            --instance-id $instance_id \
            --ena-support
    fi
}

# Placement Groupの設定
setup_placement_group() {
    # クラスタープレイスメントグループの作成
    aws ec2 create-placement-group \
        --group-name high-performance-cluster \
        --strategy cluster
    
    # パーティションプレイスメントグループの作成
    aws ec2 create-placement-group \
        --group-name distributed-workload \
        --strategy partition \
        --partition-count 7
}

# ネットワークパフォーマンステスト
network_performance_test() {
    echo "Running network performance tests..."
    
    # iperf3サーバーの起動
    cat > iperf-server-userdata.sh << 'USERDATA'
#!/bin/bash
yum install -y iperf3
iperf3 -s -D
USERDATA
    
    # テスト用インスタンスの起動
    server_id=$(aws ec2 run-instances \
        --image-id ami-12345678 \
        --instance-type c5n.large \
        --placement GroupName=high-performance-cluster \
        --user-data file://iperf-server-userdata.sh \
        --query 'Instances[0].InstanceId' \
        --output text)
    
    client_id=$(aws ec2 run-instances \
        --image-id ami-12345678 \
        --instance-type c5n.large \
        --placement GroupName=high-performance-cluster \
        --query 'Instances[0].InstanceId' \
        --output text)
    
    # テスト結果の収集
    echo "Instances launched. Run iperf3 tests after they're ready."
}

# VPCピアリング最適化
optimize_vpc_peering() {
    # Jumbo Framesの有効化
    aws ec2 modify-vpc-attribute \
        --vpc-id vpc-12345 \
        --enable-dns-hostnames
    
    # ルーティングの最適化
    echo "Optimizing routing tables for VPC peering..."
    
    # 最短経路の設定
    aws ec2 create-route \
        --route-table-id rtb-12345 \
        --destination-cidr-block 10.1.0.0/16 \
        --vpc-peering-connection-id pcx-12345
}

# CloudFrontとの統合
setup_cloudfront_integration() {
    echo "Setting up CloudFront for static content delivery..."
    
    # オリジンアクセスアイデンティティの作成
    oai=$(aws cloudfront create-cloud-front-origin-access-identity \
        --cloud-front-origin-access-identity-config '{
            "CallerReference": "my-oai",
            "Comment": "OAI for S3 bucket"
        }' \
        --query 'CloudFrontOriginAccessIdentity.Id' \
        --output text)
    
    # CloudFrontディストリビューションの作成
    cat > cloudfront-config.json << 'JSON'
{
    "CallerReference": "my-distribution",
    "Comment": "CDN for web application",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-my-bucket",
                "DomainName": "my-bucket.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": "origin-access-identity/cloudfront/OAI_ID"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-my-bucket",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "Enabled": true
}
JSON
}

# メイン処理
enable_enhanced_networking "i-1234567890"
setup_placement_group
network_performance_test
optimize_vpc_peering
setup_cloudfront_integration
EOF

chmod +x network_optimization.sh
```

## 13.6 ネットワーク監視とトラブルシューティング

### VPCフローログの分析

```python
# analyze_flow_logs.py
import boto3
import pandas as pd
from datetime import datetime, timedelta

def analyze_vpc_flow_logs(bucket_name, vpc_id):
    """VPCフローログを分析して異常なトラフィックを検出"""
    s3 = boto3.client('s3')
    
    # フローログの読み込み
    response = s3.select_object_content(
        Bucket=bucket_name,
        Key=f'flow-logs/{vpc_id}/2024/03/15/flow-log.gz',
        ExpressionType='SQL',
        Expression="""
            SELECT srcaddr, dstaddr, srcport, dstport, 
                   protocol, packets, bytes, action
            FROM s3object s
            WHERE cast(bytes as int) > 1000000
        """,
        InputSerialization={'CompressionType': 'GZIP', 'CSV': {}},
        OutputSerialization={'CSV': {}}
    )
    
    # 結果の処理
    records = []
    for event in response['Payload']:
        if 'Records' in event:
            records.append(event['Records']['Payload'].decode())
    
    # 異常検出
    df = pd.DataFrame(records)
    
    # 大量のデータ転送を検出
    high_volume = df[df['bytes'] > 10000000]
    
    # 拒否されたトラフィック
    rejected = df[df['action'] == 'REJECT']
    
    # ポートスキャンの可能性
    port_scan = df.groupby('srcaddr')['dstport'].nunique()
    suspicious_ips = port_scan[port_scan > 100].index
    
    return {
        'high_volume_transfers': high_volume,
        'rejected_traffic': rejected,
        'potential_port_scans': suspicious_ips
    }
```

### リアルタイムネットワーク監視

```bash
# realtime_monitoring.sh
#!/bin/bash

# CloudWatchメトリクスの設定
setup_cloudwatch_metrics() {
    # カスタムメトリクスの送信
    aws cloudwatch put-metric-data \
        --namespace "NetworkMonitoring" \
        --metric-name "PacketLoss" \
        --value 0.5 \
        --unit Percent \
        --dimensions Interface=eth0
    
    # アラームの作成
    aws cloudwatch put-metric-alarm \
        --alarm-name "HighPacketLoss" \
        --alarm-description "Alert when packet loss exceeds 1%" \
        --metric-name PacketLoss \
        --namespace NetworkMonitoring \
        --statistic Average \
        --period 300 \
        --threshold 1.0 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 2
}
```

## 13.7 まとめ：ソフトウェア定義ネットワークの威力

### 仮想ネットワークがもたらした革新

本章で学んだ仮想ネットワーク技術は、以下の革新をもたらしました：

1. **即座の構築**：数分で企業規模のネットワークを構築
2. **完全な隔離**：マルチテナント環境での安全な分離
3. **柔軟な変更**：ダウンタイムなしでネットワーク構成を変更
4. **グローバル接続**：世界中のリソースをシームレスに接続

### 設計の重要性

仮想だからこそ：
- **セキュリティ設計**：多層防御の実装
- **可用性設計**：マルチAZ、冗長性の確保
- **拡張性設計**：将来の成長を見据えた設計
- **コスト最適化**：必要なリソースのみを使用

### 次章への展望

これまでの章で、Linux、コンテナ、クラウドの基礎を学んできました。次章では、これらすべてを統合して「監視とログ」について学びます。

システムの可観測性（Observability）をどのように実現し、問題を予防的に発見し、迅速に対処するか。現代のインフラ運用に欠かせない技術を探求していきましょう。

---

## 第13章 演習問題

### 問題1：基本理解の確認

以下の空欄を埋めてください。

1. VPC（Virtual Private Cloud）は、AWS内に作成する論理的に（　　　）されたネットワーク空間で、（　　　）ブロックを指定して作成します。

2. セキュリティグループは（　　　）レベルのファイアウォールで、ネットワークACLは（　　　）レベルのファイアウォールです。

3. NATゲートウェイは、（　　　）サブネット内のインスタンスがインターネットへ（　　　）通信を行うために使用されます。

### 問題2：概念の理解

次の質問に答えてください。

1. **SDN（Software Defined Network）の利点を3つ挙げ、従来の物理ネットワークとの違いを説明してください。**

2. **VPCにおけるパブリックサブネットとプライベートサブネットの違いと、それぞれの用途を説明してください。**

3. **Transit GatewayとVPCピアリングの違いと、それぞれの適切な使用場面を説明してください。**

### 問題3：実践的な課題

以下の要件を満たすVPCネットワークを設計してください：

**要件：**
- 3層アーキテクチャ（Web、App、DB）
- 2つのアベイラビリティゾーンで高可用性
- インターネットからはWeb層のみアクセス可能
- App層とDB層はインターネットへのアウトバウンド通信が可能
- 各層間は必要最小限の通信のみ許可

必要なサブネット、ルートテーブル、セキュリティグループの設定を記述してください。

### 問題4：セキュリティ設計

次のセキュリティグループルールの問題点を指摘し、改善案を提示してください：

```bash
# Webサーバー用セキュリティグループ
Inbound:
- Type: All Traffic, Source: 0.0.0.0/0
- Type: SSH, Source: 0.0.0.0/0

# データベース用セキュリティグループ  
Inbound:
- Type: MySQL/Aurora, Source: 0.0.0.0/0
```

### 問題5：ネットワークトラブルシューティング

プライベートサブネット内のEC2インスタンスからインターネットへの通信ができません。確認すべき項目を優先順位付きで5つ挙げてください。

### 問題6：コスト最適化

以下のネットワーク構成のコストを削減する方法を3つ提案してください：
- 各AZに1つずつ、計2つのNATゲートウェイ
- 10個のElastic IP（うち3個は未使用）
- VPCピアリング5本（異なるVPC間）
- 未使用のVPCエンドポイント3つ

### 問題7：高可用性設計

マルチリージョンでの災害復旧を考慮したネットワーク設計を作成してください。以下の要件を満たすこと：
- プライマリリージョン：東京
- DRリージョン：大阪
- RPO：1時間
- RTO：30分

### 問題8：発展的課題

1. **ハイブリッドクラウドネットワークを設計する際の考慮事項を5つ挙げ、それぞれの解決策を提案してください。**

2. **VPCフローログを使用した異常検知システムの設計を行ってください。検知すべき異常パターンと、その検知方法を含めて説明してください。**
