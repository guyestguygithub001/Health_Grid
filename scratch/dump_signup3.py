html = open('public/emr.html', encoding='utf-8').read()
idx = html.find('id="emrSignupForm"')
script_idx = html.find('emrSignupForm', idx + 100)
with open('scratch/signup_modal.txt', 'w', encoding='utf-8') as f:
    f.write(html[max(0, script_idx-500):script_idx+1500])
