#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
分割PDFから64卦情報を抽出してJSONに追加するツール
"""

import PyPDF2
import json
import os
import re
from pathlib import Path

def extract_text_from_pdf(pdf_path):
    """PDFファイルからテキストを抽出"""
    text_content = ""

    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)

            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    text_content += f"\n--- Page {page_num + 1} ---\n"
                    text_content += page_text
                    text_content += "\n"
                except Exception as e:
                    print(f"Page {page_num + 1} extraction error: {e}")
                    continue

    except Exception as e:
        print(f"PDF reading error: {e}")
        return None

    return text_content

def find_hexagram_info(text, start_hexagram, end_hexagram):
    """テキストから指定範囲の卦情報を抽出"""

    hexagrams_found = {}

    # 卦の基本パターンを検索
    patterns = [
        r'(\d+)[\.．]\s*([^\d\n]{1,3})\s*[（(]([^)）]+)[）)]',  # "1. 乾 (天卦)"形式
        r'第(\d+)卦\s*([^\d\n]{1,3})',  # "第1卦 乾"形式
        r'([^\d\n]{1,3})卦\s*[（(]([^)）]+)[）)]',  # "乾卦 (天)"形式
    ]

    lines = text.split('\n')
    current_hexagram = None
    current_content = []

    for line_num, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # 卦番号と名前を検索
        for pattern in patterns:
            match = re.search(pattern, line)
            if match:
                if pattern.startswith(r'(\d+)'):  # 番号パターン
                    hex_num = int(match.group(1))
                    hex_name = match.group(2).strip()
                    hex_desc = match.group(3) if len(match.groups()) > 2 else ""

                    if start_hexagram <= hex_num <= end_hexagram:
                        # 前の卦の情報を保存
                        if current_hexagram and current_content:
                            hexagrams_found[current_hexagram]['content'] = '\n'.join(current_content)

                        # 新しい卦を開始
                        current_hexagram = hex_num
                        current_content = []

                        hexagrams_found[hex_num] = {
                            'number': hex_num,
                            'name': hex_name,
                            'description': hex_desc,
                            'content': '',
                            'source_line': line_num + 1
                        }
                        break

        # 現在の卦に内容を追加
        if current_hexagram and start_hexagram <= current_hexagram <= end_hexagram:
            # 卦名や番号行は除外
            if not any(re.search(p, line) for p in patterns):
                current_content.append(line)

    # 最後の卦の内容を保存
    if current_hexagram and current_content:
        hexagrams_found[current_hexagram]['content'] = '\n'.join(current_content)

    return hexagrams_found

def extract_hexagram_details(content):
    """卦の内容から詳細情報を抽出"""

    details = {
        'meaning': '',
        'advice': '',
        'keywords': [],
        'elements': [],
        'symbol': ''
    }

    # 象徴記号を検索（☰☷のような形式）
    symbol_match = re.search(r'[☰☱☲☳☴☵☶☷]{2,}', content)
    if symbol_match:
        details['symbol'] = symbol_match.group()

    # キーワードを抽出（「創造」「始まり」などの単語）
    keyword_patterns = [
        r'[創始建立開発興隆盛衰進退成功失敗危機機会変化安定調和対立統合分裂]',
        r'[吉凶禍福善悪明暗強弱大小高低上下内外]',
        r'[天地水火風雷山沢]'
    ]

    for pattern in keyword_patterns:
        matches = re.findall(pattern, content)
        details['keywords'].extend(matches)

    # 重複を除去
    details['keywords'] = list(set(details['keywords']))

    # 意味と助言を抽出（簡易版）
    lines = content.split('\n')
    meaning_lines = []
    advice_lines = []

    for line in lines[:10]:  # 最初の10行から抽出
        if any(word in line for word in ['意味', '解釈', '象徴']):
            meaning_lines.append(line)
        elif any(word in line for word in ['助言', 'アドバイス', '注意']):
            advice_lines.append(line)

    details['meaning'] = ' '.join(meaning_lines) if meaning_lines else content[:100] + "..."
    details['advice'] = ' '.join(advice_lines) if advice_lines else ""

    return details

def process_pdf_range(pdf_dir, start_pdf_range, end_pdf_range):
    """指定範囲のPDFファイルを処理"""

    pdf_dir = Path(pdf_dir)
    all_hexagrams = {}

    # PDFファイルをファイル名順に処理
    pdf_files = []
    for pdf_file in pdf_dir.glob("*.pdf"):
        # ファイル名から範囲を抽出 (例: "140-160.pdf" -> (140, 160))
        match = re.match(r'(\d+)-(\d+)\.pdf', pdf_file.name)
        if match:
            start_page = int(match.group(1))
            end_page = int(match.group(2))
            if start_pdf_range <= start_page <= end_pdf_range:
                pdf_files.append((start_page, end_page, pdf_file))

    # ソート
    pdf_files.sort(key=lambda x: x[0])

    print(f"Processing {len(pdf_files)} PDF files...")

    for start_page, end_page, pdf_file in pdf_files:
        print(f"\nProcessing: {pdf_file.name} ({start_page}-{end_page})")

        # PDFからテキスト抽出
        text_content = extract_text_from_pdf(pdf_file)

        if not text_content:
            print(f"Failed to extract text from {pdf_file.name}")
            continue

        # 卦情報を検索（推定範囲）
        estimated_start_hex = max(1, (start_page - 1) // 10)  # 大まかな推定
        estimated_end_hex = min(64, (end_page + 10) // 10)

        hexagrams = find_hexagram_info(text_content, estimated_start_hex, estimated_end_hex)

        print(f"Found {len(hexagrams)} hexagrams: {list(hexagrams.keys())}")

        # 詳細情報を抽出
        for hex_num, hex_info in hexagrams.items():
            details = extract_hexagram_details(hex_info['content'])

            # JSON形式に整理
            json_entry = {
                "id": f"hexagram_{hex_num:03d}",
                "name": hex_info['name'],
                "number": hex_num,
                "symbol": details['symbol'] or "☰☰",
                "description": hex_info['description'] or f"{hex_info['name']}の卦",
                "meaning": details['meaning'],
                "advice": details['advice'] or "詳細は原文を参照してください",
                "keywords": details['keywords'][:10],  # 最大10個
                "elements": [],  # 後で追加
                "category": "卦の詳細解釈"
            }

            all_hexagrams[hex_num] = json_entry

    return all_hexagrams

def main():
    """メイン処理"""

    pdf_directory = "data/易の元ファイル"
    output_file = "extracted_hexagrams.json"

    print("=== PDF から 64卦情報抽出ツール ===")
    print(f"PDF directory: {pdf_directory}")

    # まず小範囲でテスト（140-200ページ範囲）
    print("\nStep 1: Testing with small range (140-200 pages)...")
    test_hexagrams = process_pdf_range(pdf_directory, 140, 200)

    if test_hexagrams:
        print(f"\nTest successful! Found {len(test_hexagrams)} hexagrams")

        # テスト結果を保存
        with open("test_" + output_file, 'w', encoding='utf-8') as f:
            json.dump(list(test_hexagrams.values()), f, ensure_ascii=False, indent=2)

        print(f"Test results saved to test_{output_file}")

        # サンプル表示
        for hex_num in sorted(list(test_hexagrams.keys())[:3]):
            hex_info = test_hexagrams[hex_num]
            print(f"\nSample - Hexagram {hex_num}:")
            print(f"  Name: {hex_info['name']}")
            print(f"  Symbol: {hex_info['symbol']}")
            print(f"  Description: {hex_info['description']}")
            print(f"  Keywords: {hex_info['keywords']}")
    else:
        print("No hexagrams found in test range")
        return

    # ユーザー確認
    print(f"\nContinue with full extraction? (y/n): ", end="")

    # 自動実行（テスト用）
    response = "y"  # input().strip().lower()

    if response == 'y':
        print("Step 2: Full extraction (140-660 pages)...")
        all_hexagrams = process_pdf_range(pdf_directory, 140, 660)

        if all_hexagrams:
            # 結果を保存
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(list(all_hexagrams.values()), f, ensure_ascii=False, indent=2)

            print(f"\nFull extraction complete!")
            print(f"Found {len(all_hexagrams)} hexagrams")
            print(f"Results saved to {output_file}")
        else:
            print("No hexagrams found in full extraction")

    print("\nExtraction completed!")

if __name__ == "__main__":
    main()