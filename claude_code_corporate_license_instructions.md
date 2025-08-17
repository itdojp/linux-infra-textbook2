# Claude Code 法人ライセンス適用指示書（ITDO Inc.）

## 概要

株式会社アイティードゥ（ITDO Inc.）が著作権を保有する書籍リポジトリに Creative Commons BY-NC-SA 4.0 + 商用利用事前許諾制ライセンスを適用してください。

**著作権者：** 株式会社アイティードゥ（ITDO Inc.）  
**連絡先：** knowledge@itdo.jp

## 実行指示

### Step 1: リポジトリのクローンと準備

```bash
# 対象リポジトリのクローン
git clone [リポジトリURL]
cd [リポジトリ名]

# 新しいブランチ作成
git checkout -b feature/corporate-license-update
```

### Step 2: ファイル作成・更新

各リポジトリに以下のファイルを作成・更新してください：

## 📁 作成・更新対象ファイル

### 1. LICENSE.md （新規作成）

```markdown
# ライセンス

## 基本ライセンス

本作品は以下のライセンスの下で提供されます：

**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**

[![License: CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/80x15.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

詳細：https://creativecommons.org/licenses/by-nc-sa/4.0/

## 商用利用について

### 商用利用の定義
以下の用途は商用利用に該当し、事前の商用ライセンス契約が必要です：

- 有料での販売・配布・頒布
- 営利法人・団体での研修・教育利用
- 広告収益を伴うメディア・プラットフォームでの利用
- 商品・サービスの一部としての組み込み・統合
- 企業内教育プログラムでの活用
- コンサルティング・研修サービスでの教材利用

### 商用ライセンス契約

商用利用をご希望の場合は、以下にお問い合わせください：

**お問い合わせ先**  
株式会社アイティードゥ（ITDO Inc.）  
Email: [knowledge@itdo.jp](mailto:knowledge@itdo.jp)  
件名: [書籍名] 商用ライセンス利用申請

#### 契約に必要な情報
- 申請者情報（法人名・担当者名・連絡先）
- 利用目的・用途の詳細
- 利用範囲・対象人数
- 利用期間・契約期間
- 収益モデル・事業規模
- 技術的利用方法

#### 商用ライセンス料金

ライセンス料金は以下の要素を総合的に勘案し、個別にお見積もりいたします：

**価格決定要素**
- **利用規模・対象人数**
- **利用期間・契約期間**
- **利用用途・事業内容**
- **カスタマイズ・サポート要件**
- **地理的範囲・多言語対応**
- **既存システムとの統合要件**

**契約オプション**
- 年間契約による優遇価格
- 複数年契約による大幅割引
- ボリュームライセンス
- 教育機関向け特別価格
- スタートアップ支援プログラム

お客様の具体的なご要件をお聞かせいただき、最適なプランをご提案いたします。

### 契約条件

商用ライセンス契約には以下の条件が含まれます：

- **利用許諾範囲の明確化**
- **著作権表示義務**
- **改変・翻案に関する制限事項**
- **再配布・第三者提供に関する条件**
- **契約期間・更新条件**
- **損害賠償・免責事項**

## 著作権表示

本作品を利用する際は、以下の著作権表示を含めてください：

```
"[書籍タイトル]" by 株式会社アイティードゥ (ITDO Inc.) is licensed under CC BY-NC-SA 4.0
Original work: https://github.com/[organization]/[repository-name]
License details: https://github.com/itdojp/it-engineer-knowledge-architecture/blob/main/LICENSE.md
```

## 免責事項

株式会社アイティードゥ（ITDO Inc.）は本作品の利用に関していかなる保証も行わず、
利用によって生じた損害について責任を負いません。
ただし、商用ライセンス契約における保証・責任条項は別途定めるものとします。

## お問い合わせ

本ライセンスに関するご質問・ご相談は以下までお願いいたします：

**株式会社アイティードゥ（ITDO Inc.）**  
Email: knowledge@itdo.jp  
URL: [企業ウェブサイトURL]

---
© 2025 株式会社アイティードゥ (ITDO Inc.)
All Rights Reserved.
```

### 2. README.md 更新

既存のREADME.mdファイルの**最下部**に以下のライセンス情報を追加してください：

```markdown
---

## 📄 ライセンス

本書は **Creative Commons BY-NC-SA 4.0** ライセンスで公開されています。  
**🔓 教育・研究・個人学習での利用は自由** ですが、**💼 商用利用には事前許諾** が必要です。

📋 [詳細なライセンス条件](https://github.com/itdojp/it-engineer-knowledge-architecture/blob/main/LICENSE.md)

**お問い合わせ**  
株式会社アイティードゥ（ITDO Inc.）  
Email: [knowledge@itdo.jp](mailto:knowledge@itdo.jp)
```

### 3. .github/ISSUE_TEMPLATE/commercial_license.md （新規作成）

```markdown
---
name: 商用ライセンス契約申請
about: 法人・営利団体向け商用ライセンス契約の申請
title: '[商用ライセンス] 契約申請 - [組織名]'
labels: 'commercial-license, enterprise'
assignees: ''
---

## 申請者情報

### 組織情報
- **法人名・団体名：**
- **代表者名：**
- **所在地：**
- **従業員数：**
- **事業内容：**

### 担当者情報
- **担当者名：**
- **部署・役職：**
- **連絡先Email：**
- **電話番号：**

## 利用計画

### 利用目的・用途
- **主たる利用目的：**
- **具体的な活用方法：**
- **対象となる事業・部門：**

### 利用規模
- **想定利用者数：**
- **利用期間：**
- **地理的範囲：**
- **年間売上規模：**

### 技術的利用方法
- **利用形態：** （印刷、電子配布、システム組み込み等）
- **改変・翻案の有無：**
- **第三者への提供予定：**

## 契約希望条件

- **希望契約期間：**
- **希望開始時期：**
- **予算規模：**

## その他

**追加要望・質問等：**

---

**注意事項**
- 本申請は契約を保証するものではありません
- 詳細な契約条件は別途調整させていただきます
- 契約締結まで商用利用はお控えください
```

### 4. CONTRIBUTING.md （新規作成）

```markdown
# コントリビューションガイド

株式会社アイティードゥ（ITDO Inc.）の書籍プロジェクトへのご協力ありがとうございます。

## 📋 コントリビューション方針

### 非営利コントリビューション
以下のコントリビューションは歓迎いたします：

- **誤字脱字の修正**
- **技術的な間違いの指摘**
- **翻訳・多言語化**
- **アクセシビリティ改善**
- **学習効果向上のための提案**

### 商用利用を伴うコントリビューション

商用目的でのコントリビューション（企業研修での利用等）をお考えの場合は、
事前に commercial_license Issue での相談をお願いいたします。

## 🤝 コントリビューション手順

1. **Issue作成** - 改善提案や問題報告
2. **Fork & Clone** - リポジトリをフォーク
3. **ブランチ作成** - 作業用ブランチを作成
4. **変更実装** - 修正・改善を実装
5. **プルリクエスト** - 変更内容を提出
6. **レビュー** - 内容確認・調整
7. **マージ** - 変更の取り込み

## 📝 ライセンス同意

コントリビューションを行うことで、以下に同意したものとみなします：

- コントリビューション内容が CC BY-NC-SA 4.0 で提供されること
- 株式会社アイティードゥが商用ライセンス契約において当該コントリビューション内容を利用できること

## 📞 お問い合わせ

**株式会社アイティードゥ（ITDO Inc.）**  
Email: knowledge@itdo.jp
```

### 5. 各章ファイルのヘッダー更新

各Markdownファイル（章ファイル）の冒頭に以下を追加してください：

```markdown
---
title: "[章タイトル]"
author: "株式会社アイティードゥ (ITDO Inc.)"
license: "CC BY-NC-SA 4.0"
commercial_license: "要契約"
copyright: "© 2025 株式会社アイティードゥ (ITDO Inc.)"
---

<!-- 
本章は「[書籍タイトル]」の一部であり、
株式会社アイティードゥ (ITDO Inc.) が著作権を保有し、
CC BY-NC-SA 4.0ライセンスの下で提供されます。
商用利用は事前の契約が必要です。
詳細：https://github.com/itdojp/it-engineer-knowledge-architecture/blob/main/LICENSE.md
-->
```

### Step 2.5: 共通ライセンスリポジトリでの管理

#### A. 共通ライセンスファイルの配置

```bash
# 共通ライセンス管理リポジトリをクローン（存在しない場合は作成）
git clone https://github.com/itdojp/it-engineer-knowledge-architecture.git
cd it-engineer-knowledge-architecture

# ライセンスファイルをコピー
cp ../[対象書籍リポジトリ]/LICENSE.md ./LICENSE.md

# コミット
git add LICENSE.md
git commit -m "feat: 法人書籍統一ライセンス追加

- Creative Commons BY-NC-SA 4.0ライセンス
- 商用利用事前許諾制
- 株式会社アイティードゥ著作権"

git push origin main
```

#### B. 共通リポジトリREADME.mdの更新

`https://github.com/itdojp/it-engineer-knowledge-architecture/blob/main/README.md` に以下のライセンス情報を追加してください：

```markdown
## 📄 ライセンス

ITDO Inc.が公開する技術書籍は **Creative Commons BY-NC-SA 4.0** ライセンスで提供されています。

### 🔓 自由な利用
- 教育・研究・個人学習での利用
- 非営利団体での活用
- 内容の改変・派生作品の作成

### 💼 商用利用
法人・営利団体での利用には事前の商用ライセンス契約が必要です。

📋 [詳細なライセンス条件](./LICENSE.md)

### 📚 対象書籍一覧
- [書籍名1] - [リポジトリURL]
- [書籍名2] - [リポジトリURL]
- （他の書籍も同様に追記）

**お問い合わせ**  
株式会社アイティードゥ（ITDO Inc.）  
Email: [knowledge@itdo.jp](mailto:knowledge@itdo.jp)
```

```bash
# 既存LICENSEファイルがある場合
if [ -f LICENSE ]; then
    mv LICENSE LICENSE.backup-$(date +%Y%m%d)
fi

# 新しいLICENSE.mdファイルをLICENSEとしてもコピー
cp LICENSE.md LICENSE
```

#### B. 書籍リポジトリ内のLICENSE.md更新

書籍リポジトリ内のLICENSE.mdファイルに、共通ライセンスリポジトリへの参照を追加：

```markdown
# ライセンス

本書籍のライセンス条件は、株式会社アイティードゥの統一ライセンスに準拠します。

📋 **詳細なライセンス条件：**  
https://github.com/itdojp/it-engineer-knowledge-architecture/blob/main/LICENSE.md

## 簡易説明

本作品は **Creative Commons BY-NC-SA 4.0** ライセンスで提供されています。

- **🔓 非営利利用：** 教育・研究・個人学習で自由に利用可能
- **💼 商用利用：** 事前の商用ライセンス契約が必要

**お問い合わせ：** knowledge@itdo.jp

---
© 2025 株式会社アイティードゥ (ITDO Inc.)
```

### Step 4: 法人向け追加設定

#### package.json の更新（該当する場合）

```json
{
  "license": "SEE LICENSE.md",
  "author": {
    "name": "ITDO Inc.",
    "email": "knowledge@itdo.jp",
    "url": "[企業ウェブサイトURL]"
  },
  "contributors": [
    {
      "name": "ITDO Inc.",
      "email": "knowledge@itdo.jp"
    }
  ]
}
```

### Step 5: コミットとプッシュ

```bash
# ファイルをステージング
git add .

# コミット（法人向けメッセージ）
git commit -m "feat: 企業向けCC BY-NC-SA 4.0ライセンス適用

- Creative Commons BY-NC-SA 4.0ライセンスを適用
- 法人向け商用ライセンス契約制度を導入  
- 企業間取引に適した契約条項を整備
- Issue templateで商用ライセンス申請受付開始
- CONTRIBUTINGガイドライン策定
- 著作権者：株式会社アイティードゥ (ITDO Inc.)"

# プッシュ
git push origin feature/corporate-license-update
```

### Step 6: プルリクエスト作成

**プルリクエストのタイトル：**
```
feat: 企業向けCreative Commons BY-NC-SA 4.0ライセンス適用
```

**プルリクエストの説明：**
```markdown
## 変更概要
株式会社アイティードゥ向けCreative Commons BY-NC-SA 4.0 + 商用ライセンス契約制を適用

## 変更内容
- [ ] 共通ライセンスリポジトリでの統一管理導入
- [ ] README.mdにシンプルなライセンス表示追加
- [ ] ライセンス詳細の外部リンク化
- [ ] 商用ライセンス契約申請用Issue template追加
- [ ] CONTRIBUTINGガイドライン策定
- [ ] 各章ファイルに法人著作権表示追加（外部リンク対応）
- [ ] package.json更新（該当する場合）

## 法人向け特別配慮
- 複数書籍の統一ライセンス管理
- シンプルで分かりやすいライセンス表示
- 共通リポジトリでの一元管理
- 企業間取引に適した契約条項（外部参照）

## 影響範囲
- 教育機関・非営利利用には影響なし
- 法人・営利団体利用時は契約が必要
- より明確な商用利用ガイドライン

## 確認事項
- [ ] 法人向けライセンス表記の整合性
- [ ] 企業向けIssue templateの動作確認
- [ ] 契約条項の法的妥当性確認
- [ ] README企業向け情報の表示確認
```

## 📋 チェックリスト

実行前に以下を確認してください：

- [ ] 対象リポジトリのアクセス権限
- [ ] 株式会社アイティードゥの正式な承認
- [ ] 企業ウェブサイトURLの確認
- [ ] 法務・税務的要件の確認
- [ ] 既存契約との整合性確認

## 🚨 重要な注意事項

1. **法人契約の重要性**
   - 法人間取引として適切な契約条項を含めています
   
2. **料金体系**
   - 企業規模に応じた段階的料金設定
   - 税別表示での明確な価格提示
   
3. **契約条件**
   - より詳細な契約条件を明記
   - 保証・免責事項の法人向け調整

4. **コンプライアンス**
   - 法務・税務要件への対応
   - 既存の企業契約との整合性確保

## 完了確認

作業完了後、以下をGitHub上で確認してください：

1. ✅ 共通ライセンスリポジトリが正しく設定されること
2. ✅ README.mdのシンプルなライセンス表示が適切に表示されること
3. ✅ 外部ライセンス詳細リンクが正常に機能すること
4. ✅ 商用ライセンス契約申請templateが利用可能であること
5. ✅ CONTRIBUTINGガイドが適切に機能すること
6. ✅ プルリクエストが正常に作成されること

作業完了後、プルリクエストURLと法務確認状況をご報告ください。

---

## 📋 更新版の特徴

### 🔗 統一ライセンス管理
- `https://github.com/itdojp/it-engineer-knowledge-architecture` での一元管理
- 複数書籍での一貫したライセンス適用
- メンテナンス効率の向上

### 🎯 シンプルな表示
- トップページ下部のコンパクトな表示
- 必要最小限の情報に絞った訴求
- 外部詳細ページへの明確な導線

### 🏢 法人運用最適化
- 複数プロジェクトでの統一運用
- ライセンス更新時の一括対応可能
- ブランド統一と管理効率の両立

この設計により、**シンプルな表示・統一管理・効率的運用**を実現できます。