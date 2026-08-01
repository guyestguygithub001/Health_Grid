import re

# Clean command.html
with open('public/command.html', 'r', encoding='utf-8') as f:
    cmd_html = f.read()

# Remove roleSwitcherContainer
cmd_html = re.sub(
    r'<div style="padding: 0 12px; margin-bottom: 12px; display: none;" id="roleSwitcherContainer" class="nav-text">.*?</div>',
    '', cmd_html, flags=re.DOTALL
)

with open('public/command.html', 'w', encoding='utf-8') as f:
    f.write(cmd_html)

# Clean emr.html
with open('public/emr.html', 'r', encoding='utf-8') as f:
    emr_html = f.read()

# Remove the 'Active Context' block in the sidebar
emr_html = re.sub(
    r'<div class="nav-text" style="width: 100%; margin-top: 16px; margin-bottom: 24px; border-bottom: 1px solid rgb\(229, 231, 235\); padding: 0px 12px 16px;">.*?<div id="activeRoleDisplay".*?</div>.*?</div>',
    '', emr_html, flags=re.DOTALL
)

# Remove the 'Register Staff' button from the sidebar
emr_html = re.sub(
    r'<button id="registerStaffNavBtn".*?Register Staff.*?</button>',
    '', emr_html, flags=re.DOTALL
)

with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(emr_html)

print("UI cleanup complete")
