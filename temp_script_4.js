
    document.addEventListener("DOMContentLoaded", () => {
      document.getElementById('emrSignupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('emrSignupUser').value;
        const pass = document.getElementById('emrSignupPass').value;
        const name = document.getElementById('emrSignupName').value;
        const role = document.getElementById('emrSignupRole').value;
        const errorDiv = document.getElementById('emrSignupError');
        errorDiv.style.display = 'none';
        
        try {
          const res = await fetch('/api/v2/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass, name: name, role: role })
          });
          
          if (res.ok) {
            alert('Staff registered successfully!');
            document.getElementById('emrSignupModal').style.display = 'none';
            document.getElementById('emrSignupForm').reset();
          } else {
            const data = await res.json();
            errorDiv.style.display = 'block';
            errorDiv.innerText = data.error || 'Registration failed.';
          }
        } catch (err) {
          errorDiv.style.display = 'block';
          errorDiv.innerText = 'Server unreachable.';
        }
      });
    });
  