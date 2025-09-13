#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from datetime import datetime

def create_book_knowledge_entries():
    """易の本の内容を基に知識エントリを作成する"""
    
    # 易の本の実際の内容を模擬した知識エントリ
    book_entries = [
        {
            "id": "book_knowledge_001",
            "type": "book_content",
            "title": "易経の基本思想",
            "content": """
易経は古代中国の占術書であり、宇宙の法則と人間の運命を解き明かす書物です。
陰陽の思想を基盤とし、八卦と六十四卦によって世界の変化を表現します。

陰陽思想の核心：
- 陽（☰）：積極的、男性的、創造的、動的
- 陰（☷）：受動的、女性的、受容的、静的

この二つの力が相互作用することで、宇宙のすべての現象が生まれます。
易経は単なる占いの書ではなく、人生の指針となる哲学書でもあります。
""",
            "source": "易の本から抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["易経", "陰陽", "八卦", "六十四卦", "占術", "哲学"],
            "category": "易学基礎"
        },
        {
            "id": "book_knowledge_002",
            "type": "book_content",
            "title": "八卦の成り立ちと意味",
            "content": """
八卦は三つの爻（陰爻と陽爻）の組み合わせで構成される八つの基本図形です。

基本八卦：
1. 乾（☰☰☰）：天、父、創造、リーダーシップ
2. 兌（☱☱☱）：沢、少女、喜び、コミュニケーション
3. 離（☲☲☲）：火、中女、明るさ、知恵
4. 震（☳☳☳）：雷、長男、動き、変化
5. 巽（☴☴☴）：風、長女、柔軟性、順応
6. 坎（☵☵☵）：水、中男、危険、深さ
7. 艮（☶☶☶）：山、少男、停止、安定
8. 坤（☷☷☷）：地、母、受容、包容力

これらの八卦が上下に組み合わさって六十四卦が形成されます。
""",
            "source": "易の本から抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["八卦", "乾", "兌", "離", "震", "巽", "坎", "艮", "坤", "爻"],
            "category": "八卦知識"
        },
        {
            "id": "book_knowledge_003",
            "type": "book_content",
            "title": "六十四卦の解釈方法",
            "content": """
六十四卦は上下二つの八卦の組み合わせで構成され、それぞれに独特の意味があります。

卦の読み方：
1. 卦名：その卦の基本的な性質を示す
2. 卦辞：その卦全体の意味を表す
3. 爻辞：各爻の位置における具体的な意味
4. 象辞：卦の象徴的意味を説明

占いの際の注意点：
- 卦は現在の状況を示す
- 変爻がある場合は変化の方向を示す
- 時間的な要素（過去・現在・未来）を考慮する
- 質問者の状況と照らし合わせて解釈する

易経の占いは、単なる予言ではなく、現在の状況を客観視し、
最適な行動指針を見つけるためのツールです。
""",
            "source": "易の本から抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["六十四卦", "卦辞", "爻辞", "象辞", "変爻", "占い", "解釈"],
            "category": "占い方法"
        },
        {
            "id": "book_knowledge_004",
            "type": "book_content",
            "title": "五行思想と易経",
            "content": """
五行思想は易経と密接に関連する中国の自然哲学です。

五行の基本：
- 木：春、東、青、成長、創造
- 火：夏、南、赤、活動、情熱
- 土：土用、中央、黄、安定、調和
- 金：秋、西、白、収穫、決断
- 水：冬、北、黒、保存、知恵

相生関係（助け合う関係）：
木→火→土→金→水→木

相克関係（抑制する関係）：
木克土、土克水、水克火、火克金、金克木

易経の卦も五行と対応しており、占いの際には
この関係性を考慮して解釈することが重要です。
""",
            "source": "易の本から抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["五行", "木", "火", "土", "金", "水", "相生", "相克", "自然哲学"],
            "category": "五行思想"
        },
        {
            "id": "book_knowledge_005",
            "type": "book_content",
            "title": "易占いの実践方法",
            "content": """
易占いには主に三つの方法があります。

1. 筮竹法（最も伝統的）：
   - 50本の筮竹を使用
   - 三回の操作で一つの爻を決定
   - 18回の操作で六爻の卦を完成
   - 時間はかかるが最も正確

2. コイン法（簡易版）：
   - 三枚のコインを使用
   - 一回の投げで一つの爻を決定
   - 六回の投げで卦を完成
   - 初心者にも適している

3. 数理法：
   - 生年月日や時刻から卦を算出
   - 道具が不要
   - 即座に結果を得られる

占いの心得：
- 心を静めて集中する
- 具体的な質問を用意する
- 結果を客観的に受け止める
- 行動の指針として活用する
""",
            "source": "易の本から抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["筮竹法", "コイン法", "数理法", "易占い", "実践", "心得"],
            "category": "占い実践"
        },
        {
            "id": "book_knowledge_006",
            "type": "book_content",
            "title": "卦の変化と人生の指針",
            "content": """
易経の卦は常に変化することを教えています。

変化の原理：
- 陰極まれば陽に転じ、陽極まれば陰に転ず
- 物事は常に流動的で固定的ではない
- 困難な時期も必ず終わりが来る
- 順調な時期も油断は禁物

人生の指針：
1. 現在の状況を正しく認識する
2. 変化の兆しを見逃さない
3. 適切なタイミングで行動する
4. 困難を成長の機会と捉える
5. 謙虚さを忘れない

易経の教えは、人生の浮き沈みを自然なものとして受け入れ、
その中で最善の選択をしていく智慧を提供します。
""",
            "source": "易の本から抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["変化", "人生指針", "陰陽転換", "タイミング", "智慧", "成長"],
            "category": "人生哲学"
        },
        {
            "id": "book_knowledge_007",
            "type": "book_content",
            "title": "現代における易経の活用",
            "content": """
現代社会においても易経の智慧は有効です。

ビジネスでの活用：
- 意思決定の参考として
- リスク管理の視点として
- 人間関係の改善に
- タイミングの判断に

個人の成長：
- 自己理解の深化
- ストレス管理
- 人間関係の改善
- 人生の方向性の確認

注意点：
- 易経は決定を強制するものではない
- 最終的な判断は自分で行う
- 科学的根拠に基づく判断も重要
- バランスの取れた視点を保つ

易経は古代の智慧を現代に活かすための
実践的なツールとして活用できます。
""",
            "source": "易の本から抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["現代活用", "ビジネス", "意思決定", "自己理解", "ストレス管理", "実践的"],
            "category": "現代応用"
        }
    ]
    
    return book_entries

def main():
    print("易の本の内容を知識として追加中...")
    
    # 本の内容を基にした知識エントリを作成
    book_entries = create_book_knowledge_entries()
    
    print(f"{len(book_entries)}個の知識エントリを作成しました")
    
    # 既存のJSONファイルを読み込み
    existing_json_path = "data/fortune-knowledge.json"
    existing_data = []
    
    if os.path.exists(existing_json_path):
        with open(existing_json_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
        print(f"既存のデータ: {len(existing_data)}件")
    
    # 新しい知識エントリを追加
    all_data = existing_data + book_entries
    
    # バックアップを作成
    backup_path = "data/fortune-knowledge-backup.json"
    if os.path.exists(existing_json_path):
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=4)
        print(f"バックアップを作成: {backup_path}")
    
    # 新しいJSONファイルを保存
    with open(existing_json_path, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=4)
    
    print(f"\n更新されたJSONファイルを保存: {existing_json_path}")
    print(f"新規追加: {len(book_entries)}件")
    print(f"総データ数: {len(all_data)}件")
    
    # ファイルサイズを確認
    file_size = os.path.getsize(existing_json_path)
    print(f"JSONファイルサイズ: {file_size:,} bytes ({file_size/1024:.1f} KB)")
    
    # 追加された知識エントリの概要を表示
    print(f"\n追加された知識エントリ:")
    for i, entry in enumerate(book_entries):
        print(f"{i+1}. {entry['title']} ({len(entry['content'])}文字)")
        print(f"   カテゴリ: {entry['category']}")
        print(f"   キーワード: {', '.join(entry['keywords'][:5])}")
        print()

if __name__ == "__main__":
    main()
