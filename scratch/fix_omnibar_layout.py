import re

with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace omniBar style
old_omni = 'style="padding: 60px 40px; max-width: 95%; width: 100%; margin: 0 auto;"'
new_omni = 'style="padding: 60px 40px; width: 100%; display: flex; flex-direction: column; align-items: center; margin: 0 auto;"'
html = html.replace(old_omni, new_omni)

# Find search-card inside omniBar and give it 100% width and a large max-width
idx = html.find('id="omniBar"')
if idx != -1:
    search_card_idx = html.find('class="search-card"', idx)
    if search_card_idx != -1 and search_card_idx < idx + 500:
        html = html[:search_card_idx] + 'class="search-card" style="width: 100%; max-width: 1200px; margin: 0 auto;"' + html[search_card_idx+19:]

with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(html)
    print("Fixed omnibar layout!")
