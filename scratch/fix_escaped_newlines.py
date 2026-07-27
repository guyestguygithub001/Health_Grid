"""
Fix all literal \\n and \\t escape sequences that were incorrectly injected
into the HTML files by previous Python scripts that used string replacement
without proper newline handling.
"""

import re

def fix_escaped_newlines(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_len = len(content)
    
    # Fix literal \\n (backslash-n) that appears outside of string literals
    # These appear as the two characters \ and n in the source, not as actual newlines
    # We need to find them in JS code (inside <script> tags) and replace with real newlines
    
    # Strategy: find all script blocks and fix within them
    result = []
    last = 0
    
    script_open = re.compile(r'<script[^>]*>', re.IGNORECASE)
    script_close = re.compile(r'</script>', re.IGNORECASE)
    
    pos = 0
    fixes = 0
    while pos < len(content):
        m_open = script_open.search(content, pos)
        if not m_open:
            result.append(content[pos:])
            break
        
        result.append(content[pos:m_open.end()])
        
        m_close = script_close.search(content, m_open.end())
        if not m_close:
            result.append(content[m_open.end():])
            break
        
        js_block = content[m_open.end():m_close.start()]
        
        # Fix literal \\n\\n and \\n sequences (the actual 2-char sequences \n in JS code)
        fixed_block = js_block.replace('\\n\\n    ', '\n\n    ')
        fixed_block = fixed_block.replace('\\n\\n', '\n\n')
        fixed_block = fixed_block.replace('\\n    ', '\n    ')
        fixed_block = fixed_block.replace('\\n  ', '\n  ')
        fixed_block = fixed_block.replace('\\n', '\n')
        fixed_block = fixed_block.replace('\\t', '\t')
        
        if fixed_block != js_block:
            fixes += len([i for i in range(len(js_block)) if js_block[i:i+2] == '\\n'])
        
        result.append(fixed_block)
        result.append(content[m_close.start():m_close.end()])
        pos = m_close.end()
    
    content = ''.join(result)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"{filepath}: fixed (was {original_len} bytes, now {len(content)} bytes)")

fix_escaped_newlines('public/emr.html')
fix_escaped_newlines('public/admin.html')
print("\nNow re-checking syntax...")
