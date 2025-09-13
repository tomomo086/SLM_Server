#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from datetime import datetime

def create_timeline_order():
    """時系列的な学習順序を定義する"""
    
    # 学習の段階と順序
    timeline_order = [
        # 第1段階：基礎知識
        {
            "stage": 1,
            "stage_name": "基礎知識",
            "categories": [
                "基本概念",      # 易経の基本用語
                "歴史",          # 易経の歴史と成立
                "陰陽思想",      # 陰陽の基本概念
                "八卦知識",      # 八卦の基本
                "八卦詳細",      # 八卦の詳細解説
                "五行思想",      # 五行の基本
                "五行詳細",      # 五行の詳細
                "数理象徴"       # 数理と象徴
            ]
        },
        
        # 第2段階：理解と解釈
        {
            "stage": 2,
            "stage_name": "理解と解釈",
            "categories": [
                "読み方解釈",    # 読み方と解釈法
                "解釈学",        # 解釈学派
                "故事人物",      # 故事と人物
                "易学基礎"       # 易学の基礎
            ]
        },
        
        # 第3段階：実践方法
        {
            "stage": 3,
            "stage_name": "実践方法",
            "categories": [
                "占い方法",      # 占いの基本方法
                "占い方法詳細",  # 占いの詳細方法
                "占い実践",      # 占いの基本実践
                "占い実践詳細"   # 占いの詳細実践
            ]
        },
        
        # 第4段階：哲学と思想
        {
            "stage": 4,
            "stage_name": "哲学と思想",
            "categories": [
                "人生哲学",      # 人生哲学の基本
                "人生哲学詳細",  # 人生哲学の詳細
                "自然哲学",      # 自然哲学
                "倫理思想",      # 倫理思想
                "教育思想"       # 教育思想
            ]
        },
        
        # 第5段階：時間と空間
        {
            "stage": 5,
            "stage_name": "時間と空間",
            "categories": [
                "季節時間",      # 季節と時間
                "方位空間"       # 方位と空間
            ]
        },
        
        # 第6段階：応用と実践
        {
            "stage": 6,
            "stage_name": "応用と実践",
            "categories": [
                "日常生活応用",  # 日常生活への応用
                "実践応用",      # 実践的応用
                "現代応用",      # 現代への応用
                "現代応用詳細"   # 現代応用の詳細
            ]
        },
        
        # 第7段階：専門分野
        {
            "stage": 7,
            "stage_name": "専門分野",
            "categories": [
                "心理学",        # 深層心理学
                "医学応用",      # 医学的応用
                "軍事思想",      # 軍事思想
                "経済思想"       # 経済思想
            ]
        },
        
        # 第8段階：文化と未来
        {
            "stage": 8,
            "stage_name": "文化と未来",
            "categories": [
                "芸術文化",      # 芸術と文化
                "未来展望"       # 未来への展望
            ]
        }
    ]
    
    return timeline_order

def reorganize_knowledge_by_timeline():
    """知識を時系列順に再配置する"""
    
    # 既存のJSONファイルを読み込み
    json_path = "data/fortune-knowledge.json"
    with open(json_path, 'r', encoding='utf-8') as f:
        all_data = json.load(f)
    
    print(f"既存のデータ: {len(all_data)}件")
    
    # 卦データと本の知識データを分離
    hexagram_data = []
    book_knowledge_data = []
    
    for item in all_data:
        if item.get('type') == 'book_content':
            book_knowledge_data.append(item)
        else:
            hexagram_data.append(item)
    
    print(f"卦データ: {len(hexagram_data)}件")
    print(f"本の知識データ: {len(book_knowledge_data)}件")
    
    # 時系列順序を取得
    timeline_order = create_timeline_order()
    
    # カテゴリごとに本の知識データを分類
    categorized_data = {}
    for item in book_knowledge_data:
        category = item.get('category', 'その他')
        if category not in categorized_data:
            categorized_data[category] = []
        categorized_data[category].append(item)
    
    # 時系列順に再配置
    reorganized_data = []
    
    # まず卦データを追加（番号順）
    hexagram_data.sort(key=lambda x: x.get('number', 0))
    reorganized_data.extend(hexagram_data)
    
    # 次に本の知識データを時系列順に追加
    for stage in timeline_order:
        stage_name = stage['stage_name']
        categories = stage['categories']
        
        print(f"\n第{stage['stage']}段階: {stage_name}")
        
        for category in categories:
            if category in categorized_data:
                items = categorized_data[category]
                print(f"  - {category}: {len(items)}件")
                
                # 各カテゴリ内でID順にソート
                items.sort(key=lambda x: x.get('id', ''))
                reorganized_data.extend(items)
                
                # 処理済みとして削除
                del categorized_data[category]
    
    # 未分類のデータを最後に追加
    if categorized_data:
        print(f"\n未分類のカテゴリ:")
        for category, items in categorized_data.items():
            print(f"  - {category}: {len(items)}件")
            items.sort(key=lambda x: x.get('id', ''))
            reorganized_data.extend(items)
    
    return reorganized_data

def main():
    print("知識ファイルを時系列的に再配置中...")
    
    # 時系列順に再配置
    reorganized_data = reorganize_knowledge_by_timeline()
    
    print(f"\n再配置後の総データ数: {len(reorganized_data)}件")
    
    # バックアップを作成
    json_path = "data/fortune-knowledge.json"
    backup_path = "data/fortune-knowledge-backup.json"
    
    if os.path.exists(json_path):
        with open(backup_path, 'w', encoding='utf-8') as f:
            with open(json_path, 'r', encoding='utf-8') as original:
                backup_data = json.load(original)
            json.dump(backup_data, f, ensure_ascii=False, indent=4)
        print(f"バックアップを作成: {backup_path}")
    
    # 再配置されたデータを保存
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(reorganized_data, f, ensure_ascii=False, indent=4)
    
    print(f"時系列順に再配置されたJSONファイルを保存: {json_path}")
    
    # ファイルサイズを確認
    file_size = os.path.getsize(json_path)
    print(f"JSONファイルサイズ: {file_size:,} bytes ({file_size/1024:.1f} KB)")
    
    # 時系列順序の概要を表示
    timeline_order = create_timeline_order()
    print(f"\n時系列的な学習順序:")
    for stage in timeline_order:
        print(f"第{stage['stage']}段階: {stage['stage_name']}")
        for category in stage['categories']:
            print(f"  - {category}")
        print()

if __name__ == "__main__":
    main()
