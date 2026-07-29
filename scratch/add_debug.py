with open('public/admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

def inject_debug(view_id, color):
    global html
    search = f'id="{view_id}" class="ehr-view hidden" style="'
    replacement = f'id="{view_id}" class="ehr-view hidden" style="border: 5px solid {color}; background-color: rgba(255,0,0,0.1); min-height: 500px; '
    html = html.replace(search, replacement)

inject_debug('legalView', 'red')
inject_debug('wardsView', 'blue')
inject_debug('labsView', 'green')
inject_debug('billingView', 'purple')

with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Injected debug borders and background colors.")
