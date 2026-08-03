with open('public/portal.html','r',encoding='utf-8') as f:
    content = f.read()

old_css = """    /* Inputs */
    input, select {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--glass-border);
      background: rgba(0,0,0,0.2);
      color: white;
      margin-bottom: 16px;
      font-size: 1rem;
    }
    input:focus, select:focus {
      outline: none;
      border-color: var(--teal);
    }"""

new_css = """    /* Inputs — bare elements (legacy/simple sections) */
    input, select {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--glass-border);
      background: rgba(0,0,0,0.2);
      color: white;
      margin-bottom: 16px;
      font-size: 1rem;
    }
    input:focus, select:focus {
      outline: none;
      border-color: var(--teal);
    }
    input::placeholder { color: rgba(255,255,255,0.3); }

    /* Enhanced labelled form field primitives (used in expanded signup form) */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 14px;
    }
    .form-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
    }
    .form-input-field {
      width: 100%;
      padding: 11px 14px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.05);
      color: #fff;
      font-size: 0.92rem;
      margin-bottom: 0;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .form-input-field::placeholder { color: rgba(255,255,255,0.25); }
    .form-input-field:focus {
      outline: none;
      border-color: var(--teal);
      background: rgba(11,94,126,0.18);
      box-shadow: 0 0 0 3px rgba(11,94,126,0.25);
    }
    .form-input-field option { background: #0B1426; color: #fff; }
    /* Collapse multi-column grids on small phones */
    @media (max-width: 480px) {
      #auth-new div[style*="grid-template-columns"] {
        grid-template-columns: 1fr !important;
      }
    }"""

if old_css in content:
    content = content.replace(old_css, new_css, 1)
    with open('public/portal.html','w',encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS: Form CSS classes injected')
else:
    print('NOT FOUND — checking for CRLF version...')
    old_crlf = old_css.replace('\n', '\r\n')
    if old_crlf in content:
        new_crlf = new_css.replace('\n', '\r\n')
        content = content.replace(old_crlf, new_crlf, 1)
        with open('public/portal.html','w',encoding='utf-8') as f:
            f.write(content)
        print('SUCCESS (CRLF): Form CSS classes injected')
    else:
        # Find what's there
        idx = content.find('/* Inputs */')
        print('Found at index:', idx)
        print(repr(content[idx:idx+400]))
