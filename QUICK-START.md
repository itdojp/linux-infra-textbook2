# Quick Start（執筆・開発者向け）

このリポジトリの内容をローカルでプレビューするための最小手順です。

## 前提

- Node.js 18 以上（`package.json` の `engines.node` を参照）
- Ruby と Bundler（`docs/Gemfile` を参照）

## セットアップ

```bash
git clone https://github.com/itdojp/linux-infra-textbook2.git
cd linux-infra-textbook2

npm ci

cd docs
bundle install
cd ..
```

## ローカルプレビュー（推奨）

`docs/` を Jekyll で起動します。

```bash
npm start
```

既定では `http://localhost:4000` で閲覧できます。

## ビルドと静的プレビュー

```bash
npm run preview
```

このコマンドは `npm run build`（`docs/_site/` を生成）を実行したうえで、静的ファイルサーバーでプレビューします。

## どこを編集するか

- 公開ページのソース: `docs/`
- 原稿整理用ファイル: `src/`（運用は要確認）

## リント・リンクチェック（任意）

```bash
npm test
```
