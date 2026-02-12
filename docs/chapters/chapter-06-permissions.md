# 第6章：権限管理 - セキュリティの第一歩

## 6.1 はじめに：なぜ権限管理が必要なのか

想像してください。あなたの家に100人が住んでいるとします。全員が家のすべての部屋に自由に出入りでき、誰の持ち物でも自由に使えるとしたら、どうなるでしょうか？

プライバシーは守られず、大切なものは壊され、混乱が生じるでしょう。

Linuxシステムも同様です。複数のユーザーとプロセスが同じシステムを共有する環境では、「誰が何をできるか」を明確に定義する必要があります。これが権限管理の本質です。

## 6.2 マルチユーザーシステムの必然性

### なぜマルチユーザーなのか

#### 歴史的背景：高価なコンピュータの共有

1970年代、コンピュータは非常に高価でした：

```text
1台のメインフレーム：数億円
↓
複数の端末を接続
↓
多数のユーザーが同時利用
```

この環境では、以下が必須でした：
- 各ユーザーのファイルを保護
- システムリソースの公平な配分
- 悪意あるユーザーからの防御

#### 現代における意義

現在でもマルチユーザーの概念は重要です：

```bash
# 典型的なWebサーバーのユーザー
$ cat /etc/passwd | cut -d: -f1 | grep -E "www-data|mysql|postgres|nginx"
www-data    # Webサーバー用
mysql       # データベース用
postgres    # データベース用
nginx       # Webサーバー用
```

各サービスが独立したユーザーで動作することで：
- サービス間の干渉を防ぐ
- 一つのサービスが侵害されても被害を限定
- 最小権限の原則を実現

### ユーザーとグループの概念

#### ユーザー（User）
```bash
# ユーザー情報の確認
$ id
uid=1000(username) gid=1000(username) groups=1000(username),4(adm),24(cdrom),27(sudo)

# /etc/passwdの構造
username:x:1000:1000:User Name:/home/username:/bin/bash
#   │    │  │    │      │           │            │
#   │    │  │    │      │           │            └─ ログインシェル
#   │    │  │    │      │           └─ ホームディレクトリ
#   │    │  │    │      └─ コメント（フルネーム等）
#   │    │  │    └─ プライマリグループID
#   │    │  └─ ユーザーID（UID）
#   │    └─ パスワード（xは/etc/shadowを参照）
#   └─ ユーザー名
```

#### グループ（Group）
```bash
# グループ情報
$ cat /etc/group | grep developers
developers:x:1001:alice,bob,charlie
#     │    │  │      └─ グループメンバー
#     │    │  └─ グループID（GID）
#     │    └─ パスワード（通常は未使用）
#     └─ グループ名

# ユーザーをグループに追加
sudo usermod -aG developers alice
```

## 6.3 最小権限の原則とその実装

### 最小権限の原則とは

「各ユーザー・プロセスには、その作業を完了するために必要な最小限の権限のみを与える」

#### 実例：Webサーバーの権限設計

```bash
# 悪い例：すべてをrootで実行
sudo nginx  # rootの全権限でWebサーバー起動

# 良い例：専用ユーザーで実行
# nginx.conf
user www-data;  # 限定的な権限のユーザー

# www-dataユーザーの権限
$ sudo -u www-data whoami
www-data

$ sudo -u www-data ls /root
ls: cannot open directory '/root': Permission denied
```

### Linuxの権限モデル

#### 基本的な権限（rwx）

```bash
$ ls -la
drwxr-xr-x  5 alice developers  4096 Mar 15 10:00 project/
-rw-r--r--  1 alice developers  1234 Mar 15 09:30 README.md
-rwxr-x---  1 alice developers  5678 Mar 15 09:45 script.sh
-rw-------  1 alice alice       9012 Mar 15 10:15 private.key

# 権限の意味
# rwx rwx rwx
# │││ │││ │││
# │││ │││ └└└─ その他（others）の権限
# │││ └└└───── グループ（group）の権限
# └└└───────── 所有者（user）の権限
#
# r = 読み取り（read）    = 4
# w = 書き込み（write）   = 2
# x = 実行（execute）     = 1
```

#### ディレクトリに対する権限の意味

```bash
mkdir test_dir
chmod 755 test_dir  # rwxr-xr-x

# r（読み取り）：ディレクトリの内容をリストできる
# w（書き込み）：ファイルの作成・削除ができる
# x（実行）：ディレクトリに入れる（cd可能）

# 実験：xなしのディレクトリ
chmod 644 test_dir  # rw-r--r--
cd test_dir  # Permission denied
ls test_dir  # ファイル名は見えるが詳細は見えない
```

上記のコマンドは、権限の違いを体感するための「実験用」の例です。実際の業務ディレクトリで同様の chmod を行うと、思わぬアクセス障害につながる可能性があります。必ず自分のホームディレクトリ配下にテスト用ディレクトリ（例：`~/permission-test`）を作成し、その中でのみ試してください。

### 特殊な権限ビット

#### SetUID（Set User ID）
```bash
# passwdコマンドの例
$ ls -la /usr/bin/passwd
-rwsr-xr-x 1 root root 68208 Feb  6  2024 /usr/bin/passwd
#   └─ 's'がSetUIDビット

# 一般ユーザーでもroot権限で実行される
# これによりパスワード変更（/etc/shadow編集）が可能
```

#### SetGID（Set Group ID）
```bash
# 共有ディレクトリの設定
mkdir /shared/project
chmod 2775 /shared/project  # 2がSetGIDビット
chgrp developers /shared/project

# このディレクトリ内で作成されたファイルは
# 自動的にdevelopersグループに属する
```

#### Sticky Bit
```bash
# /tmpディレクトリの例
$ ls -ld /tmp
drwxrwxrwt 15 root root 4096 Mar 15 11:26 /tmp
#         └─ 't'がSticky bit

# 誰でも書き込めるが、自分のファイルしか削除できない
```

## 6.4 実践的な権限管理

### ファイル権限の変更

#### chmod - 権限の変更
```bash
# 数値表記
chmod 755 script.sh   # rwxr-xr-x
chmod 644 config.txt  # rw-r--r--
chmod 600 private.key # rw-------

# シンボリック表記
chmod u+x script.sh     # 所有者に実行権限を追加
chmod g-w file.txt      # グループから書き込み権限を削除
chmod o=r file.txt      # その他には読み取りのみ
chmod a+r file.txt      # 全員に読み取り権限を追加

# 再帰的な変更
chmod -R 755 /var/www/html
```

#### chown - 所有者の変更
```bash
# 所有者のみ変更
chown alice file.txt

# 所有者とグループを変更
chown alice:developers file.txt

# 再帰的に変更
chown -R www-data:www-data /var/www

# グループのみ変更
chgrp developers file.txt
```

### umask - デフォルト権限の設定

```bash
# 現在のumaskを確認
$ umask
0022

# umaskの仕組み
# ファイル作成時：666 - umask = 実際の権限
# ディレクトリ作成時：777 - umask = 実際の権限

# umask 022の場合
# ファイル：666 - 022 = 644 (rw-r--r--)
# ディレクトリ：777 - 022 = 755 (rwxr-xr-x)

# より制限的なumask
umask 077  # 所有者のみアクセス可能
```

### ACL（Access Control List）- より細かい権限制御

```bash
# ACLの確認
getfacl file.txt

# 特定ユーザーに権限を追加
setfacl -m u:bob:rw file.txt

# 特定グループに権限を追加
setfacl -m g:managers:rwx project/

# デフォルトACL（新規ファイルに自動適用）
setfacl -d -m g:developers:rw project/

# ACLを削除
setfacl -x u:bob file.txt

# すべてのACLを削除
setfacl -b file.txt
```

## 6.5 セキュリティインシデントの防止

### よくある権限設定ミス

#### 1. 過度に緩い権限
```bash
# 危険：誰でも書き込める設定ファイル
chmod 777 /etc/app/config.conf  # 絶対ダメ！

# 正しい設定
chmod 644 /etc/app/config.conf  # rootのみ編集可能
```

#### 2. 秘密鍵の権限
```bash
# SSHが拒否する緩い権限
chmod 644 ~/.ssh/id_rsa
# Permissions 0644 for 'id_rsa' are too open.

# 正しい権限
chmod 600 ~/.ssh/id_rsa
```

#### 3. SetUIDの誤用
```bash
# 危険：シェルスクリプトにSetUID
chmod u+s script.sh  # セキュリティホール！

# SetUIDは慎重に、できれば使わない
```

### 権限昇格攻撃の防止

#### sudo設定のベストプラクティス
```bash
# /etc/sudoersの編集（必ずvisudoを使用）
sudo visudo

# 良い例：特定コマンドのみ許可
alice ALL=(ALL) /usr/bin/systemctl restart nginx
bob   ALL=(ALL) /usr/bin/apt-get update, /usr/bin/apt-get upgrade

# 悪い例：無制限のsudo
alice ALL=(ALL) NOPASSWD: ALL  # 危険！

# グループベースの設定
%admin ALL=(ALL) ALL
%developers ALL=(ALL) /usr/bin/docker
```

#### ファイル改竄の検出
```bash
# ファイルの整合性チェック
# 1. チェックサムの記録
find /etc -type f -exec md5sum {} \; > /root/etc_checksums.txt

# 2. 定期的な確認
md5sum -c /root/etc_checksums.txt | grep -v "OK$"

# より高度なツール：AIDE
sudo apt install aide
sudo aideinit
sudo aide --check
```

### 実践的なセキュリティ対策

#### 1. 最小インストールの原則
```bash
# 不要なパッケージの削除
sudo apt autoremove
sudo apt purge package-name

# 実行中のサービスを確認
systemctl list-units --type=service --state=running
```

#### 2. ファイルシステムの保護
```bash
# /etc/fstabでの設定
# /tmpをnoexecでマウント
tmpfs /tmp tmpfs defaults,noexec,nosuid 0 0

# 読み取り専用マウント
/dev/sda2 /usr ext4 defaults,ro 0 0
```

#### 3. 監査ログの活用
```bash
# auditdのインストールと設定
sudo apt install auditd

# 重要ファイルの監視設定
sudo auditctl -w /etc/passwd -p wa -k passwd_changes
sudo auditctl -w /etc/shadow -p wa -k shadow_changes
sudo auditctl -w /etc/sudoers -p wa -k sudoers_changes

# 監査ログの確認
sudo ausearch -k passwd_changes
sudo aureport --summary
```

#### 4. ファイアウォール設定の実践

```bash
# iptablesによる基本設定
# デフォルトポリシーを拒否に設定
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# 必要なサービスのみ許可
sudo iptables -A INPUT -i lo -j ACCEPT                    # ローカルループバック
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT  # 確立済み接続
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT        # SSH
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT        # HTTP
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT       # HTTPS

# 設定を保存
sudo iptables-save > /etc/iptables/rules.v4

# ufw（簡易ファイアウォール）の使用
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status verbose
```

#### 5. SSH強化設定

```bash
# /etc/ssh/sshd_configの推奨設定
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# セキュリティ強化設定
cat >> /etc/ssh/sshd_config << 'EOF'
# セキュリティ強化設定
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM no
AllowUsers alice bob
DenyUsers root
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

# 設定の検証と適用
sudo sshd -t  # 設定ファイルの構文チェック
sudo systemctl reload sshd
```

#### 6. システム監視とアラート

```bash
# fail2banのインストールと設定
sudo apt install fail2ban

# /etc/fail2ban/jail.local の設定例
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
ignoreip = 127.0.0.1/8 192.168.1.0/24

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 不正アクセス試行の確認
sudo fail2ban-client status
sudo fail2ban-client status sshd

# ファイルアクセスの監視
sudo auditctl -w /etc/passwd -p wa -k passwd_changes

# ログの確認
sudo aureport -f
sudo ausearch -k passwd_changes
```

## 6.6 演習：権限設定ミスによる脆弱性を体験

### 演習1：基本的な権限管理

```bash
# 準備：テスト環境の作成
mkdir ~/permission_test
cd ~/permission_test

# 3人のユーザーをシミュレート（実際にはファイルで代用）
echo "Alice's secret" > alice_secret.txt
echo "Bob's data" > bob_data.txt
echo "Shared info" > shared.txt

# 権限の設定
chmod 600 alice_secret.txt  # Aliceのみ
chmod 640 bob_data.txt      # Bobと同じグループ
chmod 644 shared.txt        # 全員読める

# 権限の確認
ls -la

# 他ユーザーとしてアクセスを試みる（エラーを確認）
sudo -u nobody cat alice_secret.txt
```

### 演習2：SetUIDの危険性

```bash
# 危険なプログラムの作成（教育目的のみ）
cat > vulnerable.c << 'EOF'
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
    printf("Current UID: %d\n", getuid());
    printf("Effective UID: %d\n", geteuid());
    
    if (argc > 1) {
        // 危険：ユーザー入力をそのままsystem()に渡す
        system(argv[1]);
    }
    return 0;
}
EOF

# コンパイルと権限設定
gcc vulnerable.c -o vulnerable
chmod u+s vulnerable  # SetUID設定

# 実行して権限昇格を確認
./vulnerable "whoami"
./vulnerable "cat /etc/shadow"  # root権限で実行される！

# 後片付け（重要）
rm vulnerable vulnerable.c
```

### 演習3：共有ディレクトリの設定

```bash
# 共有プロジェクトディレクトリの作成
sudo mkdir /tmp/shared_project
sudo groupadd project_team
sudo usermod -aG project_team $USER

# SetGIDとSticky bitの設定
sudo chmod 3775 /tmp/shared_project  # rwxrwsr-t
sudo chgrp project_team /tmp/shared_project

# テスト
cd /tmp/shared_project
touch myfile.txt
ls -la  # グループがproject_teamになっているか確認

# 別ユーザーでのテスト（sudoを使用）
sudo -u nobody touch /tmp/shared_project/test.txt  # 失敗するはず
```

### 演習4：ACLの活用

```bash
# ACL対応の確認
mount | grep acl

# テストファイルの作成
echo "Project data" > project.txt
chmod 600 project.txt  # 所有者のみ

# 特定ユーザーに読み取り権限を付与
# (実際にはwww-dataユーザーなどを使用)
setfacl -m u:www-data:r project.txt

# ACLの確認
getfacl project.txt

# 複数ユーザーへの権限設定
setfacl -m u:user1:rw,u:user2:r,g:developers:rw project.txt

# マスクの設定（最大権限の制限）
setfacl -m m::r project.txt
```

### 演習5：セキュリティ監査

```bash
# security_audit.sh - 簡易セキュリティ監査スクリプト
cat > security_audit.sh << 'EOF'
#!/bin/bash

echo "=== Security Audit Report ==="
echo "Date: $(date)"
echo

echo "1. World-writable files:"
find / -type f -perm -002 2>/dev/null | head -20

echo
echo "2. SetUID files:"
find / -type f -perm -4000 2>/dev/null | head -20

echo
echo "3. SetGID files:"
find / -type f -perm -2000 2>/dev/null | head -20

echo
echo "4. Files without owner:"
find / -nouser -o -nogroup 2>/dev/null | head -20

echo
echo "5. Suspicious permissions on important files:"
ls -la /etc/passwd /etc/shadow /etc/sudoers 2>/dev/null

echo
echo "6. Users with UID 0 (root privileges):"
awk -F: '$3 == 0 {print $1}' /etc/passwd

echo
echo "7. Sudo configuration:"
sudo grep -v '^#' /etc/sudoers | grep -v '^$'
EOF

chmod +x security_audit.sh
# sudo ./security_audit.sh  # 実行には注意
```

## 6.7 ベストプラクティスとガイドライン

### 権限設定のチェックリスト

#### システムファイル
```bash
# 重要なシステムファイルの権限
/etc/passwd     # 644 (rw-r--r--) root:root
/etc/shadow     # 640 (rw-r-----) root:shadow
/etc/sudoers    # 440 (r--r-----) root:root
/etc/ssh/sshd_config # 644 (rw-r--r--) root:root
```

#### Webアプリケーション
```bash
# Webサーバーのドキュメントルート
/var/www/html/          # 755 www-data:www-data
/var/www/html/*.html    # 644 www-data:www-data
/var/www/html/upload/   # 775 www-data:www-data (書き込み可能)

# 設定ファイル
/etc/nginx/nginx.conf   # 644 root:root
/etc/nginx/sites-available/* # 644 root:root
```

#### ユーザーディレクトリ
```bash
# ホームディレクトリ
/home/username/         # 750 または 700
~/.ssh/                 # 700
~/.ssh/authorized_keys  # 600
~/.ssh/id_rsa          # 600
~/.ssh/id_rsa.pub      # 644
```

### 自動化スクリプト

```bash
#!/bin/bash
# fix_permissions.sh - 権限を修正するスクリプト

# SSHディレクトリの修正
fix_ssh_permissions() {
    local user=$1
    local home=$(getent passwd "$user" | cut -d: -f6)
    
    if [ -d "$home/.ssh" ]; then
        chmod 700 "$home/.ssh"
        chmod 600 "$home/.ssh/id_"* 2>/dev/null
        chmod 644 "$home/.ssh/"*.pub 2>/dev/null
        chmod 600 "$home/.ssh/authorized_keys" 2>/dev/null
        chown -R "$user:$user" "$home/.ssh"
    fi
}

# Webディレクトリの修正
fix_web_permissions() {
    find /var/www -type d -exec chmod 755 {} \;
    find /var/www -type f -exec chmod 644 {} \;
    chown -R www-data:www-data /var/www
}

# メイン処理
echo "Fixing permissions..."
for user in $(getent passwd | awk -F: '$3 >= 1000 {print $1}'); do
    fix_ssh_permissions "$user"
done

fix_web_permissions
echo "Done."
```

## 6.8 まとめ：セキュリティは設計から始まる

### 権限管理の本質

本章で学んだ権限管理は、セキュリティの基礎です：

1. **最小権限の原則**：必要最小限の権限のみを付与
2. **職務の分離**：異なる役割には異なるユーザー
3. **多層防御**：一つの対策に頼らない
4. **監査と監視**：設定を定期的に確認

### 権限管理は継続的なプロセス

セキュリティは一度設定したら終わりではありません：

```bash
# 定期的な確認項目
- 不要なユーザーアカウントの削除
- 過度に緩い権限の修正
- SetUID/SetGIDファイルの確認
- ログの監視と分析
```

### 次章への準備

これまでの章で、Linuxシステムの基本的な仕組みを理解しました。次章からは、これらのシステムがネットワークを通じてどのように連携するかを学びます。

TCP/IPスタックという、インターネットの基礎技術をLinuxがどのように実装し、管理しているか。その仕組みを理解することで、現代のネットワークシステムの本質が見えてきます。

## 章末演習問題

### 問題1：基本理解の確認
以下の文章の空欄を埋めてください。

1. Linuxの基本的な権限は、（　　　）、（　　　）、（　　　）の3つで、それぞれ数値で（　）、（　）、（　）と表現されます。
2. ファイルの所有者以外でも特定の権限で実行できるようにする特殊ビットを（　　　　）ビットといい、ディレクトリ内で作成されたファイルが自動的に特定のグループに属するようにするビットを（　　　　）ビットといいます。
3. umaskが022の場合、新規作成されるファイルの権限は（　　　）、ディレクトリの権限は（　　　）になります。

### 問題2：概念の理解
次の質問に答えてください。

1. 「最小権限の原則」とは何か、なぜ重要なのか、具体例を挙げて説明してください。
2. SetUIDビットの仕組みと、それがセキュリティリスクになり得る理由を説明してください。
3. ACL（Access Control List）が従来のUNIX権限システムより優れている点を2つ挙げてください。

### 問題3：実践的な課題
以下のシナリオに対して、適切な権限設定を行うコマンドを記述してください。

1. Webサーバーのドキュメントルート（/var/www/html）を、www-dataユーザーが読み取り可能、管理者グループ（webadmin）が読み書き可能、その他のユーザーはアクセス不可にする。

2. 共有ディレクトリ（/shared/project）を作成し、developersグループのメンバーが自由にファイルを作成・編集でき、作成されたファイルは自動的にdevelopersグループに属するようにする。

3. バックアップスクリプト（/usr/local/bin/backup.sh）を、backupユーザーのみが実行でき、実行時はroot権限で動作するようにする。

### 問題4：セキュリティ診断
以下のls -laの出力を見て、セキュリティ上の問題点を指摘し、修正方法を提案してください。

```text
drwxrwxrwx  5 root     root      4096 Mar 15 10:00 /etc/app-config/
-rwsr-xr-x  1 root     root     12288 Mar 15 09:00 /usr/local/bin/user-script.sh
-rw-rw-rw-  1 webapp   webapp     512 Mar 15 11:00 /var/www/database.conf
-rw-r--r--  1 user     user      1024 Mar 15 12:00 ~/.ssh/id_rsa
drwx------  2 root     root      4096 Mar 15 13:00 /home/user/
```

### 問題5：権限管理スクリプト
以下の要件を満たすスクリプトを作成してください。

```bash
#!/bin/bash
# security_audit.sh - セキュリティ監査スクリプト

# 要件：
# 1. システム全体で777権限のファイル/ディレクトリを検出
# 2. SetUID/SetGIDビットが設定されているファイルをリスト
# 3. 所有者が存在しないファイルを検出
# 4. /etc, /usr/bin, /usr/sbinで最近変更されたファイルを表示
# 5. 結果をレポートファイルに出力

# ここにコードを記述
```

### 問題6：ACLの活用
次のシナリオをACLを使って実現する方法を示してください。

プロジェクトディレクトリ /project/webapp があり：
- alice: 全権限
- bob: 読み書き権限（実行不可）
- charlie: 読み取りのみ
- developersグループ: 読み書き権限
- 新規作成されるファイルにも自動的に同じACLを適用

### 問題7：トラブルシューティング
ユーザーから「ファイルが編集できない」という報告がありました。以下の情報から原因を特定し、解決策を提示してください。

```bash
$ id alice
uid=1001(alice) gid=1001(alice) groups=1001(alice),1002(developers)

$ ls -la /shared/important.txt
-rw-r----- 1 bob managers 1024 Mar 15 10:00 /shared/important.txt

$ getfacl /shared/important.txt
# file: /shared/important.txt
# owner: bob
# group: managers
user::rw-
group::r--
other::---
```

### 問題8：発展的課題
1. SELinuxやAppArmorなどのMAC（Mandatory Access Control）システムが、従来のDAC（Discretionary Access Control）に加えて必要な理由を説明してください。

2. コンテナ環境における権限管理の課題と、rootlessコンテナが解決する問題について論じてください。
