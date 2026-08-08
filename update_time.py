import re

with open('public/portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the time-grid div with an input type="time"
content = re.sub(
    r'<div class="time-grid" id="wizard-times"></div>',
    '<input type="time" id="wizard-time-picker" class="sleek-date-picker" style="margin-top: 12px;" onchange="handleTimeChange(this.value)" />',
    content
)

# 2. Update loadTimes() to basically do nothing visual (or just remove the slot fetching) since we now have a native time picker.
# We'll just define handleTimeChange to update the state.
new_load_times = """
    async function loadTimes(dateStr) {
      state.booking.date = dateStr;
      // We are using a native time picker now, so we don't need to fetch slots from the API here.
      // Just ensure the time picker is visible and ready.
      const timePicker = document.getElementById('wizard-time-picker');
      if (timePicker && !timePicker.value) {
         timePicker.value = "09:00"; // default time
         state.booking.time = "09:00";
      }
    }
    
    function handleTimeChange(timeStr) {
      if (!timeStr) return;
      state.booking.time = timeStr;
    }
    
    function selectTime(el, time) {
      // deprecated, kept for safety
      state.booking.time = time;
    }
"""

content = re.sub(
    r'async function loadTimes\(dateStr\) \{[\s\S]*?function selectTime\(el, time\) \{[\s\S]*?state\.booking\.time = time;\s*\}',
    new_load_times,
    content
)

with open('public/portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Replaced time grid with native time picker.")
