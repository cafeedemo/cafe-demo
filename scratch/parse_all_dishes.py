import json
import re

with open('scratch/menu_ocr_result.json', 'r', encoding='utf-8') as f:
    ocr_data = json.load(f)

# Define category mapping rules based on headers / keywords
def detect_category(line, current_cat):
    l = line.upper()
    if 'SOUP' in l:
        return 'SOUP'
    if any(k in l for k in ['ORIENTAL INTERNATIONAL', 'INDIAN STARTER', 'DIMSUM', 'BAO', 'SUSHI', 'STARTER']):
        return 'STARTERS'
    if any(k in l for k in ['CONTINENTAL', 'RISOTTO', 'NAANZA', 'PASTA', 'BAKED']):
        return 'CONTINENTAL'
    if any(k in l for k in ['CHINESE MAIN', 'NOODLES', 'CHOPCY', 'CHOP SUEY']):
        return 'CHINESE'
    if any(k in l for k in ['PANEER MAIN', 'VEG. MAIN', 'VEGETABLE GRAVY', 'INDIAN MAIN']):
        return 'INDIAN_MAIN'
    if any(k in l for k in ['DAL & RICE', 'INDIAN BREAD', 'ROTI', 'NAAN', 'PARATHA', 'BREAD BAR']):
        return 'BREADS_RICE'
    if any(k in l for k in ['MILK SHAKE', 'MOCKTAIL', 'BEVERAGE', 'SMOOTHIE', 'DRINKS']):
        return 'BEVERAGES'
    if any(k in l for k in ['SALAD', 'ACCOMPANIMENTS', 'RAITA', 'PAPAD']):
        return 'SALADS'
    if any(k in l for k in ['DESSERT', 'ICE-CREAM', 'BROWNIE']):
        return 'DESSERTS'
    if any(k in l for k in ['SIZZLER', 'SPECIAL']):
        return 'SPECIALS'
    return current_cat

items = []

for file_name, lines in ocr_data.items():
    current_cat = 'FOOD'
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        
        # Check if line is a header
        new_cat = detect_category(line, current_cat)
        if new_cat != current_cat and ('BAR' in line.upper() or 'SOUP' in line.upper() or 'DESSERT' in line.upper() or 'SHAKE' in line.upper() or 'COURSE' in line.upper()):
            current_cat = new_cat
            i += 1
            continue

        # Look for dish pattern: "Dish Name 350" or "Dish Name" followed by price
        match = re.search(r'^(.*?)\s+([0-9]{2,4})\b', line)
        if match:
            name = match.group(1).strip(' *.-_r()')
            price = float(match.group(2))
            desc = ""
            # Check next line for description if it doesn't start with price or header
            if i + 1 < len(lines):
                next_line = lines[i+1].strip()
                if not re.search(r'\b[0-9]{2,4}\b', next_line) and len(next_line) > 10 and not any(h in next_line.upper() for h in ['BAR', 'SOUP', 'MENU']):
                    desc = next_line.strip(' *.-_')
                    i += 1
            
            if len(name) > 2 and price >= 30 and price <= 3000:
                items.append({
                    'name': name,
                    'description': desc if desc else None,
                    'price': price,
                    'category': current_cat,
                    'file': file_name
                })
        i += 1

print(f"Total dishes extracted: {len(items)}")

with open('scratch/parsed_menu_items.json', 'w', encoding='utf-8') as out:
    json.dump(items, out, indent=2)
