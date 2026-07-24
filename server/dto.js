// DTO (Data Transfer Object) filters for API responses
// Enforces strict removal of internal IDs, PII, and sensitive data.

function stripInternalIds(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => stripInternalIds(item));
    } else if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            // Drop internal sequential IDs and DB primary keys
            if (key === '_internalId' || key === 'dbPk') continue;
            cleaned[key] = stripInternalIds(value);
        }
        return cleaned;
    }
    return obj;
}

function sanitizePatientProfile(patient) {
    if (!patient) return null;
    return {
        id: patient.id, // Public UUID or masked ID
        name: patient.name,
        // Mask phone number (e.g., 08012345678 -> *******5678)
        phone: patient.phone ? '*'.repeat(patient.phone.length - 4) + patient.phone.slice(-4) : null,
        // Remove billing address completely from clinical views
        dob: patient.dob,
        gender: patient.gender
    };
}

function sanitizeBillingRecord(bill) {
    if (!bill) return null;
    return {
        id: bill.id,
        service: bill.service,
        totalAmount: bill.totalAmount,
        status: bill.status,
        date: bill.date
        // PII (patientName) might be needed for the dashboard, but stripped for external APIs
    };
}

module.exports = {
    stripInternalIds,
    sanitizePatientProfile,
    sanitizeBillingRecord
};
