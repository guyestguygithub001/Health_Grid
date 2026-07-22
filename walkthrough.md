# Global Health Grid (GHG) Project Walkthrough

This document logs all the changes and architectural shifts implemented during the transition from the legacy PlateauCare EMR to the new Global Health Grid ecosystem.

## 1. Architectural Restructuring
*   **Offline-First Migration:** Replaced the conventional CRUD interface with 4 dedicated, offline-capable workflows designed for rural/low-connectivity environments.
*   **Dashboard Redesign:** Transitioned the UI to a high-tech "command center" aesthetic with deep-blue backgrounds and immersion mode, completely hiding the traditional topbar/sidebar until needed.
*   **Module Split:** Segregated the new GHG (Primary Health Care) workflows from the traditional EMR views.

## 2. The Four New Workflows
*   **MPI Onboarding:** Integrated an "Offline/Online" network toggle that mocks local SQLite fallback for biometric caches. Embedded Social Determinants of Health (SDOH) queries and added UUID v7 generation for Digital Wallet QR logic.
*   **Clinical Encounter (Triage):** Developed an Explainable AI (XAI) lite engine that triggers a "URGENCY: RED" geo-tagged referral pathway when vitals and SDOH flags (like food insecurity) meet the threshold.
*   **Circular Pharmacy:** Created a "Zero-Stock" workflow where the system dynamically substitutes stockouts by locating alternatives within a 10km radius and firing an e-transfer SMS to the patient.
*   **Epidemic Intelligence:** Built a mock Kafka stream visualizer that ingests data from clinics. A "Simulate Cholera Cluster" button forces anomalies, triggering a WHO GOARN alert and drone deployment logic.

## 3. Navigation & Routing Fixes
*   **URL Parameter Routing:** Updated the initialization logic in `app.js` to parse `?view=` parameters from the URL, allowing the homepage or external links to deep-link directly into modules (like billing or appointments).
*   **Global Backspace Router:** Deployed a global JavaScript interceptor that captures the `Backspace` keyboard event. Instead of letting the browser kick the user backward through page history, it safely routes the user back to the application dashboard.
*   **Wizard Navigation:** Rewrote the `wizardGoBack()` function to intelligently exit the 4-step workflow back to the dashboard when the user is on the first step.
*   **Topbar Module Toggles:** Re-wired the "EMR Unit" and "PHC Module" toggles at the top of the interface. The PHC toggle now accurately triggers the new GHG offline-first workflow, while the EMR toggle routes to the traditional EMR view.

## 4. UI Adjustments
*   **Homepage Touches:** Converted the 6 feature blocks on `index.html` from links back to static information blocks based on explicit user requirements, removing the tour behavior.
*   **Dashboard Button Re-wire:** Restored and fixed the "EHR / PHC Module" entry button on the dashboard to trigger the new `mpi` workflow seamlessly without Javascript crashing.
*   **Javascript Syntax:** Resolved an "Unexpected end of input" syntax failure in `app.js` caused by a missing bracket that was freezing the entire application interface.
