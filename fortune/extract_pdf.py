#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pdfplumber
import json
import re
import sys
import os

def extract_pdf_content(pdf_path):
    """PDFファイルから内容を抽出する"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            
            # 最初の数ページのみを読み取り（ファイルサイズを考慮）
            max_pages = min(10, len(pdf.pages))
            print(f"PDFの総ページ数: {len(pdf.pages)}")
            print(f"読み取るページ数: {max_pages}")
            
            for page_num in range(max_pages):
                page = pdf.pages[page_num]
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- ページ {page_num + 1} ---\n"
                    text += page_text
                else:
                    print(f"ページ {page_num + 1} からテキストを抽出できませんでした")
                
        return text
    except Exception as e:
        print(f"PDF読み取りエラー: {e}")
        return None

def parse_hexagram_data(text):
    """テキストから卦のデータを抽出する"""
    hexagrams = []
    
    # 基本的な卦のパターンを探す
    # 数字と漢字の組み合わせを探す
    patterns = [
        r'(\d+)\s*[、．]\s*([一-龯]+)',  # 数字 + 漢字
        r'第(\d+)\s*卦\s*([一-龯]+)',    # 第X卦 + 漢字
        r'(\d+)\s*([一-龯]+)\s*卦',      # 数字 + 漢字 + 卦
    ]
    
    lines = text.split('\n')
    current_hexagram = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # 卦の番号と名前を探す
        for pattern in patterns:
            match = re.search(pattern, line)
            if match:
                number = int(match.group(1))
                name = match.group(2)
                
                # 既存の卦と重複しないかチェック
                if not any(h['number'] == number for h in hexagrams):
                    hexagram = {
                        "id": f"hexagram_{number:03d}",
                        "name": name,
                        "number": number,
                        "symbol": "",  # 後で設定
                        "description": f"{name}の卦。詳細な説明は元の文献を参照",
                        "meaning": "詳細な意味は元の文献を参照してください",
                        "advice": "詳細な助言は元の文献を参照してください",
                        "keywords": [name],
                        "elements": [],
                        "direction": "",
                        "season": "",
                        "time": ""
                    }
                    hexagrams.append(hexagram)
                    print(f"卦を発見: {number} - {name}")
                break
    
    return hexagrams

def main():
    pdf_path = "data/易の元ファイル/1-60.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"PDFファイルが見つかりません: {pdf_path}")
        return
    
    print("PDFファイルから内容を抽出中...")
    text = extract_pdf_content(pdf_path)
    
    if not text:
        print("PDFの読み取りに失敗しました")
        return
    
    print("卦のデータを解析中...")
    new_hexagrams = parse_hexagram_data(text)
    
    if not new_hexagrams:
        print("卦のデータが見つかりませんでした")
        # テキストの一部を表示してデバッグ
        print("\n抽出されたテキストの最初の1000文字:")
        print(text[:1000])
        return
    
    print(f"{len(new_hexagrams)}個の卦を発見しました")
    
    # 既存のJSONファイルを読み込み
    existing_json_path = "data/fortune-knowledge.json"
    existing_hexagrams = []
    
    if os.path.exists(existing_json_path):
        with open(existing_json_path, 'r', encoding='utf-8') as f:
            existing_hexagrams = json.load(f)
        print(f"既存の卦: {len(existing_hexagrams)}個")
    
    # 新しい卦を既存のデータに追加（重複を避ける）
    all_hexagrams = existing_hexagrams.copy()
    existing_numbers = {h['number'] for h in existing_hexagrams}
    
    for hexagram in new_hexagrams:
        if hexagram['number'] not in existing_numbers:
            all_hexagrams.append(hexagram)
            existing_numbers.add(hexagram['number'])
    
    # 番号順にソート
    all_hexagrams.sort(key=lambda x: x['number'])
    
    # バックアップを作成
    backup_path = "data/fortune-knowledge-backup.json"
    if os.path.exists(existing_json_path):
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(existing_hexagrams, f, ensure_ascii=False, indent=4)
        print(f"バックアップを作成: {backup_path}")
    
    # 新しいJSONファイルを保存
    with open(existing_json_path, 'w', encoding='utf-8') as f:
        json.dump(all_hexagrams, f, ensure_ascii=False, indent=4)
    
    print(f"更新されたJSONファイルを保存: {existing_json_path}")
    print(f"総卦数: {len(all_hexagrams)}個")
    
    # ファイルサイズを確認
    file_size = os.path.getsize(existing_json_path)
    print(f"JSONファイルサイズ: {file_size:,} bytes ({file_size/1024:.1f} KB)")

if __name__ == "__main__":
    main()
