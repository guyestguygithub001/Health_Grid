import re

with open("public/command.html", "r", encoding="utf-8") as f:
    content = f.read()

old_switch = r"""    function switchAppRole\(role\) \{\s*document\.querySelectorAll\('#ehrAppShell \.nav-btn'\)\.forEach\(btn => \{\s*if \(!btn\.dataset\.roles\) return; // skip if no roles\s*const allowedRoles = btn\.dataset\.roles\.split\(' '\);\s*if \(allowedRoles\.includes\(role\) \|\| allowedRoles\.includes\('all'\)\) \{\s*btn\.style\.display = 'flex';\s*\} else \{\s*btn\.style\.display = 'none';\s*\}\s*\}\);\s*// Optionally route them to their default view if the current view isn't allowed\s*const currentActive = document\.querySelector\('#ehrAppShell \.nav-btn\.active'\);\s*if \(currentActive && currentActive\.style\.display === 'none'\) \{\s*if \(role === 'physician'\) switchEhrView\('encountersView'\);\s*if \(role === 'nurse'\) switchEhrView\('mpiView'\);\s*\}\s*\}"""

new_switch = """    function switchAppRole(role) {
        const currentModule = window.activeModule || 'ehr';
        
        // Hide Active Role switcher in PHC mode
        const roleContainer = document.getElementById('roleSwitcherContainer');
        if (roleContainer) {
            if (currentModule === 'phc') {
                roleContainer.style.display = 'none';
                roleContainer.classList.add('phc-hidden-override');
            } else {
                roleContainer.classList.remove('phc-hidden-override');
            }
        }

        // Handle section titles
        document.querySelectorAll('.nav-section-title').forEach(title => {
           if (currentModule === 'ehr' && title.classList.contains('phc-only')) title.style.display = 'none';
           else if (currentModule === 'phc' && title.classList.contains('ehr-only')) title.style.display = 'none';
           else title.style.display = '';
        });

        document.querySelectorAll('#ehrAppShell .nav-btn').forEach(btn => {
          if (!btn.dataset.roles) return; // skip if no roles
          
          if (currentModule === 'ehr' && btn.classList.contains('phc-only')) {
            btn.style.display = 'none';
            return;
          }
          if (currentModule === 'phc' && btn.classList.contains('ehr-only')) {
            btn.style.display = 'none';
            return;
          }

          const allowedRoles = btn.dataset.roles.split(' ');
          if (allowedRoles.includes(role) || allowedRoles.includes('all')) {
            btn.style.display = 'flex';
          } else {
            btn.style.display = 'none';
          }
        });

        // Optionally route them to their default view if the current view isn't allowed
        const currentActive = document.querySelector('#ehrAppShell .nav-btn.active');
        if (currentActive && currentActive.style.display === 'none') {
          if (currentModule === 'ehr') {
            if (role === 'physician') switchEhrView('encountersView');
            if (role === 'nurse') switchEhrView('mpiView');
          }
        }
      }"""

content = re.sub(old_switch, new_switch, content)

with open("public/command.html", "w", encoding="utf-8") as f:
    f.write(content)
print("switchAppRole fixed!")
