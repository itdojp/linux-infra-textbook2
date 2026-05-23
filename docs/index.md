---
layout: book
order: 1
title: "実践Linux インフラエンジニア入門"
description: "コンテナ・クラウド時代に必要なLinuxインフラエンジニアの基礎技術を実践的に学べる技術書"
author: "株式会社アイティードゥ"
version: "1.0.1"
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

- 特別な前提知識は不要（基本的なPC操作と日本語の技術文書が読めること）
- （推奨）ターミナル/コマンドライン操作の経験（例: cd/ls/cat など）
- （推奨）ネットワークの基礎用語（IP/DNS/HTTP の概要）

## 安全に学習するための注意

- 本書のコマンドや設定例は、検証用の Linux 環境で試すことを前提としています。本番サーバーや共有環境で、そのまま実行しないでください。
- ディストリビューションやバージョンによって、利用できるパッケージ、サービス管理方法、ネットワーク診断コマンドが異なる場合があります。
- クラウド関連の章や自動化の章では、権限、課金、削除対象、適用範囲を事前に確認してください。

## 検証環境とレビューゲート（2026年5月23日確認）

本書のコマンド例は、Ubuntu LTS 系を含む systemd 前提の Linux 環境で学ぶことを想定します。
Ubuntu の公式リリース一覧では、2026年4月23日に Ubuntu 26.04 LTS が公開され、22.04 LTS / 24.04 LTS / 26.04 LTS がいずれもサポート対象に含まれています。
本文中の表示例やパッケージ名はディストリビューション、カーネル、systemd、Podman、AWS CLI、Terraform のバージョンによって変わるため、演習前に次を記録してください。

```bash
cat /etc/os-release
uname -a
systemctl --version
podman --version 2>/dev/null || true
aws --version 2>/dev/null || true
terraform version 2>/dev/null || true
```

| 操作の種類 | 例 | 実行前ゲート |
| --- | --- | --- |
| 読み取り中心 | `ls`, `cat`, `ip addr show`, `journalctl --since` | 検証環境の OS / kernel / tool version を記録する |
| ローカル状態変更 | `sudo`, `systemctl`, `ip addr add`, `chmod`, `chown`, `dd` | disposable VM / container / network namespace を優先し、戻し方を確認する |
| 外部サービス変更 | `aws ...`, `terraform apply`, DNS / routing / IAM 変更 | 検証専用 account / profile / region、課金上限、削除手順、認証主体を確認する |

AWS 演習では、root ユーザーや長期アクセスキーの常用を避け、IAM Identity Center や `AssumeRole` による一時認証情報を優先します。
実行前に `aws sts get-caller-identity`、`AWS_PROFILE`、`AWS_REGION` / `AWS_DEFAULT_REGION` を確認し、演習後は作成リソースと課金対象を削除します。
Issue / PR に検証結果を投稿する場合は、Account ID、ARN、hostname、public IP、内部 CIDR、profile 名など、組織や個人を特定し得る値をマスクします。
IAM Identity Center は、AWS 公式の Prescriptive Guidance でも複数アカウントへの centrally managed access の推奨アプローチとして説明されています。

本書へ改善 PR を出す場合は、Issue に確認範囲、変更判断、検証結果を残し、GitHub Copilot review の本文・inline comment・suggestion を全件確認します。
未解決 review thread が 0 件、CI green、merge 後 main checks、公開サイト反映確認までを完了条件とします。

参考:

- [Ubuntu project documentation: List of current releases](https://documentation.ubuntu.com/project/release-team/list-of-releases/)
- [AWS Prescriptive Guidance: AWS IAM Identity Center](https://docs.aws.amazon.com/prescriptive-guidance/latest/security-reference-architecture-identity-management/workforce-iam-identity-center.html)

## 所要時間

- 通読: 約3.5〜5時間（本文量ベース概算。コードブロック除外、400〜600文字/分換算）
- 演習問題を実施する場合は、環境構築と試行回数により変動します。

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
教育・研究・個人学習での利用は自由です。一方、商用利用には事前許諾が必要です。

[ライセンス条件の詳細](https://github.com/itdojp/it-engineer-knowledge-architecture/blob/main/LICENSE.md)

## 利用と更新情報

- リポジトリ: [itdojp/linux-infra-textbook2](https://github.com/itdojp/linux-infra-textbook2)
- 更新差分を追う場合は、GitHub のコミット履歴と PR 一覧を参照してください。
- ディストリビューションやクラウドの仕様差がある箇所は、検証環境のバージョンと公式ドキュメントを併せて確認してください。

## 関連書籍

- Linux の最初の入口を補いたい場合: [図解でわかるLinux基礎](https://itdojp.github.io/illustrated-linux-basics-book/)
- コンテナ運用を深めたい場合: [Podman完全ガイド](https://itdojp.github.io/podman-book/)
- トラブル対応を強化したい場合: [ITインフラトラブルシューティング大全](https://itdojp.github.io/IT-infra-troubleshooting-book/)

**お問い合わせ**  
株式会社アイティードゥ（ITDO Inc.）  
Email: [knowledge@itdo.jp](mailto:knowledge@itdo.jp)

---

**著者:** ITDO Inc. <knowledge@itdo.jp>  
**バージョン:** 1.0.1  
**最終更新:** 2026年5月23日

{% include page-navigation.html %}
