// 固定のAPI設定
const API_CONFIG = {
    url: 'http://192.168.2.107:1234',
    model: 'local-model' // デフォルトモデル名
};

// 占い知識データ
let FORTUNE_KNOWLEDGE_DATA = [];

// 易経知識データ（新規追加）
let YIJING_COMPLETE_KNOWLEDGE = null;
let YIJING_FUNCTIONS = null;

// 占い知識データを読み込む関数
async function loadFortuneKnowledgeData() {
    try {
        // 基本的な占い知識データ
        const response = await fetch('data/fortune-knowledge.json');
        if (response.ok) {
            FORTUNE_KNOWLEDGE_DATA = await response.json();
            console.log('🔮 占い知識データ読み込み完了:', FORTUNE_KNOWLEDGE_DATA.length, '件');
        } else {
            console.error('占い知識データの読み込みに失敗しました');
        }

        // 易経完全知識データ
        const yijingResponse = await fetch('data/yijing-complete-knowledge.json');
        if (yijingResponse.ok) {
            YIJING_COMPLETE_KNOWLEDGE = await yijingResponse.json();
            console.log('📚 易経完全知識データ読み込み完了:', YIJING_COMPLETE_KNOWLEDGE.documents.length, '文書');
        } else {
            console.warn('易経完全知識データの読み込みに失敗しました');
        }

        // 易経関数定義
        const functionsResponse = await fetch('data/yijing-functions.json');
        if (functionsResponse.ok) {
            YIJING_FUNCTIONS = await functionsResponse.json();
            console.log('⚙️ 易経関数定義読み込み完了:', YIJING_FUNCTIONS.functions.length, '関数');
        } else {
            console.warn('易経関数定義の読み込みに失敗しました');
        }

        // 読み込み結果の表示
        if (FORTUNE_KNOWLEDGE_DATA.length > 0) {
            if (YIJING_COMPLETE_KNOWLEDGE && YIJING_FUNCTIONS) {
                showStatus('✓ 基本知識＋易経知識（660ページ）読み込み完了');
            } else {
                showStatus('✓ 基本知識データが読み込まれました');
            }
        } else {
            showStatus('⚠️ 知識データの読み込みに失敗しました', true);
        }
    } catch (error) {
        console.error('知識データ読み込みエラー:', error);
        showStatus('⚠️ 知識データの読み込みエラー', true);
    }
}

// Function Tools定義（占い知識検索用）
const FUNCTION_TOOLS = [
    {
        type: "function",
        function: {
            name: "search_fortune_knowledge",
            description: "占いの知識を検索します",
            parameters: {
                type: "object",
                properties: {
                    keyword: {
                        type: "string",
                        description: "検索キーワード（卦名、意味、キーワードなど）"
                    },
                    category: {
                        type: "string",
                        description: "カテゴリ（hexagram: 六十四卦、element: 五行、direction: 方位など）",
                        enum: ["hexagram", "element", "direction", "season", "all"]
                    }
                },
                required: ["keyword"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_hexagram_detail",
            description: "特定の卦の詳細情報を取得します",
            parameters: {
                type: "object",
                properties: {
                    hexagram_id: {
                        type: "string",
                        description: "卦のID（例：hexagram_001）"
                    }
                },
                required: ["hexagram_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "perform_divination",
            description: "易占いを実行します",
            parameters: {
                type: "object",
                properties: {
                    question: {
                        type: "string",
                        description: "占いたい質問や相談内容"
                    },
                    method: {
                        type: "string",
                        description: "占い方法（coin: コイン法、yarrow: 筮竹法）",
                        enum: ["coin", "yarrow"]
                    }
                },
                required: ["question"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_yijing_content",
            description: "易経の内容をキーワードで検索し、関連する文書を取得する",
            parameters: {
                type: "object",
                properties: {
                    keyword: {
                        type: "string",
                        description: "検索キーワード（卦名、概念、人名など）"
                    },
                    page_range: {
                        type: "string",
                        description: "ページ範囲（例: '1-100', '201-300'）",
                        enum: ["1-100", "101-200", "201-300", "301-400", "401-500", "501-600", "601-660"]
                    }
                },
                required: ["keyword"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_yijing_document",
            description: "特定の文書IDで易経の内容を取得する",
            parameters: {
                type: "object",
                properties: {
                    document_id: {
                        type: "string",
                        description: "文書ID（例: 'yijing_001_020'）"
                    },
                    include_full_text: {
                        type: "boolean",
                        description: "全文を含めるかどうか（デフォルト: false）",
                        default: false
                    }
                },
                required: ["document_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_hexagram_info",
            description: "特定の卦（hexagram）に関する詳細情報を易経から取得する",
            parameters: {
                type: "object",
                properties: {
                    hexagram_name: {
                        type: "string",
                        description: "卦名（例: '乾', '坤', '屯'など）",
                        enum: ["乾", "坤", "屯", "蒙", "需", "訟", "師", "比", "小畜", "履", "泰", "否", "同人", "大有", "謙", "豫", "随", "蛊", "臨", "観", "噬嗑", "賁", "剥", "復", "無妄", "大畜", "頤", "大過", "坎", "離", "咸", "恒", "遯", "大壮", "晋", "明夷", "家人", "睽", "蹇", "解", "損", "益", "夬", "姤", "萃", "升", "困", "井", "革", "鼎", "震", "艮", "漸", "帰妹", "豊", "旅", "巽", "兌", "渙", "節", "中孚", "小過", "既済", "未済"]
                    }
                },
                required: ["hexagram_name"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_by_topic",
            description: "特定のトピック（伝の種類など）で検索する",
            parameters: {
                type: "object",
                properties: {
                    topic: {
                        type: "string",
                        description: "トピック名",
                        enum: ["序卦伝", "雑卦伝", "繋辞伝", "象伝", "文言伝", "説卦伝", "経", "伝", "解説"]
                    }
                },
                required: ["topic"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_full_text",
            description: "易経の全文から詳細検索を行う（個別ファイルの内容も含む）",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "検索クエリ（文章、単語、概念など）"
                    },
                    max_results: {
                        type: "number",
                        description: "最大結果数（デフォルト: 10）",
                        default: 10
                    },
                    context_length: {
                        type: "number",
                        description: "文脈表示文字数（デフォルト: 200）",
                        default: 200
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_page_content",
            description: "特定のページ番号の内容を取得する",
            parameters: {
                type: "object",
                properties: {
                    page_number: {
                        type: "number",
                        description: "ページ番号（1-660）"
                    },
                    context_pages: {
                        type: "number",
                        description: "前後のページも含める数（デフォルト: 0）",
                        default: 0
                    }
                },
                required: ["page_number"]
            }
        }
    }
];

// ローカルFunction実行（占い知識検索用）
// ページ内容取得関数（SLM向け最適化）
async function getPageContent(parameters) {
    const { page_number, context_pages = 0 } = parameters;

    console.log(`📄 ページ内容取得: ${page_number}ページ (前後${context_pages}ページ含む)`);

    // 入力値検証
    if (!page_number || page_number < 1 || page_number > 660) {
        return { 
            error: true, 
            message: "ページ番号は1-660の範囲で指定してください" 
        };
    }

    try {
        if (!YIJING_COMPLETE_KNOWLEDGE || !YIJING_COMPLETE_KNOWLEDGE.document_index) {
            return { 
                error: true, 
                message: "易経知識データが読み込まれていません" 
            };
        }

        console.log(`🔍 全体データ構造:`, YIJING_COMPLETE_KNOWLEDGE.collection_metadata);
        console.log(`📋 インデックス数:`, YIJING_COMPLETE_KNOWLEDGE.document_index.length);

        // 指定ページを含む文書を検索
        const targetDoc = YIJING_COMPLETE_KNOWLEDGE.document_index.find(doc => {
            const [startPage, endPage] = doc.page_range;
            return page_number >= startPage && page_number <= endPage;
        });

        if (!targetDoc) {
            return { 
                error: true, 
                message: `ページ${page_number}が見つかりません` 
            };
        }

        console.log(`📖 対象文書見つかりました:`, targetDoc.document_id);

        // 個別ファイルから詳細内容を取得を試行
        let detailContent = null;
        try {
            // 個別ファイルが存在する場合の読み込み
            const detailResponse = await fetch(`data/yijing_texts/${targetDoc.file_path}`);
            if (detailResponse.ok) {
                detailContent = await detailResponse.json();
                console.log(`📄 詳細ファイル読み込み成功: ${targetDoc.file_path}`);
            } else {
                console.warn(`⚠️ 詳細ファイル読み込み失敗: ${detailResponse.status}`);
            }
        } catch (error) {
            console.warn(`⚠️ 詳細ファイルアクセスエラー:`, error.message);
        }

        // SLM向け最適化: 要約形式で返却
        const result = {
            success: true,
            page_info: {
                page_number,
                document_id: targetDoc.document_id,
                page_range: `${targetDoc.page_range[0]}-${targetDoc.page_range[1]}`,
                character_count: targetDoc.character_count
            },
            main_topics: targetDoc.main_topics || [],
            related_hexagrams: targetDoc.hexagrams || [],
            summary: extractPageSummary(detailContent, targetDoc, page_number),
            key_concepts: extractKeyConcepts(targetDoc),
            navigation: {
                has_previous: page_number > 1,
                has_next: page_number < 660,
                previous_page: page_number > 1 ? page_number - 1 : null,
                next_page: page_number < 660 ? page_number + 1 : null
            }
        };

        // 前後ページの情報も含める場合
        if (context_pages > 0) {
            result.context_pages = getContextPages(page_number, context_pages);
        }

        console.log(`✅ ページ内容取得完了:`, result.page_info);
        return result;

    } catch (error) {
        console.error('ページ内容取得エラー:', error);
        return { 
            error: true, 
            message: `ページ内容の取得に失敗しました: ${error.message}` 
        };
    }
}

// ページ要約抽出（SLM向け最適化）
function extractPageSummary(detailContent, docInfo, pageNumber) {
    // 詳細コンテンツが利用できる場合
    if (detailContent && detailContent.content) {
        const content = detailContent.content;
        
        // コンテンツの最初の300文字を要約として使用
        if (typeof content === 'string') {
            const summary = content.substring(0, 300);
            return summary.length < content.length ? summary + "..." : summary;
        }

        // 構造化されたコンテンツの場合
        if (content.sections && content.sections.length > 0) {
            const firstSection = content.sections[0];
            if (firstSection.text) {
                const summary = firstSection.text.substring(0, 300);
                return summary.length < firstSection.text.length ? summary + "..." : summary;
            }
        }
    }

    // 詳細コンテンツが利用できない場合、docInfoから要約を作成
    const summaryParts = [];
    
    // ページ範囲の情報
    summaryParts.push(`ページ${pageNumber}は${docInfo.document_id}文書に含まれています（${docInfo.page_range[0]}-${docInfo.page_range[1]}ページ）。`);
    
    // 関連する卦の情報
    if (docInfo.hexagrams && docInfo.hexagrams.length > 0) {
        const hexagramList = docInfo.hexagrams.slice(0, 5).join('、');
        summaryParts.push(`関連する卦：${hexagramList}など。`);
    }
    
    // トピック情報
    if (docInfo.main_topics && docInfo.main_topics.length > 0) {
        const topicList = docInfo.main_topics.slice(0, 3).join('、');
        summaryParts.push(`主要トピック：${topicList}。`);
    }
    
    // 文字数情報
    summaryParts.push(`全体で${docInfo.character_count}文字の内容が含まれています。`);
    
    return summaryParts.join(' ') || "要約情報が利用できません";
}

// キー概念抽出
function extractKeyConcepts(docInfo) {
    const concepts = [];
    
    // 卦名から概念を抽出
    if (docInfo.hexagrams && docInfo.hexagrams.length > 0) {
        concepts.push(...docInfo.hexagrams.slice(0, 5)); // 最初の5つの卦
    }
    
    // トピックから概念を抽出
    if (docInfo.main_topics && docInfo.main_topics.length > 0) {
        concepts.push(...docInfo.main_topics.slice(0, 3)); // 最初の3つのトピック
    }
    
    return concepts.filter((item, index, array) => array.indexOf(item) === index); // 重複除去
}

// 前後ページ情報取得
function getContextPages(centerPage, contextRange) {
    const startPage = Math.max(1, centerPage - contextRange);
    const endPage = Math.min(660, centerPage + contextRange);
    
    const contextInfo = {
        range: `${startPage}-${endPage}`,
        pages: []
    };
    
    for (let page = startPage; page <= endPage; page++) {
        if (page !== centerPage) {
            const docInfo = YIJING_COMPLETE_KNOWLEDGE.document_index.find(doc => {
                const [start, end] = doc.page_range;
                return page >= start && page <= end;
            });
            
            if (docInfo) {
                contextInfo.pages.push({
                    page_number: page,
                    document_id: docInfo.document_id,
                    hexagrams: docInfo.hexagrams ? docInfo.hexagrams.slice(0, 3) : []
                });
            }
        }
    }
    
    return contextInfo;
}

async function executeLocalFunction(functionName, parameters) {
    console.log(`⚙️ ローカル関数「${functionName}」実行中...`, parameters);

    switch (functionName) {
        case 'search_fortune_knowledge':
            return searchFortuneKnowledge(parameters);
        case 'get_hexagram_detail':
            return getHexagramDetail(parameters);
        case 'perform_divination':
            return performDivination(parameters);
        case 'search_yijing_content':
            return searchYijingContent(parameters);
        case 'get_yijing_document':
            return await getYijingDocument(parameters);
        case 'get_hexagram_info':
            return getHexagramInfo(parameters);
        case 'search_by_topic':
            return searchByTopic(parameters);
        case 'search_full_text':
            return await searchFullText(parameters);
        case 'get_page_content':
            return await getPageContent(parameters);
        default:
            return { error: true, message: `未知の関数: ${functionName}` };
    }
}

// 易占い実行関数（最小限実装）
function performDivination(parameters) {
    const { question, method = 'coin' } = parameters;

    console.log(`🔮 易占い実行: ${question} (方法: ${method})`);

    // シンプルな擬似乱数生成で卦を決定
    const timestamp = Date.now();
    const hexagramNumber = (timestamp % 64) + 1;
    const changingLines = [];

    // 変爻をランダムに決定（0-2個）
    const numChanging = timestamp % 3;
    for (let i = 0; i < numChanging; i++) {
        const linePos = ((timestamp + i * 17) % 6) + 1;
        if (!changingLines.includes(linePos)) {
            changingLines.push(linePos);
        }
    }

    const result = {
        question: question,
        method: method,
        hexagram_number: hexagramNumber,
        hexagram_name: `第${hexagramNumber}卦`,
        changing_lines: changingLines,
        interpretation: `質問「${question}」に対して、第${hexagramNumber}卦が出ました。${changingLines.length > 0 ? `変爻: ${changingLines.join('、')}` : '変爻なし'}`,
        timestamp: new Date().toLocaleString('ja-JP')
    };

    console.log('✨ 占い結果:', result);
    return result;
}
    
// 占い知識検索関数
function searchFortuneKnowledge(parameters) {
    const { keyword, category = 'all' } = parameters;
    
    if (!FORTUNE_KNOWLEDGE_DATA || FORTUNE_KNOWLEDGE_DATA.length === 0) {
        return { 
            success: false, 
            message: '占い知識データが読み込まれていません' 
        };
    }

    const searchText = keyword ? keyword.toLowerCase() : '';
    const searchWords = searchText.split(/[\s　]+/).filter(word => word.length > 0);
    
    console.log(`🔍 占い知識検索: "${keyword}" (カテゴリ: ${category})`);
    console.log(`🔍 検索ワード: [${searchWords.join(', ')}]`);

    const results = FORTUNE_KNOWLEDGE_DATA.map(hexagram => {
        let score = 0;
        
        // 卦名マッチング: +30点
        if (searchWords.length > 0) {
            const nameLower = hexagram.name.toLowerCase();
            const matchedWords = searchWords.filter(word => nameLower.includes(word));
            score += matchedWords.length * 30;
            if (matchedWords.length > 0) {
                console.log(`📊 卦名マッチ: ${matchedWords.length}個 (${matchedWords.join(', ')}) → +${matchedWords.length * 30}点`);
            }
        }

        // 説明文マッチング: +20点
        if (searchWords.length > 0) {
            const descLower = hexagram.description.toLowerCase();
            const matchedWords = searchWords.filter(word => descLower.includes(word));
            score += matchedWords.length * 20;
            if (matchedWords.length > 0) {
                console.log(`📝 説明マッチ: ${matchedWords.length}個 → +${matchedWords.length * 20}点`);
            }
        }

        // 意味マッチング: +15点
        if (searchWords.length > 0) {
            const meaningLower = hexagram.meaning.toLowerCase();
            const matchedWords = searchWords.filter(word => meaningLower.includes(word));
            score += matchedWords.length * 15;
            if (matchedWords.length > 0) {
                console.log(`💭 意味マッチ: ${matchedWords.length}個 → +${matchedWords.length * 15}点`);
            }
        }

        // キーワードマッチング: +25点
        if (searchWords.length > 0 && hexagram.keywords) {
            searchWords.forEach(word => {
                const keywordMatches = hexagram.keywords.filter(keyword => 
                    keyword.toLowerCase().includes(word)
                );
                if (keywordMatches.length > 0) {
                    score += keywordMatches.length * 25;
                    console.log(`🏷️ キーワードマッチ: ${keywordMatches.length}個 (${keywordMatches.join(', ')}) → +${keywordMatches.length * 25}点`);
                }
            });
        }

        // 五行マッチング: +20点
        if (searchWords.length > 0 && hexagram.elements) {
            searchWords.forEach(word => {
                const elementMatches = hexagram.elements.filter(element => 
                    element.toLowerCase().includes(word)
                );
                if (elementMatches.length > 0) {
                    score += elementMatches.length * 20;
                    console.log(`🌿 五行マッチ: ${elementMatches.length}個 (${elementMatches.join(', ')}) → +${elementMatches.length * 20}点`);
                }
            });
        }

        // 方位マッチング: +15点
        if (searchWords.length > 0 && hexagram.direction) {
            const directionLower = hexagram.direction.toLowerCase();
            const matchedWords = searchWords.filter(word => directionLower.includes(word));
            score += matchedWords.length * 15;
            if (matchedWords.length > 0) {
                console.log(`🧭 方位マッチ: ${matchedWords.length}個 → +${matchedWords.length * 15}点`);
            }
        }

        // 季節マッチング: +15点
        if (searchWords.length > 0 && hexagram.season) {
            const seasonLower = hexagram.season.toLowerCase();
            const matchedWords = searchWords.filter(word => seasonLower.includes(word));
            score += matchedWords.length * 15;
            if (matchedWords.length > 0) {
                console.log(`🌸 季節マッチ: ${matchedWords.length}個 → +${matchedWords.length * 15}点`);
            }
        }

        return { ...hexagram, score };
    });

    const sortedResults = results
        .filter(hexagram => hexagram.score > 0)
        .sort((a, b) => b.score - a.score);
    
    console.log(`📈 占い知識検索結果: ${sortedResults.length}件`);
    sortedResults.forEach((hexagram, index) => {
        console.log(`${index + 1}. "${hexagram.name}" (スコア: ${hexagram.score})`);
    });

    return {
        success: true,
        count: sortedResults.length,
        hexagrams: sortedResults.slice(0, 10)
    };
}

// 卦の詳細取得関数
function getHexagramDetail(parameters) {
    const { hexagram_id } = parameters;
    const hexagram = FORTUNE_KNOWLEDGE_DATA.find(h => h.id === hexagram_id);
    
    if (hexagram) {
        return { 
            success: true, 
            hexagram: hexagram 
        };
    } else {
        return { 
            success: false, 
            message: `卦ID "${hexagram_id}" が見つかりません` 
        };
    }
}

// 易経コンテンツ検索関数
function searchYijingContent(parameters) {
    const { keyword, page_range } = parameters;
    
    if (!YIJING_COMPLETE_KNOWLEDGE || !YIJING_COMPLETE_KNOWLEDGE.documents) {
        return { 
            success: false, 
            message: '易経知識データが読み込まれていません' 
        };
    }
    
    console.log(`📚 易経コンテンツ検索: "${keyword}"${page_range ? ` (ページ範囲: ${page_range})` : ''}`);
    
    const searchText = keyword.toLowerCase();
    const results = [];
    
    YIJING_COMPLETE_KNOWLEDGE.documents.forEach(doc => {
        // ページ範囲フィルタリング
        if (page_range) {
            const [startPage, endPage] = page_range.split('-').map(Number);
            const docStartPage = parseInt(doc.id.split('_')[1]);
            if (docStartPage < startPage || docStartPage > endPage) {
                return;
            }
        }
        
        let score = 0;
        const matchDetails = [];
        
        // タイトルマッチング
        if (doc.title && doc.title.toLowerCase().includes(searchText)) {
            score += 50;
            matchDetails.push(`タイトル: ${doc.title}`);
        }
        
        // キーワードマッチング
        if (doc.keywords) {
            const matchedKeywords = doc.keywords.filter(k => 
                k.toLowerCase().includes(searchText)
            );
            if (matchedKeywords.length > 0) {
                score += matchedKeywords.length * 30;
                matchDetails.push(`キーワード: ${matchedKeywords.join(', ')}`);
            }
        }
        
        // トピックマッチング
        if (doc.topics) {
            const matchedTopics = doc.topics.filter(t => 
                t.toLowerCase().includes(searchText)
            );
            if (matchedTopics.length > 0) {
                score += matchedTopics.length * 25;
                matchDetails.push(`トピック: ${matchedTopics.join(', ')}`);
            }
        }
        
        if (score > 0) {
            results.push({
                id: doc.id,
                title: doc.title,
                page_range: doc.page_range,
                score: score,
                match_details: matchDetails,
                summary: doc.content ? doc.content.substring(0, 200) + '...' : '（要約なし）'
            });
        }
    });
    
    const sortedResults = results.sort((a, b) => b.score - a.score);
    
    console.log(`📊 易経検索結果: ${sortedResults.length}件`);
    
    return {
        success: true,
        keyword: keyword,
        page_range: page_range,
        count: sortedResults.length,
        results: sortedResults.slice(0, 10)
    };
}

// 易経文書取得関数
async function getYijingDocument(parameters) {
    const { document_id, include_full_text = false } = parameters;
    
    if (!YIJING_COMPLETE_KNOWLEDGE || !YIJING_COMPLETE_KNOWLEDGE.documents) {
        return { 
            success: false, 
            message: '易経知識データが読み込まれていません' 
        };
    }
    
    const document = YIJING_COMPLETE_KNOWLEDGE.documents.find(doc => doc.id === document_id);
    
    if (!document) {
        return {
            success: false,
            message: `文書ID "${document_id}" が見つかりません`
        };
    }
    
    console.log(`📖 易経文書取得: ${document_id} (全文: ${include_full_text})`);
    
    const result = {
        success: true,
        document: {
            id: document.id,
            title: document.title,
            page_range: document.page_range,
            character_count: document.character_count,
            keywords: document.keywords,
            topics: document.topics
        }
    };
    
    if (include_full_text) {
        // 詳細ファイルから全文を読み込み
        try {
            const detailResponse = await fetch(`data/yijing_texts/${document_id}.json`);
            if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                result.document.content = detailData.content;
                result.document.full_text_loaded = true;
                console.log(`📚 詳細ファイル読み込み成功: ${detailData.content.length}文字`);
            } else {
                // フォールバック: マスターファイルの内容を使用
                result.document.content = document.content || '（詳細ファイル読み込み失敗）';
                result.document.full_text_loaded = false;
                console.warn(`⚠️ 詳細ファイル読み込み失敗、マスターデータを使用`);
            }
        } catch (error) {
            console.error(`❌ 詳細ファイル読み込みエラー:`, error);
            result.document.content = document.content || '（読み込みエラー）';
            result.document.full_text_loaded = false;
        }
    } else {
        result.document.summary = document.content ? 
            document.content.substring(0, 500) + '...' : 
            '（内容なし）';
    }
    
    return result;
}

// 卦情報取得関数（易経版）
function getHexagramInfo(parameters) {
    const { hexagram_name } = parameters;
    
    if (!YIJING_COMPLETE_KNOWLEDGE || !YIJING_COMPLETE_KNOWLEDGE.documents) {
        return { 
            success: false, 
            message: '易経知識データが読み込まれていません' 
        };
    }
    
    console.log(`☯️ 卦情報取得（易経）: ${hexagram_name}`);
    
    const results = [];
    
    YIJING_COMPLETE_KNOWLEDGE.documents.forEach(doc => {
        let relevanceScore = 0;
        const matchDetails = [];
        
        // タイトルに卦名が含まれているかチェック
        if (doc.title && doc.title.includes(hexagram_name)) {
            relevanceScore += 100;
            matchDetails.push(`タイトル: ${doc.title}`);
        }
        
        // キーワードに卦名が含まれているかチェック
        if (doc.keywords && doc.keywords.some(k => k.includes(hexagram_name))) {
            relevanceScore += 80;
            const matchedKeywords = doc.keywords.filter(k => k.includes(hexagram_name));
            matchDetails.push(`キーワード: ${matchedKeywords.join(', ')}`);
        }
        
        // 内容に卦名が含まれているかチェック
        if (doc.content && doc.content.includes(hexagram_name)) {
            const occurrences = (doc.content.match(new RegExp(hexagram_name, 'g')) || []).length;
            relevanceScore += occurrences * 20;
            matchDetails.push(`内容中の出現回数: ${occurrences}回`);
        }
        
        if (relevanceScore > 0) {
            results.push({
                id: doc.id,
                title: doc.title,
                page_range: doc.page_range,
                relevance_score: relevanceScore,
                match_details: matchDetails,
                summary: doc.content ? doc.content.substring(0, 300) + '...' : '（内容なし）'
            });
        }
    });
    
    const sortedResults = results.sort((a, b) => b.relevance_score - a.relevance_score);
    
    console.log(`☯️ ${hexagram_name}卦の情報: ${sortedResults.length}件の関連文書`);
    
    return {
        success: true,
        hexagram_name: hexagram_name,
        count: sortedResults.length,
        documents: sortedResults.slice(0, 5)
    };
}

// トピック検索関数
function searchByTopic(parameters) {
    const { topic } = parameters;
    
    if (!YIJING_COMPLETE_KNOWLEDGE || !YIJING_COMPLETE_KNOWLEDGE.documents) {
        return { 
            success: false, 
            message: '易経知識データが読み込まれていません' 
        };
    }
    
    console.log(`🏷️ トピック検索: ${topic}`);
    
    const results = [];
    
    YIJING_COMPLETE_KNOWLEDGE.documents.forEach(doc => {
        let isRelevant = false;
        const matchDetails = [];
        
        // タイトルにトピックが含まれているかチェック
        if (doc.title && doc.title.includes(topic)) {
            isRelevant = true;
            matchDetails.push(`タイトル: ${doc.title}`);
        }
        
        // トピック配列にトピックが含まれているかチェック
        if (doc.topics && doc.topics.some(t => t.includes(topic))) {
            isRelevant = true;
            const matchedTopics = doc.topics.filter(t => t.includes(topic));
            matchDetails.push(`トピック: ${matchedTopics.join(', ')}`);
        }
        
        // 内容にトピックが含まれているかチェック
        if (doc.content && doc.content.includes(topic)) {
            isRelevant = true;
            const occurrences = (doc.content.match(new RegExp(topic, 'g')) || []).length;
            matchDetails.push(`内容中の出現回数: ${occurrences}回`);
        }
        
        if (isRelevant) {
            results.push({
                id: doc.id,
                title: doc.title,
                page_range: doc.page_range,
                match_details: matchDetails,
                summary: doc.content ? doc.content.substring(0, 250) + '...' : '（内容なし）'
            });
        }
    });
    
    console.log(`🏷️ "${topic}"トピックの検索結果: ${results.length}件`);
    
    return {
        success: true,
        topic: topic,
        count: results.length,
        documents: results
    };
}

// ツール実行状況を表示する関数
function addFunctionCallingStatus(functionCalls) {
    console.log('🏗️ addFunctionCallingStatus開始:', functionCalls);
    const statusDiv = document.createElement('div');
    statusDiv.className = 'function-calling-status';
    console.log('📦 statusDiv作成完了:', statusDiv);
    
    const header = document.createElement('div');
    header.innerHTML = `🔧 <strong>Function Calling実行中...</strong> (${functionCalls.length}個の関数)`;
    statusDiv.appendChild(header);
    console.log('📋 header追加完了');
    
    functionCalls.forEach((call, index) => {
        const callItem = document.createElement('div');
        callItem.className = 'function-call-item';
        
        const params = JSON.parse(call.function.arguments);
        const paramStr = Object.keys(params).map(key => 
            `${key}: "${params[key]}"`
        ).join(', ');
        
        callItem.innerHTML = `
            <span class="icon">⚙️</span>
            <span class="function-name">${call.function.name}</span>
            <span class="function-params">(${paramStr})</span>
        `;
        
        statusDiv.appendChild(callItem);
        console.log(`⚙️ callItem ${index + 1} 追加完了:`, call.function.name);
    });
    
    const messagesDiv = document.getElementById('messages');
    console.log('📱 messagesDiv取得:', messagesDiv ? 'あり' : 'なし');
    messagesDiv.appendChild(statusDiv);
    messagesDiv.scrollTop = 999999;
    console.log('✅ statusDiv DOM追加完了');
    return statusDiv;
}

// ツール実行結果を表示する関数
function updateFunctionCallingStatus(statusDiv, results) {
    console.log('🔄 updateFunctionCallingStatus開始:', statusDiv, results);
    const resultSummary = document.createElement('div');
    resultSummary.className = 'function-result-summary';
    console.log('📦 resultSummary作成完了');
    
    let totalResults = 0;
    let successCount = 0;
    let resultDetails = [];
    
    results.forEach(result => {
        try {
            const parsed = JSON.parse(result.content);
            console.log('📊 parsed result:', parsed);
            
            // 様々な戻り値形式に対応
            if (parsed.success === true || parsed.success === undefined) {
                successCount++;
                
                // カウント値の取得（複数の可能性に対応）
                if (parsed.count !== undefined) {
                    totalResults += parsed.count;
                    resultDetails.push(`${parsed.count}件`);
                } else if (parsed.documents && parsed.documents.length) {
                    totalResults += parsed.documents.length;
                    resultDetails.push(`${parsed.documents.length}件`);
                } else if (parsed.results && parsed.results.length) {
                    totalResults += parsed.results.length;
                    resultDetails.push(`${parsed.results.length}件`);
                } else if (parsed.hexagrams && parsed.hexagrams.length) {
                    totalResults += parsed.hexagrams.length;
                    resultDetails.push(`${parsed.hexagrams.length}件`);
                } else if (parsed.page_info) {
                    // getPageContent の場合
                    totalResults += 1;
                    resultDetails.push(`${parsed.page_info.page_number}ページの情報`);
                } else {
                    // 成功したが数値データが不明な場合
                    totalResults += 1;
                    resultDetails.push('1件の情報');
                }
            }
        } catch (error) {
            console.warn('結果解析エラー:', error);
        }
    });
    
    console.log('🔢 totalResults:', totalResults, 'successCount:', successCount);
    
    // 表示メッセージの生成
    let displayMessage;
    if (totalResults > 0) {
        displayMessage = `✅ <strong>実行完了</strong> - ${totalResults}件のデータを取得`;
    } else if (successCount > 0) {
        displayMessage = `✅ <strong>実行完了</strong> - ${successCount}個の関数が正常実行`;
    } else {
        displayMessage = `⚠️ <strong>実行完了</strong> - 結果の解析に問題があります`;
    }
    
    resultSummary.innerHTML = displayMessage;
    statusDiv.appendChild(resultSummary);
    console.log('✅ resultSummary DOM追加完了');
}

function addMessage(text, isUser, useTypingEffect = false) {
    const div = document.createElement('div');
    div.className = 'message ' + (isUser ? 'user' : 'ai');
    
    // デバッグ用ログ
    console.log('addMessage called:', { text: text.substring(0, 50), isUser, useTypingEffect });
    
    // AIメッセージに詳細表示ボタンを追加（ウェルカムメッセージ以外）
    if (!isUser) {
        // ウェルカムメッセージかどうかをテキスト内容で判定
        const isWelcomeMessage = text.includes('易占いアシスタントへようこそ');
        
        console.log('AI message detected, isWelcomeMessage:', isWelcomeMessage);
        
        if (!isWelcomeMessage) {
            // メッセージコンテナを作成
            const messageContainer = document.createElement('div');
            messageContainer.className = 'message-container';
            
            // メッセージテキスト部分
            const messageText = document.createElement('div');
            messageText.className = 'message-text';
            
            // 詳細表示ボタン
            const detailButton = document.createElement('button');
            detailButton.className = 'detail-btn';
            detailButton.innerHTML = '📖';
            detailButton.title = '詳細表示';
            detailButton.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('Detail button clicked');
                showMessageModal(text);
            });
            
            console.log('Button created and added');
            
            // 要素を組み合わせ
            messageContainer.appendChild(messageText);
            messageContainer.appendChild(detailButton);
            div.appendChild(messageContainer);
            
            // DOMに追加してからタイピング効果を開始
            document.getElementById('messages').appendChild(div);
            document.getElementById('messages').scrollTop = 999999;
            
            // タイピング効果を適用
            if (useTypingEffect) {
                console.log('🎬 タイピング効果開始:', text.substring(0, 30));
                typewriteText(messageText, text);
            } else {
                messageText.textContent = text;
            }
            
            return; // 早期リターンで重複追加を防ぐ
        } else {
            // ウェルカムメッセージは従来通り
            div.textContent = text;
            div.classList.add('welcome-message');
        }
    } else {
        // ユーザーメッセージは従来通り
        div.textContent = text;
    }
    
    document.getElementById('messages').appendChild(div);
    document.getElementById('messages').scrollTop = 999999;
}

function showStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.className = 'status ' + (isError ? 'error' : 'success');
    statusDiv.textContent = message;
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, true);
    input.value = '';
    sendBtn.disabled = true;
    sendBtn.textContent = '送信中...';

    try {
        // AIの応答用のメッセージ要素を作成
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai';
        aiMessageDiv.textContent = '';
        document.getElementById('messages').appendChild(aiMessageDiv);
        document.getElementById('messages').scrollTop = 999999;

        const response = await fetch(API_CONFIG.url + '/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    {
                        role: "system",
                        content: `あなたは「占い知識アシスタント」です。古代中国の易学（周易）の専門家として、占いの知識を提供し、人生の悩みや疑問にお答えします。

あなたの専門知識:
- 六十四卦: 乾・坤から始まる64の卦象とその意味
- 八卦: 乾☰・兌☱・離☲・震☳・巽☴・坎☵・艮☶・坤☷の基本八卦
- 五行思想: 木・火・土・金・水の相生・相克関係
- 陰陽思想: 陰爻と陽爻の調和とバランス

利用可能な関数:
- search_fortune_knowledge: 占いの知識を検索します（卦名、意味、キーワードなど）
- get_hexagram_detail: 特定の卦の詳細情報を取得します
- perform_divination: 易占いを実行します（筮竹法・コイン法）
- search_yijing_content: 易経の内容をキーワードで検索し、関連する文書を取得する（660ページの詳細知識）
- get_yijing_document: 特定の文書IDで易経の内容を取得する
- get_hexagram_info: 特定の卦に関する詳細情報を易経から取得する
- search_by_topic: 特定のトピック（序卦伝、雑卦伝等）で検索する

【重要】ユーザーが以下のような質問をした場合は、適切な関数を実行してください：
- 卦の意味や知識について → search_fortune_knowledge または search_yijing_content
- 特定の卦の詳細 → get_hexagram_detail または get_hexagram_info
- 占いや運勢に関する質問 → perform_divination
- 人生の選択で迷っている相談 → perform_divination
- 恋愛、仕事、健康、人間関係の悩み → perform_divination
- 易経の詳細な解説や古典的な解釈について → search_yijing_content, get_hexagram_info
- 特定のページ範囲の内容について → search_yijing_content（page_rangeを指定）
- 序卦伝、雑卦伝、繋辞伝などの特定の伝について → search_by_topic
- 特定の文書ID（yijing_001_020等）の詳細 → get_yijing_document

回答スタイル:
- 古風で丁寧、かつ親しみやすい口調
- 易学の専門用語は分かりやすく説明
- 占いは参考意見であり、絶対的な予言ではないことを明記
- ポジティブな解釈を心がけつつ、現実的な助言を提供`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                tools: FUNCTION_TOOLS,
                tool_choice: "auto",
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📨 LM Studio応答データ:', data);
        console.log('📨 message:', data.choices[0].message);
        console.log('📨 tool_calls存在チェック:', data.choices[0].message.tool_calls);
        
        // Function Calling処理
        console.log('🔍 Function Calling条件チェック開始...');
        if (data.choices[0].message.tool_calls && data.choices[0].message.tool_calls.length > 0) {
            console.log('✅ Function Calling検出:', data.choices[0].message.tool_calls.length, '個');
            console.log('Tool calls:', data.choices[0].message.tool_calls);
            
            // リアルタイム表示を追加
            console.log('🗑️ aiMessageDiv削除実行...');
            aiMessageDiv.remove();
            console.log('🎯 リアルタイム表示開始...');
            console.log('📋 addFunctionCallingStatus関数チェック:', typeof addFunctionCallingStatus);
            const statusDiv = addFunctionCallingStatus(data.choices[0].message.tool_calls);
            console.log('📺 ステータス表示作成完了:', statusDiv);
            console.log('📺 ステータス表示要素の親:', statusDiv ? statusDiv.parentNode : 'なし');
            console.log('📺 ステータス表示の内容:', statusDiv ? statusDiv.innerHTML : 'なし');
            
            const toolResults = [];
            
            // ローカルでFunction実行
            for (const toolCall of data.choices[0].message.tool_calls) {
                const functionName = toolCall.function.name;
                const parameters = JSON.parse(toolCall.function.arguments);
                
                console.log(`⚙️ 関数「${functionName}」実行中...`, parameters);
                
                const result = await executeLocalFunction(functionName, parameters);
                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    content: JSON.stringify(result, null, 2)
                });
            }
            
            // 関数実行結果を含めて最終応答を取得
            const finalResponse = await fetch(API_CONFIG.url + '/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: API_CONFIG.model,
                    messages: [
                        {
                            role: "system", 
                            content: `あなたは「占い知識アシスタント」です。古代中国の易学（周易）の専門家として、占いの知識を提供し、人生の悩みや疑問にお答えします。

関数実行結果を基に、詳しく丁寧な解釈を提供してください。卦の意味、陰陽五行の観点、現実的なアドバイスを含めて説明してください。`
                        },
                        {
                            role: "user",
                            content: message
                        },
                        data.choices[0].message,
                        ...toolResults
                    ],
                    temperature: 0.7,
                    stream: false
                })
            });
            
            const finalData = await finalResponse.json();
            
            // 実行完了表示
            setTimeout(() => {
                console.log('⏰ updateFunctionCallingStatus実行開始...');
                console.log('📊 toolResults:', toolResults);
                const mockResults = toolResults.map(result => ({
                    content: result.content
                }));
                console.log('🎭 mockResults:', mockResults);
                console.log('📋 updateFunctionCallingStatus関数チェック:', typeof updateFunctionCallingStatus);
                console.log('📋 statusDiv存在チェック:', statusDiv ? 'あり' : 'なし');
                updateFunctionCallingStatus(statusDiv, mockResults);
                console.log('✅ updateFunctionCallingStatus実行完了');
            }, 200);
            
            // 最終応答を表示（タイピング効果付き）
            setTimeout(() => {
                console.log('🎬 最終応答をタイピング効果で表示開始');
                addMessage(finalData.choices[0].message.content, false, true);
            }, 300);
            
        } else {
            // 通常の応答（タイピング効果付き）
            console.log('💬 通常の応答モード (Function Calling無し)');
            aiMessageDiv.remove();
            addMessage(data.choices[0].message.content, false, true);
        }

        showStatus('✓ 応答完了');

    } catch (error) {
        addMessage('エラー: ' + error.message, false);
        showStatus('送信エラー: ' + error.message, true);
    } finally {
        // 必ずボタンの状態を復元
        sendBtn.disabled = false;
        sendBtn.textContent = '送信';
    }
}

function clearChat() {
    const messagesDiv = document.getElementById('messages');
    // ウェルカムメッセージを除くすべてのメッセージを削除
    const welcomeMessage = messagesDiv.querySelector('.welcome-message');
    messagesDiv.innerHTML = '';
    if (welcomeMessage) {
        messagesDiv.appendChild(welcomeMessage);
    }
    showStatus('✓ チャット履歴をクリアしました');
}

// スマホでの使いやすさを向上させる機能
function optimizeForMobile() {
    // タッチ操作の最適化
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // スマホで入力フィールドにフォーカスした時に自動スクロール
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });

    document.addEventListener('contextmenu', function(event) {
        // テキストが選択されている場合はコンテキストメニューを許可
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            return; // メニューを表示させる
        }
        
        // 入力フィールド内でのコンテキストメニューは許可
        const target = event.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            return; // メニューを表示させる
        }
        
        // その他の場合は無効化（画像の長押しメニュー等を防ぐ）
        event.preventDefault();
    });
    
    // スワイプでチャット履歴をクリア
    let startX = 0;
    let startY = 0;
    let isSwiping = false;
    
    // 統合されたtouchstartリスナー - 2本指ズーム防止とスワイプ開始を同時処理
    document.addEventListener('touchstart', function(event) {
        // 2本指ズームのみ防止（3本指以上のシステム操作は許可）
        if (event.touches.length === 2) {
            event.preventDefault();
            return;
        }
        
        // 3本指以上の場合はシステム操作を優先（スクリーンショット等）
        if (event.touches.length > 2) {
            return; // preventDefault()を呼ばずにシステムに処理を委ねる
        }
        
        // シングルタッチの場合のスワイプ開始処理
        if (event.touches.length === 1) {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            isSwiping = false;
        }
    }, { passive: false }); // 2本指ズーム防止のためpassive: falseが必要
    
    document.addEventListener('touchmove', function(event) {
        if (!isSwiping && event.touches.length === 1) {
            const deltaX = Math.abs(event.touches[0].clientX - startX);
            const deltaY = Math.abs(event.touches[0].clientY - startY);
            
            if (deltaX > 50 && deltaY < 30) {
                isSwiping = true;
            }
        }
    });
    
    document.addEventListener('touchend', function(event) {
        if (isSwiping && event.changedTouches.length === 1) {
            const deltaX = event.changedTouches[0].clientX - startX;
            if (deltaX > 100) {
                // 右スワイプでチャット履歴をクリア
                if (confirm('チャット履歴をクリアしますか？')) {
                    clearChat();
                }
            }
        }
    });
}

// AIメッセージのタイピング効果
function typewriteText(element, text, speed = 5) {
    return new Promise((resolve) => {
        let index = 0;
        element.textContent = '';
        
        function typeNextChar() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeNextChar, speed);
            } else {
                resolve();
            }
        }
        
        typeNextChar();
    });
}

// タイピングアニメーション機能
function startTypingAnimation() {
    const input = document.getElementById('userInput');
    const placeholders = JSON.parse(input.getAttribute('data-placeholders'));
    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    
    function typeText() {
        const currentPlaceholder = placeholders[currentIndex];
        
        if (isDeleting) {
            // 文字を削除
            currentText = currentPlaceholder.substring(0, currentText.length - 1);
        } else {
            // 文字を追加
            currentText = currentPlaceholder.substring(0, currentText.length + 1);
        }
        
        // プレースホルダーを更新
        input.setAttribute('placeholder', currentText);
        
        let typeSpeed = isDeleting ? 30 : 50; // 削除の方が速い
        
        if (!isDeleting && currentText === currentPlaceholder) {
            // 完全に表示されたら、少し待ってから削除開始
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            // 完全に削除されたら、次のメッセージへ
            isDeleting = false;
            currentIndex = (currentIndex + 1) % placeholders.length;
            typeSpeed = 500;
        }
        
        setTimeout(typeText, typeSpeed);
    }
    
    // アニメーション開始
    typeText();
}

// メッセージモーダル表示機能
function showMessageModal(messageText) {
    const modal = document.getElementById('messageModal');
    const modalContent = document.getElementById('modalMessageContent');
    
    modalContent.textContent = messageText;
    modal.style.display = 'flex';
    
    // bodyのスクロールを無効化
    document.body.style.overflow = 'hidden';
}

function hideMessageModal() {
    const modal = document.getElementById('messageModal');
    modal.style.display = 'none';
    
    // bodyのスクロールを有効化
    document.body.style.overflow = '';
}

// 初期化
document.addEventListener('DOMContentLoaded', async function() {
    // 占い知識データを読み込み
    await loadFortuneKnowledgeData();
    
    // スマホ最適化を適用
    optimizeForMobile();
    
    // タイピングアニメーション開始
    startTypingAnimation();
    
    // モーダル機能の初期化
    const modal = document.getElementById('messageModal');
    const closeBtn = document.getElementById('closeModal');
    
    // 閉じるボタンのクリックイベント
    closeBtn.addEventListener('click', hideMessageModal);
    
    // モーダル背景クリックで閉じる
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideMessageModal();
        }
    });
    
    // ESCキーで閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            hideMessageModal();
        }
    });
    
    // ウェルカムメッセージ
    addMessage('☯️ 占い知識アシスタントへようこそ！\n\n古代中国の易学に基づいて、占いの知識を提供し、あなたの質問にお答えします。何でもお気軽にご相談ください。', false, false);

    // 起動メッセージを表示
    showStatus('✓ 占い知識アシスタントが起動しました');
});
