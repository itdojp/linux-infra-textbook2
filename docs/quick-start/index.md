---
layout: book
title: "クイックスタート"
description: "安全な検証環境で Linux の基本観察を体験する 20〜30 分の導入"
permalink: /quick-start/
---

# クイックスタート

## このページのゴール

このページは、Linux を初めて学ぶ読者が **20〜30 分**で「Linux は状態を観察し、ファイル・プロセス・ネットワークを段階的に扱う環境である」と体験するための導入です。コマンドを暗記することではなく、実行前に対象を確認し、期待結果と停止条件を持って観察することを完了条件にします。

### 実行前に用意するもの

- Linux の disposable（使い捨て可能）な VM、コンテナ、または検証専用の Linux 環境
- bash などの POSIX 系シェルを実行できるターミナル
- 20〜30 分の作業時間

コマンドは同じターミナルで、上から順に実行してください。表示される IP アドレス、ユーザー名、ホスト名などは、Issue やチャットにそのまま貼り付けないでください。

## 実行前の安全境界

この手順は **本番環境、共有サーバー、会社や個人の重要データがある端末では実行しない**でください。検証対象は、いつでも破棄して作り直せる環境に限定します。クラウド VM を使う場合も、検証専用アカウント・プロジェクトであること、課金上限と削除手順が確認済みであることを先に確認してください。

このページでは、`sudo`、サービス停止、権限の変更・破壊、ディスクへの書き込み、クラウドリソースの作成を必須にしません。以下のどれかに該当する場合は、コマンドを続けずに停止してください。

- disposable ではない環境、または接続先を自分で説明できない環境である
- 重要データや共有利用者の作業に影響する可能性がある
- `sudo` やサービス停止を要求する表示が出た
- コマンドの対象が専用一時ディレクトリから外れた

## Step 1: OS・identity・current directoryを確認する（約3分）

最初に「どの OS を、どの identity で、どこから操作しているか」を読み取ります。ここでは状態を変更しません。

```bash
printf '%s\n' '--- OS ---'
cat /etc/os-release
printf '%s\n' '--- kernel ---'
uname -sr
printf '%s\n' '--- identity ---'
id
printf '%s\n' '--- current directory ---'
pwd
```

**期待結果**: OS 名とバージョン、kernel、現在のユーザー ID・グループ、現在のディレクトリが表示されます。`uid=0(root)` と表示された場合は、意図して root 専用の disposable 環境を用意した場合を除き、ここで停止してください。

**停止条件**: 出力から検証環境だと確認できない、`pwd` が想定外の共有・本番領域を示す、または root である理由を説明できない場合は終了します。

**失敗時の確認点**: `/etc/os-release` がない場合は Linux ではない可能性があります。`id` や `pwd` が失敗する場合はシェルの状態を確認し、権限を変更する操作で解決しようとしないでください。

**関連する章**: [第1章：ITインフラの全体像と Linux の位置づけ](../chapters/chapter-01-linux-overview.md)、[第2章：Linux の設計思想](../chapters/chapter-02-linux-philosophy.md)

## Step 2: 専用一時ディレクトリを作り、読み取りから始める（約4分）

以降の作業対象を専用ディレクトリに限定します。`mktemp` が作るディレクトリは現在のユーザーだけが扱える権限で作成されます。

```bash
export QUICK_START_DIR="$(mktemp -d "${TMPDIR:-/tmp}/linux-infra-quick-start.XXXXXX")"
cd "$QUICK_START_DIR"
if [ "$PWD" != "$QUICK_START_DIR" ]; then
  printf '%s\n' '専用一時ディレクトリへ移動できないため、ここで停止します。' >&2
  false
fi
printf '作業場所: %s\n' "$QUICK_START_DIR"
printf '%s\n' '--- directory metadata ---'
pwd
ls -ld .
printf '%s\n' '--- empty directory listing ---'
ls -la
```

**期待結果**: `pwd` が `linux-infra-quick-start.` で始まる専用一時ディレクトリを示し、`ls -la` には `.` と `..` 以外の作業ファイルがありません。

**停止条件**: `QUICK_START_DIR` が空、`cd` に失敗、または `pwd` がそのディレクトリ以外を示した場合は、ファイル作成へ進まないでください。

**失敗時の確認点**: `mktemp` がない場合はディストリビューションの公式ドキュメントで確認します。既存のディレクトリを手動で指定したり、`sudo` で作成したりしないでください。

**関連する章**: [第3章：ファイルシステムという抽象化の威力](../chapters/chapter-03-filesystem-abstraction.md)、[第4章：シェルとコマンド](../chapters/chapter-04-shell-and-commands.md)

## Step 3: ファイルを作成し、内容とメタデータを確認する（約5分）

専用一時ディレクトリの中だけで小さなテキストファイルを作り、書き込み後に別のコマンドで確認します。これは「作ったものを読み返して検証する」基本サイクルです。

```bash
cat > hello-linux.txt <<'EOF'
Linux quick start
observe -> change locally -> verify -> clean up
EOF

printf '%s\n' '--- file metadata ---'
ls -l hello-linux.txt
printf '%s\n' '--- file contents ---'
cat hello-linux.txt
printf '%s\n' '--- line and byte counts ---'
wc -l -c hello-linux.txt
```

**期待結果**: `hello-linux.txt` がこの一時ディレクトリ内に作成され、2 行の内容と行数・バイト数が表示されます。`ls -l` の所有者は Step 1 の identity と一致します。

**停止条件**: `ls` が一時ディレクトリ外のファイルを示す、内容が想定と異なる、または所有者が不明な場合は作業を止めます。

**失敗時の確認点**: `cat` の here-document の終端 `EOF` が単独行になっているか、`pwd` が専用ディレクトリを示すかを確認します。権限エラーを `sudo` で回避しないでください。

**関連する章**: [第3章：ファイルシステムという抽象化の威力](../chapters/chapter-03-filesystem-abstraction.md)、[第6章：権限管理](../chapters/chapter-06-permissions.md)

## Step 4: 自分で起動したプロセスを読み取る（約5分）

自分で起動した短時間の `sleep` プロセスを対象に、PID と状態を読み取ります。既存サービスを停止したり、他の利用者のプロセスを操作したりしません。

```bash
if ! command -v ps >/dev/null 2>&1; then
  printf '%s\n' 'ps コマンドが見つからないため、ここで停止します。'
else
  sleep 30 &
  QUICK_START_PID=$!
  printf '自分で起動した PID: %s\n' "$QUICK_START_PID"
  ps -p "$QUICK_START_PID" -o pid=,ppid=,stat=,comm=
  if kill -0 "$QUICK_START_PID" 2>/dev/null; then
    printf '%s\n' 'プロセスは実行中です。既存プロセスには触れていません。'
  else
    printf '%s\n' 'プロセスが終了済みです。短時間のため、この結果でも観察は完了できます。'
  fi
  wait "$QUICK_START_PID" 2>/dev/null || true
fi
```

**期待結果**: 自分で起動した PID、親 PID、状態、コマンド名 `sleep` が表示されます。約 30 秒後にプロセスは自然終了します。

**停止条件**: `ps` の対象 PID が `$QUICK_START_PID` と一致しない、対象を自分で起動したと確認できない、または停止を促すコマンドが出た場合はそこで停止します。

**失敗時の確認点**: `ps` がない環境では、追加パッケージを入れるために `sudo` を実行せず、この Step をスキップします。`wait` の終了コードは観察結果に影響しないため、既存プロセスを調べるために PID を変更しないでください。

**関連する章**: [第5章：プロセスとシグナル](../chapters/chapter-05-process-and-signals.md)

## Step 5: ネットワーク状態を読み取る（約5分）

最後に、インターフェース、経路、名前解決を読み取ります。ここでも設定変更や外部リソース作成は行いません。IP アドレスやホスト名は公開しない前提で扱います。

```bash
printf '%s\n' '--- interfaces ---'
if command -v ip >/dev/null 2>&1; then
  ip -brief address show
  printf '%s\n' '--- routes ---'
  ip route show
else
  printf '%s\n' 'ip コマンドがないため、インターフェースと経路の確認をスキップします。'
fi

printf '%s\n' '--- name resolution (read-only) ---'
if command -v getent >/dev/null 2>&1; then
  getent ahosts example.com | head -n 3 || true
else
  printf '%s\n' 'getent コマンドがないため、名前解決の確認をスキップします。'
fi
```

**期待結果**: `ip` がある場合はインターフェースと経路、`getent` が使える場合は `example.com` の名前解決結果が表示されます。ネットワークがない検証環境では、空の結果や失敗が出ても環境の制約として記録できます。

**停止条件**: `ip addr add`、`ip route add`、サービス再起動など設定変更を要求された場合は実行しません。表示結果を共有する必要がある場合に、アドレスやホスト名をマスクできない場合も停止します。

**失敗時の確認点**: `ip`・`getent` の有無、ネットワーク namespace、DNS 設定、検証環境の接続制限を確認します。接続確認のためにパッケージを追加したり、ファイアウォールや DNS を変更したりしないでください。

**関連する章**: [第7章：TCP/IP スタックと Linux](../chapters/chapter-07-tcp-ip.md)、[第8章：名前解決とサービス発見](../chapters/chapter-08-name-resolution.md)

## 完了条件と振り返り（約3分）

次の項目を自分の言葉で説明できれば、この 20〜30 分の導入は完了です。

- [ ] OS・kernel・identity・current directory を確認できた
- [ ] 専用一時ディレクトリを作業対象として固定できた
- [ ] ファイルを作成し、内容とメタデータを読み返せた
- [ ] 自分で起動したプロセスの PID と状態を読み取れた
- [ ] ネットワーク情報を変更せずに観察できた
- [ ] どの段階でも期待結果・停止条件・失敗時の確認点を使えた

すべて完了しなくても問題ありません。重要なのは、分からない状態で次のコマンドを実行せず、どの環境・identity・対象を操作するかを確認する習慣です。

## クリーンアップ（約2分）

作成したファイルと一時ディレクトリだけを削除します。削除前にパスを表示し、想定した名前でなければ停止してください。

```bash
printf '削除対象: %s\n' "${QUICK_START_DIR:-未設定}"
case "${QUICK_START_DIR:-}" in
  "${TMPDIR:-/tmp}"/linux-infra-quick-start.*)
    if [ -d "$QUICK_START_DIR" ]; then
      rm -rf -- "$QUICK_START_DIR"
      unset QUICK_START_DIR QUICK_START_PID
      printf '%s\n' '専用一時ディレクトリを削除しました。'
    else
      printf '%s\n' '対象ディレクトリは既にありません。'
    fi
    ;;
  *)
    printf '%s\n' '対象パスが安全な一時ディレクトリの形式ではないため、削除せず停止します。'
    ;;
esac
```

**期待結果**: `linux-infra-quick-start.` で始まる専用一時ディレクトリだけが削除され、重要な領域には触れません。

**停止条件**: `削除対象` が自分で作った一時ディレクトリと一致しない場合は、`rm` を実行しません。

**失敗時の確認点**: 既に削除済みなら問題ありません。削除対象が分からない場合は、親ディレクトリをまとめて削除せず、検証環境自体を破棄する手順に従ってください。

## root `QUICK-START.md` との違い

リポジトリ root の [`QUICK-START.md`](https://github.com/itdojp/linux-infra-textbook2/blob/main/QUICK-START.md) は、原稿を編集・ビルド・ローカルプレビューする **執筆・開発者向け**の手順です。読者が Linux を安全に観察するためのこのページとは対象者、前提、目的が異なります。読者向けの入口として root 文書だけを代用しないでください。

## 次に読む章

この体験で観察した対象を本文で掘り下げるには、まず [第1章](../chapters/chapter-01-linux-overview.md)、[第2章](../chapters/chapter-02-linux-philosophy.md)、[第3章](../chapters/chapter-03-filesystem-abstraction.md)、[第4章](../chapters/chapter-04-shell-and-commands.md)、[第5章](../chapters/chapter-05-process-and-signals.md)、[第7章](../chapters/chapter-07-tcp-ip.md)、[第8章](../chapters/chapter-08-name-resolution.md)へ進んでください。
