Global Health Grid (GHG) Project Documentation

Hi everyone, welcome to the repo for the Global Health Grid. We recently overhauled the entire system, transitioning it from the legacy PlateauCare EMR into a fully adaptive, offline-first health grid. I wanted to drop a quick update here on how everything is structured now and what has been built.

What We Just Built

We totally deconstructed the old system to focus on reality: low-bandwidth, rural health workers, and offline capabilities. The core application is now built around four main workflows instead of a standard CRUD interface.

1. MPI Onboarding and Demographics
We added an offline toggle so community health workers can use the system without internet. When it goes offline, it falls back to a local SQLite encrypted biometric cache. We also added social determinants of health (like food and water insecurity) straight into the intake forms, and we generate a UUID v7 for every patient so they get a digital wallet QR code. This completely fixes the ghost patient problem.

2. Clinical Encounter and Triage
We built an offline triage system that runs a local explainable AI model. When a nurse enters vitals and flags something like food insecurity, the AI engine immediately calculates risk. If someone hits the red urgency threshold, it bypasses the normal pharmacy loop and creates a geo-tagged referral note for the nearest secondary facility.

3. Circular Pharmacy
This replaces the old inventory system. We added a zero-stock substitution engine. If you prescribe a drug and the local clinic is out of stock, the system queries the network within a 10km radius. It finds the medication at a nearby warehouse, reserves it, and sends the patient an SMS with an e-transfer code to pick it up.

4. Epidemic Intelligence
We wired up a simulated real-time event listener using a mock Kafka stream. As data flows in from the clinics, pharmacies, and labs, the admin dashboard listens for anomalies. We added a button to simulate a cholera outbreak, which instantly triggers a WHO GOARN alert and surfaces the logistics API to deploy drones.

Navigation and UI Fixes

The UI has been migrated to a dark, hexagonal command center aesthetic. During the rebuild, some of the navigation paths broke, but I just went through and fixed all of them.

- The backspace key on your keyboard is now intercepted. It won't accidentally kick you out of the single page app or dump you back to the login screen anymore; it gracefully slides you back to the main dashboard.
- The top navigation bar module toggles now correctly switch you between the EMR unit and the new offline-first PHC workflow.
- We added URL parameter routing so you can jump straight into specific views like billing or appointments if you need to.

How to Run It

You don't need any external databases to spin this up locally. 

Just run "npm install" if you haven't already.
Then run "node server/server.js" to start the server.
By default, it will listen on port 8085 (or whichever port you pass in your environment variables). 

Once it's running, open your browser to localhost:8085 and you can explore the staff dashboard by going to the admin page.

That's it for the latest major update. Let me know if you run into any bugs or routing issues.
