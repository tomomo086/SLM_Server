#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os

def fix_hexagram_symbols():
    """六十四卦のsymbolを正しい形式（上下二つの八卦）に修正する"""
    
    # 正しい六十四卦のsymbol（上卦+下卦）
    correct_symbols = {
        1: "☰☰",   # 乾 - 天の上に天
        2: "☷☷",   # 坤 - 地の上に地
        3: "☵☳",   # 屯 - 水の上に雷
        4: "☶☵",   # 蒙 - 山の上に水
        5: "☵☰",   # 需 - 水の上に天
        6: "☰☵",   # 訟 - 天の上に水
        7: "☷☵",   # 師 - 地の上に水
        8: "☷☵",   # 比 - 地の上に水（師と同じ）
        9: "☰☴",   # 小畜 - 天の上に風
        10: "☰☱",  # 履 - 天の上に沢
        11: "☰☷",  # 泰 - 天の上に地
        12: "☷☰",  # 否 - 地の上に天
        13: "☰☲",  # 同人 - 天の上に火
        14: "☲☰",  # 大有 - 火の上に天
        15: "☷☶",  # 謙 - 地の上に山
        16: "☳☷",  # 豫 - 雷の上に地
        17: "☱☳",  # 随 - 沢の上に雷
        18: "☶☴",  # 蛊 - 山の上に風
        19: "☷☱",  # 临 - 地の上に沢
        20: "☴☷",  # 观 - 風の上に地
        21: "☲☳",  # 噬嗑 - 火の上に雷
        22: "☶☲",  # 贲 - 山の上に火
        23: "☷☶",  # 剥 - 地の上に山
        24: "☳☷",  # 复 - 雷の上に地
        25: "☰☳",  # 无妄 - 天の上に雷
        26: "☶☰",  # 大畜 - 山の上に天
        27: "☳☶",  # 颐 - 雷の上に山
        28: "☱☰",  # 大过 - 沢の上に天
        29: "☵☵",  # 坎 - 水の上に水
        30: "☲☲",  # 离 - 火の上に火
        31: "☱☶",  # 咸 - 沢の上に山
        32: "☳☱",  # 恒 - 雷の上に沢
        33: "☰☶",  # 遁 - 天の上に山
        34: "☳☰",  # 大壮 - 雷の上に天
        35: "☷☲",  # 晋 - 地の上に火
        36: "☲☷",  # 明夷 - 火の上に地
        37: "☴☲",  # 家人 - 風の上に火
        38: "☲☱",  # 睽 - 火の上に沢
        39: "☵☶",  # 蹇 - 水の上に山
        40: "☳☵",  # 解 - 雷の上に水
        41: "☱☷",  # 损 - 沢の上に地
        42: "☷☳",  # 益 - 地の上に雷
        43: "☱☰",  # 夬 - 沢の上に天
        44: "☰☴",  # 姤 - 天の上に風
        45: "☱☷",  # 萃 - 沢の上に地
        46: "☷☴",  # 升 - 地の上に風
        47: "☱☵",  # 困 - 沢の上に水
        48: "☵☴",  # 井 - 水の上に風
        49: "☱☲",  # 革 - 沢の上に火
        50: "☲☱",  # 鼎 - 火の上に沢
        51: "☳☳",  # 震 - 雷の上に雷
        52: "☶☶",  # 艮 - 山の上に山
        53: "☴☶",  # 渐 - 風の上に山
        54: "☳☱",  # 归妹 - 雷の上に沢
        55: "☳☲",  # 丰 - 雷の上に火
        56: "☲☶",  # 旅 - 火の上に山
        57: "☴☴",  # 巽 - 風の上に風
        58: "☱☱",  # 兑 - 沢の上に沢
        59: "☴☵",  # 涣 - 風の上に水
        60: "☵☱",  # 节 - 水の上に沢
        61: "☴☱",  # 中孚 - 風の上に沢
        62: "☳☶",  # 小过 - 雷の上に山
        63: "☵☲",  # 既济 - 水の上に火
        64: "☲☵"   # 未济 - 火の上に水
    }
    
    return correct_symbols

def main():
    json_path = "data/fortune-knowledge.json"
    
    if not os.path.exists(json_path):
        print(f"JSONファイルが見つかりません: {json_path}")
        return
    
    # 既存のJSONファイルを読み込み
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"既存のデータ: {len(data)}件")
    
    # 正しいsymbolを取得
    correct_symbols = fix_hexagram_symbols()
    
    # 卦データのsymbolを修正
    fixed_count = 0
    for item in data:
        if item.get('type') == 'book_content':
            continue  # 本の内容はスキップ
            
        if 'number' in item and 'symbol' in item:
            number = item['number']
            if number in correct_symbols:
                old_symbol = item['symbol']
                new_symbol = correct_symbols[number]
                if old_symbol != new_symbol:
                    item['symbol'] = new_symbol
                    fixed_count += 1
                    print(f"卦{number} ({item['name']}): {old_symbol} → {new_symbol}")
    
    # バックアップを作成
    backup_path = "data/fortune-knowledge-backup.json"
    with open(backup_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"バックアップを作成: {backup_path}")
    
    # 修正されたJSONファイルを保存
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print(f"\n修正完了: {fixed_count}個の卦のsymbolを修正しました")
    print(f"更新されたJSONファイルを保存: {json_path}")
    
    # ファイルサイズを確認
    file_size = os.path.getsize(json_path)
    print(f"JSONファイルサイズ: {file_size:,} bytes ({file_size/1024:.1f} KB)")

if __name__ == "__main__":
    main()
