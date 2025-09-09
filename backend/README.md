# Todo Backend API

React Todoアプリケーション用のバックエンドAPI

## 技術スタック

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env` ファイルを確認し、必要に応じて変更してください：
```
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
DB_PATH=./database.sqlite
```

### 3. データベースの初期化
```bash
npm run db:init
```

### 4. サーバーの起動
```bash
# 開発モード
npm run dev

# 本番モード
npm run build
npm start
```

## テストユーザー

初期化時に以下のテストユーザーが作成されます：

- **ユーザーID**: `yamada` / **パスワード**: `password123` / **名前**: 山田 太郎
- **ユーザーID**: `sato` / **パスワード**: `password123` / **名前**: 佐藤 花子  
- **ユーザーID**: `suzuki` / **パスワード**: `password123` / **名前**: 鈴木 次郎

## API エンドポイント

### 認証系（JWT不要）

#### POST /api/auth/login
ユーザーのログイン
```json
{
  "user_id": "yamada",
  "password": "password123"
}
```

#### POST /api/auth/register
新規ユーザー登録
```json
{
  "user_id": "newuser",
  "password": "password123",
  "name": "新しいユーザー"
}
```

### ユーザー系（JWT必要）

#### GET /api/users
全ユーザー一覧取得

#### GET /api/users/me
現在のユーザー情報取得

#### GET /api/users/:id
特定ユーザー情報取得

### TODO系（JWT必要）

#### GET /api/todos
全TODO一覧取得

#### GET /api/todos/:id
特定TODO取得

#### POST /api/todos
TODO作成
```json
{
  "text": "新しいTODO",
  "assignee_ids": [1, 2],
  "status": "TODO"
}
```

#### PUT /api/todos/:id
TODO更新
```json
{
  "text": "更新されたTODO",
  "status": "IN_PROGRESS",
  "assignee_ids": [1, 3]
}
```

#### PATCH /api/todos/:id/status
TODOステータス更新
```json
{
  "status": "DONE"
}
```

#### DELETE /api/todos/:id
TODO削除

## 認証について

- ログイン後、JWTトークンが発行されます
- 認証が必要なエンドポイントでは、Authorizationヘッダーにトークンを設定してください：
  ```
  Authorization: Bearer <your-jwt-token>
  ```
- トークンの有効期限は24時間です

## データベーススキーマ

### users テーブル
- id (PRIMARY KEY)
- user_id (UNIQUE)
- password_hash
- name
- created_at
- updated_at

### todos テーブル
- id (PRIMARY KEY)
- text
- status ('TODO', 'IN_PROGRESS', 'DONE')
- creator_id (FOREIGN KEY → users.id)
- created_at
- updated_at

### todo_assignees テーブル
- todo_id (FOREIGN KEY → todos.id)
- user_id (FOREIGN KEY → users.id)
- assigned_at

## 開発コマンド

```bash
# 開発サーバー起動（ファイル監視付き）
npm run dev

# TypeScript コンパイル
npm run build

# 本番サーバー起動
npm start

# ESLint実行
npm run lint

# データベース初期化
npm run db:init
```

## レスポンス形式

### 成功時
```json
{
  "success": true,
  "data": { ... }
}
```

### エラー時
```json
{
  "error": {
    "message": "エラーメッセージ"
  }
}
```

## 注意点

- 本アプリケーションは学習用のため、本番環境での使用は推奨されません
- JWT_SECRETは本番環境では必ず変更してください
- SQLiteデータベースファイルは`database.sqlite`として作成されます