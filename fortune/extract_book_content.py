#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pdfplumber
import json
import re
import os
from datetime import datetime

def extract_pdf_text_content(pdf_path, max_pages=10):
    """PDFファイルからテキスト内容を抽出する"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text_content = ""
            
            # 最初の数ページを読み取り
            max_pages = min(max_pages, len(pdf.pages))
            print(f"PDFの総ページ数: {len(pdf.pages)}")
            print(f"読み取るページ数: {max_pages}")
            
            for page_num in range(max_pages):
                print(f"ページ {page_num + 1} を処理中...")
                page = pdf.pages[page_num]
                
                # テキスト抽出を試す
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text_content += f"\n--- ページ {page_num + 1} ---\n"
                    text_content += page_text
                    print(f"ページ {page_num + 1}: テキスト抽出成功 ({len(page_text)}文字)")
                else:
                    print(f"ページ {page_num + 1}: テキスト抽出できませんでした")
                
        return text_content
    except Exception as e:
        print(f"PDF読み取りエラー: {e}")
        return None

def create_book_knowledge_entries(text_content):
    """抽出したテキストから知識エントリを作成する"""
    if not text_content:
        return []
    
    # テキストを段落に分割
    paragraphs = [p.strip() for p in text_content.split('\n') if p.strip()]
    
    knowledge_entries = []
    current_entry = ""
    entry_count = 0
    
    for paragraph in paragraphs:
        # ページ区切りをスキップ
        if paragraph.startswith('--- ページ'):
            continue
            
        # 段落が短すぎる場合は次の段落と結合
        if len(paragraph) < 50:
            current_entry += paragraph + " "
            continue
            
        # 現在のエントリが十分な長さになったら保存
        if len(current_entry.strip()) > 100:
            entry_count += 1
            knowledge_entry = {
                "id": f"book_knowledge_{entry_count:03d}",
                "type": "book_content",
                "title": f"易の本の内容 - 第{entry_count}節",
                "content": current_entry.strip(),
                "source": "PDF本から抽出",
                "extracted_date": datetime.now().isoformat(),
                "keywords": extract_keywords(current_entry),
                "category": "易学知識"
            }
            knowledge_entries.append(knowledge_entry)
            current_entry = ""
        
        current_entry += paragraph + " "
    
    # 最後のエントリを保存
    if len(current_entry.strip()) > 50:
        entry_count += 1
        knowledge_entry = {
            "id": f"book_knowledge_{entry_count:03d}",
            "type": "book_content",
            "title": f"易の本の内容 - 第{entry_count}節",
            "content": current_entry.strip(),
            "source": "PDF本から抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": extract_keywords(current_entry),
            "category": "易学知識"
        }
        knowledge_entries.append(knowledge_entry)
    
    return knowledge_entries

def extract_keywords(text):
    """テキストからキーワードを抽出する"""
    # 易学関連のキーワードを探す
    keywords = []
    
    # 卦名のパターン
    hexagram_patterns = [
        r'([一-龯]{1,3})卦',  # 漢字 + 卦
        r'第(\d+)[\s、．・]?\s*([一-龯]+)',  # 第X + 漢字
        r'(\d+)[\s、．・]?\s*([一-龯]+)',  # 数字 + 漢字
    ]
    
    for pattern in hexagram_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            if isinstance(match, tuple):
                keywords.extend([m for m in match if m and len(m) > 0])
            else:
                if match and len(match) > 0:
                    keywords.append(match)
    
    # 易学用語
    terms = ['乾', '坤', '屯', '蒙', '需', '訟', '師', '比', '小畜', '履', '泰', '否',
             '同人', '大有', '謙', '豫', '随', '蛊', '临', '观', '噬嗑', '贲', '剥', '复',
             '无妄', '大畜', '颐', '大过', '坎', '离', '咸', '恒', '遁', '大壮', '晋', '明夷',
             '家人', '睽', '蹇', '解', '损', '益', '夬', '姤', '萃', '升', '困', '井',
             '革', '鼎', '震', '艮', '渐', '归妹', '丰', '旅', '巽', '兑', '涣', '节',
             '中孚', '小过', '既济', '未济']
    
    for term in terms:
        if term in text:
            keywords.append(term)
    
    # 重複を除去
    return list(set(keywords))

def main():
    pdf_path = "data/易の元ファイル/1-60.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"PDFファイルが見つかりません: {pdf_path}")
        return
    
    print("PDFファイルから本の内容を抽出中...")
    print("注意: 最初の10ページを処理します")
    
    # PDFからテキストを抽出
    text_content = extract_pdf_text_content(pdf_path, max_pages=10)
    
    if not text_content:
        print("PDFの読み取りに失敗しました")
        return
    
    print(f"\n抽出されたテキストの長さ: {len(text_content)}文字")
    print("\n抽出されたテキストの最初の1000文字:")
    print("=" * 50)
    print(text_content[:1000])
    print("=" * 50)
    
    # 知識エントリを作成
    print("\n知識エントリを作成中...")
    book_entries = create_book_knowledge_entries(text_content)
    
    if not book_entries:
        print("知識エントリを作成できませんでした")
        return
    
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
    for i, entry in enumerate(book_entries[:5]):  # 最初の5件を表示
        print(f"{i+1}. {entry['title']} ({len(entry['content'])}文字)")
        if entry['keywords']:
            print(f"   キーワード: {', '.join(entry['keywords'][:5])}")
    
    if len(book_entries) > 5:
        print(f"... 他 {len(book_entries) - 5}件")

if __name__ == "__main__":
    main()
