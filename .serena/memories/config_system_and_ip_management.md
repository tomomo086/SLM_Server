# SLM Server - 設定ファイルシステムとIP管理

## 概要
2025年11月実装：LM Studio APIのIPアドレスを一元管理する`config.js`システム

## 現在の設定
- **LM Studio URL**: `http://192.168.2.109:1234`
- **設定ファイル**: `C:\Users\tomon\dev\projects\SLM_Server\config.js`

## config.jsの仕組み

### ファイル構造
```javascript
const CONFIG = {
    LM_STUDIO_URL: 'http://192.168.2.109:1234',
    PORTS: {
        recipe: 3000,
        fortune: 3001,
        robotics: 3002
    },
    DEFAULT_MODEL: 'local-model',
    TIMEOUT: 30000
};

// Node.js環境用エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// ブラウザ環境用グローバル変数
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
```

### 参照方法

#### フロントエンド（ブラウザ）
```html
<!-- HTMLで先に読み込み -->
<script src="../config.js"></script>
<script src="script.js"></script>
```

```javascript
// script.js内で参照
const API_CONFIG = {
    url: CONFIG.LM_STUDIO_URL  // window.CONFIGから参照
};
```

#### バックエンド（Node.js）
```javascript
// server.js冒頭でインポート
const CONFIG = require('../../config');

// 使用例
fetch(`${CONFIG.LM_STUDIO_URL}/v1/chat/completions`, {...});
```

## 修正済みファイル一覧

### フロントエンド（7ファイル）
1. `index.html` - config.js読み込み追加
2. `fortune/chat.html` - config.js読み込み追加
3. `fortune/script.js` - CONFIG.LM_STUDIO_URL使用
4. `recipe/chat.html` - config.js読み込み追加
5. `recipe/script.js` - CONFIG.LM_STUDIO_URL使用
6. `robotics/chat.html` - config.js読み込み追加
7. `robotics/script.js` - CONFIG.LM_STUDIO_URL使用

### バックエンド（3ファイル）
1. `recipe/server/server.js` - CONFIG require追加、全URL箇所修正
2. `fortune/server/server.js` - CONFIG require追加、全URL箇所修正
3. `robotics/server/server.js` - CONFIG require追加、全URL箇所修正

## IP変更手順

### 1. config.jsを編集（1箇所のみ）
```javascript
LM_STUDIO_URL: 'http://192.168.2.XXX:1234'  // 新しいIPに変更
```

### 2. サーバー再起動
CMDを閉じて、バッチファイルで再起動

### 3. ブラウザキャッシュクリア（重要！）
**Chromeの場合、キャッシュをクリアしないと古いIPで接続され続ける**
- `Ctrl + Shift + Delete` → 「キャッシュされた画像とファイル」削除
- または `F12` → ネットワークタブ → 「キャッシュを無効にする」
- ページ再読み込み `Ctrl + Shift + R`

### 4. 動作確認
- `http://localhost:8000/` にアクセス
- F12コンソールで `✅ LM Studio API接続OK` を確認

## トラブルシューティング

### 古いIPで接続される
→ **ブラウザキャッシュをクリア**（最も重要）

### "CONFIG is not defined"エラー
→ HTMLで`config.js`が正しく読み込まれているか確認
→ `<script src="../config.js"></script>`の記述を確認

### "Cannot find module '../../config'"エラー
→ `config.js`がルートディレクトリに存在するか確認

### API接続エラー
→ LM Studioが起動しているか確認
→ IPアドレスとポート番号が正しいか確認

## 改善効果

### Before（旧構造）
- 28箇所にIPアドレスがハードコード
- IP変更時に全ファイルを手動修正
- 変更漏れのリスク大

### After（新構造）
- 1ファイル（config.js）のみ編集でOK
- 変更漏れゼロ（自動反映）
- 保守性が大幅向上

## 今後の拡張予定
- 自動IP検出機能（複数候補から自動選択）
- GUI設定画面（ブラウザから設定変更可能）
- 接続テスト機能の強化

## 参考ドキュメント
- `IP変更手順.md` - 詳細な運用マニュアル
- `README.md` - プロジェクト概要（IP設定方法を更新済み）
