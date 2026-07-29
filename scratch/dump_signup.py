html = open('public/emr.html', encoding='utf-8').read()
idx = html.find('id="emrSignupModal"')
with open('scratch/signup_modal.txt', 'w', encoding='utf-8') as f:
    f.write(html[idx:idx+1500])
