import re

def update_index_to_blue():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Body background to a cool deep blue gradient
    content = re.sub(
        r'body\s*\{[^}]*?background:\s*linear-gradient[^;]+;',
        "body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #0b192c 0%, #1e3a8a 100%);",
        content
    )
    
    # Global text color to white
    content = re.sub(r'color:\s*#1e293b;', 'color: #ffffff;', content)
    content = re.sub(r'color:\s*#0F172A;', 'color: #ffffff;', content)
    content = re.sub(r'color:\s*#475569;', 'color: rgba(255, 255, 255, 0.85);', content)
    
    # Hero text
    content = content.replace('<h1 style="font-weight: 400; font-size: 2.2rem; margin-bottom: 12px;">', '<h1 style="font-weight: 400; font-size: 2.2rem; margin-bottom: 12px; color: #ffffff;">')
    content = content.replace('<p style="font-weight: 300; font-size: 1.1rem; opacity: 0.7;">', '<p style="font-weight: 300; font-size: 1.1rem; opacity: 0.9; color: #ffffff;">')

    # Portal Cards
    content = re.sub(
        r'\.pcard\s*\{[^}]*?background:\s*rgba\(255,\s*255,\s*255,\s*0\.85\);',
        ".pcard { background: rgba(255, 255, 255, 0.1);",
        content
    )
    # Portal card text is already matched by #1e293b replacement, but let's ensure it's white
    content = content.replace('color: rgba(255,255,255,0.45);', 'color: rgba(255,255,255,0.85);')
    
    # Stats bar text
    content = content.replace('color: rgba(255,255,255,0.6);', 'color: rgba(255,255,255,0.9);')
    
    # Feature cards background
    content = re.sub(
        r'\.feat\s*\{[^}]*?background:\s*rgba\(255,255,255,0\.05\);',
        ".feat { padding: 28px; border-radius: 16px; background: rgba(255, 255, 255, 0.1);",
        content
    )

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)

update_index_to_blue()
print("SUCCESS: Updated index.html to cool blue theme with white text.")
