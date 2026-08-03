import re

def update_index():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Body background to a soft, friendly clinical gradient (light slate/blue)
    content = re.sub(r'body\s*\{\s*font-family:\s*\'Inter\',\s*sans-serif;\s*background:\s*#ffffff;', "body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #f4f9f9 0%, #e0f2fe 100%); background-attachment: fixed;", content)
    
    # Text colors
    content = re.sub(r'color:\s*#111827;', 'color: #1e293b;', content) # Slate 800 for main text
    content = re.sub(r'color:\s*#4b5563;', 'color: #475569;', content) # Slate 600 for muted text

    # Hero tweaks
    content = re.sub(r'\.hero::before\s*\{\s*display:\s*none;\s*\}', '.hero::before { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(14, 165, 233, 0.1) 0%, transparent 60%); }', content)
    
    # Portal cards
    # From background: #f9fafb; border: 1px solid #e5e7eb;
    content = re.sub(r'background:\s*#f9fafb;\s*border:\s*1px\s+solid\s+#e5e7eb;', 'background: rgba(255, 255, 255, 0.85); border: 1px solid rgba(14, 165, 233, 0.15); box-shadow: 0 10px 30px rgba(14, 165, 233, 0.08); backdrop-filter: blur(10px);', content)
    content = re.sub(r'border-color:\s*#d1d5db;', 'border-color: rgba(14, 165, 233, 0.3);', content)
    
    # Stat cards
    content = re.sub(r'\.stat-card\s*\{[^}]*?background:\s*#f9fafb;\s*border:\s*1px\s+solid\s+#e5e7eb;', '.stat-card { background: rgba(255, 255, 255, 0.8); border: 1px solid rgba(14, 165, 233, 0.15); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03); backdrop-filter: blur(5px);', content)

    # Features Section
    content = re.sub(r'\.features\s*\{[^}]*?background:\s*#f3f4f6;', '.features { background: rgba(255, 255, 255, 0.5); border-top: 1px solid rgba(14, 165, 233, 0.1);', content)
    content = re.sub(r'\.feature-card\s*\{[^}]*?background:\s*#ffffff;\s*border:\s*1px\s+solid\s+#e5e7eb;', '.feature-card { background: #ffffff; border: 1px solid rgba(14, 165, 233, 0.1); box-shadow: 0 4px 15px rgba(14, 165, 233, 0.04);', content)
    
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)


def update_portal():
    with open('public/portal.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Soft clinical background
    content = content.replace('--bg-color: #F9FAFB;', '--bg-color: #f4f9f9;')
    
    # Update text colors slightly to be softer than pure black
    content = content.replace('--text-main: #111827;', '--text-main: #1e293b;')
    content = content.replace('--text-muted: #6B7280;', '--text-muted: #475569;')
    
    # Update glass panels to have a beautiful soft shadow
    content = content.replace('--glass-bg: rgba(255, 255, 255, 1);', '--glass-bg: rgba(255, 255, 255, 0.9);')
    content = content.replace('--glass-border: rgba(0, 0, 0, 0.1);', '--glass-border: rgba(14, 165, 233, 0.15);')
    
    # Add a custom style block just before </head> to inject a soft gradient background to the body and better box shadows
    custom_css = """
  <style>
    body {
      background: linear-gradient(135deg, #f4f9f9 0%, #e0f2fe 100%);
      background-attachment: fixed;
    }
    .glass {
      box-shadow: 0 10px 30px rgba(14, 165, 233, 0.08);
      backdrop-filter: blur(12px);
    }
    .grid-card {
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .grid-card:hover {
      box-shadow: 0 15px 35px rgba(14, 165, 233, 0.12);
      border-color: rgba(14, 165, 233, 0.3);
      transform: translateY(-2px);
    }
    /* Fix input fields for light mode to look premium */
    .form-input-field {
      background: #ffffff !important;
      border: 1px solid #cbd5e1 !important;
      color: #1e293b !important;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    .form-input-field:focus {
      border-color: #0ea5e9 !important;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2) !important;
      background: #ffffff !important;
    }
    .form-label {
      color: #475569 !important;
    }
    input, select {
      background: #ffffff !important;
      border: 1px solid #cbd5e1 !important;
      color: #1e293b !important;
    }
  </style>
</head>"""
    
    content = content.replace('</head>', custom_css)
    
    with open('public/portal.html', 'w', encoding='utf-8') as f:
        f.write(content)

update_index()
update_portal()
print("SUCCESS: Colors updated to premium clinical theme.")
