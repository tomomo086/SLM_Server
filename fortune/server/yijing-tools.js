const fs = require('fs');
const path = require('path');

class YijingTools {
    constructor() {
        this.dataPath = path.join(__dirname, '..', 'data', 'yijing_texts');
        console.log('🔮 易経ツール初期化:', this.dataPath);
    }

    /**
     * Function Calling用のツール定義を取得
     */
    getToolsDefinition() {
        return [
            {
                type: "function",
                function: {
                    name: "get_yijing_document",
                    description: "指定されたIDの易経文献を取得します。yijing_001_020形式のIDを指定してください。",
                    parameters: {
                        type: "object",
                        properties: {
                            document_id: {
                                type: "string",
                                description: "取得したい易経文献のID (例: yijing_001_020)"
                            },
                            include_full_text: {
                                type: "string",
                                description: "全文を含めるかどうか (true/false)",
                                enum: ["true", "false"],
                                default: "false"
                            }
                        },
                        required: ["document_id"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "search_yijing_by_keyword",
                    description: "キーワードで易経文献を検索します",
                    parameters: {
                        type: "object",
                        properties: {
                            keyword: {
                                type: "string",
                                description: "検索キーワード（卦の名前など）"
                            },
                            max_results: {
                                type: "number",
                                description: "最大結果数",
                                default: 5
                            }
                        },
                        required: ["keyword"]
                    }
                }
            }
        ];
    }

    /**
     * 指定されたFunction Callingを実行
     */
    async executeFunction(functionName, parameters) {
        console.log(`🔧 易経関数実行: ${functionName}`, parameters);

        try {
            switch (functionName) {
                case 'get_yijing_document':
                    return await this.getYijingDocument(
                        parameters.document_id,
                        parameters.include_full_text === 'true'
                    );

                case 'search_yijing_by_keyword':
                    return await this.searchYijingByKeyword(
                        parameters.keyword,
                        parameters.max_results || 5
                    );

                default:
                    throw new Error(`未知の関数: ${functionName}`);
            }
        } catch (error) {
            console.error(`❌ 関数実行エラー [${functionName}]:`, error.message);
            return {
                success: false,
                error: error.message,
                function_name: functionName
            };
        }
    }

    /**
     * 易経文献を取得
     */
    async getYijingDocument(documentId, includeFullText = false) {
        try {
            const filePath = path.join(this.dataPath, `${documentId}.json`);

            if (!fs.existsSync(filePath)) {
                return {
                    success: false,
                    error: `文献が見つかりません: ${documentId}`,
                    available_documents: this.getAvailableDocuments()
                };
            }

            const fileContent = fs.readFileSync(filePath, 'utf8');
            const documentData = JSON.parse(fileContent);

            const result = {
                success: true,
                document_id: documentData.document_id,
                metadata: documentData.metadata,
                keywords: documentData.content?.extracted_keywords || [],
                yijing_hexagrams: documentData.content?.yijing_hexagrams || [],
                character_count: documentData.content?.character_count || 0
            };

            if (includeFullText) {
                result.full_text = documentData.content?.full_text || '';
            }

            console.log(`✅ 文献取得成功: ${documentId}`);
            return result;

        } catch (error) {
            console.error(`❌ 文献取得エラー: ${documentId}`, error.message);
            return {
                success: false,
                error: `文献読み込みエラー: ${error.message}`,
                document_id: documentId
            };
        }
    }

    /**
     * キーワードで易経文献を検索
     */
    async searchYijingByKeyword(keyword, maxResults = 5) {
        try {
            const availableFiles = this.getAvailableDocuments();
            const results = [];

            for (const documentId of availableFiles.slice(0, maxResults)) {
                const filePath = path.join(this.dataPath, `${documentId}.json`);

                try {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const documentData = JSON.parse(fileContent);

                    // キーワード検索
                    const keywords = documentData.content?.extracted_keywords || [];
                    const hexagrams = documentData.content?.yijing_hexagrams || [];
                    const fullText = documentData.content?.full_text || '';

                    if (keywords.includes(keyword) ||
                        hexagrams.includes(keyword) ||
                        fullText.includes(keyword)) {

                        results.push({
                            document_id: documentData.document_id,
                            title: documentData.metadata?.title || 'タイトル不明',
                            page_range: documentData.metadata?.page_range || {},
                            matching_keywords: keywords.filter(k => k.includes(keyword)),
                            matching_hexagrams: hexagrams.filter(h => h.includes(keyword))
                        });
                    }
                } catch (fileError) {
                    console.warn(`⚠️ ファイル読み込みスキップ: ${documentId}`, fileError.message);
                }
            }

            console.log(`🔍 キーワード検索完了: "${keyword}" -> ${results.length}件`);
            return {
                success: true,
                keyword: keyword,
                results_count: results.length,
                results: results
            };

        } catch (error) {
            console.error(`❌ 検索エラー: ${keyword}`, error.message);
            return {
                success: false,
                error: `検索エラー: ${error.message}`,
                keyword: keyword
            };
        }
    }

    /**
     * 利用可能な文献のリストを取得
     */
    getAvailableDocuments() {
        try {
            if (!fs.existsSync(this.dataPath)) {
                console.warn('⚠️ 易経データディレクトリが存在しません:', this.dataPath);
                return [];
            }

            const files = fs.readdirSync(this.dataPath);
            return files
                .filter(file => file.startsWith('yijing_') && file.endsWith('.json'))
                .map(file => file.replace('.json', ''))
                .sort();
        } catch (error) {
            console.error('❌ 利用可能文献取得エラー:', error.message);
            return [];
        }
    }

    /**
     * デバッグ用: すべての文献の概要を取得
     */
    async getAllDocumentsSummary() {
        const available = this.getAvailableDocuments();
        const summaries = [];

        for (const documentId of available) {
            const doc = await this.getYijingDocument(documentId, false);
            if (doc.success) {
                summaries.push({
                    document_id: documentId,
                    title: doc.metadata?.title,
                    page_range: doc.metadata?.page_range,
                    keywords_count: doc.keywords?.length || 0,
                    hexagrams_count: doc.yijing_hexagrams?.length || 0
                });
            }
        }

        return {
            success: true,
            total_documents: available.length,
            documents: summaries
        };
    }
}

module.exports = YijingTools;