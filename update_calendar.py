import re

with open('public/portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the date-scroll div with a date input
content = content.replace(
    '<div class="date-scroll" id="wizard-dates"></div>',
    '<input type="date" id="wizard-date-picker" class="sleek-date-picker" onchange="handleDateChange(this.value)" />'
)

# 2. Update loadDates() to initialize the date picker instead of building pills
new_load_dates = """
    function loadDates() {
      const picker = document.getElementById('wizard-date-picker');
      if (!picker) return;
      const today = new Date();
      const iso = today.toISOString().split('T')[0];
      picker.min = iso;
      picker.value = iso;
      loadTimes(iso);
    }
    
    function handleDateChange(dateStr) {
      if (!dateStr) return;
      loadTimes(dateStr);
    }
"""

content = re.sub(
    r'function loadDates\(\)\s*\{[\s\S]*?loadTimes\(today\.toISOString\(\)\.split\(\'T\'\)\[0\]\);\s*\}',
    new_load_dates,
    content
)

# 3. Add CSS for the sleek date picker
css_addition = """
    .sleek-date-picker {
      width: 100%;
      padding: 14px 16px;
      font-size: 1.1rem;
      font-family: 'Inter', sans-serif;
      color: #1e293b;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(14, 165, 233, 0.3);
      border-radius: 12px;
      outline: none;
      transition: all 0.2s ease-in-out;
      cursor: pointer;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    .sleek-date-picker:hover {
      background: #ffffff;
      border-color: #2563EB;
      box-shadow: 0 4px 12px rgba(37,99,235,0.1);
    }
    .sleek-date-picker:focus {
      background: #ffffff;
      border-color: #2563EB;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.2);
    }
"""

if ".sleek-date-picker" not in content:
    content = content.replace('</style>', css_addition + '\n</style>')

with open('public/portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Replaced horizontal date scroll with a sleek native date picker.")
