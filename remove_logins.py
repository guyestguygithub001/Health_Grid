import re

with open("public/command.html.locked", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove the old loginScreen completely. 
# Match from <!-- ┬┬ LOGIN SCREEN (or whatever it is) down to just before <!-- STANDALONE LANDING SCREEN -->
content = re.sub(r"<!--[^<]*LOGIN SCREEN[\s\S]*?(?=<!-- STANDALONE LANDING SCREEN -->)", "", content, flags=re.IGNORECASE)

# 2. Remove the DOMContentLoaded listener that forces loginScreen display
dom_load_pattern = r"document\.addEventListener\(\"DOMContentLoaded\", \(\) => \{\s*const loginScreen = document\.getElementById\('loginScreen'\);\s*const token = localStorage\.getItem\('ehr_admin_token'\);\s*if \(!token\) \{\s*loginScreen\.style\.display = 'flex';\s*\}\s*\}\);"
content = re.sub(dom_load_pattern, "", content)

# 3. Remove the auth check in enterEhrModule
auth_ehr_pattern = r"if \(!localStorage\.getItem\('ehr_admin_token'\)\) \{\s*window\.requestedModule = 'ehr';\s*document\.getElementById\('loginScreen'\)\.style\.display = 'flex';\s*return;\s*\}"
content = re.sub(auth_ehr_pattern, "", content)

# 4. Remove the auth check in enterPhcModule
auth_phc_pattern = r"if \(!localStorage\.getItem\('ehr_admin_token'\)\) \{\s*window\.requestedModule = 'phc';\s*document\.getElementById\('loginScreen'\)\.style\.display = 'flex';\s*return;\s*\}"
content = re.sub(auth_phc_pattern, "", content)

with open("public/command.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Removed login screens successfully!")
