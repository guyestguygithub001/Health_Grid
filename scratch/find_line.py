with open('public/emr.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'id="triageView"' in line:
            print(f'triageView at line {i+1}')
            break
