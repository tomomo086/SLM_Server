#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import fitz  # PyMuPDF
import os
from datetime import datetime

def extract_pdf_images(pdf_path, output_dir):
    """PDFから画像を抽出する"""
    
    # 出力ディレクトリを作成
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"出力ディレクトリを作成: {output_dir}")
    
    # PDFファイルを開く
    pdf_document = fitz.open(pdf_path)
    print(f"PDFファイルを開きました: {pdf_path}")
    print(f"総ページ数: {len(pdf_document)}")
    
    extracted_images = []
    
    # 各ページを処理
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        print(f"ページ {page_num + 1} を処理中...")
        
        # ページから画像リストを取得
        image_list = page.get_images()
        
        if image_list:
            print(f"  画像を {len(image_list)} 個発見")
            
            for img_index, img in enumerate(image_list):
                # 画像の参照を取得
                xref = img[0]
                pix = fitz.Pixmap(pdf_document, xref)
                
                # 画像が有効かチェック
                if pix.n - pix.alpha < 4:  # GRAY or RGB
                    # 画像ファイル名を生成
                    img_filename = f"page_{page_num + 1}_img_{img_index + 1}.png"
                    img_path = os.path.join(output_dir, img_filename)
                    
                    # 画像を保存
                    pix.save(img_path)
                    extracted_images.append(img_path)
                    print(f"    画像を保存: {img_filename}")
                else:
                    print(f"    画像 {img_index + 1} はスキップ（CMYK形式）")
                
                pix = None
        
        else:
            print(f"  画像は見つかりませんでした")
    
    # PDFを閉じる
    pdf_document.close()
    
    print(f"\n抽出完了!")
    print(f"抽出された画像数: {len(extracted_images)}")
    
    return extracted_images

def main():
    print("20-40.pdfから画像を抽出中...")
    
    # ファイルパスを設定
    pdf_path = "data/易の元ファイル/20-40.pdf"
    output_dir = "data/pdf_images_20_40"
    
    # ファイルの存在確認
    if not os.path.exists(pdf_path):
        print(f"エラー: PDFファイルが見つかりません: {pdf_path}")
        return
    
    print(f"PDFファイル: {pdf_path}")
    print(f"出力ディレクトリ: {output_dir}")
    print(f"開始時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)
    
    try:
        # 画像を抽出
        extracted_images = extract_pdf_images(pdf_path, output_dir)
        
        print("-" * 50)
        print(f"完了時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        if extracted_images:
            print(f"\n抽出された画像ファイル:")
            for img_path in extracted_images:
                file_size = os.path.getsize(img_path)
                print(f"  {os.path.basename(img_path)} ({file_size:,} bytes)")
        else:
            print("\n抽出された画像はありませんでした")
            
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
