import re
import os

files = ['server/patient-api.js', 'server/db-postgres.js', 'server/db.js', 'server/enterprise.js']

for file in files:
    if not os.path.exists(file): continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    content = content.replace("process.exit(1);", "throw new Error('Missing critical environment variables');")
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("SUCCESS: Replaced process.exit(1) with throw new Error()")
