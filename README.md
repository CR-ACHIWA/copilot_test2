# React Todo アプリ（JWT認証 + バックエンド連携版）

## プロジェクトの説明
React + TypeScript + Vite で作成したTodoアプリケーションです。
JWT認証によるログイン機能、Express + SQLite バックエンド、ブラウザ通知機能を備えています。

## 主な機能

### 🔐 認証機能
- JWT によるセキュアなログイン/ログアウト
- ログイン状態の永続化（localStorage）
- 認証が必要なルートの保護

### 📝 TODO管理
- TODO の作成、編集、削除
- ドラッグ&ドロップによるステータス変更
- 複数ユーザーへの担当者割り当て
- かんばんボード形式の表示（TODO / 進行中 / 完了）

### 🔔 通知機能
- 新しいTODOが割り当てられた際のブラウザ通知
- TODOステータス変更時の通知
- 通知許可の自動要求

### 🗄️ データ永続化
- SQLite データベースによるデータ保存
- RESTful API による CRUD 操作
- 外部キー制約による整合性保証

## 技術スタック

### フロントエンド
- **React 19.1.0** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite 7.0.4** - 高速開発サーバー
- **Axios** - HTTP クライアント
- **Context API** - グローバル状態管理

### バックエンド
- **Express.js** - Web フレームワーク
- **TypeScript** - 型安全性
- **SQLite3** - データベース
- **JWT** - 認証トークン
- **bcrypt** - パスワードハッシュ化

## インストールと実行方法

### 1. リポジトリをクローン
```bash
git clone <このリポジトリのURL>
cd copilot_test2
```

### 2. バックエンドのセットアップ
```bash
cd backend
npm install
npm run db:init    # データベース初期化
npm run dev        # 開発サーバー起動 (ポート3001)
```

### 3. フロントエンドのセットアップ
```bash
# ルートディレクトリに戻る
cd ..
npm install
npm run dev        # 開発サーバー起動 (ポート5175)
```

### 4. ブラウザでアクセス
```
http://localhost:5175
```

## テストアカウント

以下のアカウントでログインできます：

| ユーザーID | パスワード | 名前 |
|------------|------------|------|
| `yamada`   | `password123` | 山田 太郎 |
| `sato`     | `password123` | 佐藤 花子 |
| `suzuki`   | `password123` | 鈴木 次郎 |

## 使用方法

1. **ログイン**：ユーザーIDとパスワードを入力してログイン
2. **TODO作成**：テキスト入力、担当者選択、ステータス指定で作成
3. **ステータス変更**：TODOカードをドラッグ&ドロップで移動
4. **通知**：ブラウザ通知許可を有効にすると、割り当てられた際に通知
5. **ログアウト**：ヘッダーのログアウトボタンをクリック

## API エンドポイント

### 認証
- `POST /api/auth/login` - ログイン
- `POST /api/auth/register` - ユーザー登録

### ユーザー
- `GET /api/users` - ユーザー一覧取得
- `GET /api/users/me` - 現在のユーザー情報取得

### TODO
- `GET /api/todos` - TODO一覧取得
- `POST /api/todos` - TODO作成
- `PUT /api/todos/:id` - TODO更新
- `PATCH /api/todos/:id/status` - ステータス更新
- `DELETE /api/todos/:id` - TODO削除

## 開発コマンド

### フロントエンド
```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run preview  # ビルド結果のプレビュー
npm run lint     # ESLint実行
```

### バックエンド
```bash
cd backend
npm run dev      # 開発サーバー起動
npm run build    # TypeScript コンパイル
npm run start    # 本番サーバー起動
npm run lint     # ESLint実行
npm run db:init  # データベース初期化
```

## ファイル構成

```
copilot_test2/
├── backend/                 # バックエンドAPI
│   ├── src/
│   │   ├── controllers/     # APIコントローラー
│   │   ├── middleware/      # 認証・エラーハンドリング
│   │   ├── routes/         # ルート定義
│   │   ├── services/       # ビジネスロジック
│   │   └── types/          # 型定義
│   ├── database.sqlite     # SQLiteデータベース
│   └── package.json
├── src/                    # フロントエンドソース
│   ├── components/
│   │   ├── auth/          # 認証関連コンポーネント
│   │   ├── common/        # 共通コンポーネント
│   │   └── todo/          # TODO関連コンポーネント
│   ├── contexts/          # React Context
│   ├── services/          # API・認証・通知サービス
│   └── types/             # 型定義
├── index.html
├── package.json
└── README.md
```

## 注意点

- 本アプリは学習用のため、本番環境での使用は推奨されません
- JWT の秘密鍵は本番環境では必ず変更してください
- ブラウザ通知を使用するには、HTTPS または localhost が必要です
- データの永続化は SQLite ファイルで行われます

## ライセンス

MIT License