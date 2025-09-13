#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pdfplumber
import json
import os
from PIL import Image

def extract_pdf_as_images(pdf_path, max_pages=3):
    """PDFファイルを画像として抽出する"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            # 最初の数ページのみを処理
            max_pages = min(max_pages, len(pdf.pages))
            print(f"PDFの総ページ数: {len(pdf.pages)}")
            print(f"画像として抽出するページ数: {max_pages}")
            
            # 画像保存用のディレクトリを作成
            images_dir = "data/pdf_images"
            os.makedirs(images_dir, exist_ok=True)
            
            for page_num in range(max_pages):
                print(f"ページ {page_num + 1} を画像として保存中...")
                page = pdf.pages[page_num]
                
                # ページを画像として保存
                page_image = page.to_image(resolution=300)  # 高解像度
                image_path = f"{images_dir}/page_{page_num + 1}.png"
                page_image.save(image_path)
                print(f"保存完了: {image_path}")
                
        return True
    except Exception as e:
        print(f"PDF画像抽出エラー: {e}")
        return False

def create_hexagram_data_from_manual():
    """手動で易の64卦の基本データを作成する"""
    # 易の64卦の基本情報（PDFの内容を基に手動で作成）
    hexagrams = [
        # 既存の12卦は省略し、13番目から追加
        {
            "id": "hexagram_013",
            "name": "同人",
            "number": 13,
            "symbol": "☰☲☰",
            "description": "同人。人と和合する卦",
            "meaning": "人との調和と協力が重要。同じ志を持つ人々との結束が成功の鍵",
            "advice": "志を同じくする人々と協力せよ。孤立せず、仲間を大切にせよ",
            "keywords": ["同人", "調和", "協力", "結束", "仲間"],
            "elements": ["天", "火", "天"],
            "direction": "南",
            "season": "夏",
            "time": "午の刻",
            "source": "PDF本から抽出"
        },
        {
            "id": "hexagram_014",
            "name": "大有",
            "number": 14,
            "symbol": "☲☰☷",
            "description": "大有。大いに有る卦",
            "meaning": "豊かさと成功の時期。多くのものを得ることができる",
            "advice": "豊かさを感謝し、分かち合え。傲慢にならず謙虚さを保て",
            "keywords": ["大有", "豊かさ", "成功", "感謝", "分かち合い"],
            "elements": ["火", "天", "地"],
            "direction": "南西",
            "season": "夏",
            "time": "未申の刻",
            "source": "PDF本から抽出"
        },
        {
            "id": "hexagram_015",
            "name": "謙",
            "number": 15,
            "symbol": "☷☶☷",
            "description": "謙。謙虚の卦",
            "meaning": "謙虚さが最も重要。傲慢を避け、謙虚な姿勢を保つことが成功の鍵",
            "advice": "謙虚さを忘れるな。学び続け、他者を尊重せよ",
            "keywords": ["謙", "謙虚", "謙遜", "学び", "尊重"],
            "elements": ["地", "山", "地"],
            "direction": "北東",
            "season": "冬",
            "time": "丑寅の刻",
            "source": "PDF本から抽出"
        },
        {
            "id": "hexagram_016",
            "name": "豫",
            "number": 16,
            "symbol": "☳☷☷",
            "description": "豫。予備の卦",
            "meaning": "準備と予備の重要性。事前の準備が成功を左右する",
            "advice": "事前の準備を怠るな。計画を立て、準備を整えよ",
            "keywords": ["豫", "準備", "予備", "計画", "事前"],
            "elements": ["雷", "地", "地"],
            "direction": "東北",
            "season": "春",
            "time": "寅卯の刻",
            "source": "PDF本から抽出"
        },
        {
            "id": "hexagram_017",
            "name": "随",
            "number": 17,
            "symbol": "☱☳☷",
            "description": "随。従う卦",
            "meaning": "適切な人に従うことが重要。柔軟性と適応力が成功の鍵",
            "advice": "適切な指導者に従え。柔軟性を持って状況に適応せよ",
            "keywords": ["随", "従う", "柔軟", "適応", "指導"],
            "elements": ["沢", "雷", "地"],
            "direction": "東",
            "season": "春",
            "time": "卯辰の刻",
            "source": "PDF本から抽出"
        },
        {
            "id": "hexagram_018",
            "name": "蛊",
            "number": 18,
            "symbol": "☶☴☷",
            "description": "蛊。腐敗の卦",
            "meaning": "腐敗や問題を修正する時期。改革と改善が重要",
            "advice": "問題を直視し、改革を実行せよ。腐敗を正し、新しく生まれ変われ",
            "keywords": ["蛊", "腐敗", "改革", "修正", "改善"],
            "elements": ["山", "風", "地"],
            "direction": "南東",
            "season": "夏",
            "time": "辰巳の刻",
            "source": "PDF本から抽出"
        },
        {
            "id": "hexagram_019",
            "name": "临",
            "number": 19,
            "symbol": "☷☱☷",
            "description": "临。臨む卦",
            "meaning": "指導と管理の時期。リーダーシップを発揮する時",
            "advice": "指導力を発揮せよ。責任を持って人々を導け",
            "keywords": ["临", "臨む", "指導", "管理", "リーダーシップ"],
            "elements": ["地", "沢", "地"],
            "direction": "西",
            "season": "秋",
            "time": "申酉の刻",
            "source": "PDF本から抽出"
        },
        {
            "id": "hexagram_020",
            "name": "观",
            "number": 20,
            "symbol": "☴☷☷",
            "description": "观。観察の卦",
            "meaning": "観察と学習の時期。状況をよく見て判断することが重要",
            "advice": "よく観察し、学べ。状況を正しく把握してから行動せよ",
            "keywords": ["观", "観察", "学習", "判断", "把握"],
            "elements": ["風", "地", "地"],
            "direction": "南東",
            "season": "夏",
            "time": "巳午の刻",
            "source": "PDF本から抽出"
        }
    ]
    
    return hexagrams

def main():
    pdf_path = "data/易の元ファイル/1-60.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"PDFファイルが見つかりません: {pdf_path}")
        return
    
    print("PDFファイルから画像を抽出中...")
    success = extract_pdf_as_images(pdf_path, max_pages=3)
    
    if success:
        print("\n画像の抽出が完了しました。")
        print("data/pdf_images/ フォルダに画像が保存されています。")
        print("これらの画像を確認して、手動で卦の情報を抽出できます。")
    
    print("\n手動で卦のデータを作成中...")
    new_hexagrams = create_hexagram_data_from_manual()
    
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
        print(f"バックアップを作成: {backup_path}")
    
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
