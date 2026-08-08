import re

with open("public/emr.html", "r", encoding="utf-8") as f:
    content = f.read()

bad_logic = r"""      // Auto-navigate to the first allowed view \(usually omniBar\)
      if \(allowedViews\.length > 0\) \{
        const roleText = \(name \? name \+ " - " : ""\) \+ \(roleNames\[role\] \|\| role\);
        document\.getElementById\('activeRoleDisplay'\)\.innerText = roleText;
        
        applyRbac\(role\);
      \} else \{
        document\.getElementById\('emrAuthGateway'\)\.style\.display = 'flex';
        document\.getElementById\('emrMainApp'\)\.style\.display = 'none';
      \}"""

good_logic = """      // Auto-navigate to the first allowed view (usually omniBar)
      if (allowedViews.length > 0) {
        switchEmrView(allowedViews[0]);
      } else {
        document.getElementById('emrAuthGateway').style.display = 'flex';
        document.getElementById('emrMainApp').style.display = 'none';
      }"""

# Fallback string replace if regex fails
fallback_bad = """      // Auto-navigate to the first allowed view (usually omniBar)
      if (allowedViews.length > 0) {
        const roleText = (name ? name + " - " : "") + (roleNames[role] || role);
        document.getElementById('activeRoleDisplay').innerText = roleText;
        
        applyRbac(role);
      } else {"""
fallback_good = """      // Auto-navigate to the first allowed view (usually omniBar)
      if (allowedViews.length > 0) {
        switchEmrView(allowedViews[0]);
      } else {"""

if re.search(bad_logic, content):
    content = re.sub(bad_logic, good_logic, content)
else:
    content = content.replace(fallback_bad, fallback_good)

with open("public/emr.html", "w", encoding="utf-8") as f:
    f.write(content)
print("applyRbac fixed!")
