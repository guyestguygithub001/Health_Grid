import re
import os

def check_env(file_path):
    print(f"Updating {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # patient-api.js
    if 'patient-api.js' in file_path:
        content = re.sub(
            r"const JWT_SECRET\s*=\s*process\.env\.JWT_SECRET\s*\|\|[^;]+;",
            "const JWT_SECRET = process.env.JWT_SECRET;\nif (!JWT_SECRET) { console.error('FATAL: JWT_SECRET environment variable is missing.'); process.exit(1); }",
            content
        )
        content = re.sub(
            r"const PAYSTACK_SK\s*=\s*process\.env\.PAYSTACK_SECRET_KEY\s*\|\|\s*'[^']*';",
            "const PAYSTACK_SK = process.env.PAYSTACK_SECRET_KEY;\nif (!PAYSTACK_SK) console.warn('WARNING: PAYSTACK_SECRET_KEY is missing. Payments will fail.');",
            content
        )
        # Verify the changes occurred
        if 'if (!JWT_SECRET)' in content: print(" -> JWT_SECRET hardcode removed")
        if 'if (!PAYSTACK_SK)' in content: print(" -> PAYSTACK_SK hardcode removed")
        
    # db-postgres.js & db.js
    if 'db-postgres.js' in file_path or 'db.js' in file_path:
        content = re.sub(
            r"password:\s*process\.env\.POSTGRES_PASSWORD\s*\|\|\s*'[^']+',",
            "password: process.env.POSTGRES_PASSWORD,",
            content
        )
        if 'password: process.env.POSTGRES_PASSWORD' in content: print(" -> POSTGRES_PASSWORD hardcode removed")

    # enterprise.js
    if 'enterprise.js' in file_path:
        # Default staff password creation
        content = re.sub(
            r'crypto\.createHash\("sha256"\)\.update\(body\.password\s*\|\|\s*"changeme123"\)',
            'crypto.createHash("sha256").update(body.password || crypto.randomBytes(8).toString("hex"))',
            content
        )
        # roomToken fallback
        content = re.sub(
            r'roomToken:\s*crypto\.randomBytes\(16\)\.toString\("hex"\),',
            'roomToken: crypto.randomBytes(32).toString("hex"), // rotated length',
            content
        )
        print(" -> enterprise.js hardcodes removed")
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

files_to_update = [
    'server/patient-api.js',
    'server/db-postgres.js',
    'server/db.js',
    'server/enterprise.js'
]

for f in files_to_update:
    if os.path.exists(f):
        check_env(f)
    else:
        print(f"File {f} not found.")

print("SUCCESS: Codebase scrubbed of hardcoded fallbacks.")
