---
layout: book
order: 99
title: "用語集"
---

# 📖 Linux インフラ用語集

## 使い方
- **太字**: 重要用語
- （読み方）: カタカナ読み
- 出現章: 最初に登場する章番号

---

## A

### **Apache**（アパッチ）
世界で最も使われているWebサーバーソフトウェア。オープンソースで無料。  
**出現章**: 第1章

### **apt**（エーピーティー）
Advanced Package Tool。Ubuntu/Debianのパッケージ管理システム。  
**出現章**: 第1章

---

## C

### **CUI**（シーユーアイ）
Character User Interface。文字ベースのユーザーインターフェース。  
**出現章**: 第2章

### **Container**（コンテナ）
アプリケーションを箱に入れて持ち運べるようにする技術。  
**出現章**: 第9章

---

## D

### **DHCP**（ディーエイチシーピー）
Dynamic Host Configuration Protocol。IPアドレスを自動割り当てするプロトコル。  
**出現章**: 第1章

### **/dev/null**（デブ・ヌル）
書き込んだデータをすべて破棄する特殊ファイル。ブラックホール。  
**出現章**: 第4章

### **/dev/zero**（デブ・ゼロ）
無限のゼロデータを供給する特殊ファイル。  
**出現章**: 第4章

### **/dev/urandom**（デブ・ユーランダム）
疑似乱数を生成する特殊ファイル。パスワード生成などに使用。  
**出現章**: 第4章

---

## I

### **IPアドレス**（アイピーアドレス）
Internet Protocol Address。ネットワーク上でコンピュータを識別する住所。  
**出現章**: 第1章

### **Infrastructure as Code**（インフラストラクチャー・アズ・コード）
インフラ構成をコードで管理する手法。略してIaC。  
**出現章**: 第15章

---

## K

### **Kernel**（カーネル）
OSの中核部分。ハードウェアとアプリケーションの間で交通整理をする。  
**出現章**: 第3章

### **KISS原則**（キス原則）
Keep It Simple, Stupid。シンプルに保つことが最善という設計思想。  
**出現章**: 第3章

---

## L

### **Linux**（リナックス）
オープンソースのオペレーティングシステム。サーバーで広く使用される。  
**出現章**: 第1章

### **LTS版**（エルティーエスばん）
Long Term Support。長期サポート版。安定性を重視したバージョン。  
**出現章**: 第1章

---

## O

### **OS**（オーエス）
Operating System。コンピュータを動かす基本ソフトウェア。  
**出現章**: 第1章

---

## P

### **Podman**（ポッドマン）
Pod Manager。Dockerの代替となるコンテナ管理ツール。rootless実行が可能。  
**出現章**: 第10章

### **Process**（プロセス）
実行中のプログラム。OSによって管理される実行単位。  
**出現章**: 第5章

---

## S

### **SSH**（エスエスエイチ）
Secure Shell。暗号化された安全なリモート接続方式。  
**出現章**: 第1章

### **systemctl**（システムコントロール）
サービスを管理するLinuxコマンド。systemdシステムで使用。  
**出現章**: 第1章

### **Server**（サーバー）
サービスを提供するコンピュータ。24時間365日稼働し続ける。  
**出現章**: 第1章

### **Single Task**（シングルタスク）
一度に一つの作業のみ実行する方式。古いコンピュータの制約。  
**出現章**: 第3章

---

## T

### **Terminal**（ターミナル）
コマンドを入力するインターフェース。黒い画面とも呼ばれる。  
**出現章**: 第2章

---

## U

### **Ubuntu Server**（ウブントゥサーバー）
Linuxの代表的なディストリビューション。サーバー用途に最適化。  
**出現章**: 第1章

### **UNIX**（ユーニックス）
1969年に開発されたOS。Linuxの設計思想の源流。  
**出現章**: 第3章

---

## V

### **VirtualBox**（バーチャルボックス）
仮想化ソフトウェア。物理コンピュータ上で仮想マシンを動かす。  
**出現章**: 第1章

### **Virtual Machine**（バーチャルマシン）
仮想マシン。物理コンピュータ上で動く仮想的なコンピュータ。  
**出現章**: 第1章

---

## W

### **Web Server**（ウェブサーバー）
Webページを配信するソフトウェア。Apache、nginxなど。  
**出現章**: 第1章

---

## 数字・記号

### **127.0.0.1**（ローカルループバック）
自分自身を指すIPアドレス。localhostとも呼ばれる。  
**出現章**: 第1章

---

## 📚 章別用語インデックス

### 第1章：30分でLinuxサーバーを構築しよう
- Linux, OS, Web Server, VirtualBox, Ubuntu Server, LTS版
- Virtual Machine, DHCP, SSH, Apache, apt, systemctl
- IPアドレス, 127.0.0.1, Server

### 第2章：基本コマンドでLinuxを探検しよう
- Terminal, CUI, Command

### 第3章：ITインフラにおけるLinuxの役割
- UNIX, Kernel, KISS原則, Single Task

### 第4章：ファイルシステムという抽象化の威力
- /dev/null, /dev/zero, /dev/urandom

### 第5章：シェルとコマンド
- Process, Shell

### 第10章：Podman
- Podman, Container

### 第15章：Infrastructure as Code
- Infrastructure as Code

---

## 🔗 関連リンク

- [Linux Documentation Project](https://tldp.org/)
- [Ubuntu Documentation](https://ubuntu.com/server/docs)
- [Red Hat Documentation](https://access.redhat.com/documentation/)

---

**最終更新**: 2025年8月