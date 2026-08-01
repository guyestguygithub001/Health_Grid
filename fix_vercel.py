import re

with open('public/command.html', 'r', encoding='utf-8') as f:
    cmd = f.read()

fallback_logic_cmd = """        } catch (err) {
          console.warn("API unreachable. Falling back to embedded static verification for Vercel.");
          if (user === 'admin' && (pass === 'admin123' || pass === 'secure_admin_password')) {
            localStorage.setItem('ehr_admin_token', 'vercel-mock-token-123');
            localStorage.setItem('ehr_user_role', 'super_admin');
            localStorage.setItem('ehr_user_name', 'System Admin');
            localStorage.setItem('ehr_user_id', 'USR-0001');
            sessionStorage.setItem('role', 'super_admin');
            loginScreen.style.display = 'none';
            if (window.requestedModule === 'phc') enterPhcModule();
            else enterEhrModule();
          } else {
            errorDiv.style.display = 'block';
            errorDiv.innerText = 'Server unreachable. Try admin / admin123 for static preview.';
          }
        }"""

cmd = re.sub(r'\} catch \(err\) \{.*?errorDiv\.innerText = \'Server unreachable\. Please contact your system administrator\.\';\s*\}', fallback_logic_cmd, cmd, flags=re.DOTALL)

with open('public/command.html', 'w', encoding='utf-8') as f:
    f.write(cmd)


with open('public/emr.html', 'r', encoding='utf-8') as f:
    emr = f.read()

fallback_logic_emr = """        } catch (err) {
          console.warn("API unreachable. Falling back to static Vercel preview.");
          if (u === 'admin' && (p === 'admin123' || p === 'secure_admin_password')) {
            sessionStorage.setItem('staff_token', 'vercel-mock-token-123');
            sessionStorage.setItem('staff_role', 'admin');
            sessionStorage.setItem('staff_name', 'System Admin');
            checkSession();
          } else {
            errDiv.style.display = 'block';
            errDiv.innerText = 'Network error. Try admin / admin123 for static preview.';
          }
        }"""

emr = re.sub(r'\} catch \(err\) \{.*?errDiv\.innerText = \'Network error\.\';\s*\}', fallback_logic_emr, emr, flags=re.DOTALL)

with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(emr)

print("Vercel fallback patched.")
