import re

with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace console.error in loadBilling
html = re.sub(
    r'(async\s+function\s+loadBilling\(\)\s*\{[\s\S]*?catch\s*\(\w+\)\s*\{)([\s\S]*?)(^\s*\})',
    lambda m: m.group(1) + '\n        window.showGlobalError("Failed to load billing data.");\n        console.error("Billing error", err);\n' + m.group(3),
    html,
    flags=re.MULTILINE
)

# Replace console.error in loadRecordsData
html = re.sub(
    r'(async\s+function\s+loadRecordsData\(\)\s*\{[\s\S]*?catch\s*\(\w+\)\s*\{)([\s\S]*?)(^\s*\})',
    lambda m: m.group(1) + '\n        window.showGlobalError("Failed to load records data.");\n        console.error("Records error", err);\n' + m.group(3),
    html,
    flags=re.MULTILINE
)

with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(html)
