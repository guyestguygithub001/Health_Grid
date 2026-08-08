
import re
with open("public/command.html", "r", encoding="utf-8") as f:
    content = f.read()

# Remove the WORKSPACE section title and role switcher
workspace_pattern = r"<div class=\"nav-section-title\">WORKSPACE</div>\s*<div style=\"padding: 0 12px; margin-bottom: 12px; display: none;\" id=\"roleSwitcherContainer\" class=\"nav-text\">\s*<label[^>]*>Active Role</label>\s*<select id=\"roleSwitcher\"[^>]*>[\s\S]*?</select>\s*</div>"
content = re.sub(workspace_pattern, "", content)

with open("public/command.html", "w", encoding="utf-8") as f:
    f.write(content)
print("Removed WORKSPACE section successfully!")

