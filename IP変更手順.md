# LM Studio IPアドレス変更手順

## 概要
LM StudioのIPアドレスが変更された場合、**config.jsのみを編集**すればシステム全体に反映されます。

## 変更手順

### 1. config.jsを編集
ルートディレクトリの `config.js` を開きます：

```javascript
const CONFIG = {
    // LM Studio API URL（ここを編集）
    LM_STUDIO_URL: 'http://192.168.2.109:1234',  // ← 新しいIPアドレスに変更
    ...
};
```

### 2. サーバーを再起動
各アシスタントのサーバーを再起動します：

```bash
# Recipe アシスタント
cd recipe/server
npm start

# Fortune アシスタント
cd fortune/server
npm start

# Robotics アシスタント
cd robotics/server
npm start
```

### 3. 動作確認

#### ブラウザでアクセス
1. メイン画面: `http://localhost:8000/`
2. Recipe: `http://localhost:8000/recipe/chat.html`
3. Fortune: `http://localhost:8000/fortune/chat.html`
4. Robotics: `http://localhost:8000/robotics/chat.html`

#### API接続テスト
ブラウザのコンソール（F12）で以下を確認：
- `✅ LM Studio API接続OK` が表示されること
- エラーがないこと

## 変更が反映される箇所

✅ **フロントエンド（4箇所）**
- `index.html` - メイン画面のAPI接続テスト
- `fortune/script.js` - 易占いアシスタント
- `recipe/script.js` - レシピアシスタント
- `robotics/script.js` - ロボ開発アシスタント

✅ **バックエンド（3箇所）**
- `fortune/server/server.js` - 易占いサーバー
- `recipe/server/server.js` - レシピサーバー
- `robotics/server/server.js` - ロボ開発サーバー

## トラブルシューティング

### エラー: "CONFIG is not defined"
→ HTMLファイルで `config.js` が正しく読み込まれているか確認

### エラー: "Cannot find module '../../config'"
→ `config.js` がルートディレクトリに存在するか確認

### API接続エラー
→ LM Studioが起動しているか確認
→ IPアドレスとポート番号が正しいか確認

## 今後の拡張予定

将来的に実装予定の機能：
- [ ] 自動IP検出機能（複数候補から自動選択）
- [ ] GUI設定画面（ブラウザから設定変更可能）
- [ ] 接続テスト機能の強化
