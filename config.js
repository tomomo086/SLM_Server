/**
 * SLM Server 共通設定ファイル
 *
 * LM Studio APIのエンドポイントを一元管理
 * IPアドレスが変更された場合は、このファイルのみ編集すればOK
 */

const CONFIG = {
    // LM Studio API URL（メイン設定）
    LM_STUDIO_URL: 'http://192.168.2.109:1234',

    // 各アシスタントのポート番号
    PORTS: {
        recipe: 3000,
        fortune: 3001,
        robotics: 3002
    },

    // デフォルトモデル設定
    DEFAULT_MODEL: 'local-model',

    // タイムアウト設定（ミリ秒）
    TIMEOUT: 30000
};

// Node.js環境（バックエンド）用のエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// ブラウザ環境（フロントエンド）用のグローバル変数
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
