import re

# 1. Update index.html
with open('public/index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

# Make index.html white
idx = re.sub(r"body\s*\{\s*font-family:\s*'Inter',\s*sans-serif;\s*background:\s*linear-gradient[^;]+;", "body { font-family: 'Inter', sans-serif; background: #ffffff;", idx)
idx = re.sub(r'color:\s*#fff;', 'color: #111827;', idx)
idx = re.sub(r'\.hero::before\s*\{[^}]+\}', '.hero::before { display: none; }', idx)
idx = re.sub(r'\.hero\s+h1\s*\{[^}]*?color:\s*#fff;', '.hero h1 { position: relative; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 800; color: #111827;', idx)
idx = re.sub(r'color:\s*rgba\(255,255,255,0\.55\);', 'color: #4b5563;', idx)
idx = re.sub(r'background:\s*rgba\(255,255,255,0\.06\);\s*border:\s*1px\s+solid\s+rgba\(255,255,255,0\.1\);', 'background: #f9fafb; border: 1px solid #e5e7eb;', idx)
idx = re.sub(r'border-color:\s*rgba\(255,255,255,0\.2\);', 'border-color: #d1d5db;', idx)
idx = re.sub(r'\.pcard-title\s*\{[^}]*?color:\s*#fff;', '.pcard-title { font-weight: 700; font-size: 18px; color: #111827;', idx)
idx = re.sub(r'\.pcard-desc\s*\{[^}]*?color:\s*rgba\(255,255,255,0\.6\);', '.pcard-desc { font-size: 14px; color: #4b5563;', idx)
idx = re.sub(r'\.stat-card\s*\{[^}]*?background:\s*rgba\(255,255,255,0\.03\);\s*border:\s*1px\s+solid\s+rgba\(255,255,255,0\.06\);', '.stat-card { background: #f9fafb; border: 1px solid #e5e7eb;', idx)
idx = re.sub(r'\.stat-num\s*\{[^}]*?color:\s*#fff;', '.stat-num { font-size: 2.5rem; font-weight: 800; color: #111827;', idx)
idx = re.sub(r'\.stat-label\s*\{[^}]*?color:\s*rgba\(255,255,255,0\.5\);', '.stat-label { font-size: 0.9rem; font-weight: 500; color: #6b7280;', idx)
idx = re.sub(r'\.features\s*\{[^}]*?background:\s*rgba\(0,0,0,0\.2\);', '.features { background: #f3f4f6;', idx)
idx = re.sub(r'\.feature-card\s*\{[^}]*?background:\s*rgba\(255,255,255,0\.03\);\s*border:\s*1px\s+solid\s+rgba\(255,255,255,0\.05\);', '.feature-card { background: #ffffff; border: 1px solid #e5e7eb;', idx)
idx = re.sub(r'\.feature-card\s+h3\s*\{[^}]*?color:\s*#fff;', '.feature-card h3 { font-size: 1.1rem; margin-bottom: 8px; color: #111827;', idx)
idx = re.sub(r'\.feature-card\s+p\s*\{[^}]*?color:\s*rgba\(255,255,255,0\.55\);', '.feature-card p { font-size: 0.95rem; color: #4b5563;', idx)
idx = re.sub(r'h2\s*\{\s*text-align:\s*center;\s*font-size:\s*2\.5rem;\s*font-weight:\s*800;\s*margin-bottom:\s*16px;\s*color:\s*#fff;\s*\}', 'h2 { text-align: center; font-size: 2.5rem; font-weight: 800; margin-bottom: 16px; color: #111827; }', idx)
idx = re.sub(r'\.features\s+p\s*\{\s*text-align:\s*center;\s*color:\s*rgba\(255,255,255,0\.6\);', '.features p { text-align: center; color: #4b5563;', idx)
idx = re.sub(r'\.footer-links\s+a\s*\{\s*color:\s*rgba\(255,255,255,0\.5\);', '.footer-links a { color: #6b7280;', idx)
idx = re.sub(r'\.footer-links\s+a:hover\s*\{\s*color:\s*#fff;\s*\}', '.footer-links a:hover { color: #111827; }', idx)

# Text replacements for index.html
idx = idx.replace('Your Health Records, Anywhere You Are', 'Health Records Simplified.')
idx = idx.replace('Integrated electronic health records for patients, clinicians, and administrators across The State hospitals and PHCs.', 'Integrated health records.')
idx = idx.replace('6\n        </div>\n        <div class="stat-label">Health Facilities</div>', '6\n        </div>\n        <div class="stat-label">Facilities</div>')
idx = idx.replace('ICD-11\n        </div>\n        <div class="stat-label">Diagnosis Standard</div>', 'ICD-11\n        </div>\n        <div class="stat-label">Standard</div>')
idx = idx.replace('24/7\n        </div>\n        <div class="stat-label">System Availability</div>', '24/7\n        </div>\n        <div class="stat-label">Availability</div>')
idx = idx.replace('NHIA\n        </div>\n        <div class="stat-label">Insurance Integrated</div>', 'NHIA\n        </div>\n        <div class="stat-label">Integrated</div>')
idx = idx.replace('Everything in One System', 'Unified System')
idx = idx.replace('Designed for The State\'s unique health landscape from referral hospitals to rural PHCs.', 'Designed for our unique health landscape.')
idx = idx.replace('Clinical Consultations', 'Consultations')
idx = idx.replace('Appointment Scheduling', 'Scheduling')
idx = idx.replace('Laboratory Results', 'Labs')
idx = idx.replace('Billing & Insurance', 'Billing')
idx = idx.replace('Ward Management', 'Wards')
idx = idx.replace('Analytics & Reports', 'Analytics')

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(idx)

# 2. Update portal.html
with open('public/portal.html', 'r', encoding='utf-8') as f:
    port = f.read()

# Make portal.html white
port = port.replace('--bg-color: #0B1426;', '--bg-color: #F9FAFB;')
port = port.replace('--text-main: #FFFFFF;', '--text-main: #111827;')
port = port.replace('--text-muted: #9CA3AF;', '--text-muted: #6B7280;')
port = port.replace('--glass-bg: rgba(255, 255, 255, 0.05);', '--glass-bg: rgba(255, 255, 255, 1);')
port = port.replace('--glass-border: rgba(255, 255, 255, 0.1);', '--glass-border: rgba(0, 0, 0, 0.1);')

# Text replacements for portal.html
port = port.replace('Experience seamless healthcare access. Book consultations, manage your records, and connect with top doctors anytime, anywhere.', 'Seamless healthcare access.')
port = port.replace("onclick=\"selectSpecialty('General Checkup')\"", "onclick=\"selectSpecialty('General Practice')\"")
port = port.replace("onclick=\"selectSpecialty('Other')\"", "onclick=\"selectSpecialty('General Practice')\"") # map other to general practice as a fallback

with open('public/portal.html', 'w', encoding='utf-8') as f:
    f.write(port)

print("SUCCESS: index.html and portal.html styles and texts updated.")
