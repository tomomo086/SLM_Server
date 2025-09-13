#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
64卦の現在状況分析と不足卦リスト作成
"""

import json
import os

def analyze_hexagrams():
    """現在の64卦の状況を分析"""

    data_path = "data/fortune-knowledge.json"

    if not os.path.exists(data_path):
        print("fortune-knowledge.json が見つかりません")
        return

    # JSONデータ読み込み
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("=== 64卦分析結果 ===")
    print(f"総エントリー数: {len(data)}")

    # 卦番号を持つエントリーを抽出
    hexagram_entries = []
    for entry in data:
        if ('number' in entry and
            isinstance(entry['number'], int) and
            1 <= entry['number'] <= 64):
            hexagram_entries.append(entry)

    # 番号順にソート
    hexagram_entries.sort(key=lambda x: x['number'])

    print(f"卦番号を持つエントリー: {len(hexagram_entries)}")

    # 存在する卦番号のリスト
    existing_numbers = [entry['number'] for entry in hexagram_entries]
    print(f"存在する卦: {existing_numbers}")

    # 不足している卦を特定
    missing_numbers = []
    for i in range(1, 65):
        if i not in existing_numbers:
            missing_numbers.append(i)

    print(f"\n=== 不足している卦 ===")
    print(f"不足数: {len(missing_numbers)}/64")
    print(f"不足している卦番号: {missing_numbers}")

    # 20卦ごとに分割して表示
    print(f"\n=== 範囲別分析 ===")
    ranges = [
        (1, 20, "1-20"),
        (21, 40, "21-40"),
        (41, 64, "41-64")
    ]

    for start, end, range_name in ranges:
        range_existing = [n for n in existing_numbers if start <= n <= end]
        range_missing = [n for n in missing_numbers if start <= n <= end]

        print(f"{range_name}: {len(range_existing)}/{end-start+1} 完了")
        if range_missing:
            print(f"  不足: {range_missing}")
        else:
            print(f"  ✓ 完了")

    # 既存データの構造確認
    print(f"\n=== データ構造サンプル ===")
    if hexagram_entries:
        sample = hexagram_entries[0]
        print("サンプル卦のフィールド:")
        for key in sample.keys():
            if isinstance(sample[key], list):
                print(f"  {key}: [{len(sample[key])}個の要素]")
            elif isinstance(sample[key], str) and len(sample[key]) > 50:
                print(f"  {key}: '{sample[key][:50]}...'")
            else:
                print(f"  {key}: {repr(sample[key])}")

    return existing_numbers, missing_numbers

def generate_missing_hexagram_template():
    """不足している卦のテンプレートを生成"""

    # 易経64卦の基本情報（参考データ）
    hexagram_basic_info = {
        21: {"name": "噬嗑", "symbol": "☲☶", "description": "雷火噬嗑。障害を噛み砕く"},
        22: {"name": "賁", "symbol": "☶☲", "description": "山火賁。装飾、美化"},
        23: {"name": "剥", "symbol": "☶☷", "description": "山地剥。剥落、衰退"},
        24: {"name": "復", "symbol": "☷☳", "description": "地雷復。回復、復活"},
        25: {"name": "無妄", "symbol": "☰☳", "description": "天雷無妄。自然、無作為"},
        # ... より多くの卦情報が必要な場合はここに追加
    }

    # テンプレート作成
    templates = []
    for number in range(21, 65):
        basic = hexagram_basic_info.get(number, {
            "name": f"卦{number}",
            "symbol": "☰☰",
            "description": f"第{number}番目の卦"
        })

        template = {
            "id": f"hexagram_{number:03d}",
            "name": basic["name"],
            "number": number,
            "symbol": basic["symbol"],
            "description": basic["description"],
            "meaning": "（PDF抽出後に追加予定）",
            "advice": "（PDF抽出後に追加予定）",
            "keywords": [],
            "elements": [],
            "category": "卦の詳細解釈"
        }
        templates.append(template)

    return templates

if __name__ == "__main__":
    print("64卦分析を開始...")
    existing, missing = analyze_hexagrams()

    if missing:
        print(f"\n=== テンプレート生成 ===")
        templates = generate_missing_hexagram_template()
        print(f"不足している{len(missing)}個の卦のテンプレートを生成しました")

        # テンプレートをファイルに保存
        with open("missing_hexagrams_template.json", 'w', encoding='utf-8') as f:
            json.dump(templates, f, ensure_ascii=False, indent=2)
        print("テンプレートを missing_hexagrams_template.json に保存しました")

    print("\n分析完了！")