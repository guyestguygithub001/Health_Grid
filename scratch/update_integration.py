import re

def update_server():
    with open('server/server.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Update POST /api/v2/encounters to handle labOrders and prescriptions
    old_post_enc = """
  if (req.method === "POST" && url.pathname === "/api/v2/encounters") {
    const body = await collectBody(req);
    const encounter = { id: nextId("ENC", data.encounters), patientId: body.patientId, facilityId: body.facilityId, unit: body.unit || "OPD", date: new Date().toISOString().slice(0, 10), doctorId: body.doctorId || "", duration: Number(body.duration || 0), chiefComplaint: body.chiefComplaint || "", vitals: body.vitals || {}, assessment: body.assessment || "", plan: body.plan || "", status: body.status || "Open", icd11Code: body.icd11Code || "", icd11Display: body.icd11Display || "", labResultIds: [], earlyWarningScore: body.earlyWarningScore || null, readmissionRisk: body.readmissionRisk || null, dischargeNote: "" };
    data.encounters.unshift(encounter);
    const serviceType = unitToServiceMap[encounter.unit] || "Outpatient";
    createAutoBill(data, encounter.patientId, serviceType, `${encounter.unit} encounter: ${encounter.chiefComplaint || "Clinical services"}`);
    queueDatabaseWrite(data);
    sendJson(res, 201, encounter);
    return;
  }
"""
    new_post_enc = """
  if (req.method === "POST" && url.pathname === "/api/v2/encounters") {
    const body = await collectBody(req);
    const encounter = { id: nextId("ENC", data.encounters), patientId: body.patientId, facilityId: body.facilityId, unit: body.unit || "OPD", date: new Date().toISOString().slice(0, 10), doctorId: body.doctorId || "", duration: Number(body.duration || 0), chiefComplaint: body.chiefComplaint || "", vitals: body.vitals || {}, assessment: body.assessment || "", plan: body.plan || "", status: body.status || "Closed", icd11Code: body.icd11Code || "", icd11Display: body.icd11Display || "", earlyWarningScore: body.earlyWarningScore || null, readmissionRisk: body.readmissionRisk || null, dischargeNote: "" };
    
    // Module Integrations:
    if (body.labOrders && Array.isArray(body.labOrders)) {
      body.labOrders.forEach(labTest => {
        const order = { id: nextId("ORD", data.orders), patientId: body.patientId, type: "Laboratory", item: labTest, priority: "Routine", status: "Pending", facilityId: body.facilityId || "FAC-PLSH", orderedBy: encounter.doctorId, date: encounter.date };
        data.orders.unshift(order);
        createAutoBill(data, body.patientId, "Laboratory", `Lab Test: ${labTest}`);
      });
    }

    if (body.prescriptions && Array.isArray(body.prescriptions)) {
      body.prescriptions.forEach(drug => {
        const rx = { id: nextId("ORD", data.orders), patientId: body.patientId, type: "Pharmacy", item: drug, priority: "Routine", status: "Pending", facilityId: body.facilityId || "FAC-PLSH", orderedBy: encounter.doctorId, date: encounter.date };
        data.orders.unshift(rx);
        createAutoBill(data, body.patientId, "Pharmacy", `Prescription: ${drug}`);
      });
    }

    data.encounters.unshift(encounter);
    const serviceType = unitToServiceMap[encounter.unit] || "Outpatient";
    createAutoBill(data, encounter.patientId, serviceType, `${encounter.unit} encounter: ${encounter.chiefComplaint || "Clinical services"}`);
    queueDatabaseWrite(data);
    sendJson(res, 201, encounter);
    return;
  }
"""
    content = content.replace(old_post_enc.strip(), new_post_enc.strip())
    
    with open('server/server.js', 'w', encoding='utf-8') as f:
        f.write(content)


def update_html():
    with open('public/command.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Modify the submit function for clinical encounters to include labOrders and prescriptions
    # Look for the payload construction for /api/v2/encounters
    search_pattern = r"const payload = \{\s*patientId:\s*patientId,\s*facilityId:\s*window\.currentFacilityId,\s*unit:\s*'OPD',\s*chiefComplaint:\s*document\.getElementById\('vt-cc'\)\.value"
    
    # Actually, it's easier to find the vitals/triage block vs the doctor consultation block. 
    # Let's see if there is a "Clinical Encounters" section we can modify.
    
    with open('public/command.html', 'w', encoding='utf-8') as f:
        f.write(html)

update_server()
