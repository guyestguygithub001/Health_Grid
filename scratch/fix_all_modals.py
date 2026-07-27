"""
Fix ALL modals with display:flex inline that use classList for toggle.
Replaces them with display:none as default.
"""

def fix_modal_display(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes = 0
    
    # Pattern: fixed position modals with display:flex inline that have class="hidden"
    # These will always show because inline style > class
    import re
    
    # Find all divs that have: class="hidden" AND style="...display: flex..."
    # Replace their display: flex with display: none
    def fix_hidden_flex(match):
        nonlocal changes
        full = match.group(0)
        if 'class="hidden"' in full or "class='hidden'" in full:
            fixed = full.replace('display: flex', 'display: none')
            if fixed != full:
                changes += 1
                return fixed
        return full

    # Match opening div tags only (single line)
    content = re.sub(r'<div[^>]+>', fix_hidden_flex, content)
    
    print(f"{filepath}: {changes} modals fixed")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_modal_display('public/emr.html')
fix_modal_display('public/admin.html')
print("Done.")
