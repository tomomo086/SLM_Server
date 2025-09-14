const express = require('express');
const cors = require('cors');
const path = require('path');
const YijingTools = require('./yijing-tools');

const app = express();
const PORT = 3001;

// Yijing Tools インスタンス作成
const yijingTools = new YijingTools();

// CORS設定
app.use(cors());
app.use(express.json());

// 静的ファイル提供（Recipe_SLMフロントエンド）
app.use(express.static(path.join(__dirname, '..')));

// LM Studio API プロキシエンドポイント
app.post('/v1/chat/completions', async (req, res) => {
    try {
        const { messages, tools } = req.body;
        
        console.log('🚀 Chat API呼び出し');
        console.log('📨 メッセージ数:', messages.length);
        
        // Function Callingツールを自動注入
        const toolsToUse = yijingTools.getToolsDefinition();
        console.log('🔧 利用可能なツール:', toolsToUse.length, '個');

        // LM Studio APIに転送
        const lmStudioResponse = await fetch('http://192.168.2.107:1234/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...req.body,
                tools: toolsToUse,
                tool_choice: 'auto'
            })
        });

        const lmStudioData = await lmStudioResponse.json();
        
        // Function Calling検出と実行
        const responseMessage = lmStudioData.choices[0].message;
        
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            console.log(`🔧 Function Calling検出: ${responseMessage.tool_calls.length}個`);
            
            const toolResults = [];
            
            for (const toolCall of responseMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const parameters = JSON.parse(toolCall.function.arguments);
                
                console.log(`⚙️ 関数「${functionName}」実行中...`);
                
                const result = await yijingTools.executeFunction(functionName, parameters);
                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: 'tool',
                    content: JSON.stringify(result, null, 2)
                });
            }
            
            // Function Calling情報をレスポンスに含める
            const toolCallsInfo = responseMessage.tool_calls.map(call => ({
                function: call.function,
                id: call.id
            }));
            
            // 関数実行結果を含めて再度LM Studioにリクエスト
            const finalMessages = [
                ...messages,
                responseMessage,
                ...toolResults
            ];
            
            console.log('🔄 関数実行結果を含めて最終応答生成...');
            
            const finalResponse = await fetch('http://192.168.2.107:1234/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...req.body,
                    messages: finalMessages,
                    tools: toolsToUse,
                    tool_choice: 'none'
                })
            });
            
            const finalData = await finalResponse.json();
            console.log('✅ 最終応答生成完了');
            
            // Function Calling情報を含めたレスポンスを作成
            const enhancedResponse = {
                ...finalData,
                function_calls_executed: toolCallsInfo,
                tool_results: toolResults
            };
            
            res.json(enhancedResponse);
        } else {
            console.log('💬 通常の応答');
            res.json(lmStudioData);
        }
        
    } catch (error) {
        console.error('❌ API エラー:', error);
        res.status(500).json({ 
            error: '内部サーバーエラー',
            message: error.message 
        });
    }
});

// 易経API エンドポイント（デバッグ用）
app.get('/api/yijing/documents', async (req, res) => {
    try {
        const summary = await yijingTools.getAllDocumentsSummary();
        res.json(summary);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/yijing/documents/:id', async (req, res) => {
    try {
        const includeFullText = req.query.full === 'true';
        const document = await yijingTools.getYijingDocument(req.params.id, includeFullText);
        res.json(document);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/yijing/search', async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const maxResults = parseInt(req.query.max) || 5;

        if (!keyword) {
            return res.status(400).json({
                success: false,
                error: 'キーワードが必要です'
            });
        }

        const results = await yijingTools.searchYijingByKeyword(keyword, maxResults);
        res.json(results);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log('🔮 易経 SLM Function Calling サーバー起動');
    console.log(`📡 サーバーアドレス: http://localhost:${PORT}`);
    console.log('🔗 LM Studio API: http://192.168.2.107:1234');
    console.log(`🔧 Function Tools: ${yijingTools.getToolsDefinition().length}個登録済み`);
    console.log('📚 利用可能な易経文献:', yijingTools.getAvailableDocuments().length, '件');
    console.log('✅ 準備完了 - ブラウザでアクセスしてテストしてください');
});

module.exports = app;