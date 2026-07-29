<script>
    function toggleSidebar() {
      document.getElementById('ehrSidebar').classList.toggle('collapsed');
    }

    // Dynamic Landing Page Logic
    const landingSlides = [
      {
        time: 'Morning',
        icon: '☀️',
        greeting: 'Good Morning.',
        subGreeting: 'Start your shift with a clear overview of facility operations.',
        bg: 'assets/landing_bg/doctor_portrait_1_1784893334111.jpg'
      },
      {
        time: 'Afternoon',
        icon: '🏙️',
        greeting: 'Good Afternoon.',
        subGreeting: 'Track peak encounter volumes and outpatient workflows.',
        bg: 'assets/landing_bg/doctor_sketch_2_1784893342797.jpg'
      },
      {
        time: 'Evening',
        icon: '🌅',
        greeting: 'Good Evening.',
        subGreeting: 'Review daily clinical summaries and prepare for night handover.',
        bg: 'assets/landing_bg/doctor_portrait_3_1784893353199.jpg'
      },
      {
        time: 'Night',
        icon: '🌙',
        greeting: 'Good Night.',
        subGreeting: 'Emergency and critical care operations are active. Stay vigilant.',
        bg: 'assets/landing_bg/doctor_sketch_4_1784893362459.jpg'
      }
    ];

    function updateLandingSlideByTime() {
      const hour = new Date().getHours();
      let slideIndex = 0; // Default Morning
      
      if (hour >= 12 && hour < 17) {
        slideIndex = 1; // Afternoon
      } else if (hour >= 17 && hour < 21) {
        slideIndex = 2; // Evening
      } else if (hour >= 21 || hour < 5) {
        slideIndex = 3; // Night
      }
      
      const slide = landingSlides[slideIndex];
      const bgLayer = document.getElementById('dynamicBgLayer');
      const contentArea = document.getElementById('landingContentArea');
      
      // Image Preloading Logic to prevent Vercel CDN Glitch
      bgLayer.style.opacity = '0';
      const img = new Image();
      img.src = slide.bg;
      img.onload = () => {
        bgLayer.style.backgroundImage = `url('${slide.bg}')`;
        bgLayer.style.opacity = '1';
      };
      
      document.getElementById('landingGreetingIcon').innerText = slide.icon;
      document.getElementById('landingGreeting').innerText = slide.greeting;
      document.getElementById('landingSubGreeting').innerText = slide.subGreeting;
      contentArea.style.opacity = 1;
    }

    // Initialize slide based on current real-world time
    if (document.getElementById('landingScreen')) {
      updateLandingSlideByTime();
      setInterval(updateLandingSlideByTime, 60000); 
    }

    // ── Authentication Gateway ──────────────────────────────────────────
    document.addEventListener("DOMContentLoaded", () => {
      const loginScreen = document.getElementById('loginScreen');
      const token = localStorage.getItem('ehr_admin_token');
      
      // If no token is found, force the login screen to appear
      if (!token) {
        loginScreen.style.display = 'flex';
      }

      document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('loginUser').value;
        const pass = document.getElementById('loginPass').value;
        const errorDiv = document.getElementById('loginError');
        
        try {
          // Attempt to authenticate against the live API
          const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
          });
          
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('ehr_admin_token', data.token);
            loginScreen.style.display = 'none';
          } else {
            errorDiv.style.display = 'block';
            errorDiv.innerText = 'Invalid username or password.';
          }
        } catch (err) {
          // Fallback verification for static hosts (like Vercel) where the API might be unreachable
          console.warn("API unreachable. Falling back to embedded static verification for Vercel.");
          // Static fallback removed for security — API must be reachable
          errorDiv.style.display = 'block';
          errorDiv.innerText = 'Server unreachable. Please contact your system administrator.';
        }
      });
    });

  </script>