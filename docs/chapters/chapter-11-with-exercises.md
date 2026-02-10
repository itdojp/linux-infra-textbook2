# 第11章：イメージとレジストリ - 配布可能な実行環境

## 11.1 はじめに：「環境ごと配布する」という発想の革新性

ソフトウェア開発の歴史において、「動作環境の再現」は常に大きな課題でした。

「開発環境では動くのに、本番では動かない」
「新しいサーバーに同じ環境を作るのに丸一日かかった」
「半年前のバージョンを再現できない」

これらの問題を根本的に解決したのが、コンテナイメージという概念です。アプリケーションだけでなく、それが動作する環境全体を一つのパッケージとして扱います。この革新的な発想がどのように実現されているのか、本章で詳しく見ていきましょう。

## 11.2 「動作する環境ごと配布する」という革新

### 従来の配布方法の限界

#### ソースコード配布の問題
```bash
# 開発者A：「私のアプリケーションです」
$ tar czf myapp.tar.gz src/

# 運用者B：「動かしてみます」
$ tar xzf myapp.tar.gz
$ cd src/
$ python app.py
エラー: ModuleNotFoundError: No module named 'flask'

# 依存関係の地獄の始まり...
```

#### 仮想マシンイメージの問題
```bash
# VMイメージのサイズ
$ ls -lh
-rw-r--r-- 1 user user 20G ubuntu-server.vmdk

# 問題：
# - 巨大なサイズ（数GB〜数十GB）
# - 起動時間が長い（数分）
# - リソースの無駄（ゲストOSのオーバーヘッド）
```

### コンテナイメージの革新

#### 完全な実行環境の定義
```dockerfile
# Dockerfile - 環境の完全な定義
FROM python:3.11-slim

# システムパッケージ
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Pythonパッケージ
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーション
COPY src/ /app/
WORKDIR /app

# 実行環境の設定
ENV PYTHONUNBUFFERED=1
ENV APP_ENV=production

# 実行コマンド
CMD ["python", "app.py"]
```

#### イメージという単位での配布
```bash
# 開発者A：環境ごとパッケージング
$ podman build -t myapp:v1.0 .
$ podman push registry.example.com/myapp:v1.0

# 運用者B：ワンコマンドで実行
$ podman run registry.example.com/myapp:v1.0
# 動作する！依存関係の問題なし！
```

## 11.3 レイヤー構造とキャッシュの仕組み

### レイヤー構造の概念

コンテナイメージは、複数の読み取り専用レイヤーを重ねた構造になっています：

![コンテナイメージの層構造]({{ '/assets/images/diagrams/chapter-11/container-image-layers.svg' | relative_url }})

### レイヤーの詳細な仕組み

#### 実際のレイヤー構造を確認
```bash
# イメージのレイヤーを表示
$ podman image inspect nginx:latest | jq '.[0].RootFS.Layers'
[
  "sha256:2edcec3590a4ec7f40cf0743c15d78fb39d8326bc029073b41ef9727da6c851f",
  "sha256:e379e8aedd4d72bb4c529a4ca07a4e4d230b5a1d3f7a61bc80179e8f02421ad8",
  "sha256:b8d6e692a25e11b0d32c5c3dd544b71b1085ddc1fddad08e68cbd7fda7f70221",
  "sha256:f1db227348d0a5e0b99b15a096d930d1a69db7474a1847acbc31f05e4ef8df8c",
  "sha256:32ce5f6a5106cc637d09a98289782edf47c32cb082dc475dd47cbf19a4f866da",
  "sha256:d874fd2bc83bb3322b566df739681fbd2248c58d3369cb25908d68e7ed6040a6"
]

# 各レイヤーのサイズ
$ podman history nginx:latest
IMAGE          CREATED       CREATED BY                                      SIZE
deb46925e5ca   2 weeks ago   /bin/sh -c #(nop)  CMD ["nginx" "-g" "daem...  0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  STOPSIGNAL SIGQUIT          0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  EXPOSE 80                   0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  ENTRYPOINT ["/docker-ent... 0B
<missing>      2 weeks ago   /bin/sh -c #(nop) COPY file:7b37bddabaa26c1... 4.62kB
<missing>      2 weeks ago   /bin/sh -c set -x     && addgroup --system ... 61.1MB
<missing>      2 weeks ago   /bin/sh -c #(nop)  ENV PKG_RELEASE=1~bullseye  0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  ENV NJS_VERSION=0.7.11      0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  ENV NGINX_VERSION=1.23.4    0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  LABEL maintainer=NGINX D... 0B
<missing>      2 weeks ago   /bin/sh -c #(nop)  CMD ["bash"]                0B
<missing>      2 weeks ago   /bin/sh -c #(nop) ADD file:7347357947f130ee... 80.4MB
```

### Copy-on-Write（CoW）メカニズム

#### 読み取り専用レイヤーと書き込み可能レイヤー

![実行時のコンテナ層構造]({{ '/assets/images/diagrams/chapter-11/container-runtime-layers.svg' | relative_url }})

#### OverlayFSの動作
```bash
# OverlayFSの実験
# overlay_demo.sh
cat > overlay_demo.sh << 'EOF'
#!/bin/bash

# ディレクトリ構造の準備
mkdir -p overlay/{lower,upper,work,merged}

# 下層（読み取り専用）
echo "Original content" > overlay/lower/file.txt
echo "Unchanged file" > overlay/lower/unchanged.txt

# OverlayFSのマウント
sudo mount -t overlay overlay \
    -o lowerdir=overlay/lower,upperdir=overlay/upper,workdir=overlay/work \
    overlay/merged

# マージされたビュー
echo "Files in merged view:"
ls -la overlay/merged/

# ファイルの変更
echo "Modified content" > overlay/merged/file.txt
echo "New file" > overlay/merged/newfile.txt

# 変更は上層に保存される
echo -e "\nFiles in upper layer:"
ls -la overlay/upper/

# アンマウント
sudo umount overlay/merged
EOF
```

### キャッシュによる効率化

#### レイヤーキャッシュの仕組み
```dockerfile
# 効率的なDockerfile
FROM node:16-alpine

# 依存関係を先にコピー（変更頻度：低）
COPY package*.json ./
RUN npm ci --only=production

# アプリケーションコードをコピー（変更頻度：高）
COPY . .

CMD ["node", "server.js"]
```

#### キャッシュの活用例
```bash
# 初回ビルド
$ podman build -t myapp:v1 .
[1/4] FROM node:16-alpine                    # 50MB ダウンロード
[2/4] COPY package*.json ./                  # 新規レイヤー
[3/4] RUN npm ci --only=production          # 時間がかかる
[4/4] COPY . .                              # 新規レイヤー

# コード変更後の2回目のビルド
$ podman build -t myapp:v2 .
[1/4] FROM node:16-alpine                    # キャッシュ使用
[2/4] COPY package*.json ./                  # キャッシュ使用
[3/4] RUN npm ci --only=production          # キャッシュ使用
[4/4] COPY . .                              # 新規レイヤー（変更部分のみ）
```

## 11.4 CI/CDパイプラインとの統合

### 自動ビルドパイプライン

#### GitLab CI/CDの例
```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - scan
  - deploy

variables:
  IMAGE_NAME: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  LATEST_IMAGE: $CI_REGISTRY_IMAGE:latest

build:
  stage: build
  script:
    # マルチステージビルドでサイズ最適化
    - podman build 
        --cache-from $LATEST_IMAGE 
        --tag $IMAGE_NAME 
        --tag $LATEST_IMAGE 
        .
    - podman push $IMAGE_NAME
    - podman push $LATEST_IMAGE

test:
  stage: test
  script:
    # テスト用コンテナで実行
    - podman run --rm $IMAGE_NAME pytest
    - podman run --rm $IMAGE_NAME npm test

security-scan:
  stage: scan
  script:
    # 脆弱性スキャン
    - podman run --rm 
        -v /var/run/docker.sock:/var/run/docker.sock 
        aquasec/trivy image $IMAGE_NAME
    
    # ポリシーチェック
    - podman run --rm 
        -v $(pwd):/project 
        openpolicyagent/conftest verify --policy /project/policy $IMAGE_NAME

deploy:
  stage: deploy
  script:
    # プロダクションへのデプロイ
    - kubectl set image deployment/myapp myapp=$IMAGE_NAME
  only:
    - main
```

### イメージの自動最適化

#### マルチステージビルド
```dockerfile
# Dockerfile - マルチステージビルドの例
# ステージ1: ビルド環境
FROM golang:1.19-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# ステージ2: 実行環境（最小限）
FROM alpine:3.17
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /build/app .
CMD ["./app"]
```

#### サイズ最適化のテクニック
```dockerfile
# 最適化前：1.2GB
FROM ubuntu:22.04
RUN apt-get update
RUN apt-get install -y python3 python3-pip
RUN pip3 install flask numpy pandas
COPY app.py .
CMD ["python3", "app.py"]

# 最適化後：150MB
FROM python:3.10-slim
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
CMD ["python", "app.py"]
```

## 11.5 効率的なイメージ設計

### ベストプラクティス

#### 1. 最小限の基底イメージを使用
```dockerfile
# 悪い例：フルOSイメージ
FROM ubuntu:22.04              # 77MB

# 良い例：目的特化型イメージ
FROM python:3.10-slim          # 45MB
FROM node:16-alpine            # 39MB
FROM nginx:alpine              # 23MB
FROM scratch                   # 0MB（静的バイナリ用）
```

#### 2. レイヤー数の最適化
```dockerfile
# 悪い例：各コマンドが新しいレイヤー
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get clean

# 良い例：1つのレイヤーにまとめる
RUN apt-get update && \
    apt-get install -y \
        curl \
        git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

#### 3. ビルドキャッシュの活用
```dockerfile
# 変更頻度の低いものを先に
FROM node:16-alpine

# package.jsonは頻繁に変更されない
COPY package*.json ./
RUN npm ci --only=production

# ソースコードは頻繁に変更される
COPY . .

CMD ["node", "server.js"]
```

### セキュリティを考慮した設計

#### 非rootユーザーでの実行
```dockerfile
FROM node:16-alpine

# アプリケーション用ユーザーの作成
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# アプリケーションのセットアップ
WORKDIR /app
COPY --chown=nodejs:nodejs . .
RUN npm ci --only=production

# 非rootユーザーに切り替え
USER nodejs

EXPOSE 3000
CMD ["node", "server.js"]
```

#### シークレットの適切な扱い
```dockerfile
# 悪い例：シークレットがレイヤーに残る
FROM alpine
RUN echo "secret_key=12345" > /tmp/secret
RUN cat /tmp/secret && rm /tmp/secret  # 削除してもレイヤーに残る

# 良い例：ビルド時シークレット
FROM alpine
RUN --mount=type=secret,id=mysecret \
    cat /run/secrets/mysecret

# ビルド時に指定
# podman build --secret id=mysecret,src=secret.txt .
```

## 11.6 演習：効率的なイメージ設計

### 演習1：レイヤー構造の解析

```bash
# layer_analysis.sh
cat > layer_analysis.sh << 'EOF'
#!/bin/bash

echo "=== Container Image Layer Analysis ==="

# サンプルDockerfileの作成
cat > Dockerfile.analysis << 'DOCKERFILE'
FROM alpine:3.17
RUN echo "Layer 1" > /layer1.txt
RUN echo "Layer 2" > /layer2.txt
RUN echo "Layer 3" > /layer3.txt
DOCKERFILE

# イメージのビルド
echo "Building image..."
podman build -f Dockerfile.analysis -t layer-test:latest .

# レイヤー情報の表示
echo -e "\nLayer information:"
podman history layer-test:latest

# 各レイヤーの内容を確認
echo -e "\nExtracting layers..."
podman save layer-test:latest -o layer-test.tar
mkdir -p extracted
tar -xf layer-test.tar -C extracted

echo -e "\nLayer contents:"
for layer in extracted/*/layer.tar; do
    echo "Layer: $(dirname $layer | xargs basename)"
    tar -tf "$layer" | head -5
    echo "..."
done

# クリーンアップ
rm -rf extracted layer-test.tar Dockerfile.analysis
podman rmi layer-test:latest
EOF

chmod +x layer_analysis.sh
```

### 演習2：マルチステージビルドの実践

```bash
# multistage_demo.sh
cat > multistage_demo.sh << 'EOF'
#!/bin/bash

echo "=== Multi-stage Build Demo ==="

# Go言語のサンプルアプリケーション
cat > main.go << 'GO'
package main

import (
    "fmt"
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello from minimal container!")
}

func main() {
    http.HandleFunc("/", handler)
    fmt.Println("Server starting on :8080")
    http.ListenAndServe(":8080", nil)
}
GO

# 通常のDockerfile
cat > Dockerfile.normal << 'DOCKERFILE'
FROM golang:1.19
WORKDIR /app
COPY main.go .
RUN go build -o server main.go
CMD ["./server"]
DOCKERFILE

# マルチステージDockerfile
cat > Dockerfile.multistage << 'DOCKERFILE'
# ビルドステージ
FROM golang:1.19-alpine AS builder
WORKDIR /build
COPY main.go .
RUN CGO_ENABLED=0 go build -o server main.go

# 実行ステージ
FROM scratch
COPY --from=builder /build/server /
CMD ["/server"]
DOCKERFILE

# 両方のイメージをビルド
echo "Building normal image..."
podman build -f Dockerfile.normal -t server:normal .

echo -e "\nBuilding multi-stage image..."
podman build -f Dockerfile.multistage -t server:multistage .

# サイズ比較
echo -e "\nImage size comparison:"
podman images | grep server

# クリーンアップ
rm main.go Dockerfile.normal Dockerfile.multistage
EOF

chmod +x multistage_demo.sh
```

### 演習3：キャッシュ効率の最適化

```bash
# cache_optimization.sh
cat > cache_optimization.sh << 'EOF'
#!/bin/bash

echo "=== Cache Optimization Demo ==="

# サンプルNode.jsアプリ
cat > package.json << 'JSON'
{
  "name": "cache-demo",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0"
  }
}
JSON

cat > app.js << 'JS'
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Hello World!'));
app.listen(3000);
JS

# 非効率的なDockerfile
cat > Dockerfile.inefficient << 'DOCKERFILE'
FROM node:16-alpine
COPY . .
RUN npm install
CMD ["node", "app.js"]
DOCKERFILE

# 効率的なDockerfile
cat > Dockerfile.efficient << 'DOCKERFILE'
FROM node:16-alpine
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "app.js"]
DOCKERFILE

# 初回ビルド
echo "First build (inefficient):"
time podman build -f Dockerfile.inefficient -t app:inefficient .

echo -e "\nFirst build (efficient):"
time podman build -f Dockerfile.efficient -t app:efficient .

# アプリケーションコードを変更
echo "console.log('Updated!');" >> app.js

# 2回目のビルド（キャッシュ効果測定）
echo -e "\nSecond build after code change (inefficient):"
time podman build -f Dockerfile.inefficient -t app:inefficient-v2 .

echo -e "\nSecond build after code change (efficient):"
time podman build -f Dockerfile.efficient -t app:efficient-v2 .

# クリーンアップ
rm package.json app.js Dockerfile.*
EOF

chmod +x cache_optimization.sh
```

### 演習4：レジストリの構築と運用

```bash
# registry_setup.sh
cat > registry_setup.sh << 'EOF'
#!/bin/bash

echo "=== Private Registry Setup ==="

# レジストリコンテナの起動
echo "Starting registry..."
podman run -d \
    --name registry \
    -p 5000:5000 \
    -v registry-data:/var/lib/registry \
    registry:2

# テスト用イメージの作成
cat > Dockerfile << 'DOCKERFILE'
FROM alpine:latest
RUN echo "Test image" > /test.txt
CMD ["cat", "/test.txt"]
DOCKERFILE

podman build -t localhost:5000/test-image:v1 .

# レジストリへのプッシュ
echo -e "\nPushing to registry..."
podman push localhost:5000/test-image:v1

# レジストリの内容確認
echo -e "\nRegistry catalog:"
curl -s http://localhost:5000/v2/_catalog | jq .

echo -e "\nImage tags:"
curl -s http://localhost:5000/v2/test-image/tags/list | jq .

# 別のタグでプッシュ
podman tag localhost:5000/test-image:v1 localhost:5000/test-image:latest
podman push localhost:5000/test-image:latest

# クリーンアップオプション
echo -e "\nTo clean up:"
echo "  podman stop registry && podman rm registry"
echo "  podman volume rm registry-data"
EOF

chmod +x registry_setup.sh
```

### 演習5：イメージの脆弱性スキャン

```bash
# security_scan.sh
cat > security_scan.sh << 'EOF'
#!/bin/bash

echo "=== Image Security Scanning ==="

# Trivyを使用したスキャン
scan_image() {
    local image=$1
    echo "Scanning $image..."
    
    podman run --rm \
        -v /var/run/containers/storage:/var/run/containers/storage:ro \
        aquasec/trivy image \
        --severity HIGH,CRITICAL \
        --no-progress \
        $image
}

# 複数のイメージをスキャン
images=(
    "alpine:latest"
    "ubuntu:latest"
    "node:16"
    "python:3.11"
)

for img in "${images[@]}"; do
    echo -e "\n=== Scanning $img ==="
    scan_image $img
done

# セキュアなイメージの作成例
cat > Dockerfile.secure << 'DOCKERFILE'
# 特定のバージョンを指定（latest避ける）
FROM alpine:3.17.3

# 非rootユーザーの作成
RUN adduser -D -s /bin/sh appuser

# 必要最小限のパッケージのみインストール
RUN apk add --no-cache \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# アプリケーションのコピー
COPY --chown=appuser:appuser app /app

# 非rootユーザーに切り替え
USER appuser

# 読み取り専用ルートファイルシステム
# (実行時に --read-only フラグを使用)

ENTRYPOINT ["/app"]
DOCKERFILE

echo -e "\nSecure Dockerfile created as Dockerfile.secure"
EOF

chmod +x security_scan.sh
```

## 11.7 レジストリの運用

### プライベートレジストリの構築

#### 基本的なレジストリのセットアップ
```bash
# TLS付きレジストリの構築
# 証明書の生成
openssl req -newkey rsa:4096 -nodes -sha256 \
    -keyout domain.key -x509 -days 365 \
    -out domain.crt \
    -subj "/CN=registry.example.com"

# レジストリの起動
podman run -d \
    --name registry \
    -p 443:443 \
    -v $(pwd)/certs:/certs:ro \
    -v registry-data:/var/lib/registry \
    -e REGISTRY_HTTP_ADDR=0.0.0.0:443 \
    -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \
    -e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \
    registry:2
```

#### 認証付きレジストリ
```bash
# htpasswdファイルの作成
podman run --entrypoint htpasswd \
    httpd:2 -Bbn testuser testpassword > htpasswd

# 認証付きレジストリの起動
podman run -d \
    --name auth-registry \
    -p 5000:5000 \
    -v $(pwd)/htpasswd:/auth/htpasswd:ro \
    -v registry-data:/var/lib/registry \
    -e REGISTRY_AUTH=htpasswd \
    -e REGISTRY_AUTH_HTPASSWD_REALM="Registry Realm" \
    -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
    registry:2
```

### レジストリの高度な機能

#### ガベージコレクション
```bash
# 未使用のレイヤーを削除
podman exec registry bin/registry garbage-collect /etc/docker/registry/config.yml

# Dry-run モード
podman exec registry bin/registry garbage-collect --dry-run /etc/docker/registry/config.yml
```

#### レプリケーション
```yaml
# プルスルーキャッシュの設定
version: 0.1
log:
  fields:
    service: registry
storage:
  cache:
    blobdescriptor: inmemory
  filesystem:
    rootdirectory: /var/lib/registry
http:
  addr: :5000
  headers:
    X-Content-Type-Options: [nosniff]
proxy:
  remoteurl: https://registry-1.docker.io
```

## 11.8 まとめ：イメージが実現する新しい配布の形

### コンテナイメージの革新性

本章で学んだコンテナイメージは、以下の革新をもたらしました：

1. **完全な再現性**：「動く環境」を完全にパッケージ化
2. **効率的な配布**：レイヤー構造による差分配布
3. **バージョン管理**：環境全体のバージョン管理が可能
4. **CI/CDとの統合**：自動化されたビルド・テスト・デプロイ

### イメージ設計の重要性

良いイメージ設計は：
- **小さい**：必要最小限のコンポーネント
- **速い**：キャッシュを活用した高速ビルド
- **安全**：脆弱性の最小化、非root実行
- **保守しやすい**：明確なレイヤー構造

### 次章への展望

これまでLinuxの基礎からコンテナまでを学んできました。次章からは、これらの技術が「クラウド」という新しいインフラでどのように活用されるかを見ていきます。

AWSという巨大なデータセンターが、どのようにコンピューティングリソースを抽象化し、提供しているのか。そして、私たちがどのようにそれを活用できるのか。クラウド時代のインフラ技術を探求していきましょう。

---

## 第11章 演習問題

### 問題1：基本理解の確認

以下の空欄を埋めてください。

1. コンテナイメージは複数の（　　　）レイヤーを重ねた構造になっており、実行時には（　　　）レイヤーが追加されます。

2. Dockerfileの`COPY`命令と`ADD`命令の違いは、`ADD`命令が（　　　）や（　　　）の機能を持つことです。

3. マルチステージビルドの主な目的は、最終的なイメージの（　　　）を削減することです。

### 問題2：概念の理解

次の質問に答えてください。

1. **レイヤーキャッシュの仕組みについて説明してください。なぜDockerfileの命令の順序が重要なのですか？**

2. **Copy-on-Write（CoW）メカニズムがコンテナの効率性にどのように貢献しているか説明してください。**

3. **コンテナイメージのレジストリとは何か、なぜプライベートレジストリが必要になる場合があるのか説明してください。**

### 問題3：実践的な課題

以下のDockerfileを最適化してください。

```dockerfile
# 最適化前
FROM ubuntu:latest
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get install -y python3-pip
RUN pip3 install flask
RUN pip3 install requests
RUN pip3 install numpy
COPY . /app
WORKDIR /app
RUN pip3 install -r requirements.txt
CMD ["python3", "app.py"]
```

最適化のポイント：
- イメージサイズの削減
- ビルド時間の短縮
- セキュリティの向上

### 問題4：レイヤー分析

次のDockerfileからビルドされるイメージについて：

```dockerfile
FROM alpine:3.17
RUN apk add --no-cache curl
RUN echo "Hello" > /hello.txt
RUN echo "World" >> /hello.txt
RUN rm /hello.txt
```

1. 何個のレイヤーが作成されますか？
2. 最終的なイメージに`/hello.txt`ファイルは存在しますか？その理由も説明してください。

### 問題5：CI/CDパイプライン設計

以下の要件を満たすGitLab CI/CDパイプラインを設計してください：

- Node.jsアプリケーションのコンテナイメージをビルド
- ユニットテストの実行
- 脆弱性スキャンの実施
- mainブランチへのプッシュ時のみ本番環境へデプロイ

### 問題6：トラブルシューティング

開発者から「イメージのビルドが遅い」という報告がありました。以下の状況を改善する方法を提案してください：

- Dockerfileは頻繁に更新される
- `npm install`に5分かかる
- アプリケーションコードは100MB
- 最終イメージサイズは1.5GB

### 問題7：セキュリティ

以下のDockerfileのセキュリティ上の問題点を指摘し、改善案を提示してください：

```dockerfile
FROM node:latest
COPY . /app
WORKDIR /app
RUN npm install
ENV API_KEY=sk_live_abcdef123456
EXPOSE 3000
CMD ["node", "server.js"]
```

### 問題8：発展的課題

1. **コンテナイメージの署名と検証の仕組みについて調査し、その重要性を説明してください。**

2. **OCI（Open Container Initiative）仕様について調査し、Dockerイメージフォーマットとの関係を説明してください。**
