# React Todoアプリ（学習用）

## プロジェクトの説明
React + TypeScript + Viteで作成した、担当者選択機能付きのシンプルなTodoアプリです。バックエンドは不要で、担当者データはJSONファイルから取得します。

## 目次
- [インストールと実行方法](#インストールと実行方法)
- [使用方法](#使用方法)
- [APIエンドポイント一覧](#apiエンドポイント一覧)
- [ファイル構成](#ファイル構成)
- [クレジット](#クレジット)
- [バッジ](#バッジ)
- [注意点や備考](#注意点や備考)

## インストールと実行方法
1. リポジトリをクローン
   ```sh
   git clone <このリポジトリのURL>
   cd copilot_test2
   ```
2. 依存パッケージをインストール
   ```sh
   npm install
   ```
3. 開発サーバーを起動
   ```sh
   npm run dev
   ```
4. ブラウザで `http://localhost:5173` を開く

## 使用方法
- テキストボックスにやることを入力し、担当者をプルダウンから選択して「追加」ボタンを押すとTodoが追加されます。
- 追加したTodoはリストに表示されます。

## クレジット
- 作者: CR-ACHIWA
- 使用技術: React, TypeScript, Vite

## バッジ
![Vite](https://img.shields.io/badge/Vite-^4.0.0-blueviolet)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue)

## APIエンドポイント一覧
- `/members.json` : 担当者リスト（GET, 静的ファイル）

## ファイル構成
```
copilot_test2/
├─ public/
│  └─ members.json         # 担当者データ（静的JSON）
├─ src/
│  ├─ App.tsx             # エントリポイント
│  ├─ Todo.tsx            # Todoアプリ本体
│  ├─ main.tsx            # Reactエントリ
│  └─ ...                 # その他Vite/React関連ファイル
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ README.md
```

## 注意点や備考
- 担当者データ（members.json）は `public` フォルダに配置してください。
- バックエンドは不要です。
- 本アプリは学習用のため、データの永続化はありません。

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
