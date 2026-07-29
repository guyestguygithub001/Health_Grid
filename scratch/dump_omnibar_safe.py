html = open('public/emr.html', encoding='utf-8').read()
idx = html.find('id="omniBar"')
with open('scratch/omnibar_dump.txt', 'w', encoding='utf-8') as f:
    f.write(html[max(0, idx-50):idx+500])
