with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_omnibar = '<div id="omniBar" class="emr-view hidden" style="width: 100%; max-width: 800px; margin: 0 auto; align-self: center; padding: 32px 48px; display: flex; flex-direction: column; flex: 1; background: transparent; justify-content: center; align-items: center;">'
new_omnibar = '<div id="omniBar" class="emr-view hidden" style="width: 100%; max-width: 800px; margin: 0 auto; align-self: center; padding: 32px 48px; display: flex; flex-direction: column; flex: 1; background: transparent; justify-content: flex-start; align-items: center; margin-top: 10vh;">'

if old_omnibar in html:
    html = html.replace(old_omnibar, new_omnibar)
    with open('public/emr.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated omniBar alignment to be at the top.")
else:
    print("Could not find exact omniBar string")
