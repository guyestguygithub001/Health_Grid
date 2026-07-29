html = open('public/emr.html', encoding='utf-8').read()
idx = html.find('id="omniBar"')
print(html[max(0, idx-50):idx+500])
