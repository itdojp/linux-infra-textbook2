---
layout: book
order: 1
title: "実践Linux インフラエンジニア入門"
description: "コンテナ・クラウド時代に必要なLinuxインフラエンジニアの基礎技術を実践的に学べる技術書"
author: "株式会社アイティードゥ"
version: "1.0.0"
permalink: /
---

# 実践Linux インフラエンジニア入門

コンテナ・クラウド時代の基礎技術

## 学習成果

- Linux を土台とするインフラストラクチャの基本概念（OS・ファイルシステム・プロセス・ネットワーク）を、コンテナやクラウドの前提として整理し直せるようになる。
- シェルやコマンド、権限管理、TCP/IP、名前解決など、日常的に必要となる基礎技術について、構造と目的を説明しながら設定・操作ができるようになる。
- コンテナ技術（Podman など）や仮想化の背景を理解し、オンプレ／クラウド環境での運用イメージを持ちながら設計・選定の議論に参加できるようになる。
- 監視・ログ・Infrastructure as Code といった運用技術を含めて、現代的なLinuxインフラ環境の全体像を俯瞰し、自身の学習計画やキャリア形成に結びつけられるようになる。

## 読み方ガイド

- Linux そのものに不慣れな読者は、第1部（第1〜3章）で「なぜLinuxを学ぶか」と OS/ファイルシステムの抽象化を押さえたうえで、第2部以降の基礎技術に進むことを推奨する。
- すでに基本コマンドに慣れており、「ネットワークやコンテナの基礎」を強化したい読者は、第2部の該当章を確認しつつ、第3部（ネットワーク）、第4部（コンテナ）の順に重点的に読む読み方も有効である。
- クラウドやIaCに関心が高い読者は、第5〜6部（AWS・仮想ネットワーク・監視・自動化）の章を先に読み、必要に応じて前半の章に戻って Linux 側の基礎を補完する形でもよい。
- 既にインフラに携わっている読者は、興味のある部から読み始めつつ、演習問題や付録の解答集を通じて自分の理解度をチェックする使い方を想定している。

## 前提知識
（前提知識を記載してください）

## 所要時間
（所要時間の目安を記載してください）

## 目次

### はじめに
- **[はじめに](introduction/)** - 本書の目的と構成

### 第1部：なぜLinuxを学ぶのか
- **[第1章：ITインフラの全体像とLinuxの位置づけ](chapters/chapter-01-linux-overview)**
- **[第2章：Linuxというオペレーティングシステムの設計思想](chapters/chapter-02-linux-philosophy)**
- **[第3章：ファイルシステムという抽象化の威力](chapters/chapter-03-filesystem-abstraction)**

### 第2部：基礎技術の本質を理解する
- **[第4章：シェルとコマンド - 対話的管理の基礎](chapters/chapter-04-shell-and-commands)**
- **[第5章：プロセスとシグナル - 並行処理の制御](chapters/chapter-05-process-and-signals)**
- **[第6章：権限管理 - セキュリティの第一歩](chapters/chapter-06-permissions)**

### 第3部：ネットワークという基盤技術
- **[第7章：TCP/IPスタックとLinux](chapters/chapter-07-tcp-ip)**
- **[第8章：名前解決とサービス発見](chapters/chapter-08-name-resolution)**

### 第4部：コンテナ技術の本質
- **[第9章：仮想化からコンテナへ - 隔離技術の進化](chapters/chapter-09-container-evolution)**
- **[第10章：Podmanという選択 - エンタープライズ向けコンテナ](chapters/chapter-10-podman)**
- **[第11章：イメージとレジストリ - 配布可能な実行環境](chapters/chapter-11-with-exercises)**

### 第5部：クラウドという新しいインフラ
- **[第12章：AWSという巨大なデータセンター](chapters/chapter-12-with-exercises)**
- **[第13章：仮想ネットワークの設計と実装](chapters/chapter-13-with-exercises)**

### 第6部：統合と実践
- **[第14章：監視とログ - システムの可観測性](chapters/chapter-14-with-exercises)**
- **[第15章：自動化への道 - Infrastructure as Code](chapters/chapter-15-infrastructure-as-code)**

### 付録
- **[演習問題解答集](appendices/merged-exercise-answers)**

## 概要

本書は、Linux初心者がITインフラエンジニアとして必要な基礎技術を「原理から理解する」ことを目的とします。各技術の誕生背景、解決する課題、実務での位置づけを明確にすることで、変化の激しい技術環境でも応用が利く基礎力を養成します。

### 想定読者
- Linux未経験のIT系学生
- 他業種からの転職希望者
- インフラの知識を身につけたいソフトウェアエンジニア

### 本書の特徴
- 「なぜ」から始まる解説
- 豊富な図解と実例中心の構成
- 実践的な演習問題
- 現代的な技術スタック（Podman、AWS、Infrastructure as Code）

## ライセンス

本書は **Creative Commons BY-NC-SA 4.0** ライセンスで公開されています。  
**🔓 教育・研究・個人学習での利用は自由** ですが、**💼 商用利用には事前許諾** が必要です。

📋 [詳細なライセンス条件](https://github.com/itdojp/it-engineer-knowledge-architecture/blob/main/LICENSE.md)

**お問い合わせ**  
株式会社アイティードゥ（ITDO Inc.）  
Email: [knowledge@itdo.jp](mailto:knowledge@itdo.jp)

---

**📧 著者:** ITDO Inc. <knowledge@itdo.jp>  
**📅 最終更新:** 2025年7月7日

{% include page-navigation.html %}
