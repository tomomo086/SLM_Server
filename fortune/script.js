// 固定のAPI設定
const API_CONFIG = {
    url: 'http://192.168.2.100:1234',
    model: 'local-model' // デフォルトモデル名
};

// 占い知識データ
let FORTUNE_KNOWLEDGE_DATA = [];



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



        // 読み込み結果の表示
        if (FORTUNE_KNOWLEDGE_DATA.length > 0) {
            showStatus('✓ 基本知識データが読み込まれました');
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
    }
];

// ローカルFunction実行（占い知識検索用）
async function executeLocalFunction(functionName, parameters) {
    console.log(`⚙️ ローカル関数「${functionName}」実行中...`, parameters);

    switch (functionName) {
        case 'search_fortune_knowledge':
            return searchFortuneKnowledge(parameters);
        case 'get_hexagram_detail':
            return getHexagramDetail(parameters);
        case 'perform_divination':
            return performDivination(parameters);
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

    // あいまい検索用のキーワードマッピング
    const fuzzyKeywords = {
        // 感情・気持ち関連
        '悩み': ['困', '蹇', '否', '剥', '明夷'],
        '不安': ['坎', '蹇', '困', '否'],
        '迷い': ['蒙', '渙', '困'],
        '心配': ['坎', '蹇', '否'],
        '苦しい': ['困', '蹇', '坎', '剥'],
        'つらい': ['困', '蹇', '坎', '剥', '明夷'],
        '落ち込む': ['剥', '否', '明夷'],
        '元気': ['乾', '震', '豫', '復'],
        '嬉しい': ['豫', '随', '同人'],
        '楽しい': ['豫', '随'],
        
        // 恋愛関係
        '恋愛': ['咸', '恒', '帰妹', '姤', '同人'],
        '恋人': ['咸', '恒', '帰妹'],
        '結婚': ['帰妹', '家人', '恒', '泰'],
        '片思い': ['姤', '咸', '困'],
        '別れ': ['睽', '遯', '剥'],
        '復縁': ['復', '既済', '恒'],
        '出会い': ['姤', '遇', '咸'],
        
        // 仕事関係  
        '仕事': ['大有', '師', '比', '升', '井'],
        '転職': ['井', '革', '遯', '升'],
        '昇進': ['升', '大壮', '晋'],
        'キャリア': ['升', '晋', '大有'],
        '会社': ['師', '比', '同人'],
        '上司': ['師', '大壮', '夬'],
        '部下': ['師', '比', '謙'],
        '同僚': ['同人', '比', '師'],
        
        // 健康関係
        '健康': ['頤', '復', '無妄', '既済'],
        '病気': ['蹇', '困', '剥', '明夷'],
        '疲れ': ['剥', '困', '坎'],
        '回復': ['復', '既済', '漸'],
        
        // 人間関係
        '友達': ['同人', '比', '随'],
        '家族': ['家人', '師', '比'],
        '親': ['大畜', '頤', '家人'],
        '子供': ['蒙', '小畜', '家人'],
        '人間関係': ['同人', '比', '師', '睽'],
        'けんか': ['睽', '訟', '否'],
        '和解': ['既済', '解', '復'],
        
        // お金・財産
        'お金': ['大有', '損', '益', '井'],
        '財産': ['大有', '大畜', '頤'],
        '貯金': ['大畜', '頤', '井'],
        '投資': ['益', '損', '井'],
        '収入': ['大有', '井', '益'],
        '支出': ['損', '剥'],
        
        // 学習・成長
        '勉強': ['蒙', '漸', '升', '晋'],
        '学習': ['蒙', '漸', '升'],
        '成長': ['漸', '升', '晋', '復'],
        '進歩': ['漸', '升', '晋'],
        '才能': ['大有', '乾', '震'],
        
        // 時期・タイミング
        '時期': ['既済', '未済', '屯', '豫'],
        'タイミング': ['既済', '未済', '屯'],
        '始まり': ['乾', '屯', '震', '復'],
        '終わり': ['既済', '剥', '否'],
        '変化': ['革', '井', '渙', '震'],
        
        // 方向性・決断
        '決断': ['夬', '大壮', '乾'],
        '選択': ['夬', '履', '遯'],
        '方向': ['履', '漸', '升'],
        '進む': ['乾', '升', '晋', '漸'],
        '待つ': ['需', '豫', '頤'],
        
        // 運勢一般
        '運勢': ['泰', '否', '既済', '未済'],
        '吉凶': ['泰', '否', '既済', '未済'],
        '良い': ['泰', '大有', '豫', '同人'],
        '悪い': ['否', '剥', '困', '明夷'],
        '普通': ['既済', '未済', '無妄']
    };
    
    // 検索ワードを拡張（あいまい検索対応）
    const expandedWords = [...searchWords];
    searchWords.forEach(word => {
        if (fuzzyKeywords[word]) {
            expandedWords.push(...fuzzyKeywords[word]);
            console.log(`🔍 キーワード拡張: "${word}" → [${fuzzyKeywords[word].join(', ')}]`);
        }
    });

    const results = FORTUNE_KNOWLEDGE_DATA.map(hexagram => {
        let score = 0;
        
        // 卦名マッチング: +50点（元の30点から強化）
        if (expandedWords.length > 0) {
            const nameLower = hexagram.name.toLowerCase();
            const matchedWords = expandedWords.filter(word => nameLower.includes(word));
            score += matchedWords.length * 50;
            if (matchedWords.length > 0) {
                console.log(`📊 卦名マッチ: ${matchedWords.length}個 (${matchedWords.join(', ')}) → +${matchedWords.length * 50}点`);
            }
        }

        // 部分一致検索（あいまい対応強化）
        if (expandedWords.length > 0) {
            expandedWords.forEach(word => {
                if (word.length >= 1) { // 1文字でも検索対象に
                    if (hexagram.name.includes(word)) {
                        score += 40;
                        console.log(`🎯 卦名部分一致: "${word}" in "${hexagram.name}" → +40点`);
                    }
                }
            });
        }

        // 説明文マッチング: +25点（元の20点から強化）
        if (expandedWords.length > 0) {
            const descLower = hexagram.description.toLowerCase();
            const matchedWords = expandedWords.filter(word => descLower.includes(word));
            score += matchedWords.length * 25;
            if (matchedWords.length > 0) {
                console.log(`📝 説明マッチ: ${matchedWords.length}個 → +${matchedWords.length * 25}点`);
            }
        }

        // 意味マッチング: +20点（元の15点から強化）
        if (expandedWords.length > 0) {
            const meaningLower = hexagram.meaning.toLowerCase();
            const matchedWords = expandedWords.filter(word => meaningLower.includes(word));
            score += matchedWords.length * 20;
            if (matchedWords.length > 0) {
                console.log(`💭 意味マッチ: ${matchedWords.length}個 → +${matchedWords.length * 20}点`);
            }
        }

        // キーワードマッチング: +35点（元の25点から強化）
        if (expandedWords.length > 0 && hexagram.keywords) {
            expandedWords.forEach(word => {
                const keywordMatches = hexagram.keywords.filter(keyword => 
                    keyword.toLowerCase().includes(word)
                );
                if (keywordMatches.length > 0) {
                    score += keywordMatches.length * 35;
                    console.log(`🏷️ キーワードマッチ: ${keywordMatches.length}個 (${keywordMatches.join(', ')}) → +${keywordMatches.length * 35}点`);
                }
            });
        }

        // 五行マッチング: +25点（元の20点から強化）
        if (expandedWords.length > 0 && hexagram.elements) {
            expandedWords.forEach(word => {
                const elementMatches = hexagram.elements.filter(element => 
                    element.toLowerCase().includes(word)
                );
                if (elementMatches.length > 0) {
                    score += elementMatches.length * 25;
                    console.log(`🌿 五行マッチ: ${elementMatches.length}個 (${elementMatches.join(', ')}) → +${elementMatches.length * 25}点`);
                }
            });
        }

        // 方位マッチング: +20点（元の15点から強化）
        if (expandedWords.length > 0 && hexagram.direction) {
            const directionLower = hexagram.direction.toLowerCase();
            const matchedWords = expandedWords.filter(word => directionLower.includes(word));
            score += matchedWords.length * 20;
            if (matchedWords.length > 0) {
                console.log(`🧭 方位マッチ: ${matchedWords.length}個 → +${matchedWords.length * 20}点`);
            }
        }

        // 季節マッチング: +20点（元の15点から強化）
        if (expandedWords.length > 0 && hexagram.season) {
            const seasonLower = hexagram.season.toLowerCase();
            const matchedWords = expandedWords.filter(word => seasonLower.includes(word));
            score += matchedWords.length * 20;
            if (matchedWords.length > 0) {
                console.log(`🌸 季節マッチ: ${matchedWords.length}個 → +${matchedWords.length * 20}点`);
            }
        }

        // 検索語がない場合は全件を低スコアで返す（あいまい検索対応）
        if (searchWords.length === 0) {
            score = 1; // 最低限のスコア
        }

        return { ...hexagram, score };
    });

    // スコア0でも一定数の結果を返す（あいまい検索対応）
    const filteredResults = results.filter(hexagram => hexagram.score > 0);
    const sortedResults = filteredResults.sort((a, b) => b.score - a.score);
    
    // 結果が少ない場合は、スコア0の中からランダムに追加
    if (sortedResults.length < 3) {
        const zeroScoreResults = results.filter(hexagram => hexagram.score === 0);
        const additionalResults = zeroScoreResults
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - sortedResults.length)
            .map(hexagram => ({ ...hexagram, score: 0.5 })); // 微小スコアを付与
        sortedResults.push(...additionalResults);
    }
    
    console.log(`📈 占い知識検索結果: ${sortedResults.length}件`);
    sortedResults.forEach((hexagram, index) => {
        console.log(`${index + 1}. "${hexagram.name}" (スコア: ${hexagram.score})`);
    });

    return {
        success: true,
        count: sortedResults.length,
        hexagrams: sortedResults.slice(0, 10),
        expanded_keywords: expandedWords.length > searchWords.length ? expandedWords : undefined
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
    
    const totalResults = results.reduce((sum, result) => {
        const parsed = JSON.parse(result.content);
        console.log('📊 parsed result:', parsed);
        return sum + (parsed.count || 0);
    }, 0);
    
    console.log('🔢 totalResults:', totalResults);
    resultSummary.innerHTML = `✅ <strong>実行完了</strong> - ${totalResults}件の占い知識データを取得`;
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

【重要】ユーザーが以下のような質問をした場合は、適切な関数を実行してください：
- 卦の意味や知識について → search_fortune_knowledge
- 特定の卦の詳細 → get_hexagram_detail
- 占いや運勢に関する質問 → perform_divination
- 人生の選択で迷っている相談 → perform_divination
- 恋愛、仕事、健康、人間関係の悩み → perform_divination

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
