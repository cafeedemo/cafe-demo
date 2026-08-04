import os
import glob
from PIL import Image
import pytesseract
import json

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_all():
    jpg_files = sorted(glob.glob('scratch/menu_jpg/*.jpg'))
    extracted = {}
    
    for f in jpg_files:
        fname = os.path.basename(f)
        try:
            im = Image.open(f)
            text = pytesseract.image_to_string(im)
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            extracted[fname] = lines
            print(f"Extracted {len(lines)} lines from {fname}")
        except Exception as e:
            print(f"Error on {fname}: {e}")

    with open('scratch/menu_ocr_result.json', 'w', encoding='utf-8') as out:
        json.dump(extracted, out, indent=2)

    print("Done writing scratch/menu_ocr_result.json")

if __name__ == '__main__':
    extract_all()
