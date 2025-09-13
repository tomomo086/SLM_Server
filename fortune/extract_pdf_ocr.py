#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pdfplumber
import pytesseract
from PIL import Image
import json
import re
import sys
import os
import io

def extract_pdf_with_ocr(pdf_path, max_pages=5):
    """PDFファイルからOCRを使用して内容を抽出する"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            
            # 最初の数ページのみを読み取り（ファイルサイズを考慮）
            max_pages = min(max_pages, len(pdf.pages))
            print(f"PDFの総ページ数: {len(pdf.pages)}")
            print(f"読み取るページ数: {max_pages}")
            
            for page_num in range(max_pages):
                print(f"ページ {page_num + 1} を処理中...")
                page = pdf.pages[page_num]
                
                # まず通常のテキスト抽出を試す
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text += f"\n--- ページ {page_num + 1} ---\n"
                    text += page_text
                    print(f"ページ {page_num + 1}: テキスト抽出成功")
                else:
                    # OCRを使用
                    try:
                        # ページを画像として取得
                        page_image = page.to_image(resolution=200)
                        pil_image = page_image.original
                        
                        # OCRでテキストを抽出（日本語対応）
                        ocr_text = pytesseract.image_to_string(pil_image, lang='jpn')
                        if ocr_text.strip():
                            text += f"\n--- ページ {page_num + 1} (OCR) ---\n"
                            text += ocr_text
                            print(f"ページ {page_num + 1}: OCR抽出成功")
                        else:
                            print(f"ページ {page_num + 1}: OCRでもテキストを抽出できませんでした")
                    except Exception as ocr_error:
                        print(f"ページ {page_num + 1}: OCRエラー - {ocr_error}")
                
        return text
    except Exception as e:
        print(f"PDF読み取りエラー: {e}")
        return None

def parse_hexagram_from_text(text):
    """テキストから卦の情報を抽出する"""
    hexagrams = []
    
    # より柔軟なパターンマッチング
    patterns = [
        r'(\d+)[\s、．・]\s*([一-龯]+)',  # 数字 + 漢字
        r'第(\d+)[\s、．・]\s*([一-龯]+)',  # 第X + 漢字
        r'(\d+)[\s、．・]\s*([一-龯]+)[\s、．・]',  # 数字 + 漢字 + 区切り
        r'([一-龯]+)[\s、．・]\s*(\d+)',  # 漢字 + 数字
    ]
    
    lines = text.split('\n')
    found_hexagrams = set()
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue
            
        # 各パターンでマッチングを試す
        for pattern in patterns:
            matches = re.findall(pattern, line)
            for match in matches:
                try:
                    if len(match) == 2:
                        # 数字と漢字の組み合わせを探す
                        if match[0].isdigit() and re.match(r'[一-龯]', match[1]):
                            number = int(match[0])
                            name = match[1]
                        elif match[1].isdigit() and re.match(r'[一-龯]', match[0]):
                            number = int(match[1])
                            name = match[0]
                        else:
                            continue
                        
                        # 重複チェック
                        key = (number, name)
                        if key not in found_hexagrams and 1 <= number <= 64:
                            found_hexagrams.add(key)
                            
                            # その行の前後の文脈を取得
                            context = get_context_around_line(lines, line)
                            
                            hexagram = {
                                "id": f"hexagram_{number:03d}",
                                "name": name,
                                "number": number,
                                "symbol": "",  # 後で設定
                                "description": f"{name}の卦。{context[:100]}..." if context else f"{name}の卦",
                                "meaning": context[:200] if context else f"{name}の意味",
                                "advice": f"{name}に関する助言",
                                "keywords": [name],
                                "elements": [],
                                "direction": "",
                                "season": "",
                                "time": "",
                                "source": "PDF本から抽出"
                            }
                            hexagrams.append(hexagram)
                            print(f"卦を発見: {number} - {name}")
                except (ValueError, IndexError):
                    continue
    
    return hexagrams

def get_context_around_line(lines, target_line, context_size=3):
    """指定された行の前後の文脈を取得する"""
    try:
        target_index = lines.index(target_line)
        start = max(0, target_index - context_size)
        end = min(len(lines), target_index + context_size + 1)
        context_lines = lines[start:end]
        return ' '.join(context_lines).strip()
    except ValueError:
        return ""

def main():
    pdf_path = "data/易の元ファイル/1-60.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"PDFファイルが見つかりません: {pdf_path}")
        return
    
    print("PDFファイルからOCRを使用して内容を抽出中...")
    print("注意: 最初の5ページのみを処理します（処理時間を考慮）")
    
    text = extract_pdf_with_ocr(pdf_path, max_pages=5)
    
    if not text:
        print("PDFの読み取りに失敗しました")
        return
    
    print("\n抽出されたテキストの最初の2000文字:")
    print("=" * 50)
    print(text[:2000])
    print("=" * 50)
    
    print("\n卦のデータを解析中...")
    new_hexagrams = parse_hexagram_from_text(text)
    
    if not new_hexagrams:
        print("卦のデータが見つかりませんでした")
        print("\n抽出されたテキストの詳細:")
        print(text)
        return
    
    print(f"\n{len(new_hexagrams)}個の卦を発見しました")
    for h in new_hexagrams:
        print(f"  {h['number']}: {h['name']}")
    
    # 既存のJSONファイルを読み込み
    existing_json_path = "data/fortune-knowledge.json"
    existing_hexagrams = []
    
    if os.path.exists(existing_json_path):
        with open(existing_json_path, 'r', encoding='utf-8') as f:
            existing_hexagrams = json.load(f)
        print(f"\n既存の卦: {len(existing_hexagrams)}個")
    
    # 新しい卦を既存のデータに追加（重複を避ける）
    all_hexagrams = existing_hexagrams.copy()
    existing_numbers = {h['number'] for h in existing_hexagrams}
    
    added_count = 0
    for hexagram in new_hexagrams:
        if hexagram['number'] not in existing_numbers:
            all_hexagrams.append(hexagram)
            existing_numbers.add(hexagram['number'])
            added_count += 1
    
    # 番号順にソート
    all_hexagrams.sort(key=lambda x: x['number'])
    
    # バックアップを作成
    backup_path = "data/fortune-knowledge-backup.json"
    if os.path.exists(existing_json_path):
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(existing_hexagrams, f, ensure_ascii=False, indent=4)
        print(f"\nバックアップを作成: {backup_path}")
    
    # 新しいJSONファイルを保存
    with open(existing_json_path, 'w', encoding='utf-8') as f:
        json.dump(all_hexagrams, f, ensure_ascii=False, indent=4)
    
    print(f"\n更新されたJSONファイルを保存: {existing_json_path}")
    print(f"新規追加: {added_count}個")
    print(f"総卦数: {len(all_hexagrams)}個")
    
    # ファイルサイズを確認
    file_size = os.path.getsize(existing_json_path)
    print(f"JSONファイルサイズ: {file_size:,} bytes ({file_size/1024:.1f} KB)")

if __name__ == "__main__":
    main()
