# 第10章：Podmanという選択 - エンタープライズ向けコンテナ

## 10.1 はじめに：なぜ新しいコンテナランタイムが必要だったのか

2013年、Dockerの登場によりコンテナ技術は爆発的に普及しました。しかし、エンタープライズ環境での利用が進むにつれ、いくつかの課題が明らかになってきました。

「なぜroot権限が必要なのか？」「なぜデーモンが常に動いている必要があるのか？」「もっとセキュアな方法はないのか？」

これらの問いに対する答えが、Red Hatが中心となって開発した「Podman」です。

## 10.2 DockerからPodmanへ - なぜ新しい選択肢が必要だったか

### Dockerの構造と課題

#### Dockerのアーキテクチャ

![Dockerのアーキテクチャ]({{ '/assets/images/diagrams/chapter-10/docker-architecture.svg' | relative_url }})

#### 主な課題

1. **セキュリティリスク**
```bash
# Dockerデーモンは常にroot権限で動作
$ ps aux | grep dockerd
root  1234  0.5  1.2  1234567  123456  ?  Ssl  09:00  0:30 /usr/bin/dockerd

# （安全なデモ）ホスト側ディレクトリをマウントすると、コンテナから変更できる
# docker グループは実質root相当の権限になり得るため、最小権限の観点で注意する
$ mkdir -p /tmp/host-demo && echo "before" > /tmp/host-demo/file.txt
$ docker run --rm -v /tmp/host-demo:/host ubuntu bash -c 'ls -l /host && echo after > /host/file.txt'
$ cat /tmp/host-demo/file.txt
```

2. **単一障害点**
```bash
# Dockerデーモンが停止すると、すべてのコンテナに影響
$ sudo systemctl stop docker
# コンテナの管理操作（起動/停止/ログ取得 等）ができなくなる
# 既存コンテナのプロセスは直ちに停止しないことが多い（環境/設定による）
```

3. **システムサービスとの統合の難しさ**
```bash
# systemdとの統合が複雑
# Dockerデーモンを介する必要がある
```

### Podmanの設計思想

Podmanは、コンテナを管理するためのツールでありながら、従来のコンテナ管理（特にDocker）が抱えていた課題を解決するために登場しました。 
その設計思想は、よりセキュアに、よりシンプルに、そしてより柔軟にコンテナを扱えるようにすることにあります。

具体的には、中央のデーモンプロセスに依存せず、root権限なしでコンテナを動かすことを目指しています。
これにより、単一障害点やセキュリティリスクを低減しつつ、開発から本番環境まで、より効率的なコンテナワークフローを実現します。この革新的な設計思想は、主に以下のアーキテクチャと特徴によって実現されています。

#### Podmanのアーキテクチャ

![Podmanのアーキテクチャ]({{ '/assets/images/diagrams/chapter-10/podman-architecture.svg' | relative_url }})

#### 革新的な特徴

1. **Daemonless（デーモンレス）**
   - 中央のデーモンプロセスが不要
   - 各podmanコマンドが直接コンテナを管理

2. **Rootless（ルートレス）**
   - 一般ユーザー権限でコンテナを実行可能
   - セキュリティの大幅な向上

3. **Docker互換性**
   - Dockerコマンドとほぼ同じ使い方
   - 既存のDockerfileやdocker-compose.ymlを利用可能

## 10.3 Rootless、Daemonless設計の意味

### Rootlessコンテナの仕組み

#### ユーザー名前空間の活用
```bash
# 通常のユーザーで実行
$ whoami
alice

# Rootlessコンテナの作成
$ podman run -it alpine sh

# コンテナ内ではrootに見える
/# whoami
root

# しかし実際のホストでは一般ユーザーのまま
$ ps aux | grep podman
alice  12345  0.0  0.1  123456  12345  pts/0  S+  10:00  0:00 podman run
```

#### UIDマッピングの仕組み
```bash
# /etc/subuidの設定
$ cat /etc/subuid
alice:100000:65536

# /etc/subgidの設定
$ cat /etc/subgid
alice:100000:65536

# マッピングの確認
$ podman unshare cat /proc/self/uid_map
         0       1000          1
         1     100000      65536
```

### Daemonlessアーキテクチャの利点

#### プロセスの独立性
```bash
# 各コンテナは独立したプロセスツリー
$ podman run -d --name web nginx
$ podman run -d --name db postgres

# systemdに直接統合される
# systemd への統合（後述）により、コンテナをサービスとして管理できる
# 例: podman generate systemd ... -> systemctl --user enable --now ...
# （ユニットを作成していない場合、podman-*.service は存在しない）

# 一つのコンテナの問題が他に影響しない
$ podman stop web
$ podman ps
# 出力例: db
```

#### リソースの効率的な利用
```bash
# Dockerの場合：常にデーモンがメモリを消費
$ ps aux | grep docker
root  1234  0.5  2.0  2345678  234567  ?  Ssl  09:00  1:30 /usr/bin/dockerd

# Podmanの場合：必要なときだけリソースを使用
$ ps aux | grep podman
# コンテナが動いていなければ、プロセスなし
```

## 10.4 セキュリティと運用性の向上

### セキュリティの強化

#### 1. 最小権限の原則の実現
```bash
# 一般ユーザーでコンテナを実行
$ id
uid=1000(alice) gid=1000(alice) groups=1000(alice)

$ podman run --rm alpine id
uid=0(root) gid=0(root) groups=0(root)

# ホストから見ると
$ podman top -l user,group
USER   GROUP
alice  alice
```

#### 2. SELinuxとの統合
```bash
# SELinuxラベルの自動設定
$ podman run -d --name secure_app nginx
$ ps -eZ | grep nginx
system_u:system_r:container_t:s0:c123,c456 12345 ? 00:00:00 nginx

# ボリュームマウント時の適切なラベル付け
$ podman run -v /data:/data:Z nginx  # プライベートラベル
$ podman run -v /shared:/shared:z nginx  # 共有ラベル
```

#### 3. セキュリティスキャン
```bash
# イメージの脆弱性スキャン（例：Trivy）
# ※Podman本体のサブコマンドとしてscanが提供されるかは、バージョン/拡張/依存により異なる
$ trivy image nginx:latest
```

### 運用性の向上

#### systemdとのネイティブ統合
```bash
# Podmanコンテナからsystemdユニットファイルを生成
$ podman run -d --name myapp -p 8080:80 nginx
$ podman generate systemd --name myapp > ~/.config/systemd/user/myapp.service

# サービスとして管理
$ systemctl --user daemon-reload
$ systemctl --user enable --now myapp.service
$ systemctl --user status myapp.service
```

#### ログ管理の改善
```bash
# journaldと直接統合
$ podman run --log-driver=journald --name app nginx
$ journalctl -u app

# ログのローテーション設定
$ podman run --log-opt max-size=10m --log-opt max-file=3 nginx
```

## 10.5 Podmanの実践的な使用

### 基本的なコマンド操作

```bash
# Dockerとほぼ同じコマンド体系
podman pull nginx:latest
podman images
podman run -d --name web -p 8080:80 nginx
podman ps
podman logs web
podman exec -it web /bin/bash
podman stop web
podman rm web
```

### Podman独自の機能

#### 1. Pod機能（Kubernetesライク）
```bash
# Podの作成
$ podman pod create --name mypod -p 8080:80

# Pod内でコンテナを実行
$ podman run --pod mypod -d --name web nginx
$ podman run --pod mypod -d --name app python:3.11

# Podの管理
$ podman pod ps
$ podman pod stats mypod
$ podman pod stop mypod
```

#### 2. Kubernetesマニフェストの生成
```bash
# PodからKubernetesマニフェストを生成
$ podman generate kube mypod > mypod.yaml

# Kubernetesマニフェストからコンテナを起動
$ podman play kube mypod.yaml
```

#### 3. チェックポイント/リストア機能
```bash
# 実行中のコンテナをチェックポイント
$ podman container checkpoint myapp

# 別のホストでリストア
$ podman container restore myapp
```

### Podman Composeの使用

```bash
# docker-compose.ymlをそのまま使用
$ cat docker-compose.yml
version: '3'
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
  db:
    image: postgres:13
    environment:
      POSTGRES_PASSWORD: secret

# podman-composeで実行
$ podman-compose up -d
$ podman-compose ps
$ podman-compose logs
$ podman-compose down
```

## 10.6 演習：DockerとPodmanの違いを実体験

### 演習1：Rootless環境の構築と確認

```bash
# rootless_demo.sh
cat > rootless_demo.sh << 'EOF'
#!/bin/bash

echo "=== Rootless Container Demo ==="

# 1. 現在のユーザー情報
echo "Host user information:"
echo "  User: $(whoami)"
echo "  UID: $(id -u)"
echo "  Groups: $(groups)"

# 2. Rootlessコンテナの起動
echo
echo "Starting rootless container..."
podman run --rm alpine sh -c '
    echo "Container user information:"
    echo "  User: $(whoami)"
    echo "  UID: $(id -u)"
    echo "  Can I write to /etc?: "
    touch /etc/test 2>/dev/null && echo "  Yes" || echo "  No (but this is normal in container)"
'

# 3. UID マッピングの確認
echo
echo "UID mapping:"
podman unshare cat /proc/self/uid_map

# 4. 実際のプロセスの確認
echo
echo "Process view from host:"
podman run -d --name test alpine sleep 1000
ps aux | grep -E "sleep 1000|podman" | grep -v grep
podman rm -f test
EOF

chmod +x rootless_demo.sh
```

### 演習2：Daemonlessアーキテクチャの確認

```bash
# daemonless_test.sh
cat > daemonless_test.sh << 'EOF'
#!/bin/bash

echo "=== Daemonless Architecture Test ==="

# 1. Podmanデーモンの確認（存在しないはず）
echo "Checking for Podman daemon:"
ps aux | grep -E "podman.*daemon" | grep -v grep || echo "No daemon found (expected)"

# 2. 複数のコンテナを起動
echo
echo "Starting multiple containers..."
podman run -d --name web1 nginx
podman run -d --name web2 httpd
podman run -d --name db postgres

# 3. プロセスツリーの確認
echo
echo "Process tree:"
pstree -p $(id -u) | grep -A5 -B5 podman

# 4. 一つのコンテナを強制終了
echo
echo "Killing one container process..."
pkill -f "podman.*web1"
sleep 2

# 5. 他のコンテナへの影響確認
echo
echo "Status of other containers:"
podman ps --format "table \{\{.Names\}\}\t\{\{.Status\}\}"

# クリーンアップ
podman rm -f web1 web2 db
EOF

chmod +x daemonless_test.sh
```

### 演習3：Systemd統合

```bash
# systemd_integration.sh
cat > systemd_integration.sh << 'EOF'
#!/bin/bash

echo "=== Systemd Integration Demo ==="

# 1. コンテナの起動
echo "Starting container..."
podman run -d --name webapp -p 8080:80 nginx

# 2. Systemdユニットファイルの生成
echo
echo "Generating systemd unit file..."
mkdir -p ~/.config/systemd/user/
podman generate systemd --name webapp --new > ~/.config/systemd/user/webapp.service

# 3. ユニットファイルの内容確認
echo
echo "Unit file content:"
cat ~/.config/systemd/user/webapp.service

# 4. Systemdサービスとして管理
echo
echo "Managing as systemd service..."
systemctl --user daemon-reload
systemctl --user enable webapp.service
systemctl --user start webapp.service
systemctl --user status webapp.service

# 5. 自動起動の確認
echo
echo "Service will start automatically on boot"
systemctl --user list-unit-files | grep webapp

# クリーンアップオプション
echo
echo "To clean up, run:"
echo "  systemctl --user stop webapp.service"
echo "  systemctl --user disable webapp.service"
echo "  podman rm -f webapp"
EOF

chmod +x systemd_integration.sh
```

### 演習4：Pod機能の活用

```bash
# pod_demo.sh
cat > pod_demo.sh << 'EOF'
#!/bin/bash

echo "=== Podman Pod Demo ==="

# 1. Podの作成
echo "Creating pod with shared network..."
podman pod create --name webapp-pod \
    --publish 8080:80 \
    --publish 5432:5432

# 2. Pod内でコンテナを起動
echo
echo "Starting containers in pod..."
podman run -d --pod webapp-pod --name web nginx
podman run -d --pod webapp-pod --name db \
    -e POSTGRES_PASSWORD=secret postgres:13

# 3. Pod内のコンテナ間通信
echo
echo "Testing inter-container communication..."
podman exec web sh -c 'apt update && apt install -y postgresql-client'
podman exec web sh -c 'PGPASSWORD=secret psql -h localhost -U postgres -c "SELECT version();"'

# 4. Podの状態確認
echo
echo "Pod status:"
podman pod ps
podman pod stats webapp-pod --no-stream

# 5. KubernetesマニフェストYAMLの生成
echo
echo "Generating Kubernetes manifest:"
podman generate kube webapp-pod > webapp-pod.yaml
echo "Generated webapp-pod.yaml"

# クリーンアップ
echo
echo "Cleaning up..."
podman pod stop webapp-pod
podman pod rm webapp-pod
EOF

chmod +x pod_demo.sh
```

### 演習5：セキュリティ機能の確認

```bash
# security_features.sh
cat > security_features.sh << 'EOF'
#!/bin/bash

echo "=== Podman Security Features Demo ==="

# 1. ユーザー名前空間の確認
echo "1. User namespace isolation:"
podman run --rm alpine sh -c '
    echo "Inside container: uid=$(id -u) gid=$(id -g)"
    echo "Can create file in /root: $(touch /root/test 2>&1 && echo Yes || echo No)"
'

# 2. SELinuxコンテキストの確認（SELinux有効時）
if command -v getenforce &> /dev/null && [ "$(getenforce)" != "Disabled" ]; then
    echo
    echo "2. SELinux context:"
    podman run -d --name setest alpine sleep 1000
    ps -eZ | grep "podman.*setest"
    podman rm -f setest
fi

# 3. Capabilities の制限
echo
echo "3. Linux capabilities:"
podman run --rm alpine sh -c '
    echo "Default capabilities:"
    grep Cap /proc/self/status
'

podman run --rm --cap-drop=ALL --cap-add=NET_BIND_SERVICE alpine sh -c '
    echo "With limited capabilities:"
    grep Cap /proc/self/status
'

# 4. Seccomp プロファイル
echo
echo "4. Seccomp filtering:"
# 危険なシステムコールを制限
podman run --rm --security-opt seccomp=unconfined alpine sh -c '
    echo "Testing chmod (should work with unconfined):"
    touch /tmp/test && chmod 755 /tmp/test && echo "Success"
'

# 5. 読み取り専用ルートファイルシステム
echo
echo "5. Read-only root filesystem:"
podman run --rm --read-only alpine sh -c '
    echo "Trying to write to /:"
    touch /test 2>&1 || echo "Failed as expected"
    echo "But /tmp is writable:"
    touch /tmp/test && echo "Success"
'
EOF

chmod +x security_features.sh
```

## 10.7 企業環境でのPodman活用

### プロダクション環境での考慮事項

#### 1. 高可用性の実現
```bash
# Podman + Systemd + HAProxy による高可用性構成
# haproxy.cfg
global
    daemon

defaults
    mode http
    timeout connect 5000
    timeout client  50000
    timeout server  50000

frontend web_frontend
    bind *:80
    default_backend web_servers

backend web_servers
    balance roundrobin
    server web1 127.0.0.1:8081 check
    server web2 127.0.0.1:8082 check
    server web3 127.0.0.1:8083 check
```

#### 2. 監視とロギング
```bash
# Prometheus metrics
podman run -d \
    --name prometheus \
    -v prometheus-data:/prometheus \
    -v ./prometheus.yml:/etc/prometheus/prometheus.yml:ro \
    prom/prometheus

# ログの集約
podman run -d \
    --name fluentd \
    -v /var/log/pods:/var/log/pods:ro \
    fluent/fluentd
```

#### 3. バックアップとリストア
```bash
# コンテナのバックアップ
podman commit webapp webapp:backup-$(date +%Y%m%d)
podman save webapp:backup-$(date +%Y%m%d) | gzip > webapp-backup.tar.gz

# ボリュームのバックアップ
podman run --rm \
    -v webapp-data:/data:ro \
    -v $(pwd):/backup \
    alpine tar czf /backup/data-backup.tar.gz /data
```

## 10.8 まとめ：エンタープライズグレードのコンテナ技術

### Podmanがもたらす価値

本章で学んだPodmanは、以下の価値を提供します：

1. **セキュリティファースト**：Rootless、Daemonlessによる最小権限の実現
2. **運用の簡素化**：Systemdとのネイティブ統合
3. **互換性**：既存のDocker資産をそのまま活用
4. **エンタープライズ対応**：SELinux、監査、コンプライアンス機能

### 選択の基準

```text
Docker を選ぶべき場合：
- 既存のDocker環境が確立されている
- Docker特有の機能に依存している
- サードパーティツールとの互換性が重要

Podman を選ぶべき場合：
- セキュリティが最重要
- Systemdとの統合が必要
- Rootlessコンテナが要件
- Kubernetesへの移行を視野に入れている
```

### 次章への展望

コンテナランタイムの理解を深めたところで、次章では「コンテナイメージ」について詳しく学びます。

「動作する環境ごと配布する」という革新的な概念が、どのようにレイヤー構造として実現されているのか。効率的なイメージの作成と管理の方法を、実践的に探求していきましょう。

## 章末演習問題

### 問題1：基本理解の確認
以下の文章の空欄を埋めてください。

1. Podmanの主な特徴は（　　　　　　）と（　　　　　　）です。
2. Rootlessコンテナは（　　　　　）名前空間を使用して、一般ユーザーでコンテナを実行します。
3. Podmanでは（　　　　）と直接統合することで、コンテナをサービスとして管理できます。

### 問題2：概念の理解
次の質問に答えてください。

1. DockerとPodmanのアーキテクチャの違いを説明し、それぞれの利点と欠点を述べてください。
2. Rootlessコンテナがセキュリティ向上に寄与する理由を3つ挙げて説明してください。
3. Daemonlessアーキテクチャがもたらす運用上のメリットを具体例を交えて説明してください。

### 問題3：実践的な課題
以下のシナリオに対する解決策を示してください。

1. 既存のDocker環境をPodmanに移行する際の手順と注意点
2. Podmanを使用してマルチコンテナアプリケーションを構築する方法
3. Rootlessコンテナで特権ポート（80番）をバインドする方法

### 問題4：Podman設定
以下の要件を満たすPodmanコンテナを起動するコマンドを記述してください。

- Nginxコンテナをrootlessで実行
- ホストの8080番ポートをコンテナの80番ポートにマップ
- ホストの/data/webディレクトリをコンテナの/usr/share/nginx/htmlにマウント
- コンテナ再起動時に自動的に起動するようsystemdサービスとして設定

### 問題5：Pod機能の活用
以下の構成をPodman Podで実現してください。

```text
Pod名: webapp-stack
含まれるコンテナ：
- Nginx（フロントエンド）
- Node.js アプリケーション
- Redis（キャッシュ）
- PostgreSQL（データベース）

要件：
- すべてのコンテナは同じネットワーク名前空間を共有
- 外部からはNginxの80番ポートのみアクセス可能
```

### 問題6：セキュリティ設定
Podmanコンテナのセキュリティを最大化する設定を作成してください。

要件：
- 読み取り専用ルートファイルシステム
- 最小限のcapabilities
- SELinuxコンテキストの適用
- ユーザー名前空間の分離
- Seccompプロファイルの適用

### 問題7：トラブルシューティング
以下のエラーメッセージが表示された場合の対処法を説明してください。

```text
Error: error creating container storage: the container name "webapp" is already in use
Error: OCI runtime error: permission denied
Error: cannot set up namespace using newuidmap
Error: error creating network namespace
```

### 問題8：発展的課題
1. PodmanとKubernetesの連携について、podman generate kubeとpodman play kubeの活用方法を具体例を交えて説明してください。

2. エンタープライズ環境でPodmanを導入する際の、移行戦略とベストプラクティスについて論じてください。
