# Testing PlateauCare EHR

## Start The Server

PowerShell:

```powershell
cd "C:\Users\HP\Documents\Web E - Profile for the Boys\plateau-ehr"
powershell -ExecutionPolicy Bypass -File .\start-server.ps1
```

Command Prompt:

```bat
cd /d "C:\Users\HP\Documents\Web E - Profile for the Boys\plateau-ehr"
start-server.cmd
```

Then open:

```text
http://localhost:8080
```

## Quick API Checks

```powershell
Invoke-RestMethod http://localhost:8080/api/summary
Invoke-RestMethod http://localhost:8080/api/facilities
Invoke-RestMethod http://localhost:8080/api/patients
```

## Manual Workflow Test

1. Open the dashboard and confirm metrics load.
2. Go to Patients and register a new patient.
3. Go to Clinical Units and create an encounter.
4. Use Scrub Before Save to run the AI Medical Scrub.
5. Go to Orders and create a lab, pharmacy, or referral order.
6. Go to Reports and confirm quality, stock, surveillance, and facility reports load.

## Prototype Warning

This is not approved for real patient care. Use it for demos, learning, planning, and software development only.
