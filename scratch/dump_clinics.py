html = open('public/emr.html', encoding='utf-8').read()
idx = html.find('id="clinicsDashboardView"')
end_idx = html.find('<!-- VIEW: Inpatient Wards -->', idx)

with open('scratch/clinicsView_dump.html', 'w', encoding='utf-8') as f:
    f.write(html[idx:end_idx])
