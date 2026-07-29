content = """

### Staff Authentication & Role-Based Access Control (RBAC)

The EMR module is secured behind a Staff Authentication Gateway (`emrAuthGateway`). Users must authenticate to access clinical units.

**RBAC Role Definitions:**
- **System Admin (`admin`)**: Unrestricted access to all clinical and administrative units.
- **Physician (`physician`)**: Access to Clerking (Clinics), Triage, Pharmacy, Lab, Radiology, and Records. Cannot access Billing or Wards.
- **Nurse (`nurse`)**: Access to Triage, Inpatient Wards, and Pharmacy. Cannot access Clinics or Billing.
- **Pharmacist (`pharmacist`)**: Access restricted strictly to the Pharmacy unit and Omni-Bar.

**Troubleshooting Login Issues:**
- If a user cannot see certain units, verify their role in `data.json` under the `staff` collection.
- The login token is stored in `sessionStorage` (`staff_token`). Clearing session storage will force a logout.
"""

with open('PLAYBOOK.md', 'a', encoding='utf-8') as f:
    f.write(content)
print("Updated playbook")
