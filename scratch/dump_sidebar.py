html = open('public/emr.html', encoding='utf-8').read()
active_idx = html.find('Active Context')

if active_idx != -1:
    with open('scratch/sidebar_dump.txt', 'w', encoding='utf-8') as f:
        f.write(html[max(0, active_idx-500):active_idx+1000])
else:
    print("Could not find Active Context")
