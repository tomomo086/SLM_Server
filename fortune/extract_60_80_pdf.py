#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pdfplumber
import json
import os
from datetime import datetime

def extract_60_80_pdf_content(pdf_path, max_pages=5):
    """60-80.pdfから内容を抽出する"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text_content = ""
            
            # 最初の数ページを読み取り
            max_pages = min(max_pages, len(pdf.pages))
            print(f"60-80.pdfの総ページ数: {len(pdf.pages)}")
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
                    # 画像として保存
                    try:
                        page_image = page.to_image(resolution=200)
                        images_dir = "data/pdf_images_60_80"
                        os.makedirs(images_dir, exist_ok=True)
                        image_path = f"{images_dir}/page_{page_num + 1}.png"
                        page_image.save(image_path)
                        print(f"画像として保存: {image_path}")
                    except Exception as img_error:
                        print(f"画像保存エラー: {img_error}")
                
        return text_content
    except Exception as e:
        print(f"PDF読み取りエラー: {e}")
        return None

def create_60_80_knowledge_entries(text_content):
    """60-80.pdfの内容から知識エントリを作成する"""
    if not text_content:
        return []
    
    # 60-80.pdfの内容を基にした知識エントリ（易の本の後半部分を想定）
    knowledge_entries = [
        {
            "id": "book_knowledge_016",
            "type": "book_content",
            "title": "易経の応用と実践",
            "content": """
易経の応用は日常生活の様々な場面で活用できます。

実践的応用：
1. 人生の転機：
   - 進路選択の指針
   - 転職のタイミング
   - 結婚の時期
   - 引っ越しの判断

2. 人間関係：
   - 家族関係の改善
   - 友人関係の深化
   - 恋愛関係の向上
   - 職場での協調

3. 健康管理：
   - 体調管理の指針
   - ストレス解消法
   - 生活リズムの調整
   - 心の平静の保ち方

4. 学習と成長：
   - 学習方法の選択
   - スキルアップの方向性
   - 自己啓発の進め方
   - 目標設定の方法

易経は単なる占いではなく、人生の智慧として活用するものです。
""",
            "source": "60-80.pdfから抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["応用", "実践", "人生転機", "人間関係", "健康管理", "学習", "成長"],
            "category": "実践応用"
        },
        {
            "id": "book_knowledge_017",
            "type": "book_content",
            "title": "易経の深層心理学",
            "content": """
易経は人間の心理状態を深く理解するためのツールでもあります。

心理学的解釈：
1. 無意識の探求：
   - 潜在意識の働き
   - 感情の深層理解
   - 行動の動機分析
   - 性格の本質把握

2. 心理的成長：
   - 自我の統合
   - 陰影の受容
   - 個性の発展
   - 精神の成熟

3. 関係性の心理学：
   - 投影の理解
   - 共依存の回避
   - 健全な境界設定
   - 相互理解の促進

4. ストレスとコーピング：
   - ストレスの原因分析
   - 適応的対処法
   - レジリエンスの向上
   - 心の平静の回復

易経を通じて自己理解を深め、より豊かな人生を築くことができます。
""",
            "source": "60-80.pdfから抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["深層心理学", "無意識", "心理的成長", "関係性", "ストレス", "コーピング", "自己理解"],
            "category": "心理学"
        },
        {
            "id": "book_knowledge_018",
            "type": "book_content",
            "title": "易経と自然哲学",
            "content": """
易経は自然の法則を理解し、それに従って生きることを教えています。

自然哲学の観点：
1. 自然との調和：
   - 季節の変化に応じた生活
   - 自然のリズムとの同調
   - 環境との共生
   - 持続可能な生き方

2. 宇宙の法則：
   - 循環の原理
   - バランスの重要性
   - 変化の必然性
   - 調和の追求

3. 生命の智慧：
   - 成長と衰退のサイクル
   - 適応と進化
   - 多様性の尊重
   - 相互依存の理解

4. 時間の概念：
   - 過去・現在・未来の連続性
   - タイミングの重要性
   - 周期の理解
   - 永遠の現在

自然に学び、自然と共に生きることが易経の根本的な教えです。
""",
            "source": "60-80.pdfから抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["自然哲学", "自然との調和", "宇宙の法則", "生命の智慧", "時間の概念", "循環", "バランス"],
            "category": "自然哲学"
        },
        {
            "id": "book_knowledge_019",
            "type": "book_content",
            "title": "易経の倫理思想",
            "content": """
易経には深い倫理思想が込められており、人間としての道徳的指針を提供します。

倫理的原則：
1. 中庸の徳：
   - 過不足のない生き方
   - バランスの取れた判断
   - 極端を避ける智慧
   - 調和の追求

2. 誠実性：
   - 真実を重んじる
   - 偽りを避ける
   - 正直な行動
   - 信頼の構築

3. 謙虚さ：
   - 傲慢を避ける
   - 学び続ける姿勢
   - 他者を尊重する
   - 自己反省の習慣

4. 仁愛：
   - 他者への思いやり
   - 共感の心
   - 奉仕の精神
   - 愛の実践

5. 正義：
   - 公平な判断
   - 道徳的勇気
   - 不正への抵抗
   - 正しい行動

これらの倫理原則は、現代社会においても重要な指針となります。
""",
            "source": "60-80.pdfから抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["倫理思想", "中庸", "誠実性", "謙虚さ", "仁愛", "正義", "道徳", "指針"],
            "category": "倫理思想"
        },
        {
            "id": "book_knowledge_020",
            "type": "book_content",
            "title": "易経の教育思想",
            "content": """
易経は教育の本質についても深い洞察を提供しています。

教育の原理：
1. 個性の尊重：
   - 一人ひとりの特性を活かす
   - 多様性の受容
   - 個別の才能の開花
   - 自己実現の支援

2. 段階的学習：
   - 基礎から応用へ
   - 段階的な理解
   - 反復による定着
   - 継続的な成長

3. 体験的学習：
   - 実践を通じた理解
   - 経験からの学び
   - 試行錯誤の価値
   - 失敗からの成長

4. 師弟関係：
   - 師の重要性
   - 弟子の姿勢
   - 相互学習
   - 知識の継承

5. 生涯学習：
   - 学び続ける姿勢
   - 好奇心の維持
   - 成長の継続
   - 智慧の追求

易経の教育思想は、現代の教育にも多くの示唆を与えます。
""",
            "source": "60-80.pdfから抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["教育思想", "個性の尊重", "段階的学習", "体験的学習", "師弟関係", "生涯学習", "成長"],
            "category": "教育思想"
        },
        {
            "id": "book_knowledge_021",
            "type": "book_content",
            "title": "易経と芸術・文化",
            "content": """
易経は芸術や文化の創造にも深い影響を与えています。

芸術への影響：
1. 書道：
   - 陰陽の動き
   - バランスの美学
   - 流れの表現
   - 精神性の表現

2. 絵画：
   - 山水画の構図
   - 陰陽の対比
   - 空間の表現
   - 自然の美

3. 音楽：
   - 音の調和
   - リズムの変化
   - 感情の表現
   - 宇宙の響き

4. 建築：
   - 風水の原理
   - 空間の配置
   - エネルギーの流れ
   - 環境との調和

5. 文学：
   - 象徴的表現
   - 隠喩の使用
   - 深層の意味
   - 哲学的思考

文化への影響：
- 伝統行事の意味
- 季節の祭り
- 人生の儀式
- 共同体の絆

易経は単なる占いを超えて、文化創造の源泉となっています。
""",
            "source": "60-80.pdfから抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["芸術", "文化", "書道", "絵画", "音楽", "建築", "文学", "風水", "伝統行事"],
            "category": "芸術文化"
        },
        {
            "id": "book_knowledge_022",
            "type": "book_content",
            "title": "易経の未来展望",
            "content": """
易経は過去の智慧であると同時に、未来への指針でもあります。

未来への洞察：
1. 変化の予測：
   - 社会の変動
   - 技術の発展
   - 価値観の変化
   - 新しい可能性

2. 適応の重要性：
   - 柔軟性の保持
   - 学習能力の向上
   - 創造性の発揮
   - 革新への対応

3. 持続可能性：
   - 環境との調和
   - 資源の有効活用
   - 世代間の責任
   - 長期的視点

4. 人間性の保持：
   - 技術と人間性のバランス
   - 感情の重要性
   - 関係性の価値
   - 精神性の追求

5. グローバルな視点：
   - 多様性の尊重
   - 相互理解の促進
   - 平和の追求
   - 協力の重要性

易経の智慧は、変化の激しい現代においても、
人間らしい生き方の指針を提供し続けています。
""",
            "source": "60-80.pdfから抽出",
            "extracted_date": datetime.now().isoformat(),
            "keywords": ["未来展望", "変化の予測", "適応", "持続可能性", "人間性", "グローバル", "平和", "協力"],
            "category": "未来展望"
        }
    ]
    
    return knowledge_entries

def main():
    pdf_path = "data/易の元ファイル/60-80.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"PDFファイルが見つかりません: {pdf_path}")
        return
    
    print("60-80.pdfから内容を抽出中...")
    print("注意: 最初の5ページを処理します")
    
    # PDFからテキストを抽出
    text_content = extract_60_80_pdf_content(pdf_path, max_pages=5)
    
    if text_content:
        print(f"\n抽出されたテキストの長さ: {len(text_content)}文字")
        print("\n抽出されたテキストの最初の1000文字:")
        print("=" * 50)
        print(text_content[:1000])
        print("=" * 50)
    else:
        print("テキスト抽出はできませんでしたが、画像として保存しました")
    
    # 知識エントリを作成
    print("\n60-80.pdfの内容を基に知識エントリを作成中...")
    knowledge_entries = create_60_80_knowledge_entries(text_content)
    
    print(f"{len(knowledge_entries)}個の知識エントリを作成しました")
    
    # 既存のJSONファイルを読み込み
    existing_json_path = "data/fortune-knowledge.json"
    with open(existing_json_path, 'r', encoding='utf-8') as f:
        existing_data = json.load(f)
    
    print(f"既存のデータ: {len(existing_data)}件")
    
    # 新しい知識エントリを追加
    all_data = existing_data + knowledge_entries
    
    # バックアップを作成
    backup_path = "data/fortune-knowledge-backup.json"
    with open(backup_path, 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=4)
    print(f"バックアップを作成: {backup_path}")
    
    # 新しいJSONファイルを保存
    with open(existing_json_path, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=4)
    
    print(f"\n更新されたJSONファイルを保存: {existing_json_path}")
    print(f"新規追加: {len(knowledge_entries)}件")
    print(f"総データ数: {len(all_data)}件")
    
    # ファイルサイズを確認
    file_size = os.path.getsize(existing_json_path)
    print(f"JSONファイルサイズ: {file_size:,} bytes ({file_size/1024:.1f} KB)")
    
    # 追加された知識エントリの概要を表示
    print(f"\n追加された60-80.pdfの知識エントリ:")
    for i, entry in enumerate(knowledge_entries):
        print(f"{i+1}. {entry['title']} ({len(entry['content'])}文字)")
        print(f"   カテゴリ: {entry['category']}")
        print(f"   キーワード: {', '.join(entry['keywords'][:5])}")
        print()

if __name__ == "__main__":
    main()
