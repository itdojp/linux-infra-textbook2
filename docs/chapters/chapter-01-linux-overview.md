---
layout: book
title: "第1章：30分でLinuxサーバーを構築しよう"
order: 3
---

# 第1章：30分でLinuxサーバーを構築しよう

## 🎯 この章の目標
- 実際にLinuxサーバーを構築して動かす
- Webサーバーを立ち上げてブラウザからアクセスする
- Linuxの基本操作に慣れる

## 🚀 30分後にできるようになること
- 自分だけのWebサーバーが動いている
- ブラウザで「Hello, Linux!」が表示される
- 基本的なLinuxコマンドが使える

## 📋 必要なもの
- インターネットに接続されたPC
- ブラウザ（Chrome、Firefox、Safari等）
- やる気（これが一番重要！）

---

## 1.1 まずは動かしてみよう！

理論は後回し。まずは「動くLinuxサーバー」を作ってみましょう。

### 🌟 今日作るもの
```
あなたのPC
    ↓
Linuxサーバー（仮想環境）
    ↓
Webサーバー（Apache）
    ↓
ブラウザで「Hello, Linux!」表示
```

### ステップ1：Linux環境の準備（5分）

#### VirtualBoxでLinux仮想マシンを作る

```bash
# Windows/Mac/Linuxどれでも OK！
# VirtualBoxをダウンロード
# → Ubuntu Server LTSをダウンロード
# → 仮想マシンを作成
```

#### 📝 **今すぐ試そう（5分）**
1. [VirtualBox公式サイト](https://www.virtualbox.org/)からダウンロード
2. [Ubuntu Server](https://ubuntu.com/download/server)の最新LTS版をダウンロード
3. VirtualBoxで新規仮想マシンを作成
   - 名前: MyLinuxServer
   - メモリ: 2GB（2048MB）
   - ストレージ: 20GB

### ステップ2：Ubuntuのインストール（10分）

#### シンプルな設定で進める

```bash
# インストール画面での選択
言語: English（日本語より安定）
キーボード: Japanese
ネットワーク: DHCP（自動設定）
ストレージ: デフォルトのまま
ユーザー名: admin
パスワード: password123（練習用）
SSH: インストールする（重要！）
```

#### 📝 **今すぐ試そう（10分）**
画面の指示に従ってインストールを進めてください。
コーヒーを飲みながら待つのもOK！

### ステップ3：最初のLinuxコマンド（5分）

#### ログインしてコマンドを打ってみる

```bash
# Ubuntuが起動したらログイン
login: admin
password: password123

# 基本コマンドを試してみよう
admin@ubuntu:~$ pwd
/home/admin

admin@ubuntu:~$ ls
（何も表示されない = 空のフォルダ）

admin@ubuntu:~$ whoami
admin

admin@ubuntu:~$ date
Sun Aug 13 10:30:45 UTC 2024
```

#### 📝 **今すぐ試そう（30秒）**
上記のコマンドを順番に入力してみてください。
コマンドの意味は後で説明します。まずは「動く」ことを体験！

### ステップ4：Webサーバーのインストール（5分）

#### Apacheを一発インストール

```bash
# パッケージリストを更新
admin@ubuntu:~$ sudo apt update

# Apacheをインストール
admin@ubuntu:~$ sudo apt install apache2 -y

# 自動起動を有効化
admin@ubuntu:~$ sudo systemctl enable apache2

# 起動確認
admin@ubuntu:~$ sudo systemctl status apache2
● apache2.service - The Apache HTTP Server
   Loaded: loaded
   Active: active (running)  ← これが表示されればOK！
```

#### 📝 **今すぐ試そう（5分）**
コマンドを順番に実行してください。
`apt install`の実行中は少し時間がかかります。

### ステップ5：Hello World ページの作成（3分）

#### 簡単なHTMLページを作る

```bash
# Webページを作成
admin@ubuntu:~$ sudo tee /var/www/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>My First Linux Server!</title>
    <style>
        body { font-family: Arial; text-align: center; margin: 100px; }
        h1 { color: #2e7d32; }
    </style>
</head>
<body>
    <h1>🎉 Hello, Linux! 🎉</h1>
    <p>おめでとうございます！あなたのLinuxサーバーが動いています。</p>
    <p>サーバー名: $(hostname)</p>
    <p>現在時刻: $(date)</p>
</body>
</html>
EOF

# ファイルができたか確認
admin@ubuntu:~$ ls -la /var/www/html/
total 12
drwxr-xr-x 2 root root 4096 Aug 13 10:35 .
drwxr-xr-x 3 root root 4096 Aug 13 10:30 ..
-rw-r--r-- 1 root root  456 Aug 13 10:35 index.html
```

#### 📝 **今すぐ試そう（3分）**
コマンドをコピー&ペーストしてください。
HTMLの知識は不要です！

### ステップ6：ブラウザでアクセス（2分）

#### IPアドレスを確認してアクセス

```bash
# サーバーのIPアドレスを確認
admin@ubuntu:~$ ip addr show | grep inet
    inet 127.0.0.1/8 scope host lo
    inet 192.168.1.100/24 brd 192.168.1.255 scope global enp0s3
                ↑
        このIPアドレスをメモ
```

#### 📝 **今すぐ試そう（2分）**
1. IPアドレスをメモする
2. ホストPCのブラウザで `http://192.168.1.100` にアクセス
3. 「Hello, Linux!」ページが表示されたら成功！🎉

---

## 1.2 おめでとうございます！

### 🎉 あなたが30分で達成したこと

1. ✅ **Linux環境を構築** - 仮想マシンでUbuntu Server起動
2. ✅ **コマンドライン操作** - pwd, ls, whoami等の基本コマンド
3. ✅ **パッケージ管理** - apt updateとapt installでソフトウェア導入
4. ✅ **サービス管理** - systemctlでApache制御
5. ✅ **ファイル操作** - HTMLファイルの作成と配置
6. ✅ **ネットワーク** - IPアドレス確認とWebアクセス

### 🤔 なぜこれが重要なのか？

今あなたが作ったのは、世界中で動いている何百万台ものサーバーと同じ基本構造です：

```
インターネット上のWebサイト
├─ Netflix、YouTube → Linuxサーバー
├─ Google、Amazon → Linuxサーバー  
├─ Facebook、Twitter → Linuxサーバー
└─ あなたが今作ったサーバー → Linuxサーバー ⭐
```

### 📚 次に学ぶこと

この成功体験を土台に、以下を深く学んでいきます：

- **第2章**: なぜLinuxが選ばれるのか？
- **第3章**: ファイルシステムの仕組み
- **第4章**: コマンドの本質を理解する
- **第5章**: プロセスとメモリ管理

---

## 1.3 よくある質問と対処法

### ❓ コマンドが見つからない

```bash
# エラー例
admin@ubuntu:~$ apach2
bash: apach2: command not found

# 対処法
1. スペルを確認（apache2）
2. tabキーで補完を使う
3. which コマンドで場所を確認
```

### ❓ 権限がない

```bash
# エラー例
admin@ubuntu:~$ systemctl start apache2
Failed to start apache2.service: Access denied

# 対処法
sudo を付ける
admin@ubuntu:~$ sudo systemctl start apache2
```

### ❓ ブラウザでアクセスできない

```bash
# 確認手順
1. サーバーが動いているか確認
   sudo systemctl status apache2

2. ファイアウォールを確認
   sudo ufw status

3. ネットワーク設定を確認
   ip addr show
```

---

## 🎯 この章のまとめ

30分で実際にLinuxサーバーを動かし、Webページを公開することができました。

**重要なポイント**：
- Linuxは「難しい」ものではなく「道具」
- コマンドは慣れれば直感的
- 小さな成功の積み重ねが大きな理解につながる

次章では、なぜLinuxがこれほど重要なのか、その背景を理解していきましょう。

---

**次章へ**: [第2章 Linuxの設計思想を理解する](../chapter-02-linux-philosophy/)