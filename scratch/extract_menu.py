import os
import glob
from PIL import Image
import easyocr
import json

def process_menu():
    os.makedirs('scratch/menu_resized', exist_ok=True)
    jpg_files = sorted(glob.glob('scratch/menu_jpg/*.jpg'))
    
    resized_files = []
    for f in jpg_files:
        out_f = os.path.join('scratch/menu_resized', os.path.basename(f))
        im = Image.open(f)
        im.thumbnail((1200, 1200))
        im.save(out_f, quality=85)
        resized_files.append((os.path.basename(f), out_f))

    print(f"Resized {len(resized_files)} files.")
    
    reader = easyocr.Reader(['en'], gpu=False)
    
    extracted_data = {}
    for fname, path in resized_files:
        print(f"Reading {fname}...")
        results = reader.readtext(path, detail=0)
        extracted_data[fname] = results
        print(f"  Extracted {len(results)} lines.")

    with open('scratch/menu_extracted.json', 'w', encoding='utf-8') as out:
        json.dump(extracted_data, out, indent=2)

    print("Extraction complete. Saved to scratch/menu_extracted.json")

if __name__ == '__main__':
    process_menu()
