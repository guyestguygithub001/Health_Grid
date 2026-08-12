module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/server/data.json.[json].cjs [api] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = JSON.parse("{\"facilities\":[{\"id\":\"FAC-JUTH\",\"name\":\"Jos University Teaching Hospital\",\"type\":\"Tertiary Hospital\",\"lga\":\"Jos North\",\"level\":\"Referral\",\"beds\":520,\"totalBeds\":520,\"availableBeds\":87,\"status\":\"Online\",\"contactPhone\":\"073-460-0001\",\"operatingHours\":\"24/7\",\"doctors\":[\"Dr. A. Mwanret\",\"Dr. B. Dashe\",\"Dr. C. Pam\"],\"services\":[\"Emergency\",\"Surgery\",\"ICU\",\"Laboratory\",\"Radiology\",\"Pharmacy\",\"Maternity\"]},{\"id\":\"FAC-PLSH\",\"name\":\"Plateau State Specialist Hospital\",\"type\":\"Specialist Hospital\",\"lga\":\"Jos North\",\"level\":\"Secondary\",\"beds\":280,\"totalBeds\":280,\"availableBeds\":42,\"status\":\"Online\",\"contactPhone\":\"073-460-0002\",\"operatingHours\":\"24/7\",\"doctors\":[\"Dr. D. Goshit\",\"Dr. E. Bala\"],\"services\":[\"OPD\",\"Emergency\",\"Laboratory\",\"Radiology\",\"Pharmacy\",\"Maternity\"]},{\"id\":\"FAC-WASE\",\"name\":\"Federal Medical Centre Wase\",\"type\":\"Federal Medical Centre\",\"lga\":\"Wase\",\"level\":\"Referral\",\"beds\":180,\"totalBeds\":180,\"availableBeds\":31,\"status\":\"Online\",\"contactPhone\":\"073-460-0003\",\"operatingHours\":\"24/7\",\"doctors\":[\"Dr. F. Lot\",\"Dr. G. Nden\"],\"services\":[\"OPD\",\"Emergency\",\"Surgery\",\"Laboratory\",\"Pharmacy\"]},{\"id\":\"FAC-PHC-BARKIN\",\"name\":\"Barkin Ladi Model PHC\",\"type\":\"Primary Health Centre\",\"lga\":\"Barkin Ladi\",\"level\":\"Primary\",\"beds\":24,\"totalBeds\":24,\"availableBeds\":9,\"status\":\"Online\",\"contactPhone\":\"073-460-0004\",\"operatingHours\":\"08:00-17:00\",\"doctors\":[\"Nurse H. Rwang\"],\"services\":[\"ANC\",\"Immunization\",\"Malaria\",\"Delivery\",\"Outreach\"]},{\"id\":\"FAC-PHC-MANGU\",\"name\":\"Mangu Central PHC\",\"type\":\"Primary Health Centre\",\"lga\":\"Mangu\",\"level\":\"Primary\",\"beds\":18,\"totalBeds\":18,\"availableBeds\":7,\"status\":\"Online\",\"contactPhone\":\"073-460-0005\",\"operatingHours\":\"08:00-17:00\",\"doctors\":[\"Nurse I. Sati\"],\"services\":[\"ANC\",\"Immunization\",\"Malaria\",\"Nutrition\",\"Outreach\"]},{\"id\":\"FAC-PHC-SHENDAM\",\"name\":\"Shendam Community PHC\",\"type\":\"Primary Health Centre\",\"lga\":\"Shendam\",\"level\":\"Primary\",\"beds\":20,\"totalBeds\":20,\"availableBeds\":11,\"status\":\"Needs Sync\",\"contactPhone\":\"073-460-0006\",\"operatingHours\":\"08:00-17:00\",\"doctors\":[\"CHO J. Dong\"],\"services\":[\"ANC\",\"Immunization\",\"Malaria\",\"Delivery\"]}],\"patients\":[{\"id\":\"PT-2008\",\"name\":\"Sekyen Millicent\",\"sex\":\"Female\",\"age\":24,\"phone\":\"07035696430\",\"lga\":\"\",\"community\":\"\",\"facilityId\":\"FAC-PLSH\",\"insurance\":\"Private Pay\",\"risk\":\"Routine\",\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"address\":\"\",\"occupation\":\"\",\"allergies\":[],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-2007\",\"name\":\"Sekyen Millicent\",\"sex\":\"Female\",\"age\":24,\"phone\":\"07035696430\",\"lga\":\"\",\"community\":\"\",\"facilityId\":\"FAC-PLSH\",\"insurance\":\"Private Pay\",\"risk\":\"Routine\",\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"address\":\"\",\"occupation\":\"\",\"allergies\":[],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-2006\",\"name\":\"Test Patient\",\"sex\":\"Male\",\"age\":30,\"phone\":\"08099999999\",\"lga\":\"\",\"community\":\"\",\"facilityId\":\"FAC-PLSH\",\"insurance\":\"Private Pay\",\"risk\":\"Routine\",\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"address\":\"\",\"occupation\":\"\",\"allergies\":[],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-2005\",\"name\":\"Andre Jispal\",\"sex\":\"Male\",\"age\":20,\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"phone\":\"09094930925\",\"address\":\"\",\"occupation\":\"\",\"lga\":\"Jos North\",\"community\":\"Nabor\",\"facilityId\":\"FAC-JUTH\",\"insurance\":\"Private Pay\",\"risk\":\"Routine Checkup\",\"allergies\":[\"Anti malaria meds\"],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-2004\",\"name\":\"Andre Jispal\",\"sex\":\"Male\",\"age\":20,\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"phone\":\"09094930925\",\"address\":\"\",\"occupation\":\"\",\"lga\":\"Jos North\",\"community\":\"Nabor\",\"facilityId\":\"FAC-JUTH\",\"insurance\":\"PLASCHEMA\",\"risk\":\"Routine Checkup\",\"allergies\":[\"Anti malaria meds\"],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-2003\",\"name\":\"Andre Jispal\",\"sex\":\"Male\",\"age\":20,\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"phone\":\"09094930925\",\"address\":\"\",\"occupation\":\"\",\"lga\":\"Jos North\",\"community\":\"Nabor\",\"facilityId\":\"FAC-JUTH\",\"insurance\":\"PLASCHEMA\",\"risk\":\"Routine Checkup\",\"allergies\":[\"Anti malaria meds\"],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-2002\",\"name\":\"Andre Jispal\",\"sex\":\"Male\",\"age\":20,\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"phone\":\"09094930925\",\"address\":\"\",\"occupation\":\"\",\"lga\":\"Jos North\",\"community\":\"Nabor\",\"facilityId\":\"FAC-JUTH\",\"insurance\":\"PLASCHEMA\",\"risk\":\"Routine Checkup\",\"allergies\":[\"Anti malaria meds\"],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-2001\",\"name\":\"Daniel Kingsley Ene\",\"sex\":\"Female\",\"age\":24,\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"phone\":\"09094930925\",\"address\":\"\",\"occupation\":\"\",\"lga\":\"Jos North\",\"community\":\"Nabor\",\"facilityId\":\"FAC-PLSH\",\"insurance\":\"Private Pay\",\"risk\":\"Routine Checkup\",\"allergies\":[\"Anti malaria meds\"],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-0009\",\"name\":\"Daniel Kingsley Ene\",\"sex\":\"Female\",\"age\":24,\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"phone\":\"09094930925\",\"address\":\"\",\"occupation\":\"\",\"lga\":\"Jos North\",\"community\":\"Nabor\",\"facilityId\":\"FAC-JUTH\",\"insurance\":\"Private Pay\",\"risk\":\"Routine Checkup\",\"allergies\":[\"Anti malaria meds\"],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-0008\",\"name\":\"Daniel Kingsley Ene\",\"sex\":\"Female\",\"age\":24,\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"phone\":\"09094930925\",\"address\":\"\",\"occupation\":\"\",\"lga\":\"Jos North\",\"community\":\"Nabor\",\"facilityId\":\"FAC-JUTH\",\"insurance\":\"Private Pay\",\"risk\":\"Routine Checkup\",\"allergies\":[\"Anti malaria meds\"],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-0007\",\"name\":\"Daniel Kingsley Ene\",\"sex\":\"Female\",\"age\":24,\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"phone\":\"09094930925\",\"address\":\"\",\"occupation\":\"\",\"lga\":\"Jos North\",\"community\":\"Nabor\",\"facilityId\":\"FAC-JUTH\",\"insurance\":\"Private Pay\",\"risk\":\"Routine Checkup\",\"allergies\":[\"Anti malaria meds\"],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-0006\",\"name\":\"Daniel Kingsley Ene\",\"sex\":\"Female\",\"age\":24,\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"phone\":\"09094930925\",\"address\":\"\",\"occupation\":\"\",\"lga\":\"Jos North\",\"community\":\"Nabor\",\"facilityId\":\"FAC-JUTH\",\"insurance\":\"Private Pay\",\"risk\":\"Routine Checkup\",\"allergies\":[\"Anti malaria meds\"],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-0005\",\"name\":\"Daniel Kingsley Ene\",\"sex\":\"Female\",\"age\":24,\"dateOfBirth\":\"\",\"bloodGroup\":\"\",\"phone\":\"09094930925\",\"address\":\"\",\"occupation\":\"\",\"lga\":\"Jos North\",\"community\":\"Nabor\",\"facilityId\":\"FAC-JUTH\",\"insurance\":\"Private Pay\",\"risk\":\"Routine Checkup\",\"allergies\":[\"Anti malaria meds\"],\"nextOfKin\":\"\",\"nextOfKinPhone\":\"\",\"lastVisit\":\"2026-07-14\"},{\"id\":\"PT-0001\",\"name\":\"Amina Musa\",\"sex\":\"Female\",\"age\":29,\"dateOfBirth\":\"1997-03-12\",\"bloodGroup\":\"O+\",\"phone\":\"08030000001\",\"address\":\"12 Ropp Road, Barkin Ladi\",\"occupation\":\"Farmer\",\"lga\":\"Barkin Ladi\",\"community\":\"Ropp\",\"facilityId\":\"FAC-PHC-BARKIN\",\"insurance\":\"PLASCHEMA\",\"risk\":\"Routine\",\"allergies\":[\"Arthemeter\"],\"nextOfKin\":\"Ibrahim Musa\",\"nextOfKinPhone\":\"08030000011\",\"lastVisit\":\"2026-06-18\"},{\"id\":\"PT-0002\",\"name\":\"Yakubu Pam\",\"sex\":\"Male\",\"age\":54,\"dateOfBirth\":\"1972-07-08\",\"bloodGroup\":\"A+\",\"phone\":\"08030000002\",\"address\":\"5 Bukuru Estate, Jos South\",\"occupation\":\"Teacher\",\"lga\":\"Jos South\",\"community\":\"Bukuru\",\"facilityId\":\"FAC-PLSH\",\"insurance\":\"NHIA\",\"risk\":\"Hypertension\",\"allergies\":[],\"nextOfKin\":\"Ruth Pam\",\"nextOfKinPhone\":\"08030000012\",\"lastVisit\":\"2026-06-22\"},{\"id\":\"PT-0003\",\"name\":\"Grace Dung\",\"sex\":\"Female\",\"age\":7,\"dateOfBirth\":\"2019-02-14\",\"bloodGroup\":\"B+\",\"phone\":\"Guardian: 08030000003\",\"address\":\"Panyam Village, Mangu LGA\",\"occupation\":\"Student\",\"lga\":\"Mangu\",\"community\":\"Panyam\",\"facilityId\":\"FAC-PHC-MANGU\",\"insurance\":\"Basic Health Care Provision Fund\",\"risk\":\"Under-5\",\"allergies\":[\"Penicillin\"],\"nextOfKin\":\"Joseph Dung\",\"nextOfKinPhone\":\"08030000013\",\"lastVisit\":\"2026-06-20\"},{\"id\":\"PT-0004\",\"name\":\"Samuel Longji\",\"sex\":\"Male\",\"age\":37,\"dateOfBirth\":\"1989-11-20\",\"bloodGroup\":\"AB+\",\"phone\":\"08030000004\",\"address\":\"Wase Town, Wase LGA\",\"occupation\":\"Civil Servant\",\"lga\":\"Wase\",\"community\":\"Wase Town\",\"facilityId\":\"FAC-WASE\",\"insurance\":\"Private Pay\",\"risk\":\"Trauma Follow-up\",\"allergies\":[],\"nextOfKin\":\"Mary Longji\",\"nextOfKinPhone\":\"08030000014\",\"lastVisit\":\"2026-06-23\"},{\"id\":\"PT-0010\",\"name\":\"Ngozi Obiora\",\"sex\":\"Female\",\"age\":40,\"phone\":\"07053509504\",\"lga\":\"Riyom\",\"community\":\"Anglo-Jos\",\"facilityId\":\"FAC-JUTH\",\"insurance\":\"NHIA\",\"risk\":\"Routine Checkup\",\"allergies\":[\"Penicillin\"],\"lastVisit\":\"2021-06-16\"},{\"id\":\"PT-0011\",\"name\":\"Amina Madaki\",\"sex\":\"Male\",\"age\":4,\"phone\":\"08092414407\",\"lga\":\"Wase\",\"community\":\"Bauchi Road\",\"facilityId\":\"FAC-PHC-MANGU\",\"insurance\":\"NHIA\",\"risk\":\"Under-5\",\"allergies\":[\"Tetracycline\"],\"lastVisit\":\"2024-07-21\"},{\"id\":\"PT-0012\",\"name\":\"Noah Maikudi\",\"sex\":\"Male\",\"age\":73,\"phone\":\"09085131314\",\"lga\":\"Jos South\",\"community\":\"Rantya\",\"facilityId\":\"FAC-PLSH\",\"insurance\":\"PLASCHEMA\",\"risk\":\"Elderly\",\"allergies\":[\"Ibuprofen\"],\"lastVisit\":\"2020-10-04\"},{\"id\":\"PT-0013\",\"name\":\"Matthew Ofodum\",\"sex\":\"Female\",\"age\":49,\"phone\":\"07020002235\",\"lga\":\"Bokkos\",\"community\":\"Rantya\",\"facilityId\":\"FAC-PLSH\",\"insurance\":\"NHIA\",\"risk\":\"Sickle Cell\",\"allergies\":[\"Ampicillin\"],\"lastVisit\":\"2022-03-15\"},{\"id\":\"PT-0014\",\"name\":\"Oluchi Chukwudum\",\"sex\":\"Male\",\"age\":60,\"phone\":\"08026905137\",\"lga\":\"Jos South\",\"community\":\"Rayfield\",\"facilityId\":\"FAC-JUTH\",\"insurance\":\"Private Pay\",\"risk\":\"HIV/AIDS\",\"allergies\":[\"Artemether\"],\"lastVisit\":\"2023-07-07\"},{\"id\":\"PT-0015\",\"name\":\"Suleiman Onwuegbu\",\"sex\":\"Male\",\"age\":27,\"phone\":\"08139840075\",\"lga\":\"Langtang South\",\"community\":\"Shendam\",\"facilityId\":\"FAC-PHC-BARKIN\",\"insurance\":\"Basic Health Care Provision Fund\",\"risk\":\"Pregnancy\",\"allergies\":[\"Anti malaria meds\"],\"lastVisit\":\"2023-04-17\"}],\"encounters\":[{\"id\":\"ENC-1010\",\"patientId\":\"PT-2007\",\"facilityId\":\"FAC-JUTH\",\"unit\":\"ANC\",\"date\":\"2026-07-14\",\"doctorId\":\"\",\"duration\":0,\"chiefComplaint\":\"Pre-clampsia\",\"vitals\":{\"temperature\":\"30\",\"bp\":\"120/80\",\"pulse\":\"\",\"respiration\":\"\",\"spo2\":\"\",\"weight\":\"80\"},\"assessment\":\"OBSTETRIC ASSESSMENT:\\n- Gestational Age: 30 weeks\\n- Vitals: BP 120/80, Temp 30°C\\n- Fetal Heart Rate: 120 bpm\\n- Clinical Impression: Normal progressing pregnancy, vitals stable. No acute distress.\",\"plan\":\"MANAGEMENT PLAN:\\n1. Routine prenatal vitamins (Iron & Folic Acid) dispensed.\\n2. Routine anomaly scan ordered.\\n3. Counselled on danger signs of pregnancy.\\n4. Next ANC appointment scheduled in 4 weeks.\",\"status\":\"Open\",\"icd11Code\":\"\",\"icd11Display\":\"\",\"labResultIds\":[],\"earlyWarningScore\":null,\"readmissionRisk\":null,\"dischargeNote\":\"\"},{\"id\":\"ENC-1009\",\"patientId\":\"PT-2007\",\"facilityId\":\"FAC-JUTH\",\"unit\":\"ANC\",\"date\":\"2026-07-14\",\"doctorId\":\"\",\"duration\":0,\"chiefComplaint\":\"Pre-clampsia\",\"vitals\":{\"temperature\":\"30\",\"bp\":\"120/80\",\"pulse\":\"\",\"respiration\":\"\",\"spo2\":\"\",\"weight\":\"80\"},\"assessment\":\"OBSTETRIC ASSESSMENT:\\n- Gestational Age: 30 weeks\\n- Vitals: BP 120/80, Temp 30°C\\n- Fetal Heart Rate: 120 bpm\\n- Clinical Impression: Normal progressing pregnancy, vitals stable. No acute distress.\",\"plan\":\"MANAGEMENT PLAN:\\n1. Routine prenatal vitamins (Iron & Folic Acid) dispensed.\\n2. Routine anomaly scan ordered.\\n3. Counselled on danger signs of pregnancy.\\n4. Next ANC appointment scheduled in 4 weeks.\",\"status\":\"Open\",\"icd11Code\":\"\",\"icd11Display\":\"\",\"labResultIds\":[],\"earlyWarningScore\":null,\"readmissionRisk\":null,\"dischargeNote\":\"\"},{\"id\":\"ENC-1008\",\"patientId\":\"PT-2007\",\"facilityId\":\"FAC-JUTH\",\"unit\":\"ANC\",\"date\":\"2026-07-14\",\"doctorId\":\"\",\"duration\":0,\"chiefComplaint\":\"Pre-clampsia\",\"vitals\":{\"temperature\":\"30\",\"bp\":\"120/80\",\"pulse\":\"\",\"respiration\":\"\",\"spo2\":\"\",\"weight\":\"80\"},\"assessment\":\"OBSTETRIC ASSESSMENT:\\n- Gestational Age: 30 weeks\\n- Vitals: BP 120/80, Temp 30°C\\n- Fetal Heart Rate: 120 bpm\\n- Clinical Impression: Normal progressing pregnancy, vitals stable. No acute distress.\",\"plan\":\"MANAGEMENT PLAN:\\n1. Routine prenatal vitamins (Iron & Folic Acid) dispensed.\\n2. Routine anomaly scan ordered.\\n3. Counselled on danger signs of pregnancy.\\n4. Next ANC appointment scheduled in 4 weeks.\",\"status\":\"Open\",\"icd11Code\":\"\",\"icd11Display\":\"\",\"labResultIds\":[],\"earlyWarningScore\":null,\"readmissionRisk\":null,\"dischargeNote\":\"\"},{\"id\":\"ENC-1007\",\"patientId\":\"PT-2007\",\"facilityId\":\"FAC-JUTH\",\"unit\":\"ANC\",\"date\":\"2026-07-14\",\"doctorId\":\"\",\"duration\":0,\"chiefComplaint\":\"Pre-clampsia\",\"vitals\":{\"temperature\":\"30\",\"bp\":\"120/80\",\"pulse\":\"\",\"respiration\":\"\",\"spo2\":\"\",\"weight\":\"80\"},\"assessment\":\"OBSTETRIC ASSESSMENT:\\n- Gestational Age: 30 weeks\\n- Vitals: BP 120/80, Temp 30°C\\n- Fetal Heart Rate: 120 bpm\\n- Clinical Impression: Normal progressing pregnancy, vitals stable. No acute distress.\",\"plan\":\"MANAGEMENT PLAN:\\n1. Routine prenatal vitamins (Iron & Folic Acid) dispensed.\\n2. Routine anomaly scan ordered.\\n3. Counselled on danger signs of pregnancy.\\n4. Next ANC appointment scheduled in 4 weeks.\",\"status\":\"Open\",\"icd11Code\":\"\",\"icd11Display\":\"\",\"labResultIds\":[],\"earlyWarningScore\":null,\"readmissionRisk\":null,\"dischargeNote\":\"\"},{\"id\":\"ENC-1006\",\"patientId\":\"PT-2007\",\"facilityId\":\"FAC-JUTH\",\"unit\":\"ANC\",\"date\":\"2026-07-14\",\"doctorId\":\"\",\"duration\":0,\"chiefComplaint\":\"Pre-clampsia\",\"vitals\":{\"temperature\":\"30\",\"bp\":\"120/80\",\"pulse\":\"\",\"respiration\":\"\",\"spo2\":\"\",\"weight\":\"80\"},\"assessment\":\"OBSTETRIC ASSESSMENT:\\n- Gestational Age: 30 weeks\\n- Vitals: BP 120/80, Temp 30°C\\n- Fetal Heart Rate: 120 bpm\\n- Clinical Impression: Normal progressing pregnancy, vitals stable. No acute distress.\",\"plan\":\"MANAGEMENT PLAN:\\n1. Routine prenatal vitamins (Iron & Folic Acid) dispensed.\\n2. Routine anomaly scan ordered.\\n3. Counselled on danger signs of pregnancy.\\n4. Next ANC appointment scheduled in 4 weeks.\",\"status\":\"Open\",\"icd11Code\":\"\",\"icd11Display\":\"\",\"labResultIds\":[],\"earlyWarningScore\":null,\"readmissionRisk\":null,\"dischargeNote\":\"\"},{\"id\":\"ENC-1005\",\"patientId\":\"PT-2007\",\"facilityId\":\"FAC-JUTH\",\"unit\":\"ANC\",\"date\":\"2026-07-14\",\"doctorId\":\"\",\"duration\":0,\"chiefComplaint\":\"Pre-clampsia\",\"vitals\":{\"temperature\":\"30\",\"bp\":\"120/80\",\"pulse\":\"\",\"respiration\":\"\",\"spo2\":\"\",\"weight\":\"80\"},\"assessment\":\"OBSTETRIC ASSESSMENT:\\n- Gestational Age: 30 weeks\\n- Vitals: BP 120/80, Temp 30°C\\n- Fetal Heart Rate: 120 bpm\\n- Clinical Impression: Normal progressing pregnancy, vitals stable. No acute distress.\",\"plan\":\"MANAGEMENT PLAN:\\n1. Routine prenatal vitamins (Iron & Folic Acid) dispensed.\\n2. Routine anomaly scan ordered.\\n3. Counselled on danger signs of pregnancy.\\n4. Next ANC appointment scheduled in 4 weeks.\",\"status\":\"Open\",\"icd11Code\":\"\",\"icd11Display\":\"\",\"labResultIds\":[],\"earlyWarningScore\":null,\"readmissionRisk\":null,\"dischargeNote\":\"\"},{\"id\":\"ENC-1004\",\"patientId\":\"PT-2007\",\"facilityId\":\"FAC-JUTH\",\"unit\":\"ANC\",\"date\":\"2026-07-14\",\"doctorId\":\"\",\"duration\":0,\"chiefComplaint\":\"Pre-clampsia\",\"vitals\":{\"temperature\":\"30\",\"bp\":\"120/80\",\"pulse\":\"\",\"respiration\":\"\",\"spo2\":\"\",\"weight\":\"80\"},\"assessment\":\"OBSTETRIC ASSESSMENT:\\n- Gestational Age: 30 weeks\\n- Vitals: BP 120/80, Temp 30°C\\n- Fetal Heart Rate: 120 bpm\\n- Clinical Impression: Normal progressing pregnancy, vitals stable. No acute distress.\",\"plan\":\"MANAGEMENT PLAN:\\n1. Routine prenatal vitamins (Iron & Folic Acid) dispensed.\\n2. Routine anomaly scan ordered.\\n3. Counselled on danger signs of pregnancy.\\n4. Next ANC appointment scheduled in 4 weeks.\",\"status\":\"Open\",\"icd11Code\":\"\",\"icd11Display\":\"\",\"labResultIds\":[],\"earlyWarningScore\":null,\"readmissionRisk\":null,\"dischargeNote\":\"\"},{\"id\":\"ENC-1001\",\"patientId\":\"PT-0001\",\"facilityId\":\"FAC-PHC-BARKIN\",\"unit\":\"ANC\",\"date\":\"2026-06-18\",\"doctorId\":\"Nurse H. Rwang\",\"duration\":25,\"chiefComplaint\":\"Routine antenatal visit, intermittent headache\",\"vitals\":{\"temperature\":36.8,\"bp\":\"142/94\",\"pulse\":88,\"respiration\":18,\"spo2\":98,\"weight\":72,\"gcs\":15},\"assessment\":\"Pregnancy at 28 weeks with elevated blood pressure. Rule out pre-eclampsia.\",\"plan\":\"Check urine protein, FBC, LFT, counsel danger signs, refer if severe features.\",\"status\":\"Open\",\"icd11Code\":\"JA60\",\"icd11Display\":\"Pre-eclampsia\",\"labResultIds\":[],\"earlyWarningScore\":null,\"readmissionRisk\":null,\"dischargeNote\":\"\"},{\"id\":\"ENC-1002\",\"patientId\":\"PT-0002\",\"facilityId\":\"FAC-PLSH\",\"unit\":\"OPD\",\"date\":\"2026-06-22\",\"doctorId\":\"Dr. D. Goshit\",\"duration\":20,\"chiefComplaint\":\"Headache and dizziness for three days\",\"vitals\":{\"temperature\":37.1,\"bp\":\"168/104\",\"pulse\":94,\"respiration\":20,\"spo2\":97,\"weight\":86,\"gcs\":15},\"assessment\":\"Poorly controlled hypertension.\",\"plan\":\"Review adherence, renal function, ECG, adjust antihypertensive after clinician review.\",\"status\":\"Open\",\"icd11Code\":\"BA00.0\",\"icd11Display\":\"Essential hypertension\",\"labResultIds\":[],\"earlyWarningScore\":null,\"readmissionRisk\":null,\"dischargeNote\":\"\"},{\"id\":\"ENC-1003\",\"patientId\":\"PT-0003\",\"facilityId\":\"FAC-PHC-MANGU\",\"unit\":\"PHC\",\"date\":\"2026-06-20\",\"doctorId\":\"Nurse I. Sati\",\"duration\":15,\"chiefComplaint\":\"Fever, chills, vomiting\",\"vitals\":{\"temperature\":39.2,\"bp\":\"92/60\",\"pulse\":124,\"respiration\":28,\"spo2\":96,\"weight\":21,\"gcs\":14},\"assessment\":\"Suspected malaria with dehydration. Under-5 high risk.\",\"plan\":\"RDT, oral rehydration if tolerated, urgent referral if lethargy/persistent vomiting.\",\"status\":\"Escalated\",\"icd11Code\":\"1D2Z\",\"icd11Display\":\"Malaria, unspecified\",\"labResultIds\":[],\"earlyWarningScore\":null,\"readmissionRisk\":null,\"dischargeNote\":\"\"}],\"consultations\":[],\"appointments\":[{\"id\":\"APT-0001\",\"patientId\":\"PT-0001\",\"facilityId\":\"FAC-PHC-BARKIN\",\"department\":\"ANC\",\"doctor\":\"Nurse H. Rwang\",\"date\":\"2026-07-20\",\"time\":\"09:00\",\"reason\":\"Follow-up ANC visit — 32 weeks\",\"status\":\"Scheduled\",\"notes\":\"\"},{\"id\":\"APT-0002\",\"patientId\":\"PT-0002\",\"facilityId\":\"FAC-PLSH\",\"department\":\"OPD\",\"doctor\":\"Dr. D. Goshit\",\"date\":\"2026-07-18\",\"time\":\"10:30\",\"reason\":\"Hypertension review and medication adjustment\",\"status\":\"Scheduled\",\"notes\":\"\"}],\"labResults\":[{\"id\":\"LAB-0001\",\"patientId\":\"PT-0001\",\"orderId\":\"ORD-5001\",\"facilityId\":\"FAC-PHC-BARKIN\",\"date\":\"2026-06-18\",\"tests\":[{\"name\":\"Urine Protein\",\"value\":\"2+\",\"unit\":\"\",\"refRange\":\"Negative\",\"interpretation\":\"Abnormal\"},{\"name\":\"Haemoglobin\",\"value\":\"9.8\",\"unit\":\"g/dL\",\"refRange\":\"12-16\",\"interpretation\":\"Abnormal\"},{\"name\":\"ALT\",\"value\":\"38\",\"unit\":\"U/L\",\"refRange\":\"7-40\",\"interpretation\":\"Normal\"}],\"technician\":\"Lab Tech K. Mancha\",\"notes\":\"Proteinuria 2+ — clinician review needed urgently\",\"criticalFlag\":true}],\"orders\":[{\"id\":\"ORD-5001\",\"patientId\":\"PT-0001\",\"type\":\"Laboratory\",\"item\":\"Urine Protein, FBC, LFT\",\"priority\":\"Urgent\",\"status\":\"Resulted\",\"facilityId\":\"FAC-PHC-BARKIN\",\"orderedBy\":\"Nurse H. Rwang\",\"date\":\"2026-06-18\"},{\"id\":\"ORD-5002\",\"patientId\":\"PT-0002\",\"type\":\"Pharmacy\",\"item\":\"Amlodipine 10mg OD, Hydrochlorothiazide 25mg OD\",\"priority\":\"Routine\",\"status\":\"In Progress\",\"facilityId\":\"FAC-PLSH\",\"orderedBy\":\"Dr. D. Goshit\",\"date\":\"2026-06-22\"},{\"id\":\"ORD-5003\",\"patientId\":\"PT-0003\",\"type\":\"Referral\",\"item\":\"Refer to General Hospital Mangu if danger signs persist\",\"priority\":\"Emergency\",\"status\":\"Escalated\",\"facilityId\":\"FAC-PHC-MANGU\",\"orderedBy\":\"Nurse I. Sati\",\"date\":\"2026-06-20\"},{\"id\":\"ORD-5004\",\"patientId\":\"PT-0002\",\"type\":\"Laboratory\",\"item\":\"Renal Function Test, Electrolytes, ECG\",\"priority\":\"Urgent\",\"status\":\"Pending\",\"facilityId\":\"FAC-PLSH\",\"orderedBy\":\"Dr. D. Goshit\",\"date\":\"2026-06-22\"}],\"billing\":[{\"id\":\"BILL-0007\",\"patientId\":\"PT-2007\",\"patientName\":\"Sekyen Millicent\",\"service\":\"ANC and Maternity\",\"description\":\"ANC encounter: Pre-clampsia\",\"totalAmount\":1000,\"insuranceCovered\":0,\"patientPayable\":1000,\"insurance\":\"Private Pay\",\"status\":\"Pending\",\"date\":\"2026-07-14\"},{\"id\":\"BILL-0006\",\"patientId\":\"PT-2007\",\"patientName\":\"Sekyen Millicent\",\"service\":\"ANC and Maternity\",\"description\":\"ANC encounter: Pre-clampsia\",\"totalAmount\":1000,\"insuranceCovered\":0,\"patientPayable\":1000,\"insurance\":\"Private Pay\",\"status\":\"Pending\",\"date\":\"2026-07-14\"},{\"id\":\"BILL-0005\",\"patientId\":\"PT-2007\",\"patientName\":\"Sekyen Millicent\",\"service\":\"ANC and Maternity\",\"description\":\"ANC encounter: Pre-clampsia\",\"totalAmount\":1000,\"insuranceCovered\":0,\"patientPayable\":1000,\"insurance\":\"Private Pay\",\"status\":\"Pending\",\"date\":\"2026-07-14\"},{\"id\":\"BILL-0004\",\"patientId\":\"PT-2007\",\"patientName\":\"Sekyen Millicent\",\"service\":\"ANC and Maternity\",\"description\":\"ANC encounter: Pre-clampsia\",\"totalAmount\":1000,\"insuranceCovered\":0,\"patientPayable\":1000,\"insurance\":\"Private Pay\",\"status\":\"Pending\",\"date\":\"2026-07-14\"},{\"id\":\"BILL-0003\",\"patientId\":\"PT-2007\",\"patientName\":\"Sekyen Millicent\",\"service\":\"ANC and Maternity\",\"description\":\"ANC encounter: Pre-clampsia\",\"totalAmount\":1000,\"insuranceCovered\":0,\"patientPayable\":1000,\"insurance\":\"Private Pay\",\"status\":\"Pending\",\"date\":\"2026-07-14\"},{\"id\":\"BILL-0002\",\"patientId\":\"PT-2007\",\"patientName\":\"Sekyen Millicent\",\"service\":\"ANC and Maternity\",\"description\":\"ANC encounter: Pre-clampsia\",\"totalAmount\":1000,\"insuranceCovered\":0,\"patientPayable\":1000,\"insurance\":\"Private Pay\",\"status\":\"Pending\",\"date\":\"2026-07-14\"},{\"id\":\"BILL-0001\",\"patientId\":\"PT-2007\",\"patientName\":\"Sekyen Millicent\",\"service\":\"ANC and Maternity\",\"description\":\"ANC encounter: Pre-clampsia\",\"totalAmount\":1000,\"insuranceCovered\":0,\"patientPayable\":1000,\"insurance\":\"Private Pay\",\"status\":\"Pending\",\"date\":\"2026-07-14\"}],\"beds\":[{\"id\":\"BED-JUTH-01\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Male Medical\",\"bedNumber\":\"1\",\"status\":\"Occupied\",\"patientId\":\"PT-0002\",\"admissionId\":\"ADM-0001\"},{\"id\":\"BED-JUTH-02\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Male Medical\",\"bedNumber\":\"2\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-JUTH-03\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Female Medical\",\"bedNumber\":\"1\",\"status\":\"Occupied\",\"patientId\":\"PT-0001\",\"admissionId\":\"ADM-0002\"},{\"id\":\"BED-JUTH-04\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Female Medical\",\"bedNumber\":\"2\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-JUTH-05\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Paediatric\",\"bedNumber\":\"1\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-JUTH-06\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Paediatric\",\"bedNumber\":\"2\",\"status\":\"Maintenance\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-JUTH-07\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Surgery Ward\",\"bedNumber\":\"1\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-JUTH-08\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Surgery Ward\",\"bedNumber\":\"2\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-JUTH-09\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Maternity Ward\",\"bedNumber\":\"1\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-JUTH-10\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Maternity Ward\",\"bedNumber\":\"2\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-JUTH-11\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Intensive Care Unit (ICU)\",\"bedNumber\":\"1\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-JUTH-12\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Isolation Ward\",\"bedNumber\":\"1\",\"status\":\"Maintenance\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-JUTH-13\",\"facilityId\":\"FAC-JUTH\",\"ward\":\"Emergency Ward\",\"bedNumber\":\"1\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-PLSH-01\",\"facilityId\":\"FAC-PLSH\",\"ward\":\"General Ward\",\"bedNumber\":\"1\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-PLSH-02\",\"facilityId\":\"FAC-PLSH\",\"ward\":\"General Ward\",\"bedNumber\":\"2\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-PLSH-03\",\"facilityId\":\"FAC-PLSH\",\"ward\":\"Maternity Ward\",\"bedNumber\":\"1\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null},{\"id\":\"BED-PLSH-04\",\"facilityId\":\"FAC-PLSH\",\"ward\":\"Surgery Ward\",\"bedNumber\":\"1\",\"status\":\"Vacant\",\"patientId\":null,\"admissionId\":null}],\"admissions\":[{\"id\":\"ADM-0001\",\"patientId\":\"PT-0002\",\"facilityId\":\"FAC-JUTH\",\"bedId\":\"BED-JUTH-01\",\"ward\":\"Male Medical\",\"admissionDate\":\"2026-07-10\",\"dischargeDate\":null,\"admissionDiagnosis\":\"Hypertensive crisis\",\"status\":\"Active\",\"readmissionRisk\":\"High\",\"dischargedBy\":null},{\"id\":\"ADM-0002\",\"patientId\":\"PT-0001\",\"facilityId\":\"FAC-JUTH\",\"bedId\":\"BED-JUTH-03\",\"ward\":\"Female Medical\",\"admissionDate\":\"2026-07-11\",\"dischargeDate\":null,\"admissionDiagnosis\":\"Pre-eclampsia with severe features\",\"status\":\"Active\",\"readmissionRisk\":\"Very High\",\"dischargedBy\":null},{\"id\":\"ADM-0003\",\"patientId\":\"PT-0003\",\"facilityId\":\"FAC-JUTH\",\"bedId\":\"BED-JUTH-05\",\"ward\":\"Paediatric\",\"admissionDate\":\"2026-07-12\",\"dischargeDate\":\"2026-07-14\",\"admissionDiagnosis\":\"Severe malaria with dehydration\",\"status\":\"Discharged\",\"readmissionRisk\":\"Medium\",\"dischargedBy\":\"Duty Clinician\"}],\"reports\":null,\"alertsLog\":[],\"dischargeSummaries\":[{\"disclaimer\":\"System-generated discharge summary. Clinician must review, complete, and sign before issuing to patient.\",\"summary\":{\"header\":\"DISCHARGE SUMMARY — GRACE DUNG\",\"patientInfo\":\"Patient: Grace Dung | Age: 7 | Sex: Female | ID: PT-0003\",\"dateOfAdmission\":\"2026-07-12\",\"dateOfDischarge\":\"14/07/2026\",\"ward\":\"Paediatric\",\"admittingDiagnosis\":\"Severe malaria with dehydration\",\"finalDiagnosis\":\"Malaria, unspecified\",\"clinicalSummary\":\"Suspected malaria with dehydration. Under-5 high risk.\",\"hospitalCourse\":\"RDT, oral rehydration if tolerated, urgent referral if lethargy/persistent vomiting.\",\"investigationsPerformed\":\"No laboratory results on file.\",\"medicationsOnDischarge\":\"No medications prescribed on discharge.\",\"followUpInstructions\":\"Please return to clinic in 2 weeks or sooner if symptoms worsen. Next appointment at FAC-PHC-MANGU.\",\"warningSignsToReturn\":\"Return immediately for: chest pain, difficulty breathing, high fever >39°C, seizures, loss of consciousness, or any new concerning symptoms.\",\"clinicianSignature\":\"Attending Clinician — 14/07/2026\",\"footer\":\"This document was generated by Health Grid EHR. It must be reviewed and co-signed by the attending clinician.\"},\"createdAt\":\"2026-07-14T13:56:56.701Z\"}]}");
}),
"[project]/server/server.js [api] (ecmascript)", ((__turbopack_context__, module, exports) => {

const http = __turbopack_context__.r("[externals]/http [external] (http, cjs)");
const fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
const PORT = process.env.PORT || 8082;
const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
let DATA_FILE = path.join(ROOT, "server", "data.json");
let memoryDb = null;
if (process.env.VERCEL) {
    const tmpPath = path.join("/tmp", "data.json");
    try {
        if (!fs.existsSync(tmpPath)) {
            // Look for data.json at compile or runtime path
            const sourcePath = fs.existsSync(DATA_FILE) ? DATA_FILE : path.join(("TURBOPACK compile-time value", "/ROOT/server"), "data.json");
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, tmpPath);
            }
        }
        DATA_FILE = tmpPath;
    } catch (err) {
        console.warn("Failed to set up /tmp database, using memory fallback:", err);
    }
}
const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml"
};
// ─── Data Helpers ───────────────────────────────────────────
function readData() {
    if (memoryDb) return memoryDb;
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf8");
        const data = JSON.parse(raw);
        if (process.env.VERCEL) memoryDb = data;
        return data;
    } catch (err) {
        try {
            console.warn("data.json not found, using bundled copy:", err.message);
            const seed = __turbopack_context__.r("[project]/server/data.json.[json].cjs [api] (ecmascript)");
            writeData(seed);
            return seed;
        } catch (_) {
            try {
                const seedFile = path.join(ROOT, "server", "seed_data.json");
                const seed = JSON.parse(fs.readFileSync(seedFile, "utf8"));
                writeData(seed);
                return seed;
            } catch (__) {
                console.error("All data sources missing, using empty schema:", err.message);
                const empty = {
                    patients: [],
                    encounters: [],
                    admissions: [],
                    billing: [],
                    facilities: [],
                    orders: [],
                    appointments: [],
                    labResults: [],
                    beds: [],
                    consultations: []
                };
                return empty;
            }
        }
    }
}
function writeData(d) {
    memoryDb = d;
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2), "utf8");
    } catch (err) {
        console.error("Write data failed, keeping in memory:", err);
    }
}
function sendJson(res, status, body) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end(JSON.stringify(body));
}
function collectBody(req) {
    return new Promise((resolve, reject)=>{
        let raw = "";
        req.on("data", (chunk)=>{
            raw += chunk;
            if (raw.length > 2_000_000) reject(new Error("Body too large"));
        });
        req.on("end", ()=>{
            if (!raw) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(raw));
            } catch (e) {
                reject(e);
            }
        });
    });
}
function nextId(prefix, list) {
    const max = list.reduce((h, x)=>{
        const n = Number(String(x.id || "").replace(/\D/g, ""));
        return isFinite(n) && n > h ? n : h;
    }, 0);
    return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}
function parseBp(bp) {
    const [s, d] = String(bp || "").split("/").map(Number);
    return {
        systolic: s || 0,
        diastolic: d || 0
    };
}
// ─── Drug Interaction Database ───────────────────────────────
const DRUG_INTERACTIONS = {
    "warfarin": {
        "aspirin": {
            severity: "Critical",
            message: "Warfarin + Aspirin: Major bleeding risk. Avoid combination unless under strict haematology supervision."
        },
        "ibuprofen": {
            severity: "Critical",
            message: "Warfarin + NSAIDs: Increased haemorrhage risk. Avoid."
        },
        "ciprofloxacin": {
            severity: "Warning",
            message: "Warfarin + Ciprofloxacin: May increase INR. Monitor closely."
        }
    },
    "metformin": {
        "contrast": {
            severity: "Warning",
            message: "Metformin + IV Contrast: Risk of contrast-induced nephropathy and lactic acidosis. Hold metformin 48h."
        },
        "alcohol": {
            severity: "Warning",
            message: "Metformin + Alcohol: Risk of lactic acidosis."
        }
    },
    "amlodipine": {
        "simvastatin": {
            severity: "Warning",
            message: "Amlodipine + Simvastatin >20mg: Increased statin toxicity/rhabdomyolysis risk."
        }
    },
    "ace inhibitor": {
        "potassium": {
            severity: "Warning",
            message: "ACE Inhibitors + Potassium supplements: Risk of hyperkalaemia."
        },
        "nsaid": {
            severity: "Warning",
            message: "ACE Inhibitors + NSAIDs: Reduced antihypertensive effect and renal impairment risk."
        }
    },
    "gentamicin": {
        "furosemide": {
            severity: "Critical",
            message: "Gentamicin + Furosemide: High risk of ototoxicity and nephrotoxicity. Avoid if possible."
        }
    },
    "artemether": {
        "quinine": {
            severity: "Critical",
            message: "Artemether + Quinine: QT prolongation risk. Do not combine."
        }
    },
    "magnesium sulphate": {
        "calcium channel blocker": {
            severity: "Warning",
            message: "MgSO4 + Calcium Channel Blockers: Risk of neuromuscular blockade."
        }
    }
};
const ALLERGY_DRUG_MAP = {
    "Penicillin": [
        "penicillin",
        "amoxicillin",
        "ampicillin",
        "flucloxacillin",
        "co-amoxiclav",
        "piperacillin"
    ],
    "Sulfa": [
        "sulfamethoxazole",
        "co-trimoxazole",
        "trimethoprim-sulfamethoxazole",
        "sulphonamide",
        "sulfadiazine"
    ],
    "NSAIDs": [
        "ibuprofen",
        "diclofenac",
        "indomethacin",
        "naproxen",
        "aspirin",
        "ketorolac"
    ],
    "Aspirin": [
        "aspirin",
        "asa"
    ],
    "Codeine": [
        "codeine",
        "dihydrocodeine"
    ],
    "Contrast": [
        "iodine contrast",
        "iv contrast",
        "contrast dye"
    ]
};
// ─── ICD-11 Database ─────────────────────────────────────────
const ICD11_DB = {
    stems: {
        "1A00": {
            title: "Cholera",
            allowedExtensions: []
        },
        "1D2Z": {
            title: "Malaria, unspecified",
            allowedExtensions: []
        },
        "BA00.0": {
            title: "Essential hypertension",
            allowedExtensions: []
        },
        "JA60": {
            title: "Pre-eclampsia",
            allowedExtensions: [
                "XS2A",
                "XS0T"
            ]
        },
        "NC72.Z": {
            title: "Fracture of forearm, unspecified",
            allowedExtensions: [
                "XK8G",
                "XK9K",
                "XJ7ZH",
                "XJ7YM"
            ]
        },
        "5A11": {
            title: "Type 2 diabetes mellitus",
            allowedExtensions: []
        },
        "1C44.Z": {
            title: "Tuberculosis of lungs, unspecified",
            allowedExtensions: []
        },
        "1E31": {
            title: "Type A influenza",
            allowedExtensions: []
        },
        "NE60": {
            title: "Burns of unspecified body region",
            allowedExtensions: [
                "XK8G",
                "XK9K"
            ]
        },
        "CA22.Z": {
            title: "Pneumonia, unspecified",
            allowedExtensions: []
        },
        "5B55": {
            title: "Severe acute malnutrition",
            allowedExtensions: []
        },
        "KA21": {
            title: "Sickle cell disease",
            allowedExtensions: []
        },
        "1C82.Z": {
            title: "HIV disease, unspecified",
            allowedExtensions: []
        },
        "5A10": {
            title: "Type 1 diabetes mellitus",
            allowedExtensions: []
        },
        "MG43": {
            title: "Sepsis, unspecified",
            allowedExtensions: []
        },
        "NA07.1": {
            title: "Intracranial injury",
            allowedExtensions: []
        },
        "JA00": {
            title: "Ectopic pregnancy",
            allowedExtensions: []
        },
        "BB22": {
            title: "Ischaemic stroke",
            allowedExtensions: []
        }
    },
    extensions: {
        "XK8G": {
            title: "Left side",
            axis: "Laterality"
        },
        "XK9K": {
            title: "Right side",
            axis: "Laterality"
        },
        "XJ7ZH": {
            title: "Closed fracture",
            axis: "Fracture Type"
        },
        "XJ7YM": {
            title: "Open fracture",
            axis: "Fracture Type"
        },
        "XS2A": {
            title: "Mild severity",
            axis: "Severity"
        },
        "XS0T": {
            title: "Severe severity",
            axis: "Severity"
        }
    }
};
const SYMPTOM_MAP = [
    {
        keywords: [
            "cholera",
            "watery diarrhoea",
            "rice water",
            "severe dehydration"
        ],
        code: "1A00"
    },
    {
        keywords: [
            "malaria",
            "fever",
            "chills",
            "sweating",
            "rigors",
            "rdt positive"
        ],
        code: "1D2Z"
    },
    {
        keywords: [
            "hypertension",
            "high blood pressure",
            "elevated bp",
            "systolic",
            "diastolic"
        ],
        code: "BA00.0"
    },
    {
        keywords: [
            "pre-eclampsia",
            "preeclampsia",
            "pregnancy",
            "proteinuria",
            "elevated bp",
            "blurred vision"
        ],
        code: "JA60"
    },
    {
        keywords: [
            "fracture",
            "broken arm",
            "forearm pain",
            "deformity",
            "fall"
        ],
        code: "NC72.Z"
    },
    {
        keywords: [
            "diabetes",
            "polyuria",
            "polydipsia",
            "increased thirst",
            "high blood sugar",
            "hyperglycemia"
        ],
        code: "5A11"
    },
    {
        keywords: [
            "tuberculosis",
            "tb",
            "coughing blood",
            "hemoptysis",
            "night sweats",
            "geneXpert"
        ],
        code: "1C44.Z"
    },
    {
        keywords: [
            "influenza",
            "flu",
            "sore throat",
            "runny nose",
            "body aches",
            "cough"
        ],
        code: "1E31"
    },
    {
        keywords: [
            "burn",
            "burns",
            "scald",
            "blister",
            "fire injury"
        ],
        code: "NE60"
    },
    {
        keywords: [
            "pneumonia",
            "chest pain",
            "cough with phlegm",
            "difficulty breathing",
            "crepitations"
        ],
        code: "CA22.Z"
    },
    {
        keywords: [
            "malnutrition",
            "wasting",
            "muac",
            "edema",
            "severe acute malnutrition"
        ],
        code: "5B55"
    },
    {
        keywords: [
            "sickle cell",
            "crisis",
            "vaso-occlusive",
            "hb ss",
            "anemia"
        ],
        code: "KA21"
    },
    {
        keywords: [
            "hiv",
            "aids",
            "opportunistic infection",
            "retroviral"
        ],
        code: "1C82.Z"
    },
    {
        keywords: [
            "sepsis",
            "qsofa",
            "shock",
            "infection",
            "confusion",
            "hypothermia"
        ],
        code: "MG43"
    },
    {
        keywords: [
            "head injury",
            "concussion",
            "gcs < 15",
            "loss of consciousness",
            "intracranial"
        ],
        code: "NA07.1"
    },
    {
        keywords: [
            "ectopic",
            "pregnancy pain",
            "missed period",
            "vaginal bleeding",
            "pelvic pain"
        ],
        code: "JA00"
    },
    {
        keywords: [
            "stroke",
            "slurred speech",
            "hemiplegia",
            "facial droop",
            "weakness"
        ],
        code: "BB22"
    }
];
function suggestIcd11FromSymptoms(text) {
    const t = String(text).toLowerCase();
    let bestMatch = null;
    let maxMatches = 0;
    for (const item of SYMPTOM_MAP){
        let matches = 0;
        for (const kw of item.keywords){
            if (t.includes(kw)) {
                matches++;
            }
        }
        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = item.code;
        }
    }
    if (bestMatch) {
        const stem = ICD11_DB.stems[bestMatch];
        return {
            code: bestMatch,
            title: stem.title,
            allowedExtensions: stem.allowedExtensions
        };
    }
    return null;
}
function searchIcd11(query) {
    const q = String(query).toLowerCase().trim();
    if (!q) return [];
    return Object.entries(ICD11_DB.stems).filter(([code, info])=>code.toLowerCase().includes(q) || info.title.toLowerCase().includes(q)).map(([code, info])=>({
            code,
            title: info.title,
            type: "stem",
            allowedExtensions: info.allowedExtensions
        }));
}
function validateIcd11Cluster(expression) {
    if (!expression) return {
        isValid: false,
        error: "Empty expression"
    };
    const parts = expression.split("&");
    const stemCode = parts[0];
    const extensionCodes = parts.slice(1);
    const stem = ICD11_DB.stems[stemCode];
    if (!stem) return {
        isValid: false,
        error: `Invalid stem code: ${stemCode}`
    };
    const seenAxes = {};
    const validatedExtensions = [];
    for (const extCode of extensionCodes){
        const ext = ICD11_DB.extensions[extCode];
        if (!ext) return {
            isValid: false,
            error: `Invalid extension: ${extCode}`
        };
        if (!stem.allowedExtensions.includes(extCode)) return {
            isValid: false,
            error: `Extension ${extCode} not permitted for ${stemCode}`
        };
        if (seenAxes[ext.axis]) return {
            isValid: false,
            error: `Axis conflict: ${ext.axis} duplicated`
        };
        seenAxes[ext.axis] = extCode;
        validatedExtensions.push({
            code: extCode,
            title: ext.title,
            axis: ext.axis
        });
    }
    return {
        isValid: true,
        stem: {
            code: stemCode,
            title: stem.title
        },
        extensions: validatedExtensions,
        formattedDisplay: stem.title + (validatedExtensions.length ? ", " + validatedExtensions.map((e)=>e.title).join(", ") : "")
    };
}
// ─── Billing ─────────────────────────────────────────────────
const serviceCosts = {
    "Triage": 500,
    "Outpatient": 1000,
    "Emergency": 3000,
    "Wards": 5000,
    "Laboratory": 2000,
    "Pharmacy": 1200,
    "Radiology": 4500,
    "ANC and Maternity": 1000,
    "Immunization": 300,
    "Theatre": 15000,
    "Claims": 200,
    "Referrals": 800,
    "Consultation": 1500,
    "Appointment": 500
};
const unitToServiceMap = {
    "OPD": "Outpatient",
    "Emergency": "Emergency",
    "Ward": "Wards",
    "ANC": "ANC and Maternity",
    "PHC": "Triage",
    "Theatre": "Theatre",
    "Triage": "Triage",
    "Laboratory": "Laboratory",
    "Pharmacy": "Pharmacy",
    "Radiology": "Radiology",
    "Immunization": "Immunization",
    "Claims": "Claims",
    "Referrals": "Referrals"
};
const insuranceCoverage = {
    "PLASCHEMA": 0.7,
    "NHIA": 0.6,
    "Basic Health Care Provision Fund": 0.9,
    "Private Pay": 0.0
};
function createAutoBill(data, patientId, serviceType, description) {
    if (!data.billing) data.billing = [];
    const patient = data.patients.find((p)=>p.id === patientId);
    const cost = serviceCosts[serviceType] || 1000;
    const cov = insuranceCoverage[patient?.insurance] ?? 0;
    const bill = {
        id: nextId("BILL", data.billing),
        patientId,
        patientName: patient?.name || "Unknown",
        service: serviceType,
        description: description || `${serviceType} services`,
        totalAmount: cost,
        insuranceCovered: Math.round(cost * cov),
        patientPayable: Math.round(cost * (1 - cov)),
        insurance: patient?.insurance || "Private Pay",
        status: "Pending",
        date: new Date().toISOString().slice(0, 10)
    };
    data.billing.unshift(bill);
    return bill;
}
// ─── Summary ─────────────────────────────────────────────────
function buildSummary(data) {
    const openEncounters = (data.encounters || []).filter((e)=>e.status !== "Closed").length;
    const phcs = (data.facilities || []).filter((f)=>f.type.includes("Primary")).length;
    const urgentOrders = (data.orders || []).filter((o)=>[
            "Urgent",
            "Emergency"
        ].includes(o.priority)).length;
    const lowStock = (data.inventory || []).filter((i)=>i.quantity <= i.reorderLevel).length;
    const totalBilled = (data.billing || []).reduce((s, b)=>s + (b.totalAmount || 0), 0);
    const totalCollected = (data.billing || []).filter((b)=>b.status === "Paid").reduce((s, b)=>s + (b.patientPayable || 0), 0);
    const activeAdmissions = (data.admissions || []).filter((a)=>a.status === "Active").length;
    const criticalLabs = (data.labResults || []).filter((l)=>l.criticalFlag).length;
    return {
        facilities: (data.facilities || []).length,
        phcs,
        patients: (data.patients || []).length,
        openEncounters,
        urgentOrders,
        lowStock,
        surveillanceSignals: (data.surveillance || []).length,
        activeAdmissions,
        criticalLabs,
        totalBilled,
        totalCollected,
        collectionRate: totalBilled > 0 ? Math.round(totalCollected / totalBilled * 100) : 0,
        quality: {
            avgWaitMinutes: 34,
            triageUnder10Minutes: 82,
            referralCompletion: 76,
            ancRiskReviewed: 91
        }
    };
}
// ─── Analytics ───────────────────────────────────────────────
function buildAnalytics(data) {
    const diseaseBurden = {};
    (data.surveillance || []).forEach((s)=>{
        diseaseBurden[s.condition] = (diseaseBurden[s.condition] || 0) + s.cases7d;
    });
    const registrationByMonth = {};
    (data.patients || []).forEach((p)=>{
        const month = p.lastVisit ? p.lastVisit.slice(0, 7) : "Unknown";
        registrationByMonth[month] = (registrationByMonth[month] || 0) + 1;
    });
    const insuranceDist = {};
    (data.patients || []).forEach((p)=>{
        insuranceDist[p.insurance || "Unknown"] = (insuranceDist[p.insurance || "Unknown"] || 0) + 1;
    });
    const billingByStatus = {
        Pending: 0,
        Paid: 0,
        Claimed: 0,
        Waived: 0
    };
    (data.billing || []).forEach((b)=>{
        if (billingByStatus[b.status] !== undefined) billingByStatus[b.status] += b.totalAmount || 0;
    });
    const lgaPatients = {};
    data.patients.forEach((p)=>{
        lgaPatients[p.lga || "Unknown"] = (lgaPatients[p.lga || "Unknown"] || 0) + 1;
    });
    return {
        diseaseBurden,
        registrationByMonth,
        insuranceDist,
        billingByStatus,
        lgaPatients
    };
}
// ─── Clinical Engines ──────────────────────────────────────────────
// 1. Clinical Note Scrubber (existing, enhanced)
function scrubClinicalNote(payload) {
    const text = [
        payload.chiefComplaint,
        payload.assessment,
        payload.plan,
        payload.note
    ].filter(Boolean).join(" ").toLowerCase();
    const vitals = payload.vitals || {};
    const issues = [], missing = [], suggestions = [], redFlags = [];
    [
        "temperature",
        "bp",
        "pulse",
        "respiration",
        "spo2"
    ].forEach((f)=>{
        if (!vitals[f]) missing.push(f);
    });
    const { systolic, diastolic } = parseBp(vitals.bp);
    if (systolic >= 180 || diastolic >= 120) redFlags.push("Severe hypertension range. Confirm manually, assess end-organ symptoms, escalate per protocol.");
    else if (systolic >= 140 || diastolic >= 90) issues.push("Blood pressure elevated. Document repeat BP and cardiovascular/obstetric risk.");
    if (Number(vitals.temperature) >= 38) issues.push("Fever documented. Consider malaria RDT, infection screen, hydration status.");
    if (Number(vitals.spo2) && Number(vitals.spo2) < 94) redFlags.push("Low oxygen saturation. Recheck probe, assess airway, consider urgent escalation.");
    if (text.includes("pregnan") && (systolic >= 140 || diastolic >= 90)) redFlags.push("Pregnancy + elevated BP → screen for pre-eclampsia: urine protein, headache, visual changes, epigastric pain.");
    if (text.includes("child") || text.includes("under-5") || text.includes("paediatric")) suggestions.push("Under-5: document weight-based dosing, danger signs, hydration, immunization status, caregiver counselling.");
    if (text.includes("malaria")) suggestions.push("Malaria: record RDT/microscopy result before treatment. Report rising clusters to surveillance.");
    if (text.includes("chest pain") || text.includes("stroke") || text.includes("unconscious") || text.includes("seizure")) redFlags.push("Emergency symptom detected. Activate emergency workflow and document time-critical actions.");
    if (text.includes("diabet")) suggestions.push("Diabetes: document HbA1c, blood glucose, medication adherence, foot exam, renal function.");
    if (missing.length) issues.push(`Missing core vitals: ${missing.join(", ")}.`);
    return {
        safety: "Clinical decision support only. Licensed clinicians are responsible for all clinical decisions.",
        qualityScore: Math.max(45, 100 - issues.length * 10 - redFlags.length * 18 - missing.length * 5),
        redFlags,
        documentationIssues: issues,
        suggestions,
        structuredSoap: {
            subjective: payload.chiefComplaint || "Not documented",
            objective: vitals,
            assessment: payload.assessment || "Not documented",
            plan: payload.plan || "Not documented"
        }
    };
}
// 2. Clinical Inquiry
function answerClinicalInquiry(question) {
    const q = String(question || "").toLowerCase();
    const disclaimer = "Clinical decision support. Verify with local protocol and senior review where needed.";
    if (q.includes("pre-eclampsia") || q.includes("preeclampsia")) return {
        disclaimer,
        answer: "Elevated BP after 20 weeks: repeat BP, urine protein, symptom screen, severity assessment. Red flags: severe headache, visual disturbance, epigastric pain, seizures, severe BP range, low platelets, abnormal LFT/creatinine, fetal concerns. Stabilize and refer urgently if severe features.",
        actions: [
            "Repeat BP",
            "Check urine protein",
            "Assess danger symptoms",
            "Order FBC/LFT/renal",
            "Refer urgently for severe features"
        ]
    };
    if (q.includes("malaria")) return {
        disclaimer,
        answer: "Confirm with RDT/microscopy. Assess danger signs, hydration, pregnancy, age, oral tolerance. Escalate: altered consciousness, convulsions, respiratory distress, severe anaemia, shock.",
        actions: [
            "Perform RDT/microscopy",
            "Check danger signs",
            "Weight-based dosing",
            "Document batch",
            "Notify surveillance"
        ]
    };
    if (q.includes("hypertension") || q.includes(" bp ") || q.includes("blood pressure")) return {
        disclaimer,
        answer: "Repeat BP after rest with correct cuff size. Check adherence and symptoms. Assess renal/cardiac risk. Review medicines. Escalate severe range or end-organ symptoms. Document BP trend, counselling, follow-up date.",
        actions: [
            "Repeat BP",
            "Screen chest pain/neuro signs",
            "Review medication adherence",
            "Check renal function",
            "Schedule follow-up or emergency referral"
        ]
    };
    if (q.includes("sepsis")) return {
        disclaimer,
        answer: "Sepsis: suspect if SIRS criteria + infection. qSOFA ≥2 (RR≥22, SBP≤100, altered mentation) = high risk. Initiate sepsis bundle: cultures, fluids, antibiotics within 1 hour. Escalate immediately.",
        actions: [
            "Calculate qSOFA score",
            "Draw blood cultures",
            "IV access + fluids",
            "Broad-spectrum antibiotics within 1hr",
            "Escalate to ICU if organ dysfunction"
        ]
    };
    if (q.includes("diabet")) return {
        disclaimer,
        answer: "Diabetes management: monitor glucose, HbA1c 3-6 monthly, check feet, eyes, renal function annually. Adjust medications at each visit. Educate on lifestyle, hypoglycaemia recognition, and sick day rules.",
        actions: [
            "Check fasting glucose",
            "Review HbA1c",
            "Foot examination",
            "Urine ACR for nephropathy",
            "Medication review"
        ]
    };
    return {
        disclaimer,
        answer: "I can assist with clinical thinking, documentation gaps, danger sign identification, SOAP notes, condition-specific guidance (malaria, hypertension, pre-eclampsia, sepsis, diabetes, under-5, ANC), drug interactions, and referral criteria.",
        actions: [
            "Add patient age/sex",
            "Add vital signs",
            "State pregnancy/child status",
            "Mention allergies and medicines",
            "Ask a focused clinical question"
        ]
    };
}
// 3. Ambient Auto-Note Generator
function generateAutoNote(payload) {
    const { chiefComplaint, vitals = {}, age, sex, allergies = [], conditions = [] } = payload;
    const { systolic, diastolic } = parseBp(vitals.bp);
    const temp = Number(vitals.temperature);
    const spo2 = Number(vitals.spo2);
    const pulse = Number(vitals.pulse);
    const rr = Number(vitals.respiration);
    const findings = [];
    if (systolic >= 140 || diastolic >= 90) findings.push(`blood pressure elevated at ${vitals.bp} mmHg`);
    if (temp >= 38) findings.push(`fever at ${temp}°C`);
    if (spo2 > 0 && spo2 < 94) findings.push(`hypoxia with SpO2 of ${spo2}%`);
    if (pulse > 100) findings.push(`tachycardia at ${pulse} bpm`);
    if (rr > 20) findings.push(`tachypnoea at ${rr} breaths/min`);
    const objectiveText = `Vital signs: Temp ${vitals.temperature || "—"}°C, BP ${vitals.bp || "—"} mmHg, Pulse ${vitals.pulse || "—"} bpm, RR ${vitals.respiration || "—"} breaths/min, SpO2 ${vitals.spo2 || "—"}%, Weight ${vitals.weight || "—"} kg.${findings.length ? " Notable findings: " + findings.join("; ") + "." : " Vitals otherwise stable."}`;
    let assessmentText = `${age ? age + "-year-old " : ""}${sex || "patient"} presenting with ${chiefComplaint || "unspecified complaint"}.`;
    if (conditions.length) assessmentText += ` Known history of: ${conditions.join(", ")}.`;
    if (allergies.length) assessmentText += ` Documented allergies: ${allergies.join(", ")}.`;
    let planText = "Further evaluation required. ";
    if (temp >= 38) planText += "Consider malaria RDT and infection workup. ";
    if (systolic >= 140) planText += "Repeat BP after rest, assess cardiovascular risk. ";
    if (spo2 > 0 && spo2 < 94) planText += "Urgent respiratory assessment and supplemental oxygen. ";
    planText += "Document complete history, review medications, and arrange appropriate follow-up.";
    return {
        disclaimer: "System-generated draft note. Clinician must review, edit, and confirm before finalising.",
        soap: {
            subjective: chiefComplaint || "Chief complaint not entered",
            objective: objectiveText,
            assessment: assessmentText,
            plan: planText
        }
    };
}
// 4. Symptom Triage + Differential Diagnosis Engine
function triageSymptoms(payload) {
    const { symptoms = [], vitals = {}, age, sex, allergies = [], conditions = [] } = payload;
    const text = (symptoms.join(" ") + " " + (payload.freeText || "")).toLowerCase();
    const { systolic, diastolic } = parseBp(vitals.bp);
    const temp = Number(vitals.temperature);
    const spo2 = Number(vitals.spo2);
    const pulse = Number(vitals.pulse);
    const rr = Number(vitals.respiration);
    let acuity = "Routine";
    const redFlags = [];
    const differentials = [];
    const suggestedOrders = [];
    // Emergency triggers
    if (text.includes("unconscious") || text.includes("not breathing") || text.includes("cardiac arrest")) {
        acuity = "Emergency";
        redFlags.push("Possible cardiac/respiratory arrest — activate emergency response immediately.");
    }
    if (text.includes("seizure") || text.includes("convulsion")) {
        acuity = "Emergency";
        redFlags.push("Active or recent seizure — airway, breathing, circulation first.");
    }
    if (text.includes("severe bleeding") || text.includes("haemorrhage")) {
        acuity = "Emergency";
        redFlags.push("Significant haemorrhage — obtain IV access, cross-match blood.");
    }
    if (spo2 > 0 && spo2 < 90) {
        acuity = "Emergency";
        redFlags.push(`Critical hypoxia: SpO2 ${spo2}%. Immediate airway/breathing assessment.`);
    }
    if (systolic > 0 && systolic <= 90) {
        acuity = "Emergency";
        redFlags.push(`Hypotension: BP ${vitals.bp}. Assess for shock.`);
    }
    if (systolic >= 180 || diastolic >= 120) {
        acuity = "Emergency";
        redFlags.push("Hypertensive emergency. Assess end-organ damage immediately.");
    }
    // Urgent triggers
    if (acuity !== "Emergency") {
        if (temp >= 39.5 || temp >= 38 && age < 5) acuity = "Urgent";
        if (pulse > 120 || pulse < 50) acuity = "Urgent";
        if (rr > 25) acuity = "Urgent";
        if ((systolic >= 160 || diastolic >= 100) && acuity !== "Emergency") acuity = "Urgent";
    }
    // Differential Diagnosis
    if (text.includes("fever") || temp >= 38) {
        if (age < 15 || text.includes("child")) {
            differentials.push({
                rank: 1,
                diagnosis: "Malaria (Plasmodium falciparum)",
                confidence: "High",
                reasoning: "Fever in under-15 in endemic area — malaria is the primary diagnosis until ruled out."
            });
            differentials.push({
                rank: 2,
                diagnosis: "Bacterial sepsis",
                confidence: "Medium",
                reasoning: "High fever with tachycardia warrants sepsis workup if malaria negative."
            });
            differentials.push({
                rank: 3,
                diagnosis: "Typhoid fever",
                confidence: "Low-Medium",
                reasoning: "Stepladder fever pattern, abdominal symptoms — consider if malaria RDT negative."
            });
            suggestedOrders.push("Malaria RDT / thick and thin blood film", "FBC with differential", "Blood culture if febrile >3 days");
        } else {
            differentials.push({
                rank: 1,
                diagnosis: "Malaria",
                confidence: "High",
                reasoning: "Fever in malaria-endemic region requires RDT confirmation first."
            });
            differentials.push({
                rank: 2,
                diagnosis: "Urinary tract infection",
                confidence: "Medium",
                reasoning: "Especially in women — check urinalysis."
            });
            differentials.push({
                rank: 3,
                diagnosis: "Typhoid / enteric fever",
                confidence: "Medium",
                reasoning: "Prolonged fever with GI symptoms."
            });
            suggestedOrders.push("Malaria RDT", "Urinalysis + culture", "FBC + ESR");
        }
    }
    if ((systolic >= 140 || diastolic >= 90) && !text.includes("pregnan")) {
        differentials.push({
            rank: differentials.length + 1,
            diagnosis: "Hypertension (essential or secondary)",
            confidence: "High",
            reasoning: "Elevated BP on presentation. Repeat after rest. Screen for end-organ damage."
        });
        suggestedOrders.push("Repeat BP x2", "Renal function + electrolytes", "Urinalysis for protein", "ECG if available");
    }
    if (text.includes("pregnan") && (systolic >= 140 || diastolic >= 90)) {
        differentials.push({
            rank: 1,
            diagnosis: "Pre-eclampsia / eclampsia",
            confidence: "High",
            reasoning: "Pregnancy + hypertension after 20 weeks — rule out pre-eclampsia urgently."
        });
        suggestedOrders.push("Urine protein (dipstick)", "FBC + platelets", "LFT + creatinine", "CTG/fetal monitoring if available");
        if (acuity === "Routine") acuity = "Urgent";
    }
    if (text.includes("chest pain")) {
        differentials.push({
            rank: 1,
            diagnosis: "Acute Coronary Syndrome (ACS)",
            confidence: "Medium-High",
            reasoning: "Chest pain — exclude myocardial infarction or unstable angina."
        });
        differentials.push({
            rank: 2,
            diagnosis: "Pulmonary embolism",
            confidence: "Low-Medium",
            reasoning: "Pleuritic chest pain, dyspnoea, risk factors."
        });
        differentials.push({
            rank: 3,
            diagnosis: "Musculoskeletal chest pain",
            confidence: "Medium",
            reasoning: "Reproducible on palpation."
        });
        suggestedOrders.push("ECG", "Troponin if available", "Chest X-ray", "D-dimer if PE suspected");
        if (acuity === "Routine") acuity = "Urgent";
    }
    if (text.includes("cough") || text.includes("shortness of breath") || text.includes("dyspnoea")) {
        differentials.push({
            rank: differentials.length + 1,
            diagnosis: "Pneumonia",
            confidence: "Medium",
            reasoning: "Cough + fever + RR elevation — community-acquired pneumonia."
        });
        differentials.push({
            rank: differentials.length + 1,
            diagnosis: "Pulmonary TB",
            confidence: "Medium",
            reasoning: "Chronic cough >2 weeks in endemic area — screen for TB."
        });
        suggestedOrders.push("Chest X-ray", "SpO2 monitoring", "Sputum GeneXpert/ZN stain if TB suspected", "FBC");
    }
    if (text.includes("diarrhoea") || text.includes("vomiting") || text.includes("gastro")) {
        differentials.push({
            rank: differentials.length + 1,
            diagnosis: "Acute gastroenteritis",
            confidence: "High",
            reasoning: "GI symptoms — assess dehydration status urgently, especially under-5."
        });
        differentials.push({
            rank: differentials.length + 1,
            diagnosis: "Cholera",
            confidence: "Low-Medium",
            reasoning: "Rice-water stools in epidemic context."
        });
        suggestedOrders.push("Assess dehydration (skin turgor, eyes, CRT)", "Stool microscopy/culture", "Electrolytes if severe dehydration", "ORS initiation");
    }
    if (text.includes("diabetes") || conditions.includes("diabetes") || text.includes("hyperglycaemia")) {
        differentials.push({
            rank: differentials.length + 1,
            diagnosis: "Diabetic ketoacidosis (DKA) / HONK",
            confidence: "Medium",
            reasoning: "Known diabetic with altered state or vomiting — check blood glucose urgently."
        });
        suggestedOrders.push("Random blood glucose (urgent)", "Urine ketones", "Electrolytes + bicarbonate", "Blood gas if available");
    }
    if (differentials.length === 0) differentials.push({
        rank: 1,
        diagnosis: "Undifferentiated — further assessment needed",
        confidence: "Low",
        reasoning: "Insufficient data for differential. Please add more symptoms, vitals, and history."
    });
    return {
        disclaimer: "Decision support only. Final clinical judgement must be made by a licensed clinician.",
        acuity,
        redFlags,
        differentials: differentials.slice(0, 5),
        suggestedOrders: [
            ...new Set(suggestedOrders)
        ]
    };
}
// 5. Early Warning Score Calculator (qSOFA + SIRS)
function calculateEWS(vitals, gcs) {
    const { systolic, diastolic } = parseBp(vitals.bp);
    const temp = Number(vitals.temperature);
    const rr = Number(vitals.respiration);
    const pulse = Number(vitals.pulse);
    const gcScore = Number(gcs || vitals.gcs || 15);
    // qSOFA (0-3)
    let qsofa = 0;
    const qsofaCriteria = [];
    if (rr >= 22) {
        qsofa++;
        qsofaCriteria.push(`RR ≥22 (${rr} breaths/min)`);
    }
    if (systolic > 0 && systolic <= 100) {
        qsofa++;
        qsofaCriteria.push(`SBP ≤100 (${systolic} mmHg)`);
    }
    if (gcScore < 15) {
        qsofa++;
        qsofaCriteria.push(`GCS <15 (${gcScore})`);
    }
    // SIRS (0-4)
    let sirs = 0;
    const sirsCriteria = [];
    if (temp > 38 || temp < 36) {
        sirs++;
        sirsCriteria.push(`Temp >38 or <36 (${temp}°C)`);
    }
    if (pulse > 90) {
        sirs++;
        sirsCriteria.push(`HR >90 (${pulse} bpm)`);
    }
    if (rr > 20) {
        sirs++;
        sirsCriteria.push(`RR >20 (${rr} breaths/min)`);
    }
    let qsofaRisk = "Low";
    let sirsRisk = "Low";
    if (qsofa >= 2) qsofaRisk = "High";
    else if (qsofa === 1) qsofaRisk = "Moderate";
    if (sirs >= 2) sirsRisk = "SIRS Criteria Met";
    const overallRisk = qsofa >= 2 || sirs >= 3 ? "HIGH — Sepsis Alert" : qsofa === 1 || sirs === 2 ? "MODERATE — Monitor Closely" : "LOW";
    return {
        disclaimer: "EWS is a screening tool only. Clinical assessment and senior review are mandatory.",
        qsofa: {
            score: qsofa,
            risk: qsofaRisk,
            criteria: qsofaCriteria
        },
        sirs: {
            score: sirs,
            risk: sirsRisk,
            criteria: sirsCriteria
        },
        overallRisk,
        recommendation: qsofa >= 2 ? "⚠️ HIGH SEPSIS RISK: Initiate sepsis bundle — blood cultures, IV access, fluids, antibiotics within 1hr. Escalate immediately." : sirs >= 2 ? "⚡ SIRS criteria met — possible systemic inflammation/early infection. Investigate cause urgently." : "✅ Low EWS — continue monitoring. Reassess if condition changes."
    };
}
// 6. 30-Day Readmission Risk (LACE-adapted)
function calculateReadmissionRisk(payload) {
    const { age, diagnosis, insurance, admissionDuration, previousAdmissions = 0, comorbidities = [], lga } = payload;
    let score = 0;
    const factors = [];
    const ruralLgas = [
        "Wase",
        "Shendam",
        "Mangu",
        "Barkin Ladi",
        "Qua'an Pan",
        "Mikang",
        "Bokkos"
    ];
    if (Number(age) >= 65) {
        score += 3;
        factors.push("Age ≥65 years (+3)");
    } else if (Number(age) >= 50) {
        score += 1;
        factors.push("Age 50-64 years (+1)");
    }
    if (Number(admissionDuration) >= 7) {
        score += 3;
        factors.push("Long hospital stay ≥7 days (+3)");
    } else if (Number(admissionDuration) >= 3) {
        score += 2;
        factors.push("Hospital stay 3-6 days (+2)");
    }
    if (Number(previousAdmissions) >= 3) {
        score += 4;
        factors.push("≥3 previous admissions in 6 months (+4)");
    } else if (Number(previousAdmissions) >= 1) {
        score += 2;
        factors.push("1-2 previous admissions (+2)");
    }
    if (insurance === "Private Pay") {
        score += 1;
        factors.push("No insurance / private pay (+1)");
    }
    if (comorbidities.length >= 3) {
        score += 3;
        factors.push("≥3 comorbidities (+3)");
    } else if (comorbidities.length >= 1) {
        score += 1;
        factors.push("1-2 comorbidities (+1)");
    }
    if (ruralLgas.includes(lga)) {
        score += 1;
        factors.push("Rural/remote location (+1)");
    }
    if (String(diagnosis || "").toLowerCase().includes("heart") || String(diagnosis || "").toLowerCase().includes("cardiac")) {
        score += 2;
        factors.push("Cardiac diagnosis (+2)");
    }
    if (String(diagnosis || "").toLowerCase().includes("sepsis")) {
        score += 2;
        factors.push("Sepsis diagnosis (+2)");
    }
    if (String(diagnosis || "").toLowerCase().includes("diabet")) {
        score += 1;
        factors.push("Diabetes (+1)");
    }
    let risk = "Low";
    let probability = "< 10%";
    let recommendations = [];
    if (score >= 10) {
        risk = "Very High";
        probability = "> 40%";
        recommendations = [
            "Arrange community health worker (CHW) follow-up within 3 days",
            "Schedule clinic appointment within 7 days",
            "Telephone follow-up call on day 3 and day 7",
            "Ensure full medication supply on discharge",
            "Activate family caregiver counselling"
        ];
    } else if (score >= 7) {
        risk = "High";
        probability = "25-40%";
        recommendations = [
            "Schedule clinic review within 14 days",
            "Telephone follow-up on day 7",
            "Medication counselling and supply",
            "CHW referral if available"
        ];
    } else if (score >= 4) {
        risk = "Moderate";
        probability = "10-25%";
        recommendations = [
            "Schedule routine follow-up within 4 weeks",
            "Discharge medication counselling",
            "Patient education on warning signs"
        ];
    } else {
        risk = "Low";
        probability = "< 10%";
        recommendations = [
            "Standard discharge instructions",
            "Return if symptoms worsen"
        ];
    }
    return {
        disclaimer: "Readmission risk is a decision-support tool. Clinical assessment takes precedence.",
        score,
        risk,
        probability,
        factors,
        recommendations
    };
}
// 7. Discharge Summary Generator
function generateDischargeSummary(payload) {
    const { patient, admission, encounter, prescriptions = [], labResults = [], clinicianName = "Attending Clinician" } = payload;
    const patientName = patient?.name || "Patient";
    const today = new Date().toLocaleDateString("en-GB");
    const admDate = admission?.admissionDate || encounter?.date || today;
    const diagnosis = encounter?.icd11Display || encounter?.assessment || admission?.admissionDiagnosis || "Unspecified";
    const labSummary = labResults.length > 0 ? labResults.map((lr)=>lr.tests?.map((t)=>`${t.name}: ${t.value} ${t.unit} (${t.interpretation})`).join(", ")).join("; ") : "No laboratory results on file.";
    const medsSummary = prescriptions.length > 0 ? prescriptions.map((p)=>`• ${p.drug} ${p.dose} — ${p.frequency} for ${p.duration}`).join("\n") : "No medications prescribed on discharge.";
    return {
        disclaimer: "System-generated discharge summary. Clinician must review, complete, and sign before issuing to patient.",
        summary: {
            header: `DISCHARGE SUMMARY — ${patientName.toUpperCase()}`,
            patientInfo: `Patient: ${patientName} | Age: ${patient?.age || "—"} | Sex: ${patient?.sex || "—"} | ID: ${patient?.id || "—"}`,
            dateOfAdmission: admDate,
            dateOfDischarge: today,
            ward: admission?.ward || "General Ward",
            admittingDiagnosis: admission?.admissionDiagnosis || diagnosis,
            finalDiagnosis: diagnosis,
            clinicalSummary: encounter?.assessment || "Patient was admitted, assessed, and managed as per clinical findings.",
            hospitalCourse: encounter?.plan || "Treatment was initiated based on clinical presentation. Patient responded to management.",
            investigationsPerformed: labSummary,
            medicationsOnDischarge: medsSummary,
            followUpInstructions: `Please return to clinic in 2 weeks or sooner if symptoms worsen. Next appointment at ${patient?.facilityId || "nearest clinic"}.`,
            warningSignsToReturn: "Return immediately for: chest pain, difficulty breathing, high fever >39°C, seizures, loss of consciousness, or any new concerning symptoms.",
            clinicianSignature: `${clinicianName} — ${today}`,
            footer: "This document was generated by Health Grid EHR. It must be reviewed and co-signed by the attending clinician."
        }
    };
}
// ─── Drug Interaction Checker ─────────────────────────────────
function checkDrugInteractions(drugs, patientAllergies = []) {
    const alerts = [];
    const drugList = drugs.map((d)=>String(d).toLowerCase());
    // Check interactions
    for (const [drug1, interactions] of Object.entries(DRUG_INTERACTIONS)){
        const hasDrug1 = drugList.some((d)=>d.includes(drug1));
        if (!hasDrug1) continue;
        for (const [drug2, interaction] of Object.entries(interactions)){
            const hasDrug2 = drugList.some((d)=>d.includes(drug2));
            if (hasDrug2) alerts.push({
                type: "Interaction",
                severity: interaction.severity,
                message: interaction.message
            });
        }
    }
    // Check allergies
    for (const allergy of patientAllergies){
        const mappedDrugs = ALLERGY_DRUG_MAP[allergy] || [];
        for (const mappedDrug of mappedDrugs){
            const prescribed = drugList.find((d)=>d.includes(mappedDrug));
            if (prescribed) alerts.push({
                type: "Allergy",
                severity: "Critical",
                message: `ALLERGY ALERT: Patient is allergic to ${allergy}. Prescribed drug "${prescribed}" may contain ${mappedDrug}. Do not administer without specialist review.`
            });
        }
    }
    return {
        drugsChecked: drugs,
        alertCount: alerts.length,
        alerts,
        safe: alerts.filter((a)=>a.severity === "Critical").length === 0
    };
}
// ─── Request Handler ─────────────────────────────────────────
async function handleApi(req, res, url) {
    const data = readData();
    if (!data.consultations) data.consultations = [];
    if (!data.billing) data.billing = [];
    if (!data.appointments) data.appointments = [];
    if (!data.labResults) data.labResults = [];
    if (!data.beds) data.beds = [];
    if (!data.admissions) data.admissions = [];
    if (!data.alertsLog) data.alertsLog = [];
    if (!data.dischargeSummaries) data.dischargeSummaries = [];
    if (req.method === "OPTIONS") {
        sendJson(res, 200, {
            ok: true
        });
        return;
    }
    // ── Summary
    if (req.method === "GET" && url.pathname === "/api/summary") {
        sendJson(res, 200, buildSummary(data));
        return;
    }
    // ── Analytics
    if (req.method === "GET" && url.pathname === "/api/analytics") {
        sendJson(res, 200, buildAnalytics(data));
        return;
    }
    // ── Facilities
    if (req.method === "GET" && url.pathname === "/api/facilities") {
        sendJson(res, 200, data.facilities);
        return;
    }
    // ── Patients
    if (req.method === "GET" && url.pathname === "/api/patients") {
        sendJson(res, 200, data.patients);
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/patients") {
        const body = await collectBody(req);
        const patient = {
            id: nextId("PT", data.patients),
            name: body.name || "Unnamed",
            sex: body.sex || "Unknown",
            age: Number(body.age || 0),
            dateOfBirth: body.dateOfBirth || "",
            bloodGroup: body.bloodGroup || "",
            phone: body.phone || "",
            address: body.address || "",
            occupation: body.occupation || "",
            lga: body.lga || "",
            community: body.community || "",
            facilityId: body.facilityId || "FAC-PLSH",
            insurance: body.insurance || "Private Pay",
            risk: body.risk || "Routine",
            allergies: String(body.allergies || "").split(",").map((s)=>s.trim()).filter(Boolean),
            nextOfKin: body.nextOfKin || "",
            nextOfKinPhone: body.nextOfKinPhone || "",
            lastVisit: new Date().toISOString().slice(0, 10)
        };
        data.patients.unshift(patient);
        writeData(data);
        sendJson(res, 201, patient);
        return;
    }
    // ── Patient Timeline
    if (req.method === "GET" && url.pathname.startsWith("/api/patients/") && url.pathname.endsWith("/timeline")) {
        const patientId = url.pathname.split("/")[3];
        const patient = data.patients.find((p)=>p.id === patientId);
        if (!patient) {
            sendJson(res, 404, {
                error: "Patient not found"
            });
            return;
        }
        const timeline = {
            patient,
            encounters: data.encounters.filter((e)=>e.patientId === patientId),
            appointments: (data.appointments || []).filter((a)=>a.patientId === patientId),
            labResults: (data.labResults || []).filter((l)=>l.patientId === patientId),
            orders: data.orders.filter((o)=>o.patientId === patientId),
            billing: (data.billing || []).filter((b)=>b.patientId === patientId),
            admissions: (data.admissions || []).filter((a)=>a.patientId === patientId),
            consultations: (data.consultations || []).filter((c)=>c.patientId === patientId)
        };
        sendJson(res, 200, timeline);
        return;
    }
    // ── Encounters
    if (req.method === "GET" && url.pathname === "/api/encounters") {
        sendJson(res, 200, data.encounters);
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/encounters") {
        const body = await collectBody(req);
        const encounter = {
            id: nextId("ENC", data.encounters),
            patientId: body.patientId,
            facilityId: body.facilityId,
            unit: body.unit || "OPD",
            date: new Date().toISOString().slice(0, 10),
            doctorId: body.doctorId || "",
            duration: Number(body.duration || 0),
            chiefComplaint: body.chiefComplaint || "",
            vitals: body.vitals || {},
            assessment: body.assessment || "",
            plan: body.plan || "",
            status: body.status || "Open",
            icd11Code: body.icd11Code || "",
            icd11Display: body.icd11Display || "",
            labResultIds: [],
            earlyWarningScore: body.earlyWarningScore || null,
            readmissionRisk: body.readmissionRisk || null,
            dischargeNote: ""
        };
        data.encounters.unshift(encounter);
        const serviceType = unitToServiceMap[encounter.unit] || "Outpatient";
        createAutoBill(data, encounter.patientId, serviceType, `${encounter.unit} encounter: ${encounter.chiefComplaint || "Clinical services"}`);
        writeData(data);
        sendJson(res, 201, encounter);
        return;
    }
    // ── Orders
    if (req.method === "GET" && url.pathname === "/api/orders") {
        sendJson(res, 200, data.orders);
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/orders") {
        const body = await collectBody(req);
        const order = {
            id: nextId("ORD", data.orders),
            patientId: body.patientId,
            type: body.type || "Laboratory",
            item: body.item || "Unspecified",
            priority: body.priority || "Routine",
            status: "Pending",
            facilityId: body.facilityId || "FAC-PLSH",
            orderedBy: body.orderedBy || "",
            date: new Date().toISOString().slice(0, 10)
        };
        data.orders.unshift(order);
        writeData(data);
        sendJson(res, 201, order);
        return;
    }
    // ── Appointments
    if (req.method === "GET" && url.pathname === "/api/appointments") {
        sendJson(res, 200, data.appointments);
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/appointments") {
        const body = await collectBody(req);
        const apt = {
            id: nextId("APT", data.appointments),
            patientId: body.patientId,
            facilityId: body.facilityId,
            department: body.department || "OPD",
            doctor: body.doctor || "",
            date: body.date,
            time: body.time || "08:00",
            reason: body.reason || "",
            status: "Scheduled",
            notes: body.notes || ""
        };
        data.appointments.unshift(apt);
        createAutoBill(data, body.patientId, "Appointment", `Appointment: ${apt.department} — ${apt.date}`);
        writeData(data);
        sendJson(res, 201, apt);
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/appointments/status") {
        const body = await collectBody(req);
        const apt = data.appointments.find((a)=>a.id === body.id);
        if (apt) {
            apt.status = body.status;
            writeData(data);
            sendJson(res, 200, apt);
        } else sendJson(res, 404, {
            error: "Appointment not found"
        });
        return;
    }
    // ── Lab Results
    if (req.method === "GET" && url.pathname === "/api/labresults") {
        sendJson(res, 200, data.labResults);
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/labresults") {
        const body = await collectBody(req);
        const hasCritical = (body.tests || []).some((t)=>t.interpretation === "Critical");
        const lr = {
            id: nextId("LAB", data.labResults),
            patientId: body.patientId,
            orderId: body.orderId || "",
            facilityId: body.facilityId,
            date: new Date().toISOString().slice(0, 10),
            tests: body.tests || [],
            technician: body.technician || "",
            notes: body.notes || "",
            criticalFlag: hasCritical
        };
        data.labResults.unshift(lr);
        if (body.orderId) {
            const order = data.orders.find((o)=>o.id === body.orderId);
            if (order) order.status = "Resulted";
        }
        writeData(data);
        sendJson(res, 201, lr);
        return;
    }
    // ── Beds
    if (req.method === "GET" && url.pathname === "/api/beds") {
        sendJson(res, 200, data.beds);
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/beds/admit") {
        const body = await collectBody(req);
        const bed = data.beds.find((b)=>b.id === body.bedId);
        if (!bed) {
            sendJson(res, 404, {
                error: "Bed not found"
            });
            return;
        }
        if (bed.status === "Occupied") {
            sendJson(res, 400, {
                error: "Bed is already occupied"
            });
            return;
        }
        const admission = {
            id: nextId("ADM", data.admissions),
            patientId: body.patientId,
            facilityId: bed.facilityId,
            bedId: bed.id,
            ward: bed.ward,
            admissionDate: new Date().toISOString().slice(0, 10),
            dischargeDate: null,
            admissionDiagnosis: body.diagnosis || "Unspecified",
            status: "Active",
            readmissionRisk: null,
            dischargedBy: null
        };
        bed.status = "Occupied";
        bed.patientId = body.patientId;
        bed.admissionId = admission.id;
        data.admissions.unshift(admission);
        createAutoBill(data, body.patientId, "Wards", `Ward admission: ${bed.ward}`);
        writeData(data);
        sendJson(res, 201, {
            bed,
            admission
        });
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/beds/discharge") {
        const body = await collectBody(req);
        const admission = data.admissions.find((a)=>a.id === body.admissionId);
        if (!admission) {
            sendJson(res, 404, {
                error: "Admission not found"
            });
            return;
        }
        const bed = data.beds.find((b)=>b.id === admission.bedId);
        admission.status = "Discharged";
        admission.dischargeDate = new Date().toISOString().slice(0, 10);
        admission.dischargedBy = body.dischargedBy || "System";
        if (bed) {
            bed.status = "Vacant";
            bed.patientId = null;
            bed.admissionId = null;
        }
        writeData(data);
        sendJson(res, 200, {
            admission,
            bed
        });
        return;
    }
    // ── Reports
    if (req.method === "GET" && url.pathname === "/api/reports") {
        sendJson(res, 200, {
            summary: buildSummary(data),
            inventory: data.inventory,
            surveillance: data.surveillance,
            facilities: data.facilities.map((f)=>({
                    id: f.id,
                    name: f.name,
                    lga: f.lga,
                    openEncounters: data.encounters.filter((e)=>e.facilityId === f.id && e.status !== "Closed").length,
                    orders: data.orders.filter((o)=>o.facilityId === f.id).length
                }))
        });
        return;
    }
    // ── Billing
    if (req.method === "GET" && url.pathname === "/api/billing") {
        sendJson(res, 200, data.billing);
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/billing") {
        const body = await collectBody(req);
        const bill = createAutoBill(data, body.patientId, body.service, body.description);
        writeData(data);
        sendJson(res, 201, bill);
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/billing/status") {
        const body = await collectBody(req);
        const bill = data.billing.find((b)=>b.id === body.id);
        if (bill) {
            bill.status = body.status;
            writeData(data);
            sendJson(res, 200, bill);
        } else sendJson(res, 404, {
            error: "Bill not found"
        });
        return;
    }
    // ── Consultations
    if (req.method === "GET" && url.pathname === "/api/consultations") {
        sendJson(res, 200, data.consultations);
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/consultations") {
        const body = await collectBody(req);
        const cns = {
            id: nextId("CNS", data.consultations),
            patientId: body.patientId,
            facilityId: body.facilityId,
            doctorName: body.doctorName || "Dr. Staff",
            specialty: body.specialty || "General Medicine",
            chiefComplaint: body.chiefComplaint || "",
            historyOfPresentingComplaint: body.historyOfPresentingComplaint || "",
            pastMedicalHistory: body.pastMedicalHistory || "",
            allergies: body.allergies || "",
            examinationFindings: body.examinationFindings || "",
            vitals: body.vitals || {},
            socialHistory: body.socialHistory || "",
            assessment: body.assessment || "",
            plan: body.plan || "",
            icd11Code: body.icd11Code || "",
            icd11Display: body.icd11Display || "",
            prescriptions: body.prescriptions || [],
            date: new Date().toISOString().slice(0, 10)
        };
        data.consultations.unshift(cns);
        createAutoBill(data, body.patientId, "Consultation", `Doctor Consultation (${cns.specialty})`);
        writeData(data);
        sendJson(res, 201, cns);
        return;
    }
    // ── ICD-11
    if (req.method === "GET" && url.pathname === "/api/icd11/search") {
        sendJson(res, 200, searchIcd11(url.searchParams.get("q") || ""));
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/icd11/validate") {
        const body = await collectBody(req);
        sendJson(res, 200, validateIcd11Cluster(body.expression));
        return;
    }
    if (req.method === "GET" && url.pathname === "/api/icd11/suggest") {
        sendJson(res, 200, {
            suggestion: suggestIcd11FromSymptoms(url.searchParams.get("symptoms") || "")
        });
        return;
    }
    // ── FHIR
    if (req.method === "GET" && url.pathname.startsWith("/api/fhir/Condition/")) {
        const id = url.pathname.split("/").pop();
        const enc = data.encounters.find((e)=>e.id === id);
        if (!enc) {
            sendJson(res, 404, {
                error: "Encounter not found"
            });
            return;
        }
        const patient = data.patients.find((p)=>p.id === enc.patientId);
        const stemCode = enc.icd11Code ? enc.icd11Code.split("&")[0] : "";
        const stemTitle = enc.icd11Display ? enc.icd11Display.split(",")[0] : "Unspecified Diagnosis";
        sendJson(res, 200, {
            resourceType: "Condition",
            id: enc.id,
            clinicalStatus: {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                        code: enc.status === "Closed" ? "resolved" : "active"
                    }
                ]
            },
            verificationStatus: {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                        code: "confirmed"
                    }
                ]
            },
            subject: {
                reference: `Patient/${enc.patientId}`,
                display: patient?.name || "Unknown"
            },
            recordedDate: enc.date,
            code: {
                coding: [
                    {
                        system: "http://id.who.int/icd/release/11/mms",
                        code: stemCode || "Unspecified",
                        display: stemTitle
                    }
                ],
                text: enc.icd11Display || enc.assessment || "Unspecified"
            }
        });
        return;
    }
    // ── Clinical Endpoints
    if (req.method === "POST" && url.pathname === "/api/support/scrub") {
        const body = await collectBody(req);
        sendJson(res, 200, scrubClinicalNote(body));
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/support/inquiry") {
        const body = await collectBody(req);
        sendJson(res, 200, answerClinicalInquiry(body.question));
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/support/autonote") {
        const body = await collectBody(req);
        sendJson(res, 200, generateAutoNote(body));
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/support/triage") {
        const body = await collectBody(req);
        sendJson(res, 200, triageSymptoms(body));
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/support/ews") {
        const body = await collectBody(req);
        sendJson(res, 200, calculateEWS(body.vitals || {}, body.gcs));
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/support/readmission-risk") {
        const body = await collectBody(req);
        sendJson(res, 200, calculateReadmissionRisk(body));
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/support/discharge-summary") {
        const body = await collectBody(req);
        const summary = generateDischargeSummary(body);
        data.dischargeSummaries.push({
            ...summary,
            createdAt: new Date().toISOString()
        });
        writeData(data);
        sendJson(res, 200, summary);
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/alerts/drug-check") {
        const body = await collectBody(req);
        sendJson(res, 200, checkDrugInteractions(body.drugs || [], body.allergies || []));
        return;
    }
    // ── Generic Update Record Endpoint
    if (req.method === "POST" && url.pathname === "/api/update-record") {
        const body = await collectBody(req);
        const { collection, id, fields } = body;
        if (!data[collection]) {
            sendJson(res, 400, {
                error: "Invalid collection"
            });
            return;
        }
        const record = data[collection].find((x)=>x.id === id);
        if (record) {
            Object.assign(record, fields);
            writeData(data);
            sendJson(res, 200, record);
        } else {
            sendJson(res, 404, {
                error: "Record not found"
            });
        }
        return;
    }
    sendJson(res, 404, {
        error: "API route not found"
    });
}
// ─── Static File Server ───────────────────────────────────────
function serveStatic(req, res, url) {
    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    const safePath = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[\\/])+/, "");
    const filePath = path.join(PUBLIC_DIR, safePath);
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }
    fs.readFile(filePath, (err, content)=>{
        if (err) {
            res.writeHead(404, {
                "Content-Type": "text/plain"
            });
            res.end("Not found");
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            "Content-Type": mimeTypes[ext] || "application/octet-stream"
        });
        res.end(content);
    });
}
// ─── Patient Auth API ────────────────────────────────────────
async function handlePatientApi(req, res, url) {
    const data = readData();
    // POST /api/patient/register  { name, phone, age, sex, lga, community }
    if (req.method === "POST" && url.pathname === "/api/patient/register") {
        const body = await collectBody(req);
        const phone = (body.phone || "").trim();
        if (!phone) {
            sendJson(res, 400, {
                ok: false,
                error: "Phone number is required"
            });
            return;
        }
        const patient = {
            id: nextId("PT", data.patients),
            name: body.name || "Unnamed",
            sex: body.sex || "Unknown",
            age: Number(body.age || 0),
            phone: phone,
            lga: body.lga || "",
            community: body.community || "",
            facilityId: body.facilityId || "FAC-PLSH",
            insurance: body.insurance || "Private Pay",
            risk: "Routine",
            dateOfBirth: "",
            bloodGroup: "",
            address: "",
            occupation: "",
            allergies: [],
            nextOfKin: "",
            nextOfKinPhone: "",
            lastVisit: new Date().toISOString().slice(0, 10)
        };
        data.patients.unshift(patient);
        writeData(data);
        // Return empty arrays for a new patient
        sendJson(res, 201, {
            ok: true,
            patient,
            consultations: [],
            appointments: [],
            labResults: [],
            billing: []
        });
        return;
    }
    // POST /api/patient/login  { phone, patientId }
    if (req.method === "POST" && url.pathname === "/api/patient/login") {
        const body = await collectBody(req);
        const phone = (body.phone || "").trim();
        const patientId = (body.patientId || "").trim().toUpperCase();
        const patient = data.patients.find((p)=>p.phone && p.phone.trim() === phone && p.id && p.id.toUpperCase() === patientId);
        if (!patient) {
            sendJson(res, 401, {
                ok: false,
                error: "Invalid phone number or Patient ID."
            });
            return;
        }
        // Return patient + their records
        const consultations = (data.consultations || []).filter((c)=>c.patientId === patient.id);
        const appointments = (data.appointments || []).filter((a)=>a.patientId === patient.id);
        const labResults = (data.labResults || []).filter((l)=>l.patientId === patient.id);
        const billing = (data.billing || []).filter((b)=>b.patientId === patient.id);
        sendJson(res, 200, {
            ok: true,
            patient,
            consultations,
            appointments,
            labResults,
            billing
        });
        return;
    }
    // GET /api/patient/dashboard/:patientId?phone=xxx
    if (req.method === "GET" && url.pathname.startsWith("/api/patient/dashboard/")) {
        const patientId = url.pathname.split("/")[4] || "";
        const phone = (url.searchParams.get("phone") || "").trim();
        const patient = data.patients.find((p)=>p.id && p.id.toUpperCase() === patientId.toUpperCase() && p.phone && p.phone.trim() === phone);
        if (!patient) {
            sendJson(res, 401, {
                error: "Unauthorized"
            });
            return;
        }
        const consultations = (data.consultations || []).filter((c)=>c.patientId === patient.id);
        const appointments = (data.appointments || []).filter((a)=>a.patientId === patient.id);
        const labResults = (data.labResults || []).filter((l)=>l.patientId === patient.id);
        const billing = (data.billing || []).filter((b)=>b.patientId === patient.id);
        sendJson(res, 200, {
            patient,
            consultations,
            appointments,
            labResults,
            billing
        });
        return;
    }
    sendJson(res, 404, {
        error: "Not found"
    });
}
// ─── Main Server ──────────────────────────────────────────────
// PUBLIC paths that need no admin auth:
//   /                   → homepage
//   /index.html         → homepage
//   /portal.html        → patient portal
//   /portal.js          → patient portal script (if any)
//   /api/patient/*      → patient auth endpoints
const PUBLIC_PATHS = [
    "/",
    "/index.html",
    "/portal.html"
];
const PUBLIC_API = "/api/patient/";
const server = http.createServer(async (req, res)=>{
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    try {
        // ── 1. Public static pages (no auth needed) ──────────
        if (!pathname.startsWith("/api/") && (pathname === "/" || pathname === "/index.html" || pathname === "/portal.html")) {
            serveStatic(req, res, url);
            return;
        }
        // ── 2. Patient API (no admin auth needed) ─────────────
        if (pathname.startsWith(PUBLIC_API)) {
            await handlePatientApi(req, res, url);
            return;
        }
        // ── 3. All other routes require admin auth ─────────────
        const b64 = (req.headers.authorization || "").split(" ")[1] || "";
        const decoded = Buffer.from(b64, "base64").toString();
        const colonIdx = decoded.indexOf(":");
        const login = decoded.slice(0, colonIdx);
        const password = decoded.slice(colonIdx + 1);
        if (login !== (process.env.APP_USER || "guyestguy") || password !== (process.env.APP_PASS || "guyestguygithub001")) {
            res.statusCode = 401;
            res.setHeader("WWW-Authenticate", 'Basic realm="Health Grid EHR"');
            res.end("Access denied");
            return;
        }
        if (pathname.startsWith("/api/")) {
            await handleApi(req, res, url);
            return;
        }
        serveStatic(req, res, url);
    } catch (err) {
        sendJson(res, 500, {
            error: err.message
        });
    }
});
if (/*TURBOPACK member replacement*/ __turbopack_context__.t.main === module) {
    server.listen(PORT, ()=>{
        console.log(`Health Grid EHR running at http://localhost:${PORT}`);
    });
}
module.exports = server;
}),
"[project]/pages/api/[...catchall].js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>handler
]);
const server = __turbopack_context__.r("[project]/server/server.js [api] (ecmascript)");
function handler(req, res) {
    return new Promise((resolve)=>{
        server.emit("request", req, res);
        res.on("finish", resolve);
    });
}
const config = {
    api: {
        bodyParser: false
    }
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1hbxkmg._.js.map