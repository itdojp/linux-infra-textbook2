# なぜから学ぶLinuxインフラ技術 - 全章演習問題解答集

## 第1章：ITインフラの全体像とLinuxの位置づけ 演習問題解答

### 問題1：基本理解の確認

1. Linuxは（**1991**）年にリーナス・トーバルズによって開発が始まりました。
2. 企業がLinuxを選ぶ技術的理由として、（**安定**）性、（**スケーラビリティ**）性、自動化との（**親和**）性があります。
3. サーバーOSとしてのLinuxの役割は、ハードウェアの（**抽象**）化、リソースの（**管理**）と分配、（**セキュリティ**）の確保です。

### 問題2：概念の理解

**1. なぜ多くの企業がWindows ServerやmacOSではなく、Linuxをサーバー用途に選ぶのか、3つの観点から説明**

1. **経済的観点**：
   - Linuxは無料で使用でき、ライセンス費用が不要
   - 必要に応じて商用サポートを選択できる柔軟性
   - ハードウェア要件が低く、同じ処理をより少ないリソースで実現可能

2. **技術的観点**：
   - 高い安定性（長期間再起動不要）
   - 優れたメモリ管理とプロセス管理
   - テキストベースの設定による自動化の容易さ

3. **人材・エコシステムの観点**：
   - オープンソースによる豊富な学習リソース
   - 世界規模のコミュニティサポート
   - 一度習得すれば様々な環境で活用可能な汎用性

**2. 「オペレーティングシステム」の役割を、レストラン以外の身近な例えで説明**

交通管制センターの例：
- **ハードウェア**：道路、信号機、標識（インフラ）
- **OS**：交通管制センター（交通整理、ルール適用）
- **アプリケーション**：各車両（目的地に向かう）
- **利用者**：運転手や乗客（目的達成）

OSは道路上の車両の流れを管理し、事故を防ぎ、効率的な交通を実現します。

**3. オンプレミスからクラウドへの移行が進んでいる理由**

- **コストの観点**：
  - 初期投資が不要（CAPEX→OPEX）
  - 使った分だけ支払う従量課金制
  - ハードウェア保守・更新費用が不要

- **柔軟性の観点**：
  - 需要に応じた即座のスケーリング
  - 新技術・サービスへの迅速なアクセス
  - 地理的な制約からの解放

### 問題3：実践的思考

**ECサイトのインフラ構成**

1. **必要な構成要素**：
   - Webサーバー（nginx/Apache）
   - アプリケーションサーバー（Node.js/Python）
   - データベースサーバー（MySQL/PostgreSQL）
   - キャッシュサーバー（Redis/Memcached）
   - ロードバランサー
   - ファイアウォール/WAF
   - 監視システム
   - バックアップシステム

2. **Linuxベースを選択すべき理由**：
   - 高い安定性による24時間365日運用の実現
   - セキュリティ機能の充実とコミュニティによる迅速な対応
   - 限定的な予算でも高性能なシステム構築が可能
   - 豊富なオープンソースソフトウェアの活用

3. **将来の拡張性確保**：
   - コンテナ技術（Docker）による環境の標準化
   - 自動スケーリング機能の実装
   - マイクロサービスアーキテクチャの採用
   - Infrastructure as Codeによる環境管理

### 問題4：トラブルシューティング

**Webサイトが時々遅くなる問題の調査**

1. **確認項目（優先順位順）**：
   1. **サーバーリソース使用状況**
      - CPU、メモリ、ディスクI/Oを確認
      - 閾値：CPU80%以上、メモリ90%以上で問題あり
   
   2. **ネットワーク状況**
      - 帯域使用率、パケットロス率
      - レイテンシの測定
   
   3. **アプリケーションログ**
      - エラーログの確認
      - 処理時間の長いリクエストの特定
   
   4. **データベースの状態**
      - スロークエリの確認
      - 接続数、ロック状況
   
   5. **外部サービスの応答**
      - API呼び出しのレスポンスタイム
      - CDNの状態確認

### 問題5：発展的課題

**Infrastructure as CodeとLinuxの関係**

Infrastructure as CodeはLinuxの以下の特性を活かしています：

1. **テキストベースの設定**：
   - すべての設定がテキストファイルであるため、コード化が容易
   - バージョン管理システムでの管理が可能

2. **自動化との親和性**：
   - CLIベースの操作により、スクリプト化が簡単
   - APIやツールとの統合が容易

3. **再現性**：
   - 同じコードから同じ環境を確実に構築可能
   - Linuxの決定論的な動作が基盤

**コンテナ技術とLinuxの関係**

コンテナ技術はLinuxの以下の機能を活用：

1. **プロセス分離機能**：
   - namespaceによる隔離
   - cgroupsによるリソース制限

2. **ファイルシステムの柔軟性**：
   - Union File Systemによるレイヤー構造
   - 効率的なイメージ管理

## 第2章：Linuxというオペレーティングシステムの設計思想 演習問題解答

### 問題1：基本理解の確認

1. UNIXは（**1969**）年に（**AT&Tベル研究所**）で開発されました。
2. Linuxの設計思想「小さなツールの組み合わせ」は、（**KISS**）原則とも呼ばれます。
3. Linuxのアーキテクチャは、（**カーネル**）と（**ユーザーランド**）に分かれており、ハードウェアへの直接アクセスは（**カーネル**）のみが行います。

### 問題2：概念の理解

**1. 「すべてはファイル」という設計思想のメリット**

1. **統一的なインターフェース**：
   - 例：デバイスもファイルも同じopen/read/write/closeで操作
   - プログラマーは一つの方法を学べばすべてに適用可能

2. **ツールの再利用性**：
   - 例：`grep`でログファイルもプロセス情報も検索可能
   - ファイル用ツールがシステム管理にも使える

3. **スクリプト化の容易さ**：
   - 例：設定変更もデバイス操作もリダイレクトで実現
   - 複雑な操作を簡単に自動化できる

**2. パイプを使った処理の優位性**

1. **段階的な問題解決**：
   - 各段階で結果を確認しながら処理を構築
   - デバッグが容易で、問題箇所の特定が簡単

2. **メモリ効率**：
   - 全データをメモリに読み込まず、ストリーム処理
   - 巨大なファイルも効率的に処理可能

**3. カーネルとユーザーランドの分離の利点**

- **セキュリティの観点**：
  - カーネルが全アクセスを仲介し、不正を防ぐ
  - アプリケーションの暴走からシステムを保護
  - 権限の細かい制御が可能

- **拡張性の観点**：
  - カーネルを変更せずに新しいアプリケーションを追加
  - ドライバーのモジュール化により動的な機能追加
  - 異なるユーザーランド（GNU、Busybox等）の選択が可能

### 問題3：実践的思考

**1. 大量のログファイルから特定IPのアクセスを集計**

```bash
# 方法1: 基本的なアプローチ
for i in {1..100}; do
    grep "192.168.1.100" access.log.$i
done | awk '{print $4}' | cut -d: -f1 | sort | uniq -c

# 方法2: より効率的なアプローチ
grep -h "192.168.1.100" access.log.{1..100} | \
awk '{print substr($4,2,10)}' | sort | uniq -c | sort -k2
```

**2. メモリ使用率上位5プロセスの監視**

```bash
#!/bin/bash
# memory_monitor.sh

while true; do
    echo "=== $(date) ==="
    # メモリ使用率上位5プロセスを表示
    ps aux --sort=-%mem | head -6 | tail -5
    
    # 50%を超えるプロセスをチェック
    ps aux --sort=-%mem | awk 'NR>1 && $4>50 {
        print "ALERT: Process " $11 " is using " $4 "% memory (PID: " $2 ")"
    }'
    
    sleep 60
done
```

### 問題4：設計思想の応用

**1. 「一つのプログラムは一つのことをうまくやる」の適用**

例：ログ分析システムの設計
- **ログ収集器**：ログファイルの収集のみ
- **パーサー**：ログの解析のみ
- **フィルター**：条件に基づく抽出のみ
- **集計器**：統計情報の計算のみ
- **レポーター**：結果の表示のみ

各コンポーネントは独立して開発・テスト・更新可能。

**2. パイプのような仕組みの実装**

メッセージキューを使った実装：
```
[ログ収集] → Queue → [パーサー] → Queue → [フィルター] → Queue → [集計器]
```

各コンポーネントは標準入出力のように、キューから読んで、キューに書く。

### 問題5：トラブルシューティング

**問題のあるコマンド：**
```bash
cat /var/log/app.log | grep "2024-03-15" | grep "ERROR" | wc -l > count.txt | mail -s "Today's errors" admin@example.com
```

**問題点**：
パイプの最後で`count.txt`にリダイレクトしているため、その後のパイプが機能しない。

**修正案**：
```bash
# 方法1: teeを使用
cat /var/log/app.log | grep "2024-03-15" | grep "ERROR" | wc -l | tee count.txt | mail -s "Today's errors" admin@example.com

# 方法2: サブシェルを使用
count=$(cat /var/log/app.log | grep "2024-03-15" | grep "ERROR" | wc -l)
echo $count > count.txt
echo $count | mail -s "Today's errors" admin@example.com
```

### 問題6：発展的課題

**マイクロサービスとUNIX思想の関連**

マイクロサービスアーキテクチャは、UNIXの「小さなツールの組み合わせ」思想の現代的な実装です：

1. **単一責任の原則**：
   - 各サービスは一つの機能に特化
   - UNIXツールと同じ設計思想

2. **疎結合**：
   - APIを通じた通信（パイプの現代版）
   - 独立したデプロイメントとスケーリング

3. **組み合わせの柔軟性**：
   - 必要なサービスを組み合わせて複雑な機能を実現
   - コンテナ技術により、さらに独立性が向上

## 第3章：ファイルシステムという抽象化の威力 演習問題解答

### 問題1：基本理解の確認

1. Linuxの「すべてはファイル」という思想では、デバイスは（**/dev**）ディレクトリに、プロセス情報は（**/proc**）ディレクトリに、カーネルパラメータは（**/sys**）ディレクトリにファイルとして存在します。

2. /dev/nullは（**ブラックホール/出力を捨てるデバイス**）として機能し、/dev/zeroは（**無限のゼロ**）を生成し、/dev/randomは（**乱数**）を生成します。

3. 標準入力、標準出力、標準エラー出力のファイルディスクリプタ番号は、それぞれ（**0**）、（**1**）、（**2**）です。

### 問題2：概念の理解

**1. ハードウェアデバイスをファイルとして扱う利点**

1. **統一的な操作方法**：
   - すべてのデバイスを同じAPIで操作可能
   - 新しいデバイスも既存のツールで扱える

2. **権限管理の一貫性**：
   - ファイルと同じ権限システムを適用
   - ユーザー/グループベースのアクセス制御

3. **スクリプト化の容易さ**：
   - リダイレクトやパイプでデバイスを操作
   - 自動化が簡単に実現可能

**2. /procと/sysの違い**

- **/proc**：
  - プロセスとシステムの実行時情報を提供
  - 主に読み取り専用の情報
  - 例：プロセス情報、メモリ使用状況、CPU情報

- **/sys**：
  - カーネルのオブジェクトモデルを公開
  - 設定可能なパラメータが多い
  - 例：デバイスの設定、電源管理、ネットワーク設定

**3. ブロックデバイスとキャラクタデバイスの違い**

- **ブロックデバイス**：
  - 一定サイズのブロック単位でアクセス
  - ランダムアクセス可能
  - 例：ハードディスク(/dev/sda)、SSD

- **キャラクタデバイス**：
  - 1バイトずつシーケンシャルにアクセス
  - ストリーム型のデータ
  - 例：端末(/dev/tty)、シリアルポート

### 問題3：実践的思考

**1. 実行中の全プロセスが開いているファイルの総数**

```bash
# 方法1: lsofを使用
sudo lsof | wc -l

# 方法2: /procを直接調査
sudo find /proc -maxdepth 2 -name fd -type d 2>/dev/null | \
while read dir; do
    ls "$dir" 2>/dev/null
done | wc -l
```

**2. システムの温度センサーの値を定期的に記録**

```bash
#!/bin/bash
# temp_logger.sh

LOG_FILE="/var/log/temperature.log"

while true; do
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    # センサーの場所は環境により異なる
    temp=$(cat /sys/class/thermal/thermal_zone0/temp)
    temp_c=$(echo "scale=2; $temp / 1000" | bc)
    
    echo "$timestamp: ${temp_c}°C" >> "$LOG_FILE"
    sleep 300  # 5分ごと
done
```

**3. 特定のプロセスのメモリ使用量の変化を記録**

```bash
#!/bin/bash
# memory_tracker.sh

if [ $# -ne 1 ]; then
    echo "Usage: $0 <PID>"
    exit 1
fi

PID=$1
LOG_FILE="memory_${PID}.log"

echo "Time,VmSize(KB),VmRSS(KB)" > "$LOG_FILE"

while kill -0 $PID 2>/dev/null; do
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    if [ -f "/proc/$PID/status" ]; then
        vmsize=$(grep VmSize /proc/$PID/status | awk '{print $2}')
        vmrss=$(grep VmRSS /proc/$PID/status | awk '{print $2}')
        echo "$timestamp,$vmsize,$vmrss" >> "$LOG_FILE"
    fi
    sleep 5
done
```

### 問題4：トラブルシューティング

**1. 大量ログ出力でディスク圧迫、内容は不要**

```bash
# /dev/nullにリダイレクト
./application > /dev/null 2>&1

# または、systemdサービスの場合
# /etc/systemd/system/app.service
[Service]
StandardOutput=null
StandardError=null
```

**2. USBデバイスの認識確認**

```bash
# 接続前後でデバイスを比較
ls /dev > before.txt
# USBを接続
ls /dev > after.txt
diff before.txt after.txt

# dmesgでカーネルメッセージ確認
dmesg | tail -20

# lsusbコマンド使用
lsusb -v
```

**3. プロセスが使用しているポート確認**

```bash
# 方法1: /procから直接確認
sudo cat /proc/PID/net/tcp
sudo cat /proc/PID/net/tcp6

# 方法2: lsof使用
sudo lsof -p PID -i

# 方法3: ss使用
sudo ss -tulpn | grep PID
```

### 問題5：応用問題

```bash
#!/bin/bash
# システムリソースの使用状況をまとめるスクリプト

echo "=== System Resource Report ==="

# 1. CPU情報（コア数）を表示
echo "CPU Cores: $(grep -c ^processor /proc/cpuinfo)"

# 2. 総メモリ量をGB単位で表示
total_mem_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')
total_mem_gb=$(echo "scale=2; $total_mem_kb / 1024 / 1024" | bc)
echo "Total Memory: $total_mem_gb GB"

# 3. 現在のネットワークインターフェースとその状態を表示
echo "Network Interfaces:"
for interface in $(ls /sys/class/net/); do
    if [ -f "/sys/class/net/$interface/operstate" ]; then
        state=$(cat /sys/class/net/$interface/operstate)
        echo "  $interface: $state"
    fi
done

# 4. 最も多くのファイルを開いているプロセスのPIDと名前を表示
echo "Process with most open files:"
max_files=0
max_pid=""
max_cmd=""

for pid in $(ls /proc | grep -E '^[0-9]+$'); do
    if [ -d "/proc/$pid/fd" ] 2>/dev/null; then
        count=$(ls /proc/$pid/fd 2>/dev/null | wc -l)
        if [ $count -gt $max_files ]; then
            max_files=$count
            max_pid=$pid
            max_cmd=$(cat /proc/$pid/comm 2>/dev/null)
        fi
    fi
done

echo "  PID: $max_pid, Name: $max_cmd, Open files: $max_files"
```

### 問題6：発展的課題

**1. Dockerと「すべてはファイル」思想の活用**

Dockerは以下の方法でこの思想を活用：

- **cgroups**：
  - `/sys/fs/cgroup/`以下のファイルでリソース制限
  - CPU、メモリ、I/Oの制限を数値の書き込みで実現

- **namespaces**：
  - `/proc/PID/ns/`以下のファイルで名前空間を管理
  - ファイルディスクリプタとして名前空間を操作

**2. 「すべてはファイル」の限界**

- **非同期イベント**：
  - GUIイベント、リアルタイムストリーミング
  - ファイルメタファーでは表現しづらい

- **分散システム**：
  - ネットワーク越しのリソース
  - レイテンシーや部分的障害の表現が困難

- **ハードウェアアクセラレーション**：
  - GPU、TPUなどの並列処理
  - 単純な読み書きでは性能が出ない

## 第4章：シェルとコマンド - 対話的管理の基礎 演習問題解答

### 問題1：基本理解の確認

1. シェルは人間と（**カーネル**）の間に立つ（**通訳者**）の役割を果たします。
2. パイプ（|）は、あるコマンドの（**標準出力**）を別のコマンドの（**標準入力**）につなぎます。
3. リダイレクトで、標準出力は（**>**）、標準エラー出力は（**2>**）、両方を同じファイルに出力するには（**2>&1**）と記述します。

### 問題2：コマンドの理解

**1. `find /var/log -name "*.log" -mtime +30 -exec rm {} \;`**

30日以上前に更新された/var/log以下の.logファイルをすべて削除する。

**2. `ps aux | grep nginx | grep -v grep | awk '{print $2}' | xargs kill -HUP`**

nginxプロセスのPIDを取得し、HUPシグナル（設定再読み込み）を送信する。

**3. `tail -f /var/log/syslog | grep -E "error|warning" | tee alerts.log`**

syslogをリアルタイム監視し、errorまたはwarningを含む行を画面表示しつつalerts.logにも保存する。

### 問題3：実践的な課題

**1. TODOを含む行をファイル名と行番号付きで表示**

```bash
grep -rn "TODO" . --include="*.txt"
# または
find . -name "*.txt" -exec grep -Hn "TODO" {} \;
```

**2. 直近1時間のログレベル集計**

```bash
#!/bin/bash
# 1時間前のタイムスタンプ
one_hour_ago=$(date -d '1 hour ago' '+%b %d %H')

# ログレベルごとに集計
grep "$one_hour_ago" /var/log/syslog | \
awk '
{
    if ($0 ~ /ERROR/) error++
    else if ($0 ~ /WARNING/) warning++
    else if ($0 ~ /INFO/) info++
}
END {
    print "ERROR:", error+0
    print "WARNING:", warning+0
    print "INFO:", info+0
}'
```

**3. サブディレクトリのディスク使用量TOP10**

```bash
du -sh */ 2>/dev/null | sort -rh | head -10
# または、より詳細に
find . -maxdepth 1 -type d -exec du -sh {} \; | sort -rh | head -10
```

### 問題4：パイプラインの設計

```bash
# 本日の404エラーをIPアドレスごとに集計
grep "$(date '+%d/%b/%Y')" /var/log/nginx/access.log | \
grep " 404 " | \
awk '{print $1}' | \
sort | uniq -c | \
sort -rn | \
head -20
```

### 問題5：シェルスクリプトの作成

```bash
#!/bin/bash
# log_monitor.sh - ログファイル監視スクリプト

if [ $# -ne 1 ]; then
    echo "Usage: $0 <logfile>"
    exit 1
fi

LOGFILE="$1"
ERROR_LOG="error_$(date +%Y%m%d).log"
ERROR_COUNT=0
LAST_CHECK=$(date +%s)

# クリーンアップ処理
cleanup() {
    echo "監視を終了します。総ERROR数: $TOTAL_ERRORS"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "監視開始: $LOGFILE"
TOTAL_ERRORS=0

# tail -fで監視
tail -f "$LOGFILE" | while read line; do
    if echo "$line" | grep -q "ERROR"; then
        # ERRORログを記録
        echo "$line" >> "$ERROR_LOG"
        ERROR_COUNT=$((ERROR_COUNT + 1))
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
        
        # 1分間のチェック
        CURRENT_TIME=$(date +%s)
        if [ $((CURRENT_TIME - LAST_CHECK)) -ge 60 ]; then
            if [ $ERROR_COUNT -ge 10 ]; then
                echo "警告: 1分間に${ERROR_COUNT}個のERRORが発生しました！"
            fi
            ERROR_COUNT=0
            LAST_CHECK=$CURRENT_TIME
        fi
    fi
done
```

### 問題6：トラブルシューティング

**問題のあるスクリプト：**
```bash
if [ $usage > $threshold ]; then
```

**問題点**：
`>`はリダイレクト演算子として解釈される。数値比較には`-gt`を使用すべき。

**修正版：**
```bash
#!/bin/bash
# ディスク使用率が80%を超えたらアラートを出すスクリプト

threshold=80
df -h | grep -v "Filesystem" | while read line
do
    usage=$(echo $line | awk '{print $5}' | sed 's/%//')
    mount=$(echo $line | awk '{print $6}')
    
    # 数値比較には -gt を使用
    if [ "$usage" -gt "$threshold" ]; then
        echo "Warning: $mount is $usage% full"
    fi
done
```

### 問題7：発展的課題

**1. GUIとCUIの選択基準**

**GUIの利点と適用場面**：
- 直感的操作（初心者向け）
- ビジュアルデータの扱い（画像編集、CAD）
- 複雑な選択操作（ファイルマネージャー）

**CUIの利点と適用場面**：
- 自動化・スクリプト化（定期タスク）
- リモート操作（SSH経由の管理）
- 大量データ処理（ログ解析）
- 再現性が必要な作業（構成管理）

**2. DevOps/SREでのシェルスクリプト活用例**

- **CI/CDパイプライン**：
  ```bash
  # デプロイスクリプトの例
  #!/bin/bash
  git pull origin main
  npm install
  npm test
  docker build -t app:latest .
  docker push registry/app:latest
  kubectl rollout restart deployment/app
  ```

- **監視・アラート**：
  ```bash
  # ヘルスチェックスクリプト
  if ! curl -f http://app/health; then
      slack-notify "Application is down!"
  fi
  ```

- **インフラ自動化**：
  ```bash
  # サーバープロビジョニング
  terraform apply -auto-approve
  ansible-playbook site.yml
  ```

## 第5章：プロセスとシグナル - 並行処理の制御 演習問題解答

### 問題1：基本理解の確認

1. Linuxで新しいプロセスは、（**fork**）システムコールで既存プロセスをコピーし、（**exec**）システムコールで別のプログラムに置き換えることで生成されます。

2. プロセスの状態には、実行中を表す（**R**）、スリープ中を表す（**S**）、ゾンビ状態を表す（**Z**）などがあります。

3. プロセスに送信できる主要なシグナルには、割り込みの（**SIGINT**）、正常終了要求の（**SIGTERM**）、強制終了の（**SIGKILL**）があります。

### 問題2：概念の理解

**1. fork()とexec()を分ける設計の利点**

- **柔軟な環境設定**：
  - fork()後、exec()前に環境変数やファイルディスクリプタを設定可能
  - 親プロセスの環境を選択的に継承

- **リダイレクトの実現**：
  - fork()後に標準入出力を変更してからexec()
  - パイプの実装が可能

- **プロセス属性の制御**：
  - 実行前にnice値、リソース制限などを設定可能

**2. ゾンビプロセスについて**

- **定義**：
  終了したが、親プロセスがwait()していないプロセス

- **発生理由**：
  - 親プロセスが子の終了を確認していない
  - 親プロセスのバグや設計ミス

- **対処方法**：
  - 親プロセスを修正してwait()を呼ぶ
  - 親プロセスを終了させる（initが回収）
  - ダブルフォークテクニックの使用

**3. シグナルと他のIPC方法の違い**

- **シグナル**：
  - 非同期、単方向、少量の情報
  - 割り込み的な通知に適する

- **パイプ/ソケット**：
  - 同期的、双方向可能、大量データ転送
  - 継続的なデータ交換に適する

### 問題3：実践的な課題

**1. CPU使用率50%超のプロセス特定**

```bash
ps aux --sort=-%cpu | awk 'NR>1 && $3>50 {
    printf "PID: %s, CPU: %s%%, TIME: %s, CMD: %s\n", $2, $3, $10, $11
}'
```

**2. メモリ使用量の変化を記録**

```bash
#!/bin/bash
PID=1234
OUTPUT="memory_${PID}.csv"

echo "Timestamp,VmSize,VmRSS,VmSwap" > "$OUTPUT"

while kill -0 $PID 2>/dev/null; do
    timestamp=$(date +%s)
    vmsize=$(grep VmSize /proc/$PID/status | awk '{print $2}')
    vmrss=$(grep VmRSS /proc/$PID/status | awk '{print $2}')
    vmswap=$(grep VmSwap /proc/$PID/status | awk '{print $2}')
    
    echo "$timestamp,$vmsize,$vmrss,$vmswap" >> "$OUTPUT"
    sleep 10
done
```

**3. プロセス数監視スクリプト**

```bash
#!/bin/bash
# process_count_monitor.sh

THRESHOLD=500
ALERT_FILE="/var/log/process_alert.log"

while true; do
    count=$(ps aux | wc -l)
    
    if [ $count -gt $THRESHOLD ]; then
        msg="警告: プロセス数が${count}個に達しました (閾値: $THRESHOLD)"
        echo "$(date): $msg" >> "$ALERT_FILE"
        
        # メール送信やSlack通知など
        # echo "$msg" | mail -s "Process Alert" admin@example.com
        
        # 詳細情報を記録
        echo "=== Top 10 processes by count ===" >> "$ALERT_FILE"
        ps aux --sort=-pid | head -10 >> "$ALERT_FILE"
    fi
    
    sleep 60
done
```

### 問題4：トラブルシューティング

**1. 大量のゾンビプロセス**

```bash
# 親プロセスの特定
ps aux | grep defunct | awk '{print $3}' | sort | uniq -c | sort -rn

# 根本対策
# 1. 親プロセスのコードを修正
# 2. 一時対策として親プロセスを再起動
# 3. systemdサービスならKillMode=mixedを設定
```

**2. kill -TERMで終了しないプロセス**

```bash
# 1. プロセスの状態確認
cat /proc/1234/stat | awk '{print $3}'

# 2. straceで調査
sudo strace -p 1234

# 3. 強制終了
kill -KILL 1234

# 4. それでも終了しない場合（D状態）
# I/O待ちの可能性があるため、関連デバイスを確認
lsof -p 1234
```

**3. fork()が失敗**

```bash
# プロセス数の確認
ps aux | wc -l

# ユーザーごとのプロセス数
ps aux | awk '{print $1}' | sort | uniq -c | sort -rn

# リソース制限の確認
ulimit -a

# 対策
# 1. 不要なプロセスを終了
# 2. limits.confで制限を緩和
# 3. カーネルパラメータ調整
echo 32768 > /proc/sys/kernel/pid_max
```

### 問題5：シグナルハンドリング

```bash
#!/bin/bash
# graceful_server.sh - グレースフルシャットダウンを実装

# 状態変数
running=true
config_file="/etc/server.conf"

# シグナルハンドラ
handle_sigterm() {
    echo "Received SIGTERM, shutting down gracefully..."
    running=false
}

handle_sighup() {
    echo "Reloading configuration..."
    # 設定ファイルの再読み込み処理
    if [ -f "$config_file" ]; then
        source "$config_file"
    fi
}

# シグナルハンドラの登録
trap handle_sigterm SIGTERM
trap handle_sighup SIGHUP

# メインループ
echo "Server started (PID: $$)"

while $running; do
    echo "Server is running..."
    sleep 1
done

echo "Server stopped gracefully"
```

### 問題6：プロセス監視スクリプト

```bash
#!/bin/bash
# process_watcher.sh - 指定したプロセスを監視

if [ $# -ne 1 ]; then
    echo "Usage: $0 <process_name>"
    exit 1
fi

PROCESS_NAME="$1"
LOG_FILE="/var/log/process_watcher_${PROCESS_NAME}.log"
CHECK_INTERVAL=30

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# メインループ
log "Starting monitoring for process: $PROCESS_NAME"

while true; do
    # プロセスの確認
    pids=($(pgrep -x "$PROCESS_NAME"))
    count=${#pids[@]}
    
    if [ $count -eq 0 ]; then
        log "Process not found, starting $PROCESS_NAME"
        # プロセスを起動（実際のコマンドに置き換える）
        $PROCESS_NAME &
        
    elif [ $count -gt 1 ]; then
        log "Multiple instances found ($count), keeping oldest"
        # 最も古いPID以外を終了
        oldest=${pids[0]}
        for pid in "${pids[@]:1}"; do
            log "Terminating duplicate process PID: $pid"
            kill -TERM $pid
        done
    else
        log "Process running normally (PID: ${pids[0]})"
    fi
    
    sleep $CHECK_INTERVAL
done
```

### 問題7：発展的課題

**1. コンテナでのプロセス隔離**

- **Namespace**：
  - PID namespace: コンテナ内でPID 1から開始
  - Network namespace: 独立したネットワークスタック
  - Mount namespace: 独立したファイルシステムビュー

- **cgroups**：
  - CPU使用率の制限
  - メモリ使用量の制限
  - I/O帯域の制限

```bash
# 実装例
# PID namespaceの作成
unshare --pid --fork /bin/bash

# cgroupsでのメモリ制限
echo $$ > /sys/fs/cgroup/memory/mygroup/cgroup.procs
echo 100M > /sys/fs/cgroup/memory/mygroup/memory.limit_in_bytes
```

**2. systemd vs SysV init**

**SysV init**：
- 順次起動（シリアル処理）
- 依存関係はスクリプトの番号で管理
- 起動が遅い

**systemd**：
- 並列起動
- 明示的な依存関係（Requires, After）
- ソケットアクティベーション
- cgroupsによるプロセス管理

```ini
# systemdユニットファイルの例
[Unit]
Description=My Service
After=network.target
Requires=database.service

[Service]
Type=simple
ExecStart=/usr/bin/myapp
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## 第6章：権限管理 - セキュリティの第一歩 演習問題解答

### 問題1：基本理解の確認

1. Linuxの基本的な権限は、（**読み取り**）、（**書き込み**）、（**実行**）の3つで、それぞれ数値で（**4**）、（**2**）、（**1**）と表現されます。

2. ファイルの所有者以外でも特定の権限で実行できるようにする特殊ビットを（**SetUID**）ビットといい、ディレクトリ内で作成されたファイルが自動的に特定のグループに属するようにするビットを（**SetGID**）ビットといいます。

3. umaskが022の場合、新規作成されるファイルの権限は（**644**）、ディレクトリの権限は（**755**）になります。

### 問題2：概念の理解

1. **「最小権限の原則」とは何か、なぜ重要なのか**
   - 定義：各ユーザーやプロセスに、その作業を完了するために必要な最小限の権限のみを与える原則
   - 重要性：
     - セキュリティリスクの最小化（侵害時の被害を限定）
     - 操作ミスによる被害の防止
     - 監査とコンプライアンスの簡素化
   - 具体例：Webサーバーをwww-dataユーザーで実行し、設定ファイルは読み取り専用にする

2. **SetUIDビットの仕組みとセキュリティリスク**
   - 仕組み：実行時に、ファイル所有者の権限で動作する
   - リスク：
     - 権限昇格攻撃の可能性
     - バッファオーバーフローなどの脆弱性が致命的
     - シェルスクリプトでは特に危険（インタープリタの問題）

3. **ACLの優位性**
   - より細かい権限制御（特定ユーザー・グループごとの設定）
   - デフォルトACLによる継承メカニズム
   - 既存の権限システムとの併用が可能

### 問題3：実践的な課題

1. **Webサーバーのドキュメントルート設定**
```bash
sudo chown -R www-data:webadmin /var/www/html
sudo chmod 750 /var/www/html
sudo find /var/www/html -type f -exec chmod 640 {} \;
sudo find /var/www/html -type d -exec chmod 750 {} \;
```

2. **共有ディレクトリの設定**
```bash
sudo mkdir -p /shared/project
sudo chgrp developers /shared/project
sudo chmod 2775 /shared/project  # SetGIDビット設定
```

3. **バックアップスクリプトの設定**
```bash
sudo chown root:backup /usr/local/bin/backup.sh
sudo chmod 4750 /usr/local/bin/backup.sh  # SetUIDビット設定
# より安全な方法：sudoersで制限
# backup ALL=(root) NOPASSWD: /usr/local/bin/backup.sh
```

### 問題4：セキュリティ診断

**問題点と修正方法：**

1. `/etc/app-config/` (777権限)
   - 問題：誰でも設定を変更可能
   - 修正：`sudo chmod 755 /etc/app-config/`

2. `/usr/local/bin/user-script.sh` (SetUID + シェルスクリプト)
   - 問題：シェルスクリプトのSetUIDは危険
   - 修正：SetUIDを削除し、sudoersで制御

3. `/var/www/database.conf` (666権限)
   - 問題：誰でも読み書き可能（パスワード漏洩リスク）
   - 修正：`chmod 640 /var/www/database.conf`

4. `~/.ssh/id_rsa` (644権限)
   - 問題：他ユーザーが秘密鍵を読める
   - 修正：`chmod 600 ~/.ssh/id_rsa`

5. `/home/user/` (rootが所有)
   - 問題：ユーザーが自分のホームディレクトリにアクセスできない
   - 修正：`sudo chown -R user:user /home/user/`

### 問題5：権限管理スクリプト

```bash
#!/bin/bash
# security_audit.sh - セキュリティ監査スクリプト

REPORT_FILE="/tmp/security_audit_$(date +%Y%m%d_%H%M%S).txt"

{
    echo "=== Security Audit Report ==="
    echo "Date: $(date)"
    echo

    echo "1. Files/directories with 777 permissions:"
    find / -type f -perm 777 2>/dev/null | head -20
    find / -type d -perm 777 2>/dev/null | head -20

    echo
    echo "2. SetUID files:"
    find / -type f -perm -4000 2>/dev/null | head -20

    echo
    echo "3. SetGID files:"
    find / -type f -perm -2000 2>/dev/null | head -20

    echo
    echo "4. Files without owner:"
    find / \( -nouser -o -nogroup \) 2>/dev/null | head -20

    echo
    echo "5. Recently modified system files:"
    find /etc /usr/bin /usr/sbin -type f -mtime -7 2>/dev/null | head -20
} > "$REPORT_FILE"

echo "Report saved to: $REPORT_FILE"
```

### 問題6：ACLの活用

```bash
# ACL設定コマンド
cd /project/webapp

# 各ユーザーの権限設定
setfacl -m u:alice:rwx .
setfacl -m u:bob:rw- .
setfacl -m u:charlie:r-- .
setfacl -m g:developers:rw- .

# デフォルトACL（新規ファイルに自動適用）
setfacl -d -m u:alice:rwx .
setfacl -d -m u:bob:rw- .
setfacl -d -m u:charlie:r-- .
setfacl -d -m g:developers:rw- .
```

### 問題7：トラブルシューティング

**原因：** aliceはmanagersグループのメンバーではなく、othersの権限（---）も読み取り不可

**解決策：**
1. aliceをmanagersグループに追加：`sudo usermod -aG managers alice`
2. ACLで個別に権限付与：`setfacl -m u:alice:rw /shared/important.txt`
3. ファイルの権限を変更：`chmod 664 /shared/important.txt`

### 問題8：発展的課題

1. **MAC（Mandatory Access Control）の必要性**
   - DACの限界：ユーザーが自身のファイルの権限を自由に変更可能
   - MACの利点：
     - システムポリシーによる強制的なアクセス制御
     - 権限昇格攻撃への対策
     - コンプライアンス要件への対応

2. **コンテナ環境における権限管理**
   - 課題：コンテナ内のrootがホストに影響する可能性
   - rootlessコンテナの解決策：
     - ユーザー名前空間による権限分離
     - 非特権ユーザーでのコンテナ実行
     - セキュリティリスクの大幅な低減

## 第7章：TCP/IPスタックとLinux 演習問題解答

### 問題1：基本理解の確認

1. OSI参照モデルは（**7**）層から構成され、TCP/IPモデルは（**4**）層から構成されます。

2. IPアドレスは（**ネットワーク**）層で使用され、MACアドレスは（**データリンク**）層で使用されます。

3. TCPの3ウェイハンドシェイクは、（**SYN**）→（**SYN+ACK**）→（**ACK**）の順序で行われます。

### 問題2：概念の理解

1. **階層的プロトコルスタックの利点**
   - 各層の独立性：一つの層の変更が他層に影響しない
   - 問題の切り分けが容易：層ごとに診断可能
   - 標準化と相互運用性：各層で規格を定義

2. **TCPとUDPの比較**
   - 信頼性：TCP（確実な配送保証）、UDP（保証なし）
   - 速度：TCP（遅い・オーバーヘッド大）、UDP（速い・軽量）
   - 用途：TCP（Web、メール、ファイル転送）、UDP（動画配信、DNS、ゲーム）

3. **NATの背景と問題点**
   - 背景：IPv4アドレスの枯渇対策
   - 問題点：
     - End-to-End接続の破壊
     - P2P通信の困難
     - パフォーマンスのオーバーヘッド

### 問題3：実践的な課題

1. **SSH接続できない場合の確認項目**
   - 物理層：ケーブル接続、リンクアップ
   - データリンク層：ARPテーブル、同一セグメント通信
   - ネットワーク層：ping疎通、ルーティング
   - トランスポート層：ポート22の開放、ファイアウォール
   - アプリケーション層：SSHデーモンの起動、認証設定

2. **Webサイト表示遅延の切り分け**
   - DNS解決時間の測定
   - pingによるレイテンシ確認
   - tracerouteで経路上の遅延箇所特定
   - ブラウザの開発者ツールでHTTP通信分析

3. **tcpdump出力の解釈**
   - TCP接続の確立（3ウェイハンドシェイク）
   - 最後の行はFINフラグ付き＝接続の終了開始

### 問題4：ネットワーク設定

```bash
# 1. 固定IPアドレス設定
sudo ip addr add 192.168.1.100/24 dev eth0

# 2. デフォルトゲートウェイ設定
sudo ip route add default via 192.168.1.1

# 3. DNS設定
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf

# 4. 永続化（Netplan使用の場合）
cat << EOF | sudo tee /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
EOF
sudo netplan apply
```

### 問題5：パケットフィルタリング

```bash
# iptablesルール
# 既存ルールをクリア
sudo iptables -F
sudo iptables -X

# デフォルトポリシー
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# ループバック許可
sudo iptables -A INPUT -i lo -j ACCEPT

# 確立済み接続の許可
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# SSH（特定IPのみ）
sudo iptables -A INPUT -p tcp --dport 22 -s 10.0.0.0/24 -j ACCEPT

# HTTP/HTTPS（全IP）
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# ルールの保存
sudo iptables-save > /etc/iptables/rules.v4
```

### 問題6：トラブルシューティングスクリプト

```bash
#!/bin/bash
# network_diagnostics.sh - ネットワーク診断スクリプト

TARGET="${1:-google.com}"

echo "=== Network Diagnostics for $TARGET ==="
echo "Date: $(date)"
echo

# 1. ping疎通確認
echo "1. Ping Test:"
if ping -c 3 -W 2 "$TARGET" > /dev/null 2>&1; then
    echo "   ✓ Ping successful"
    avg_time=$(ping -c 3 "$TARGET" | grep avg | awk -F '/' '{print $5}')
    echo "   Average RTT: ${avg_time}ms"
else
    echo "   ✗ Ping failed"
fi

# 2. 経路確認
echo
echo "2. Route to $TARGET:"
traceroute -n -m 10 "$TARGET" 2>/dev/null | head -15

# 3. DNS解決確認
echo
echo "3. DNS Resolution:"
if host "$TARGET" > /dev/null 2>&1; then
    echo "   ✓ DNS resolution successful"
    host "$TARGET" | head -3
else
    echo "   ✗ DNS resolution failed"
fi

# 4. ポート接続性
echo
echo "4. Port Connectivity:"
for port in 80 443 22; do
    if timeout 2 nc -zv "$TARGET" $port 2>&1 | grep -q succeeded; then
        echo "   ✓ Port $port: Open"
    else
        echo "   ✗ Port $port: Closed/Filtered"
    fi
done

# 5. レポート出力
echo
echo "=== Summary ==="
echo "Target: $TARGET"
echo "Test completed at: $(date)"
```

### 問題7：パフォーマンス分析

**分析結果：**
- 高い再送信数（1523セグメント）：パケットロスが発生
- RTT 250.5ms：遅延が大きい（通常は数十ms以下が望ましい）

**可能性のある問題：**
- ネットワークの輻輳
- 回線品質の問題
- 距離による遅延

**対策：**
- 帯域幅の増強
- QoSの実装
- CDNの利用
- TCP輻輳制御アルゴリズムの調整

### 問題8：発展的課題

1. **IPv6移行が進まない理由と解決策**
   - 技術的理由：NATで問題を回避できている、機器の互換性
   - 経済的理由：移行コスト、即座のメリット不明確
   - 解決策：デュアルスタック、トランスレーション技術、インセンティブ

2. **SDNの利点とLinux実装**
   - 利点：プログラマブル、集中管理、動的な構成変更
   - Linux実装例：Open vSwitch、OpenFlow対応スイッチ

## 第8章：名前解決とサービス発見 演習問題解答

### 問題1：基本理解の確認

1. DNSは（**Domain Name System**）の略で、（**ドメイン名**）を（**IPアドレス**）に変換するシステムです。

2. DNSの階層構造において、最上位を（**ルート**）サーバー、その下を（**トップレベル**）ドメインと呼びます。

3. Linuxで名前解決の順序を決定するファイルは（**/etc/nsswitch.conf**）です。

### 問題2：概念の理解

1. **DNSが分散型である理由**
   - スケーラビリティ：世界規模でも機能
   - 耐障害性：一部が停止しても継続可能
   - 管理の分散：各組織が自ドメインを管理

2. **DNSキャッシュの利点と欠点**
   - 利点：クエリ削減、応答速度向上、負荷軽減
   - 欠点：変更反映の遅延、キャッシュポイズニングのリスク
   - TTLによる制御が重要

3. **mDNSの必要性と違い**
   - 必要な場面：小規模ネットワーク、自動設定環境
   - 違い：DNSサーバー不要、マルチキャスト使用、.localドメイン

### 問題3：DNSレコードの理解

1. **A レコード**
   - 用途：ドメイン名をIPv4アドレスに変換
   - 例：`www.example.com. IN A 192.0.2.1`

2. **CNAME レコード**
   - 用途：ドメイン名の別名（エイリアス）定義
   - 例：`blog.example.com. IN CNAME www.example.com.`

3. **MX レコード**
   - 用途：メールサーバーの指定
   - 例：`example.com. IN MX 10 mail.example.com.`

4. **SRV レコード**
   - 用途：サービスの場所情報
   - 例：`_http._tcp.example.com. IN SRV 0 5 80 www.example.com.`

5. **PTR レコード**
   - 用途：IPアドレスからドメイン名への逆引き
   - 例：`1.2.0.192.in-addr.arpa. IN PTR www.example.com.`

### 問題4：実践的な課題

1. **スプリットDNSの実現**
```bash
# BINDでのview設定
view "internal" {
    match-clients { 192.168.0.0/16; 10.0.0.0/8; };
    zone "example.com" {
        type master;
        file "internal/example.com.zone";
    };
};

view "external" {
    match-clients { any; };
    zone "example.com" {
        type master;
        file "external/example.com.zone";
    };
};
```

2. **DNS障害時のトラブルシューティング**
   - DNSサーバーへの到達性確認
   - 代替DNSサーバーでのテスト
   - キャッシュのクリア
   - 権威DNSサーバーへの直接クエリ
   - ネットワーク経路の確認

3. **開発環境での設定**
```bash
# /etc/hostsに追加
192.168.1.100 production.example.com
192.168.1.101 api.production.example.com

# またはローカルDNSサーバー（dnsmasq）の使用
```

### 問題5：DNS診断スクリプト

```bash
#!/bin/bash
# dns_health_check.sh - DNS健全性チェックスクリプト

DOMAIN="${1:-example.com}"
DNS_SERVERS=("8.8.8.8" "1.1.1.1" "208.67.222.222")
RESULTS=()

# JSON出力の開始
echo "{"
echo "  \"domain\": \"$DOMAIN\","
echo "  \"timestamp\": \"$(date -Iseconds)\","
echo "  \"tests\": ["

# 各DNSサーバーでテスト
for i in "${!DNS_SERVERS[@]}"; do
    dns="${DNS_SERVERS[$i]}"
    
    # 応答時間測定
    start_time=$(date +%s.%N)
    result=$(dig @"$dns" "$DOMAIN" +short 2>/dev/null)
    end_time=$(date +%s.%N)
    response_time=$(echo "$end_time - $start_time" | bc)
    
    # IPアドレス取得
    ips=$(echo "$result" | grep -E '^[0-9.]+$' | tr '\n' ' ')
    
    # DNSSEC検証
    dnssec=$(dig @"$dns" "$DOMAIN" +dnssec +short | grep -c "RRSIG")
    
    # JSON形式で出力
    echo "    {"
    echo "      \"server\": \"$dns\","
    echo "      \"response_time\": $response_time,"
    echo "      \"ips\": \"$ips\","
    echo "      \"dnssec\": $([ $dnssec -gt 0 ] && echo "true" || echo "false")"
    echo -n "    }"
    
    [ $i -lt $((${#DNS_SERVERS[@]} - 1)) ] && echo ","
done

echo
echo "  ]"
echo "}"
```

### 問題6：負荷分散DNS

```bash
# PowerDNSでの重み付き負荷分散設定
cat > weighted-lb.lua << 'EOF'
function preresolve(qname, qtype)
    if qname == "www.example.com." and qtype == pdns.A then
        local servers = {
            {ip = "192.0.2.1", weight = 50, healthy = true},
            {ip = "192.0.2.2", weight = 30, healthy = true},
            {ip = "192.0.2.3", weight = 20, healthy = true}
        }
        
        -- ヘルスチェック（簡易版）
        for _, server in ipairs(servers) do
            -- 実際にはTCPチェックなどを実装
            server.healthy = checkHealth(server.ip)
        end
        
        -- 重み付き選択
        local total_weight = 0
        for _, server in ipairs(servers) do
            if server.healthy then
                total_weight = total_weight + server.weight
            end
        end
        
        local random = math.random(total_weight)
        local current = 0
        
        for _, server in ipairs(servers) do
            if server.healthy then
                current = current + server.weight
                if random <= current then
                    return 0, {{qtype = pdns.A, content = server.ip, ttl = 30}}
                end
            end
        end
    end
    return -1, {}
end
EOF
```

### 問題7：セキュリティ

1. **DNSキャッシュポイズニング攻撃と防御**
   - 攻撃：偽のDNS応答でキャッシュを汚染
   - 防御：
     - ソースポートのランダム化
     - DNSSECの実装
     - 応答の検証強化

2. **DNSSECの仕組み**
   - 公開鍵暗号でDNSレコードに署名
   - 信頼の連鎖による検証
   - 改竄検出が可能

3. **DNS over HTTPS（DoH）**
   - メリット：暗号化、プライバシー保護、検閲回避
   - デメリット：企業ポリシー適用困難、デバッグ困難

### 問題8：発展的課題

1. **サービスディスカバリの比較**
   - DNSベース：標準的、既存インフラ活用、TTLによる制限
   - 他の方法（Consul、etcd）：リアルタイム更新、ヘルスチェック統合、複雑性増加

2. **エッジコンピューティングでのDNS課題**
   - 課題：レイテンシ、キャッシュ一貫性、地理的分散
   - 解決策：エッジDNS、Anycastデプロイ、インテリジェントルーティング

## 第9章：仮想化からコンテナへ - 隔離技術の進化 演習問題解答

### 問題1：基本理解の確認

1. コンテナ技術で使用されるLinuxカーネルの機能は、（**名前空間（namespaces）**）と（**cgroups**）です。

2. 仮想マシンは（**ハードウェア**）を仮想化し、コンテナは（**OS/プロセス**）を仮想化します。

3. PID名前空間を使用すると、コンテナ内のプロセスはPID（**1**）から始まります。

### 問題2：概念の理解

1. **仮想マシンとコンテナの比較**
   - リソース効率：VM（低い・OSごと必要）、コンテナ（高い・カーネル共有）
   - 起動速度：VM（数十秒〜分）、コンテナ（数秒）
   - セキュリティ：VM（強い隔離）、コンテナ（軽い隔離・改善中）

2. **Linuxの名前空間の種類と役割**
   - PID：プロセスIDの隔離
   - Network：ネットワークスタックの隔離
   - Mount：ファイルシステムマウントの隔離
   - UTS：ホスト名・ドメイン名の隔離
   - IPC：プロセス間通信の隔離

3. **cgroupsの役割**
   - CPU使用率の制限（例：50%に制限）
   - メモリ使用量の制限（例：512MBまで）
   - I/O帯域幅の制限
   - プロセス数の制限

### 問題3：実践的な課題

1. **メモリ100MB制限**
```bash
# cgroup v2の場合
sudo mkdir -p /sys/fs/cgroup/mycontainer
echo "+memory" | sudo tee /sys/fs/cgroup/cgroup.subtree_control
echo "100M" | sudo tee /sys/fs/cgroup/mycontainer/memory.max
echo $$ | sudo tee /sys/fs/cgroup/mycontainer/cgroup.procs
```

2. **コンテナ間通信ネットワーク**
```bash
# ブリッジネットワーク作成
sudo ip link add br0 type bridge
sudo ip addr add 172.20.0.1/24 dev br0
sudo ip link set br0 up

# 各コンテナ用のvethペア作成
sudo ip link add veth0 type veth peer name veth0-br
sudo ip link add veth1 type veth peer name veth1-br
sudo ip link set veth0-br master br0
sudo ip link set veth1-br master br0
```

3. **ホストディレクトリマウントの考慮事項**
   - 権限の分離（ユーザー名前空間）
   - 読み取り専用マウントの検討
   - SELinuxラベルの適用
   - マウントポイントの最小化

### 問題4：コンテナ作成

```dockerfile
FROM ubuntu:22.04

# Nginxインストール
RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 非rootユーザー設定
RUN chown -R www-data:www-data /var/log/nginx /var/cache/nginx && \
    chmod -R 755 /var/log/nginx /var/cache/nginx

# カスタムindex.html
COPY index.html /usr/share/nginx/html/

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 非rootユーザーで実行
USER www-data

# Nginxをフォアグラウンドで実行
CMD ["nginx", "-g", "daemon off;"]
```

### 問題5：名前空間の実験

```bash
#!/bin/bash
# namespace_experiment.sh

echo "=== Namespace Experiment ==="

# 1. UTS名前空間
echo "1. Testing UTS namespace:"
echo "   Host hostname: $(hostname)"
sudo unshare --uts bash -c '
    hostname container-test
    echo "   Container hostname: $(hostname)"
'
echo "   Host hostname after: $(hostname)"

# 2. PID名前空間
echo
echo "2. Testing PID namespace:"
echo "   Host process count: $(ps aux | wc -l)"
sudo unshare --pid --fork --mount-proc bash -c '
    echo "   Container process count: $(ps aux | wc -l)"
    echo "   Container processes:"
    ps aux
'

# 3. ネットワーク名前空間
echo
echo "3. Testing Network namespace:"
echo "   Host interfaces:"
ip -brief link show
sudo unshare --net bash -c '
    echo "   Container interfaces:"
    ip -brief link show
    ip link set lo up
    echo "   After enabling lo:"
    ip -brief link show
'

echo
echo "4. Verification: All changes were isolated to namespaces"
```

### 問題6：パフォーマンス比較

```bash
#!/bin/bash
# performance_comparison.sh

echo "=== VM vs Container Performance Test ==="

# コンテナのテスト
echo "Container Tests:"
# 起動時間
time_start=$(date +%s.%N)
docker run --rm alpine echo "Started"
time_end=$(date +%s.%N)
container_start_time=$(echo "$time_end - $time_start" | bc)
echo "  Start time: ${container_start_time}s"

# メモリ使用量
docker stats --no-stream alpine

# VMのテスト（KVM想定）
echo
echo "VM Tests:"
# 注：実際のVM起動にはlibvirtなどが必要

# 結果の比較表示
echo
echo "Summary:"
echo "  Container start: ~1s"
echo "  VM start: ~30s"
echo "  Container memory overhead: ~10MB"
echo "  VM memory overhead: ~512MB"
```

### 問題7：トラブルシューティング

**段階的トラブルシューティング手順：**

1. **イメージの確認**
   ```bash
   docker images
   docker pull <image> # 必要に応じて
   ```

2. **リソース制限の確認**
   ```bash
   docker system df
   docker system prune # 不要なリソースを削除
   ```

3. **ネットワーク設定**
   ```bash
   docker network ls
   docker network inspect bridge
   ```

4. **権限設定**
   ```bash
   # ユーザーがdockerグループに属しているか
   groups
   # SELinuxの状態
   getenforce
   ```

5. **ログの確認**
   ```bash
   docker logs <container>
   journalctl -u docker
   ```

### 問題8：発展的課題

1. **コンテナセキュリティ強化技術**
   - **seccomp**：システムコールのフィルタリング
   - **AppArmor**：アプリケーションレベルのアクセス制御
   - **SELinux**：強制アクセス制御
   
   実装例：
   ```bash
   docker run --security-opt seccomp=profile.json \
              --security-opt apparmor=docker-default \
              --security-opt label=level:s0:c100,c200 \
              myapp
   ```

2. **マイクロサービスでのコンテナの役割**
   - 役割：
     - サービスごとの独立したデプロイメント
     - 技術スタックの自由度
     - スケーラビリティの向上
   - 課題：
     - ネットワークの複雑性
     - サービス間通信のオーバーヘッド
     - 分散システムのデバッグ困難性

## 第10章：Podmanという選択 - エンタープライズ向けコンテナ 演習問題解答

### 問題1：基本理解の確認

1. Podmanの主な特徴は（**Rootless**）と（**Daemonless**）です。

2. Rootlessコンテナは（**ユーザー**）名前空間を使用して、一般ユーザーでコンテナを実行します。

3. Podmanでは（**systemd**）と直接統合することで、コンテナをサービスとして管理できます。

### 問題2：概念の理解

1. **DockerとPodmanのアーキテクチャ比較**
   - Docker：クライアント・サーバー型、常駐デーモン必要
     - 利点：成熟したエコシステム、豊富なツール
     - 欠点：単一障害点、root権限必要
   - Podman：デーモンレス、直接実行
     - 利点：セキュリティ向上、systemd統合
     - 欠点：一部Docker機能の非互換

2. **Rootlessコンテナのセキュリティ向上理由**
   - root権限不要で権限昇格リスク低減
   - ユーザー名前空間による隔離強化
   - ホストへの影響を最小化

3. **Daemonlessアーキテクチャのメリット**
   - システムリソースの効率的利用
   - 個別コンテナの障害が他に影響しない
   - systemdによる統一的な管理

### 問題3：実践的な課題

1. **Docker→Podman移行手順**
   ```bash
   # エイリアス設定
   alias docker=podman
   
   # イメージの移行
   docker save myapp:latest | podman load
   
   # docker-composeの代替
   pip3 install podman-compose
   podman-compose up
   ```

2. **マルチコンテナアプリケーション構築**
   ```bash
   # Podの作成
   podman pod create --name webapp -p 8080:80
   
   # 各コンテナの起動
   podman run -d --pod webapp --name frontend nginx
   podman run -d --pod webapp --name backend node:14
   podman run -d --pod webapp --name db postgres:13
   ```

3. **Rootlessで特権ポート使用**
   ```bash
   # 方法1：ポートフォワーディング
   podman run -d -p 8080:80 nginx
   # iptablesで80→8080転送
   
   # 方法2：CAP_NET_BIND_SERVICE付与
   sudo setcap cap_net_bind_service=+ep $(which podman)
   ```

### 問題4：Podman設定

```bash
# 1. Rootless Nginxコンテナ起動
podman run -d \
  --name nginx-web \
  -p 8080:80 \
  -v /data/web:/usr/share/nginx/html:Z \
  nginx:latest

# 2. systemdサービス作成
mkdir -p ~/.config/systemd/user
podman generate systemd --name nginx-web --new \
  > ~/.config/systemd/user/nginx-web.service

# 3. サービス有効化
systemctl --user daemon-reload
systemctl --user enable nginx-web.service
systemctl --user start nginx-web.service
```

### 問題5：Pod機能の活用

```bash
#!/bin/bash
# Create webapp-stack pod

# Podの作成
podman pod create \
  --name webapp-stack \
  -p 80:80 \
  --network bridge

# Nginxコンテナ
podman run -d \
  --pod webapp-stack \
  --name nginx \
  -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:latest

# Node.jsアプリケーション
podman run -d \
  --pod webapp-stack \
  --name app \
  -v ./app:/app \
  node:14 npm start

# Redis
podman run -d \
  --pod webapp-stack \
  --name redis \
  redis:6-alpine

# PostgreSQL
podman run -d \
  --pod webapp-stack \
  --name postgres \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:13
```

### 問題6：セキュリティ設定

```bash
# セキュリティ最大化設定
podman run -d \
  --name secure-app \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /run \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  --security-opt label=type:container_runtime_t \
  --security-opt seccomp=/usr/share/containers/seccomp.json \
  --userns auto \
  --user 1000:1000 \
  myapp:latest
```

### 問題7：トラブルシューティング

1. **コンテナ名重複エラー**
   ```bash
   podman rm webapp  # または
   podman rm -f webapp
   ```

2. **権限エラー**
   ```bash
   # Rootlessモードの確認
   podman info | grep rootless
   # subuidの確認
   cat /etc/subuid
   ```

3. **newuidmapエラー**
   ```bash
   # uidmapパッケージのインストール
   sudo apt install uidmap  # または
   sudo yum install shadow-utils
   ```

4. **ネットワーク名前空間エラー**
   ```bash
   # slirp4netnsのインストール
   sudo apt install slirp4netns
   ```

### 問題8：発展的課題

1. **PodmanとKubernetesの連携**
   ```bash
   # Pod→Kubernetesマニフェスト生成
   podman generate kube mypod > mypod.yaml
   
   # 内容の確認と編集
   vi mypod.yaml
   
   # Kubernetesマニフェスト→Pod実行
   podman play kube mypod.yaml
   
   # 実用例：開発環境でPodman、本番でKubernetes
   ```

2. **エンタープライズ環境でのPodman導入**
   - **移行戦略**：
     - 段階的移行（新規プロジェクトから）
     - 互換性レイヤーの活用
     - トレーニングプログラムの実施
   
   - **ベストプラクティス**：
     - Rootlessコンテナの標準化
     - systemd統合によるライフサイクル管理
     - SELinux/ポリシーの統一
     - 監視・ログ収集の統合

## 第11章：イメージとレジストリ - 配布可能な実行環境 演習問題解答

### 問題1：基本理解の確認

1. コンテナイメージは複数の（**読み取り専用**）レイヤーを重ねた構造になっており、実行時には（**書き込み可能**）レイヤーが追加されます。

2. Dockerfileの`COPY`命令と`ADD`命令の違いは、`ADD`命令が（**URLからのダウンロード**）や（**tarアーカイブの自動展開**）の機能を持つことです。

3. マルチステージビルドの主な目的は、最終的なイメージの（**サイズ**）を削減することです。

### 問題2：概念の理解

1. **レイヤーキャッシュの仕組みと命令順序の重要性**
   - 仕組み：
     - 各Dockerfile命令が新しいレイヤーを作成
     - レイヤーはハッシュ値で識別され、変更がなければ再利用
     - 一度キャッシュが無効になると、それ以降のレイヤーも再構築
   - 命令順序の重要性：
     - 変更頻度の低いものを先に配置（依存関係のインストールなど）
     - 変更頻度の高いものを後に配置（アプリケーションコード）
     - これによりビルド時間を大幅に短縮

2. **Copy-on-Write（CoW）メカニズムの効率性への貢献**
   - ストレージ効率：
     - 複数のコンテナが同じイメージレイヤーを共有
     - 変更部分のみが新しいレイヤーとして保存
   - 起動速度の向上：
     - イメージレイヤーのコピーが不要
     - 差分のみを管理するため高速
   - メモリ効率：
     - 読み取り専用レイヤーはメモリ上でも共有可能

3. **コンテナイメージレジストリとプライベートレジストリの必要性**
   - レジストリとは：
     - コンテナイメージを保存・配布するためのサービス
     - タグによるバージョン管理機能
     - HTTPSベースのAPIで通信
   - プライベートレジストリが必要な理由：
     - 機密性の高いアプリケーションの保護
     - ネットワーク帯域幅の節約（ローカルキャッシュ）
     - アクセス制御とコンプライアンス要件
     - カスタムポリシーの適用

### 問題3：実践的な課題

```dockerfile
# 最適化後のDockerfile
FROM python:3.10-slim

# 依存関係を先にインストール（キャッシュ効率化）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache/pip

# 非rootユーザーの作成
RUN useradd -m -u 1000 appuser

# アプリケーションのコピー
WORKDIR /app
COPY --chown=appuser:appuser . .

# 非rootユーザーに切り替え
USER appuser

# 実行
CMD ["python", "app.py"]
```

最適化のポイント：
- **イメージサイズ削減**：slim版のベースイメージ使用、キャッシュ削除
- **ビルド時間短縮**：依存関係を先にコピーしてキャッシュ活用
- **セキュリティ向上**：非rootユーザーでの実行

### 問題4：レイヤー分析

1. **作成されるレイヤー数**：5個
   - ベースイメージ（alpine:3.17）
   - apk add --no-cache curl
   - echo "Hello" > /hello.txt
   - echo "World" >> /hello.txt
   - rm /hello.txt

2. **最終イメージでの/hello.txtの存在**
   - 存在しません
   - 理由：レイヤーは追加のみで、削除操作も新しいレイヤーとして記録されるため、最終的なファイルシステムビューでは削除されているが、以前のレイヤーにはファイルが残っている（イメージサイズには影響）

### 問題5：CI/CDパイプライン設計

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
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build --cache-from $LATEST_IMAGE -t $IMAGE_NAME -t $LATEST_IMAGE .
    - docker push $IMAGE_NAME
    - docker push $LATEST_IMAGE

test:
  stage: test
  script:
    - docker run --rm $IMAGE_NAME npm test

security_scan:
  stage: scan
  script:
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock 
        aquasec/trivy image --severity HIGH,CRITICAL $IMAGE_NAME

deploy:
  stage: deploy
  script:
    - kubectl set image deployment/app app=$IMAGE_NAME
  only:
    - main
```

### 問題6：トラブルシューティング

**改善方法：**

1. **Dockerfileの最適化**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   # 依存関係を先にコピー
   COPY package*.json ./
   RUN npm ci --only=production
   # アプリケーションコードを後でコピー
   COPY . .
   CMD ["node", "app.js"]
   ```

2. **マルチステージビルドの使用**
   - ビルド用と実行用のステージを分離
   - 最終イメージから不要なビルドツールを除外

3. **キャッシュレイヤーの活用**
   - ベースイメージのキャッシュ
   - レジストリキャッシュの設定

### 問題7：セキュリティ

**問題点と改善案：**

1. **latestタグの使用**
   - 問題：予期しない変更の可能性
   - 改善：`FROM node:20-alpine`

2. **rootユーザーでの実行**
   - 問題：コンテナエスケープ時のリスク
   - 改善：非rootユーザーの追加

3. **環境変数でのシークレット**
   - 問題：イメージレイヤーに平文で保存
   - 改善：実行時の環境変数またはシークレット管理ツール使用

4. **すべてのファイルのコピー**
   - 問題：不要なファイルの混入
   - 改善：.dockerignoreの使用

改善後：
```dockerfile
FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --chown=nodejs:nodejs . .
USER nodejs
EXPOSE 3000
CMD ["node", "server.js"]
```

### 問題8：発展的課題

1. **コンテナイメージの署名と検証**
   - 重要性：
     - イメージの改竄防止
     - 配布元の信頼性確保
     - コンプライアンス要件の充足
   - 仕組み：
     - Docker Content Trust (DCT) / Notary
     - 公開鍵暗号による署名
     - レジストリでの署名検証

2. **OCI仕様とDockerイメージフォーマット**
   - OCI (Open Container Initiative)：
     - コンテナランタイムとイメージフォーマットの業界標準
     - ベンダー中立的な仕様
   - Dockerとの関係：
     - DockerイメージフォーマットがOCI仕様のベース
     - 相互運用性の確保
     - podman、containerdなど他のツールでも利用可能

## 第12章：AWSという巨大なデータセンター 演習問題解答

### 問題1：基本理解の確認

1. AWS EC2における「インスタンス」とは、（**仮想**）化されたサーバーのことで、必要に応じて（**起動**）や（**停止**）できます。

2. AWS の責任共有モデルにおいて、（**物理インフラ**）の管理はAWSの責任、（**OSのパッチ適用**）の管理はユーザーの責任です。

3. Auto Scalingでは、（**CloudWatch**）メトリクスに基づいて、自動的にインスタンス数を（**増加**）したり（**減少**）したりできます。

### 問題2：概念の理解

1. **オンプレミスからクラウドへの移行で解決された課題**
   - **初期投資の削減**：
     - 物理サーバーの購入が不要
     - データセンターの建設・維持費用が不要
     - 使った分だけの支払い（OPEX化）
   - **スケーラビリティ**：
     - 需要に応じた即座のリソース調整
     - ピーク時対応のための過剰投資が不要
     - グローバルな展開が容易
   - **運用負荷の軽減**：
     - ハードウェア保守が不要
     - 自動化による人的エラーの削減
     - 24/365の可用性保証

2. **EC2インスタンスタイプの違いと使用場面**
   - **t3シリーズ（バースト可能）**：
     - 特徴：CPU使用率が低い時にクレジットを蓄積
     - 用途：Webサーバー、小規模DB、開発環境
   - **m5シリーズ（汎用）**：
     - 特徴：CPU/メモリのバランスが良い
     - 用途：エンタープライズアプリ、バックエンド
   - **c5シリーズ（コンピューティング最適化）**：
     - 特徴：高いCPU性能
     - 用途：科学計算、バッチ処理、ゲームサーバー
   - **r5シリーズ（メモリ最適化）**：
     - 特徴：大容量メモリ
     - 用途：インメモリDB、ビッグデータ分析

3. **インスタンス購入オプションの違いと使用場面**
   - **オンデマンド**：
     - 特徴：柔軟性最大、コスト最大
     - 用途：短期プロジェクト、開発・テスト
   - **リザーブド**：
     - 特徴：1〜3年契約で最大72%割引
     - 用途：常時稼働のプロダクション環境
   - **スポット**：
     - 特徴：最大90%割引、中断の可能性
     - 用途：バッチ処理、ビッグデータ分析、CI/CD

### 問題3：実践的な課題

**AWSインフラストラクチャ設計：**

```yaml
# 必要なAWSサービスと設定
Resources:
  # 1. VPCとネットワーク
  - VPC (10.0.0.0/16)
  - Public Subnet × 2 (各AZ)
  - Private Subnet × 2 (各AZ)
  - Internet Gateway
  - NAT Gateway × 2 (各AZ)

  # 2. コンピューティング
  - Application Load Balancer (ALB)
  - Auto Scaling Group:
      Min: 2
      Max: 10
      Target: CPU 70%
  - Launch Template:
      Instance Type: t3.medium (リザーブド推奨)
      
  # 3. セキュリティ
  - Security Groups:
      - ALB: 80/443 from 0.0.0.0/0
      - Web: 80 from ALB SG only
      - SSH: 22 from Bastion only
  - Web Application Firewall (WAF)
  
  # 4. モニタリング
  - CloudWatch Alarms
  - VPC Flow Logs
```

### 問題4：責任分界点

1. EC2インスタンスのOSパッチ適用：**ユーザー**
2. データセンターの物理的セキュリティ：**AWS**
3. セキュリティグループの設定：**ユーザー**
4. ハイパーバイザーの保守：**AWS**
5. アプリケーションのバックアップ：**ユーザー**
6. ネットワークインフラストラクチャ：**AWS**

### 問題5：コスト最適化

1. **現在の月間コスト**
   - $0.124/時 × 24時間 × 30日 × 10台 = $892.80/月

2. **コスト削減方法**
   - **リザーブドインスタンスの導入**
     - 1年全前払いで約40%削減
     - 削減額：約$357/月
   - **Auto Scalingの実装**
     - 夜間・休日のスケールダウン
     - 削減額：約30% = $268/月
   - **インスタンスタイプの見直し**
     - t3.largeへのダウンサイズ検討
     - 削減額：約20% = $179/月

3. **概算削減額**
   - 組み合わせで最大60%削減可能 = 約$536/月

### 問題6：トラブルシューティング

**SSH接続できない原因と確認項目：**

1. **セキュリティグループ**
   - ポート22が開いているか
   - ソースIPが許可されているか

2. **ネットワークACL**
   - インバウンド/アウトバウンドルール確認

3. **インスタンスの状態**
   - Running状態か
   - Status Checkが正常か

4. **SSHキーペア**
   - 正しい秘密鍵を使用しているか
   - 権限が400に設定されているか

5. **パブリックIP/DNS**
   - パブリックIPが割り当てられているか
   - 正しいIPアドレスに接続しているか

### 問題7：自動化

```bash
#!/bin/bash
# daily_backup.sh

# 変数設定
INSTANCE_ID="i-1234567890abcdef0"
RETENTION_DAYS=7

# AMI作成
AMI_NAME="backup-${INSTANCE_ID}-$(date +%Y%m%d-%H%M%S)"
AMI_ID=$(aws ec2 create-image \
    --instance-id $INSTANCE_ID \
    --name $AMI_NAME \
    --no-reboot \
    --query 'ImageId' \
    --output text)

echo "Created AMI: $AMI_ID"

# 古いAMIの削除
CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
OLD_AMIS=$(aws ec2 describe-images \
    --owners self \
    --filters "Name=name,Values=backup-${INSTANCE_ID}-*" \
    --query "Images[?CreationDate<'$CUTOFF_DATE'].ImageId" \
    --output text)

for ami in $OLD_AMIS; do
    echo "Deleting old AMI: $ami"
    # スナップショットIDを取得
    SNAPSHOT_IDS=$(aws ec2 describe-images \
        --image-ids $ami \
        --query 'Images[0].BlockDeviceMappings[*].Ebs.SnapshotId' \
        --output text)
    
    # AMI削除
    aws ec2 deregister-image --image-id $ami
    
    # スナップショット削除
    for snap in $SNAPSHOT_IDS; do
        aws ec2 delete-snapshot --snapshot-id $snap
    done
done

# Crontab設定
# 0 2 * * * /path/to/daily_backup.sh
```

### 問題8：発展的課題

1. **マルチリージョンDR戦略**
   ```yaml
   Primary Region (Tokyo):
     - Production Environment
     - RDS with automated backups
     - S3 with Cross-Region Replication
     - Route 53 health checks
   
   DR Region (Osaka):
     - Pilot Light approach
     - Minimal resources always running
     - Database replica (async)
     - Pre-configured AMIs
   
   Failover Process:
     1. Route 53 detects failure (1-2 min)
     2. Scale up DR environment (5 min)
     3. Promote RDS read replica (5 min)
     4. Update DNS records (5 min)
     Total RTO: ~15 minutes
   
   Data Sync:
     - RDS: Async replication (RPO: <5 min)
     - S3: Cross-region replication (RPO: <15 min)
     - Application data: Hourly snapshots
     Total RPO: ~1 hour
   ```

2. **IaCのメリット・デメリットとツール比較**
   - **メリット**：
     - バージョン管理可能
     - 再現性の確保
     - 自動化とCI/CD統合
     - ドキュメントとしての価値
   - **デメリット**：
     - 学習曲線
     - 初期設定の複雑さ
     - 状態管理の必要性
   
   - **CloudFormation vs Terraform**：
     - CloudFormation：
       - AWS公式、完全統合
       - AWSリソースのみ対応
       - 状態管理不要
     - Terraform：
       - マルチクラウド対応
       - より柔軟な構文
       - 状態ファイル管理が必要

## 第13章：仮想ネットワークの設計と実装 演習問題解答

### 問題1：基本理解の確認

1. VPC（Virtual Private Cloud）は、AWS内に作成する論理的に（**隔離**）されたネットワーク空間で、（**CIDR**）ブロックを指定して作成します。

2. セキュリティグループは（**インスタンス**）レベルのファイアウォールで、ネットワークACLは（**サブネット**）レベルのファイアウォールです。

3. NATゲートウェイは、（**プライベート**）サブネット内のインスタンスがインターネットへ（**アウトバウンド**）通信を行うために使用されます。

### 問題2：概念の理解

1. **SDNの利点と物理ネットワークとの違い**
   - **プログラマブル性**：
     - APIやコードでネットワーク設定が可能
     - 物理：手動設定が必要
   - **即座の変更**：
     - 数秒で設定変更・適用
     - 物理：ケーブリングや機器設定に時間
   - **柔軟なトポロジー**：
     - 論理的な接続を自由に構成
     - 物理：物理的制約に縛られる

2. **パブリック/プライベートサブネットの違いと用途**
   - **パブリックサブネット**：
     - インターネットゲートウェイへの直接ルート
     - パブリックIPの自動割り当て可能
     - 用途：ロードバランサー、Webサーバー、NAT Gateway
   - **プライベートサブネット**：
     - インターネットへの直接ルートなし
     - NATゲートウェイ経由でアウトバウンド通信
     - 用途：アプリケーションサーバー、データベース

3. **Transit GatewayとVPCピアリングの違い**
   - **VPCピアリング**：
     - 2つのVPC間の1対1接続
     - 推移的ピアリングは不可
     - 用途：少数のVPC間接続
   - **Transit Gateway**：
     - ハブ&スポーク型の多対多接続
     - 推移的ルーティング可能
     - 用途：大規模なVPC間接続、ハイブリッド接続

### 問題3：実践的な課題

**VPCネットワーク設計：**

```yaml
# サブネット構成
VPC: 10.0.0.0/16
  AZ-1:
    Public Subnet: 10.0.1.0/24 (Web層用)
    Private Subnet: 10.0.11.0/24 (App層用)
    Private Subnet: 10.0.21.0/24 (DB層用)
  AZ-2:
    Public Subnet: 10.0.2.0/24 (Web層用)
    Private Subnet: 10.0.12.0/24 (App層用)
    Private Subnet: 10.0.22.0/24 (DB層用)

# ルートテーブル
Public Route Table:
  0.0.0.0/0 -> Internet Gateway
  
Private Route Table (AZ-1):
  0.0.0.0/0 -> NAT Gateway-1
  
Private Route Table (AZ-2):
  0.0.0.0/0 -> NAT Gateway-2

# セキュリティグループ
Web-SG:
  Inbound:
    - 80/tcp from 0.0.0.0/0
    - 443/tcp from 0.0.0.0/0
    - 22/tcp from Bastion-SG
    
App-SG:
  Inbound:
    - 8080/tcp from Web-SG
    - 22/tcp from Bastion-SG
    
DB-SG:
  Inbound:
    - 3306/tcp from App-SG
```

### 問題4：セキュリティ設計

**問題点と改善案：**

1. **Webサーバー用セキュリティグループ**
   - 問題：All Trafficを全開放は過度に緩い
   - 改善：
     ```
     Inbound:
     - Type: HTTP, Source: 0.0.0.0/0
     - Type: HTTPS, Source: 0.0.0.0/0
     - Type: SSH, Source: 10.0.0.0/16 (社内IPのみ)
     ```

2. **データベース用セキュリティグループ**
   - 問題：インターネット全体からDB接続可能
   - 改善：
     ```
     Inbound:
     - Type: MySQL/Aurora, Source: App-Server-SG
     ```

### 問題5：ネットワークトラブルシューティング

**優先順位付き確認項目：**

1. **NATゲートウェイの状態**
   - StatusがAvailableか確認
   - 正しいパブリックサブネットに配置されているか

2. **ルートテーブル**
   - プライベートサブネットに正しく関連付けられているか
   - 0.0.0.0/0がNATゲートウェイを指しているか

3. **セキュリティグループ**
   - アウトバウンドルールが適切に設定されているか
   - デフォルトで全許可になっているか確認

4. **ネットワークACL**
   - デフォルトから変更されていないか
   - 必要なポートが開いているか

5. **インスタンス内の設定**
   - iptablesなどのローカルファイアウォール
   - ルーティング設定の確認

### 問題6：コスト最適化

**コスト削減方法：**

1. **NATゲートウェイの統合**
   - 開発環境では1つのNATゲートウェイに統合
   - 削減額：$45/月 × 1 = $45/月

2. **未使用Elastic IPの解放**
   - 3個のElastic IP解放
   - 削減額：$0.005/時 × 24 × 30 × 3 = $10.80/月

3. **VPCエンドポイントの削除**
   - 未使用の3つを削除
   - 削減額：$0.01/時 × 24 × 30 × 3 = $21.60/月

合計削減額：約$77.40/月

### 問題7：高可用性設計

**マルチリージョンDRネットワーク設計：**

```yaml
Primary Region (Tokyo):
  VPC: 10.0.0.0/16
  - Multi-AZ deployment
  - Application Load Balancer
  - RDS Multi-AZ
  - Route 53 weighted routing (100%)

DR Region (Osaka):  
  VPC: 172.16.0.0/16
  - Pilot light configuration
  - Minimal resources (1-2 instances)
  - RDS read replica
  - Route 53 weighted routing (0%)
  
Network Connectivity:
  - VPC Peering between regions
  - S3 Cross-Region Replication
  - Database replication over private connection

Failover Process:
  1. Health check failure detection (1 min)
  2. Route 53 weight adjustment (2 min)
  3. Scale up DR environment (10 min)
  4. Promote RDS replica (5 min)
  5. Application warm-up (12 min)
  Total RTO: 30 minutes
```

### 問題8：発展的課題

1. **ハイブリッドクラウドネットワークの考慮事項と解決策**
   - **接続の信頼性**
     - 解決策：Direct ConnectとVPNのバックアップ構成
   - **帯域幅の制限**
     - 解決策：トラフィックの優先順位付け、ローカルキャッシング
   - **レイテンシー**
     - 解決策：エッジロケーション活用、CDN導入
   - **セキュリティ**
     - 解決策：エンドツーエンド暗号化、専用接続
   - **IPアドレスの重複**
     - 解決策：適切なCIDR設計、NATの活用

2. **VPCフローログを使用した異常検知システム**
   ```python
   # 検知すべき異常パターン
   異常パターン:
     1. ポートスキャン
        - 検知方法：同一送信元から複数ポートへの接続試行
        - 閾値：100ポート/分以上
     
     2. DDoS攻撃
        - 検知方法：特定IPへの大量トラフィック
        - 閾値：1000リクエスト/秒以上
     
     3. データ流出
        - 検知方法：内部から外部への異常な大量データ転送
        - 閾値：1GB/時間以上
     
     4. 不正アクセス
        - 検知方法：拒否されたトラフィックの急増
        - 閾値：REJECTアクション50回/分以上
   
   実装:
     - Lambda関数でリアルタイム処理
     - Amazon Athenaでバッチ分析
     - CloudWatch Alarmsで通知
     - Amazon QuickSightで可視化
   ```

## 第14章：監視とログ - システムの可観測性 演習問題解答

### 問題1：基本理解の確認

1. システムの可観測性（Observability）は、（**メトリクス**）、（**ログ**）、（**トレース**）の三本柱で構成されています。

2. Prometheusは（**プル**）型のメトリクス収集システムで、定期的にターゲットから（**スクレイプ**）してデータを収集します。

3. 分散トレーシングにおいて、一つのリクエストの処理全体を（**トレース**）と呼び、その中の個々の処理単位を（**スパン**）と呼びます。

### 問題2：概念の理解

**1. 従来の閾値ベースの監視と機械学習を使った異常検知の違い**

**閾値ベースの監視：**
- **仕組み**：事前に定めた固定値を超えたらアラート
- **利点**：
  - シンプルで理解しやすい
  - 設定が簡単
  - 誤検知の原因が明確
- **欠点**：
  - 動的な環境に対応困難
  - 季節性や時間帯の考慮が難しい
  - 複数メトリクスの相関を見られない

**機械学習による異常検知：**
- **仕組み**：過去のパターンを学習し、統計的に異常を検出
- **利点**：
  - 動的な閾値の自動調整
  - 複雑なパターンの検出
  - 未知の異常も検出可能
- **欠点**：
  - ブラックボックス化しやすい
  - 学習データの質に依存
  - 計算リソースが必要

**2. 構造化ログの利点**

1. **検索・分析の効率化**：
   - JSONやKey-Value形式により、特定フィールドで高速検索可能
   - 集計や統計処理が容易

2. **自動処理の実現**：
   - プログラムによる自動解析が可能
   - アラートルールの設定が簡単

3. **コンテキスト情報の保持**：
   - user_id、request_id等の関連情報を構造的に保存
   - トラブルシューティング時の追跡が容易

**3. メトリクス、ログ、トレースの使い分け**

**シナリオ：ECサイトで「注文完了が遅い」という報告**

1. **メトリクス**で全体像を把握：
   - レスポンスタイムの推移を確認
   - CPU/メモリ使用率をチェック
   - 「14時頃から遅延が発生」と特定

2. **トレース**で処理フローを追跡：
   - 遅い注文処理のトレースを確認
   - 「在庫確認API」で3秒かかっていることを発見

3. **ログ**で詳細を調査：
   - 在庫確認サービスのログを確認
   - データベースのコネクションプールが枯渇していたことが判明

### 問題3：実践的な課題

**マイクロサービス監視システムの設計：**

```yaml
# docker-compose-monitoring.yml
version: '3.8'

services:
  # メトリクス収集
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  # 各サービスのメトリクスエクスポーター
  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"

  # ログ収集
  elasticsearch:
    image: elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"

  kibana:
    image: kibana:7.15.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"

  # 分散トレーシング
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "6831:6831/udp"

  # アラート
  alertmanager:
    image: prom/alertmanager:latest
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    ports:
      - "9093:9093"

  # 可視化
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
```

**Prometheus設定：**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alert_rules.yml'

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:8080']
    metrics_path: '/metrics'

  - job_name: 'user-service'
    static_configs:
      - targets: ['user-service:8081']

  - job_name: 'order-service'
    static_configs:
      - targets: ['order-service:8082']

  - job_name: 'product-service'
    static_configs:
      - targets: ['product-service:8083']
```

**アラートルール：**

```yaml
# alert_rules.yml
groups:
  - name: microservices
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
# 第14章 演習問題 解答集

## 問題1：基本理解の確認

### 解答

1. システムの可観測性（Observability）は、（**メトリクス**）、（**ログ**）、（**トレース**）の三本柱で構成されています。

2. Prometheusは（**プル**）型のメトリクス収集システムで、定期的にターゲットから（**スクレイプ**）してデータを収集します。

3. 分散トレーシングにおいて、一つのリクエストの処理全体を（**トレース**）と呼び、その中の個々の処理単位を（**スパン**）と呼びます。

## 問題2：概念の理解

### 解答

**1. 従来の閾値ベースの監視と機械学習を使った異常検知の違い**

**閾値ベースの監視：**
- **仕組み**：事前に定めた固定値を超えたらアラート
- **利点**：
  - シンプルで理解しやすい
  - 設定が簡単
  - 誤検知の原因が明確
- **欠点**：
  - 動的な環境に対応困難
  - 季節性や時間帯の考慮が難しい
  - 複数メトリクスの相関を見られない

**機械学習による異常検知：**
- **仕組み**：過去のパターンを学習し、統計的に異常を検出
- **利点**：
  - 動的な閾値の自動調整
  - 複雑なパターンの検出
  - 未知の異常も検出可能
- **欠点**：
  - ブラックボックス化しやすい
  - 学習データの質に依存
  - 計算リソースが必要

**2. 構造化ログの利点**

1. **検索・分析の効率化**：
   - JSONやKey-Value形式により、特定フィールドで高速検索可能
   - 集計や統計処理が容易

2. **自動処理の実現**：
   - プログラムによる自動解析が可能
   - アラートルールの設定が簡単

3. **コンテキスト情報の保持**：
   - user_id、request_id等の関連情報を構造的に保存
   - トラブルシューティング時の追跡が容易

**3. メトリクス、ログ、トレースの使い分け**

**シナリオ：ECサイトで「注文完了が遅い」という報告**

1. **メトリクス**で全体像を把握：
   - レスポンスタイムの推移を確認
   - CPU/メモリ使用率をチェック
   - 「14時頃から遅延が発生」と特定

2. **トレース**で処理フローを追跡：
   - 遅い注文処理のトレースを確認
   - 「在庫確認API」で3秒かかっていることを発見

3. **ログ**で詳細を調査：
   - 在庫確認サービスのログを確認
   - データベースのコネクションプールが枯渇していたことが判明

## 問題3：実践的な課題

### 解答：マイクロサービス監視システムの設計

**アーキテクチャ構成：**

```yaml
# docker-compose-monitoring.yml
version: '3.8'

services:
  # メトリクス収集
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  # 各サービスのメトリクスエクスポーター
  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"

  # ログ収集
  elasticsearch:
    image: elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"

  kibana:
    image: kibana:7.15.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"

  # 分散トレーシング
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "6831:6831/udp"

  # アラート
  alertmanager:
    image: prom/alertmanager:latest
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    ports:
      - "9093:9093"

  # 可視化
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
```

**Prometheus設定：**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alert_rules.yml'

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:8080']
    metrics_path: '/metrics'

  - job_name: 'user-service'
    static_configs:
      - targets: ['user-service:8081']

  - job_name: 'order-service'
    static_configs:
      - targets: ['order-service:8082']

  - job_name: 'product-service'
    static_configs:
      - targets: ['product-service:8083']
```

**アラートルール：**

```yaml
# alert_rules.yml
groups:
  - name: microservices
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error rate exceeds 5%"
          description: "Service {{ $labels.job }} has error rate of {{ $value | humanizePercentage }}"
```

## 問題4：アラート設計

### 解答

**1. CPU使用率**
```yaml
- alert: HighCPUUsage
  expr: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "CPU usage is high"
    description: "CPU usage is {{ $value }}%"

- alert: CriticalCPUUsage
  expr: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 95
  for: 5m
  labels:
    severity: critical
```

**2. メモリ使用率**
```yaml
- alert: HighMemoryUsage
  expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
  for: 10m
  labels:
    severity: warning

- alert: CriticalMemoryUsage
  expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 95
  for: 5m
  labels:
    severity: critical
```

**3. ディスク使用率**
```yaml
- alert: DiskSpaceLow
  expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 20
  for: 15m
  labels:
    severity: warning

- alert: DiskSpaceCritical
  expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 10
  for: 5m
  labels:
    severity: critical
```

**4. HTTPエラー率**
```yaml
- alert: HighHTTPErrorRate
  expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
  for: 5m
  labels:
    severity: warning

- alert: CriticalHTTPErrorRate
  expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.10
  for: 3m
  labels:
    severity: critical
```

**5. レスポンスタイム**
```yaml
- alert: SlowResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "95th percentile response time is slow"

- alert: CriticalResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 3
  for: 5m
  labels:
    severity: critical
```

## 問題5：ログ分析

### 解答

**読み取れる問題：**

1. **データベース接続の不安定性**：
   - 2回の接続タイムアウトが発生
   - リトライメカニズムは機能している

2. **レスポンスタイムの遅延**：
   - 全体で5秒以上かかっている
   - ユーザー体験に悪影響

**改善提案：**

1. **接続プールの最適化**：
```yaml
database:
  pool:
    min_size: 10
    max_size: 50
    connection_timeout: 3s
    idle_timeout: 30s
```

2. **Circuit Breakerパターンの実装**：
```python
from pybreaker import CircuitBreaker

db_breaker = CircuitBreaker(
    fail_max=3,
    reset_timeout=60,
    exclude=[OperationalError]
)

@db_breaker
def connect_to_database():
    return database.connect()
```

3. **ヘルスチェックの強化**：
```python
async def health_check():
    try:
        await database.execute("SELECT 1")
        return True
    except Exception:
        return False

# 定期的にヘルスチェックを実行
```

4. **タイムアウト設定の見直し**：
```python
connection_config = {
    'connect_timeout': 2,  # 2秒に短縮
    'command_timeout': 5,
    'retry_count': 3,
    'retry_delay': 0.5
}
```

## 問題6：パフォーマンス分析

### 解答

**ボトルネックの特定：**

1. **主要ボトルネック**：
   - Order Service の External API Call（250ms）
   - User Service の Database Query（180ms）

2. **全体の処理時間**：
   - 合計：560ms（並列処理を考慮しない場合）

**改善策：**

1. **キャッシュの導入**：
```python
# Redis キャッシュの実装
@cache.memoize(timeout=300)  # 5分間キャッシュ
def get_user_data(user_id):
    return database.query(f"SELECT * FROM users WHERE id = {user_id}")
```

2. **非同期処理の活用**：
```python
async def process_order(order_data):
    # 並列実行
    user_task = asyncio.create_task(user_service.get_user(order_data.user_id))
    inventory_task = asyncio.create_task(check_inventory(order_data.items))
    
    user_info, inventory_status = await asyncio.gather(user_task, inventory_task)
    
    # External APIは結果に応じて非同期に
    asyncio.create_task(notify_external_system(order_data))
    
    return process_result
```

3. **データベースクエリの最適化**：
```sql
-- インデックスの追加
CREATE INDEX idx_users_active ON users(id) WHERE status = 'active';

-- クエリの最適化
SELECT id, name, email 
FROM users 
WHERE id = ? AND status = 'active'
-- 必要なカラムのみ選択
```

4. **API呼び出しの最適化**：
```python
# バッチ処理
def call_external_api_batch(requests):
    return external_api.batch_process(requests)

# タイムアウトの設定
response = requests.post(
    url,
    json=data,
    timeout=(3, 10)  # 接続3秒、読み取り10秒
)
```

## 問題7：予測的監視

### 解答：予測的スケーリング戦略

**1. パターン分析：**
```python
# CPU使用率のパターン
# 毎日14:00にピーク（おそらくランチタイム後のアクセス集中）
```

**2. スケーリング戦略：**

```yaml
# Kubernetes HPA with custom metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: predictive-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: External
    external:
      metric:
        name: predicted_cpu_usage
        selector:
          matchLabels:
            deployment: web-app
      target:
        type: Value
        value: "70"  # 予測値が70%を超えたらスケール
  behavior:
    scaleUp:
      policies:
      - type: Percent
        value: 100  # 100%増加（倍増）
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300  # 5分間安定してから縮小
```

**3. 事前スケーリングのスケジュール：**

```yaml
# CronJob for scheduled scaling
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-before-peak
spec:
  schedule: "45 13 * * *"  # 13:45に実行
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: kubectl
            image: bitnami/kubectl
            command:
            - /bin/sh
            - -c
            - |
              kubectl scale deployment web-app --replicas=8
              echo "Scaled up to 8 replicas before peak time"
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-after-peak
spec:
  schedule: "0 15 * * *"  # 15:00に実行
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: kubectl
            image: bitnami/kubectl
            command:
            - /bin/sh
            - -c
            - |
              kubectl scale deployment web-app --replicas=3
              echo "Scaled down to 3 replicas after peak time"
```

**4. 予測モデルの実装：**

```python
# predictive_scaling.py
from prophet import Prophet
import pandas as pd
from datetime import datetime, timedelta

class PredictiveScaler:
    def __init__(self):
        self.model = Prophet(changepoint_prior_scale=0.05)
        
    def train(self, historical_data):
        # データの準備
        df = pd.DataFrame(historical_data)
        df.columns = ['ds', 'y']  # Prophet expects these column names
        
        # 週次の季節性を追加
        self.model.add_seasonality(
            name='daily_peak',
            period=1,
            fourier_order=5
        )
        
        self.model.fit(df)
    
    def predict_next_hours(self, hours=6):
        future = self.model.make_future_dataframe(
            periods=hours,
            freq='H'
        )
        forecast = self.model.predict(future)
        
        # スケーリング推奨の生成
        recommendations = []
        for _, row in forecast.tail(hours).iterrows():
            if row['yhat'] > 70:
                replicas = min(10, int(row['yhat'] / 10))
                recommendations.append({
                    'time': row['ds'],
                    'predicted_cpu': row['yhat'],
                    'recommended_replicas': replicas
                })
        
        return recommendations
```

## 問題8：発展的課題

### 解答

**1. SLI、SLO、SLAの関係**

**定義と関係：**
- **SLI（Service Level Indicator）**：サービスレベルを測定する指標
- **SLO（Service Level Objective）**：SLIの目標値
- **SLA（Service Level Agreement）**：顧客との契約上の約束

**具体例：オンラインショッピングサイト**

**SLI定義：**
```yaml
slis:
  - name: availability
    description: "サービスが正常に応答する割合"
    query: |
      sum(rate(http_requests_total{status!~"5.."}[5m]))
      /
      sum(rate(http_requests_total[5m]))

  - name: latency
    description: "95パーセンタイルのレスポンスタイム"
    query: |
      histogram_quantile(0.95,
        rate(http_request_duration_seconds_bucket[5m])
      )

  - name: error_rate
    description: "エラーレスポンスの割合"
    query: |
      sum(rate(http_requests_total{status=~"5.."}[5m]))
      /
      sum(rate(http_requests_total[5m]))
```

**SLO定義：**
```yaml
slos:
  - sli: availability
    objective: 99.9%  # スリーナイン
    window: 30d

  - sli: latency
    objective: < 200ms
    window: 30d

  - sli: error_rate
    objective: < 0.1%
    window: 30d
```

**SLA定義：**
```
契約条項：
- 可用性：月間99.9%を保証
- 違反時の補償：
  - 99.0% - 99.9%：月額料金の10%返金
  - 95.0% - 99.0%：月額料金の25%返金
  - 95.0%未満：月額料金の50%返金
```

**2. カオスエンジニアリングと可観測性**

**関係性：**
- カオスエンジニアリングは「計画的な障害注入」
- 可観測性は「システムの内部状態の理解」
- 両者は相補的：障害を注入し、システムの反応を観測

**実験設計例：データベース障害のシミュレーション**

```yaml
# chaos-experiment.yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: database-network-delay
spec:
  selector:
    namespaces:
      - production
    labelSelectors:
      app: database
  mode: all
  action: delay
  delay:
    latency: "500ms"
    jitter: "100ms"
    correlation: "25"
  duration: "5m"
```

**監視設定：**
```python
# chaos_monitoring.py
class ChaosExperimentMonitor:
    def __init__(self, prometheus_url):
        self.prom = PrometheusConnect(url=prometheus_url)
        self.baseline_metrics = {}
        
    def capture_baseline(self, duration_minutes=30):
        """実験前のベースラインを記録"""
        queries = {
            'error_rate': 'rate(http_requests_total{status=~"5.."}[5m])',
            'latency_p95': 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
            'throughput': 'rate(http_requests_total[5m])'
        }
        
        for name, query in queries.items():
            result = self.prom.custom_query_range(
                query=query,
                start_time=datetime.now() - timedelta(minutes=duration_minutes),
                end_time=datetime.now(),
                step='1m'
            )
            self.baseline_metrics[name] = self.calculate_stats(result)
    
    def monitor_experiment(self, experiment_duration_minutes=5):
        """実験中のメトリクスを監視"""
        alerts = []
        
        # リアルタイム監視
        for minute in range(experiment_duration_minutes):
            current_metrics = self.get_current_metrics()
            
            # ベースラインとの比較
            for metric_name, current_value in current_metrics.items():
                baseline = self.baseline_metrics[metric_name]
                deviation = abs(current_value - baseline['mean']) / baseline['std']
                
                if deviation > 3:  # 3σを超えたら異常
                    alerts.append({
                        'metric': metric_name,
                        'baseline': baseline['mean'],
                        'current': current_value,
                        'deviation': deviation,
                        'timestamp': datetime.now()
                    })
            
            time.sleep(60)
        
        return alerts
    
    def generate_report(self, alerts):
        """実験レポートの生成"""
        report = {
            'experiment': 'Database Network Delay',
            'duration': '5 minutes',
            'observations': {
                'system_stability': len(alerts) == 0,
                'degraded_metrics': [a['metric'] for a in alerts],
                'recovery_time': self.measure_recovery_time(),
                'cascade_failures': self.detect_cascade_failures(alerts)
            },
            'recommendations': self.generate_recommendations(alerts)
        }
        
        return report
    
    def generate_recommendations(self, alerts):
        """改善提案の生成"""
        recommendations = []
        
        if any(a['metric'] == 'error_rate' for a in alerts):
            recommendations.append({
                'issue': 'Error rate increased during database latency',
                'recommendation': 'Implement circuit breaker pattern',
                'priority': 'high'
            })
        
        if any(a['metric'] == 'latency_p95' for a in alerts):
            recommendations.append({
                'issue': 'Latency propagation observed',
                'recommendation': 'Add database connection pooling and caching',
                'priority': 'medium'
            })
        
        return recommendations
```

**実験手順：**

1. **事前準備**：
   - ベースラインメトリクスの記録（30分）
   - アラートチャネルの設定
   - ロールバック手順の確認

2. **実験実施**：
   - カオス注入（5分間のネットワーク遅延）
   - メトリクスの継続的な監視
   - 異常の記録

3. **事後分析**：
   - システムの回復時間測定
   - カスケード障害の有無確認
   - 改善点の特定

4. **改善実施**：
   - Circuit Breakerの実装
   - タイムアウト設定の最適化
   - リトライロジックの改善
# 第15章 演習問題 解答集

## 問題1：基本理解の確認

### 解答

1. Infrastructure as Codeの主な利点は、**再現**性、**バージョン**管理、**協働**作業、**自動**化、**スケール**の5つです。

2. 宣言的アプローチでは「**何が欲しいか**」を記述し、命令的アプローチでは「**どうやって作るか**」を記述します。

3. 何度実行しても同じ結果になる性質を**冪等**性といいます。

## 問題2：概念の理解

### 解答

**1. 手作業によるインフラ管理の問題点とIaCでの解決策**

1. **人的ミス**
   - 問題：設定の入力ミス、手順の抜け漏れ
   - IaCでの解決：コードによる自動化、バリデーション機能、依存関係の明確化

2. **再現性の欠如**
   - 問題：同じ環境を正確に再構築できない
   - IaCでの解決：コードから同一の環境を何度でも構築可能

3. **変更管理の困難さ**
   - 問題：誰が、いつ、何を変更したか追跡困難
   - IaCでの解決：Gitによるバージョン管理、変更履歴の完全な記録

**2. Terraformの状態管理の重要性**

状態ファイル（terraform.tfstate）は、Terraformが管理するリソースの現在の状態を記録しています。

重要性：
- 実際のリソースとコードのマッピング
- リソースの依存関係の管理
- 変更の差分計算の基盤

状態ファイルを失った場合の影響：
- リソースのIDが不明になり、Terraformで管理できなくなる
- 既存リソースを新規作成しようとして重複エラーが発生
- 手動でのインポート作業が必要になる

**3. 宣言的設定と命令的設定の違い**

命令的設定の例：
```bash
# 手順を記述
create_server()
configure_network()
install_software()
start_service()
```

宣言的設定の例：
```hcl
# 望む状態を記述
resource "aws_instance" "web" {
  instance_type = "t3.micro"
  # Terraformが必要な手順を判断
}
```

## 問題3：実践的な課題

### 解答

```hcl
# variables.tf
variable "environment" {
  type = string
}

# locals.tf
locals {
  instance_count = {
    dev  = 1
    prod = 3
  }
  
  instance_type = {
    dev  = "t3.micro"
    prod = "t3.small"
  }
}

# main.tf
resource "aws_instance" "web" {
  count         = local.instance_count[var.environment]
  instance_type = local.instance_type[var.environment]
  ami           = data.aws_ami.amazon_linux_2.id
  
  vpc_security_group_ids = [aws_security_group.web.id]
  
  tags = {
    Name        = "${var.environment}-web-${count.index + 1}"
    Environment = var.environment
  }
}

resource "aws_security_group" "web" {
  name_prefix = "${var.environment}-web-sg-"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ロードバランサー（本番環境のみ）
resource "aws_lb" "web" {
  count = var.environment == "prod" ? 1 : 0
  
  name               = "${var.environment}-web-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb[0].id]
  subnets            = data.aws_subnet_ids.public.ids
}

resource "aws_security_group" "alb" {
  count = var.environment == "prod" ? 1 : 0
  
  name_prefix = "${var.environment}-alb-sg-"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.web.id]
  }
}
```

## 問題4：トラブルシューティング

### 問題点と修正

問題点：
1. AMI IDがハードコード
2. セキュリティグループルールが独立している
3. user_dataで$RANDOMを使用（冪等性の欠如）
4. タグが不足

修正後：
```hcl
# SSM Public Parameter から最新のAmazon Linux 2023 AMIを取得
data "aws_ssm_parameter" "amazon_linux_2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_instance" "web" {
  instance_type = "t3.micro"
  ami           = data.aws_ssm_parameter.amazon_linux_2023_ami.value
  
  vpc_security_group_ids = [aws_security_group.web.id]
  
  user_data = <<-EOF
    #!/bin/bash
    dnf update -y
    dnf install -y nginx
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
    echo "Web Server $INSTANCE_ID" > /usr/share/nginx/html/index.html
    systemctl start nginx
    systemctl enable nginx
  EOF
  
  tags = {
    Name        = "web-server"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

resource "aws_security_group" "web" {
  name_prefix = "web-sg-"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

## 問題5：モジュール設計

### 解答

```hcl
# modules/vpc/variables.tf
variable "vpc_cidr" {
  type        = string
  description = "CIDR block for VPC"
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  type        = list(string)
  description = "List of availability zones"
}

variable "environment" {
  type        = string
  description = "Environment name"
}

# modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name        = "${var.environment}-public-${var.availability_zones[count.index]}"
    Environment = var.environment
    Type        = "public"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 100)
  availability_zone = var.availability_zones[count.index]
  
  tags = {
    Name        = "${var.environment}-private-${var.availability_zones[count.index]}"
    Environment = var.environment
    Type        = "private"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name        = "${var.environment}-igw"
    Environment = var.environment
  }
}

resource "aws_eip" "nat" {
  count  = length(var.availability_zones)
  domain = "vpc"
  
  tags = {
    Name        = "${var.environment}-nat-eip-${count.index}"
    Environment = var.environment
  }
  
  depends_on = [aws_internet_gateway.main]
}

resource "aws_nat_gateway" "main" {
  count         = length(var.availability_zones)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name        = "${var.environment}-nat-${count.index}"
    Environment = var.environment
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = {
    Name        = "${var.environment}-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table" "private" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  
  tags = {
    Name        = "${var.environment}-private-rt-${count.index}"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# modules/vpc/outputs.tf
output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}
```

## 問題6：CI/CDパイプライン

### 解答（GitHub Actions）

```yaml
# .github/workflows/terraform.yml
name: Terraform CI/CD

on:
  pull_request:
    paths:
      - 'terraform/**'
  push:
    branches:
      - main
    paths:
      - 'terraform/**'

env:
  TF_VERSION: '1.3.0'
  AWS_REGION: 'ap-northeast-1'

jobs:
  format-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Terraform Format Check
        run: terraform fmt -check -recursive
        working-directory: ./terraform

  validate:
    runs-on: ubuntu-latest
    needs: format-check
    steps:
      - uses: actions/checkout@v3
      
      - uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Terraform Init
        run: terraform init -backend=false
        working-directory: ./terraform
      
      - name: Terraform Validate
        run: terraform validate
        working-directory: ./terraform

  security-scan:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: terraform/
          framework: terraform
      
      - name: Run tfsec
        uses: aquasecurity/tfsec-action@v1.0.0
        with:
          working_directory: terraform/

  plan:
    runs-on: ubuntu-latest
    needs: security-scan
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3
      
      - uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Terraform Init
        run: terraform init
        working-directory: ./terraform
      
      - name: Terraform Plan
        id: plan
        run: terraform plan -out=tfplan -no-color
        working-directory: ./terraform
        continue-on-error: true
      
      - name: Comment PR
        uses: actions/github-script@v6
        env:
          PLAN: "terraform\n${{ steps.plan.outputs.stdout }}"
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const output = `#### Terraform Plan 📖\`${{ steps.plan.outcome }}\`
            
            <details><summary>Show Plan</summary>
            
            \`\`\`
            ${process.env.PLAN}
            \`\`\`
            
            </details>
            
            *Pushed by: @${{ github.actor }}, Action: \`${{ github.event_name }}\`*`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            })

  apply:
    runs-on: ubuntu-latest
    needs: security-scan
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
    steps:
      - uses: actions/checkout@v3
      
      - uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Terraform Init
        run: terraform init
        working-directory: ./terraform
      
      - name: Terraform Apply
        run: terraform apply -auto-approve
        working-directory: ./terraform
```

## 問題7：ポリシーの実装

### 解答（Sentinel）

```hcl
# policy/tags.sentinel
import "tfplan/v2" as tfplan

# EC2インスタンスには必ず"Environment"タグが必要
ec2_tags = rule {
    all tfplan.resource_changes as _, rc {
        rc.type is not "aws_instance" or
        rc.mode is not "managed" or
        rc.change.actions[0] is "delete" or
        "Environment" in keys(rc.change.after.tags)
    }
}

# policy/encryption.sentinel
# 本番環境のS3バケットは暗号化が必須
s3_encryption = rule {
    all tfplan.resource_changes as _, rc {
        rc.type is not "aws_s3_bucket" or
        rc.mode is not "managed" or
        rc.change.actions[0] is "delete" or
        (
            rc.change.after.tags.Environment is not "production" or
            rc.change.after.server_side_encryption_configuration is not null
        )
    }
}

# policy/network.sentinel
# パブリックIPアドレスの割り当ては禁止
no_public_ip = rule {
    all tfplan.resource_changes as _, rc {
        rc.type is not "aws_instance" or
        rc.mode is not "managed" or
        rc.change.actions[0] is "delete" or
        rc.change.after.associate_public_ip_address is false
    }
}

# main.sentinel
import "tags"
import "encryption"
import "network"

main = rule {
    tags.ec2_tags and
    encryption.s3_encryption and
    network.no_public_ip
}
```

## 問題8：災害復旧

### 解答

設計概要：
```hcl
# dr_design.tf
# プライマリリージョン（東京）
provider "aws" {
  alias  = "primary"
  region = "ap-northeast-1"
}

# DRリージョン（シンガポール）
provider "aws" {
  alias  = "dr"
  region = "ap-southeast-1"
}

# RDS Multi-AZ with Read Replica
resource "aws_db_instance" "primary" {
  provider = aws.primary
  
  identifier     = "primary-database"
  engine         = "mysql"
  engine_version = "8.0"
  
  multi_az                = true
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  
  enabled_cloudwatch_logs_exports = ["error", "general", "slowquery"]
}

resource "aws_db_instance" "dr_replica" {
  provider = aws.dr
  
  replicate_source_db = aws_db_instance.primary.id
  identifier          = "dr-replica"
}

# S3 Cross-Region Replication
resource "aws_s3_bucket" "primary" {
  provider = aws.primary
  bucket   = "myapp-primary-data"
  
  versioning {
    enabled = true
  }
}

resource "aws_s3_bucket_replication_configuration" "primary_to_dr" {
  provider = aws.primary
  
  role   = aws_iam_role.replication.arn
  bucket = aws_s3_bucket.primary.id
  
  rule {
    id     = "replicate-to-dr"
    status = "Enabled"
    
    destination {
      bucket        = aws_s3_bucket.dr.arn
      storage_class = "STANDARD_IA"
      
      replication_time {
        status = "Enabled"
        time {
          minutes = 15  # RPO: 1時間以内
        }
      }
    }
  }
}

# Route 53 Health Check and Failover
resource "aws_route53_health_check" "primary" {
  fqdn              = aws_lb.primary.dns_name
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = "3"
  request_interval  = "30"
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.example.com"
  type    = "A"
  
  set_identifier = "Primary"
  failover_routing_policy {
    type = "PRIMARY"
  }
  
  alias {
    name                   = aws_lb.primary.dns_name
    zone_id                = aws_lb.primary.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "www_dr" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.example.com"
  type    = "A"
  
  set_identifier = "DR"
  failover_routing_policy {
    type = "SECONDARY"
  }
  
  alias {
    name                   = aws_lb.dr.dns_name
    zone_id                = aws_lb.dr.zone_id
    evaluate_target_health = true
  }
}

# Lambda for automated failover
resource "aws_lambda_function" "dr_failover" {
  filename      = "dr_failover.zip"
  function_name = "dr-failover-automation"
  role          = aws_iam_role.lambda.arn
  handler       = "index.handler"
  runtime       = "python3.9"
  
  environment {
    variables = {
      DR_RDS_INSTANCE = aws_db_instance.dr_replica.id
      ROUTE53_ZONE_ID = aws_route53_zone.main.zone_id
    }
  }
}
```

## 問題9：コスト最適化

### 解答

```hcl
# cost_optimization.tf

# 開発環境：平日9-18時のみ起動
resource "aws_autoscaling_schedule" "dev_start" {
  scheduled_action_name  = "dev-start"
  autoscaling_group_name = aws_autoscaling_group.dev.name
  
  min_size         = 1
  max_size         = 2
  desired_capacity = 1
  
  # 平日9時に起動（UTC 0時 = JST 9時）
  recurrence = "0 0 * * MON-FRI"
}

resource "aws_autoscaling_schedule" "dev_stop" {
  scheduled_action_name  = "dev-stop"
  autoscaling_group_name = aws_autoscaling_group.dev.name
  
  min_size         = 0
  max_size         = 0
  desired_capacity = 0
  
  # 平日18時に停止（UTC 9時 = JST 18時）
  recurrence = "0 9 * * MON-FRI"
}

# ステージング環境：夜間は最小構成
resource "aws_autoscaling_schedule" "staging_night" {
  scheduled_action_name  = "staging-scale-down"
  autoscaling_group_name = aws_autoscaling_group.staging.name
  
  min_size         = 1
  max_size         = 2
  desired_capacity = 1
  
  # 毎日20時に縮小（UTC 11時 = JST 20時）
  recurrence = "0 11 * * *"
}

resource "aws_autoscaling_schedule" "staging_day" {
  scheduled_action_name  = "staging-scale-up"
  autoscaling_group_name = aws_autoscaling_group.staging.name
  
  min_size         = 2
  max_size         = 4
  desired_capacity = 2
  
  # 毎日8時に拡大（UTC 23時前日 = JST 8時）
  recurrence = "0 23 * * *"
}

# 本番環境：トラフィックに応じた自動スケーリング
resource "aws_autoscaling_group" "production" {
  name = "production-asg"
  
  min_size         = 3
  max_size         = 20
  desired_capacity = 5
  
  # ターゲット追跡スケーリング
  target_group_arns = [aws_lb_target_group.production.arn]
  
  mixed_instances_policy {
    instances_distribution {
      on_demand_base_capacity                  = 3
      on_demand_percentage_above_base_capacity = 30
      spot_allocation_strategy                 = "capacity-optimized"
    }
    
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.production.id
      }
      
      override {
        instance_type = "t3.large"
      }
      
      override {
        instance_type = "t3a.large"
      }
    }
  }
}

resource "aws_autoscaling_policy" "cpu_target" {
  name                   = "cpu-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.production.name
  policy_type            = "TargetTrackingScaling"
  
  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    
    target_value = 65.0
  }
}

resource "aws_autoscaling_policy" "request_count_target" {
  name                   = "request-count-tracking"
  autoscaling_group_name = aws_autoscaling_group.production.name
  policy_type            = "TargetTrackingScaling"
  
  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.production.arn_suffix}/${aws_lb_target_group.production.arn_suffix}"
    }
    
    target_value = 1000.0
  }
}
```

## 問題10：発展的課題

### 解答

**1. GitOpsワークフロー**

ArgoCD を使用した GitOps ワークフロー：

```yaml
# argocd-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: infrastructure
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/infrastructure
    targetRevision: HEAD
    path: terraform
    plugin:
      name: terraform
  destination:
    server: https://kubernetes.default.svc
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

プロセス：
1. 開発者がインフラコードを変更しPR作成
2. CI/CDでテストとplan実行
3. PRがマージされるとArgoCDが変更を検知
4. ArgoCDがTerraform applyを自動実行
5. 実際の状態とGitの状態を常に同期

**2. IaCツールの比較**

| ツール | 適用場面 | 特徴 |
|--------|----------|------|
| Terraform | マルチクラウド環境、複雑なインフラ | 宣言的、状態管理、豊富なプロバイダー |
| CloudFormation | AWS専用環境 | AWSネイティブ、ドリフト検出、スタック管理 |
| Pulumi | プログラミング言語でインフラ定義 | TypeScript/Python/Go対応、型安全 |
| Ansible | 設定管理とプロビジョニング | エージェントレス、手続き的、冪等性 |

**3. IaCにおけるテスト戦略**

単体テスト：
```go
func TestValidateVariables(t *testing.T) {
    // 変数の妥当性検証
    vars := terraform.Variables{
        "instance_type": "t3.micro",
    }
    assert.Contains(t, allowedTypes, vars["instance_type"])
}
```

統合テスト：
```go
func TestVPCModule(t *testing.T) {
    terraformOptions := &terraform.Options{
        TerraformDir: "../modules/vpc",
    }
    defer terraform.Destroy(t, terraformOptions)
    
    terraform.InitAndApply(t, terraformOptions)
    
    // VPCが作成されたか確認
    vpcId := terraform.Output(t, terraformOptions, "vpc_id")
    assert.NotEmpty(t, vpcId)
}
```

E2Eテスト：
```go
func TestCompleteInfrastructure(t *testing.T) {
    // 本番相当の環境を構築
    // アプリケーションをデプロイ
    // 実際のトラフィックでテスト
    // パフォーマンステスト実施
}
```
