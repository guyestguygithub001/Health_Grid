Global Health Grid (GHG) Project Documentation

Hey team, welcome to the main repo for the Global Health Grid project. We recently did a massive overhaul, moving away from the old PlateauCare EMR into a much more robust, offline-first health grid. I'm dropping a quick update here to explain the structure and what we just finished building.

What We Built So Far

We rebuilt the system around the reality of the ground: bad internet, rural clinics, and high-stakes data. 

1. Core Workflows
We set up the main onboarding so community health workers can jump straight into offline mode if the connection drops. The vitals triage system now has a local model that immediately calculates risk levels and geo-tags referrals. The pharmacy also has a zero-stock substitution engine, so if a clinic is out of meds, it finds it at the nearest warehouse and texts the patient a pickup code.

2. UI & Aesthetic Overhaul
The interface was moved to a sleek, dark mode command center design. The blues blend smoothly from the hero section all the way down, making it super clean and easy on the eyes. The portal cards have nice fluid animations when you hover over them. I also went through and fixed all the routing bugs—like the backspace key kicking you out—so navigating between the EMR and PHC modules is flawless now. The dashboard even greets you dynamically based on the exact time of day.

3. Security & Database Hardening (The Big One)
This is the most critical update. Since we can't afford data races or security breaches, I built a custom ACID compliance wrapper directly into the node server. 
- Rate limiting is active, so nobody can spam our endpoints.
- We have optimistic locking and transaction wrappers. If a nurse tries to save a patient record, the system clones the memory state, attempts the save, and silently rolls it back if anything goes wrong. No partial data saves.
- I added idempotency keys to the frontend fetch calls. If someone double-clicks the save button because of lag, the server catches the duplicate key and ignores the second request.
- Finally, there's dirty form protection. If a doctor is halfway through typing SOAP notes and accidentally clicks a navigation button, the browser will stop them and ask for confirmation before leaving the page.

How to Run It

You don't need docker or any external database setups to run this locally. It's completely self-contained.

1. Run `npm install` just to be safe.
2. Run `node server/server.js` to boot it up.
3. It defaults to port 8085. Just open `http://localhost:8085` in your browser.

That's it for the latest sprint. Let me know if you run into any weird UI glitches or routing issues.
