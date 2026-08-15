// Deterministic Eligibility Rules Engine & Coverage-Gap Matching
// Layer 1 of AI Guardrails: Zero AI Decision-Making for Financial Calculations

export const AUTHORITATIVE_BENEFITS = [
  {
    id: 'benefit-doh-map-01',
    program_name: 'DOH Medical Assistance to Indigent Patients (MAP)',
    agency: 'Department of Health (DOH)',
    benefit_type: 'hospital_bill',
    covered_expenses: ['Inpatient hospital bill balance', 'Prescribed medicines', 'Diagnostic procedures', 'Implants'],
    amount_cap_summary: 'Up to 100% of remaining balance after PhilHealth/HMO (subject to MSWD classification)',
    required_documents: ['Clinical Abstract / Medical Certificate', 'Statement of Account / Hospital Bill', 'Certificate of Indigency / 4Ps ID', 'Valid Government ID'],
    where_to_apply: 'Malasakit Center Desk / DOH Regional Health Office',
    office_hours: 'Monday - Friday, 8:00 AM - 5:00 PM',
    processing_time: '1 - 3 business days (Immediate for urgent inpatient release)',
    can_stack: true,
    tier: 'tier_a',
    verification_status: 'verified',
    eligibility_conditions: [
      { field: 'facility_type', operator: 'equals', value: 'government', label: 'Government Hospital or DOH-Retained Specialty Center' },
      { field: 'indigent_4ps', operator: 'is_true', value: true, label: 'Indigent / Class C3/D or Active 4Ps Beneficiary' },
      { field: 'remaining_balance_min', operator: 'greater_than', value: 0, label: 'Has Remaining Out-of-Pocket Hospital Balance' }
    ]
  },
  {
    id: 'benefit-pcso-imap-02',
    program_name: 'PCSO Individual Medical Assistance Program (IMAP)',
    agency: 'Philippine Charity Sweepstakes Office (PCSO)',
    benefit_type: 'hospital_bill',
    covered_expenses: ['Confinement expenses', 'Chemotherapy drugs', 'Dialysis treatments', 'Surgical supplies'],
    amount_cap_summary: 'Guaranteed Letter (GL) from ₱10,000 up to ₱150,000 based on socio-economic evaluation',
    required_documents: ['Original Statement of Account (SOA)', 'Medical Abstract with Physician Signature & PRC License', 'Barangay Certificate of Indigency', 'Photocopy of Valid ID (Patient & Representative)'],
    where_to_apply: 'PCSO Branch Office / Hospital Malasakit Center Counter',
    office_hours: 'Monday - Friday, 7:00 AM - 3:00 PM',
    processing_time: 'Same day for complete documentary submissions',
    can_stack: true,
    tier: 'tier_a',
    verification_status: 'verified',
    eligibility_conditions: [
      { field: 'remaining_balance_min', operator: 'greater_than', value: 5000, label: 'Hospital Bill Exceeds ₱5,000 after PhilHealth Deduction' }
    ]
  },
  {
    id: 'benefit-dswd-aics-03',
    program_name: 'DSWD Assistance to Individuals in Crisis Situation (AICS)',
    agency: 'Department of Social Welfare and Development (DSWD)',
    benefit_type: 'medicines',
    covered_expenses: ['Direct financial grant for medicines', 'Assistive devices', 'Medical transport assistance', 'Burial support'],
    amount_cap_summary: 'Cash grant from ₱3,000 up to ₱10,000 per crisis incident (Renewable after 3 months)',
    required_documents: ['Doctor Prescription with Cost Estimate', 'Social Case Study Report / MSWD Intake Sheet', 'Barangay Indigency Certificate', 'Registered Voter ID or Valid National ID'],
    where_to_apply: 'DSWD Crisis Intervention Unit (CIU) / Malasakit Center Desk',
    office_hours: 'Monday - Friday, 8:00 AM - 4:00 PM',
    processing_time: '1 business day (Direct Cash / Guarantee Letter)',
    can_stack: true,
    tier: 'tier_a',
    verification_status: 'verified',
    eligibility_conditions: [
      { field: 'indigent_4ps', operator: 'is_true', value: true, label: 'Documented Individual/Family in Crisis Situation' }
    ]
  }
];

/**
 * Deterministically evaluate patient profile against assistance programs
 */
export function evaluatePatientAssistance(facts = {}) {
  const {
    grossBillAmount = 45200,
    philhealthCoverageAmount = 12500,
    hmoCoverageAmount = 20000,
    isIndigentOr4Ps = true,
    facilityType = 'government',
    isSeniorOrPwd = false,
  } = facts;

  const totalDeductions = philhealthCoverageAmount + hmoCoverageAmount;
  const netRemainingBalance = Math.max(0, grossBillAmount - totalDeductions);

  const evaluated = AUTHORITATIVE_BENEFITS.map((program) => {
    const traces = [];
    let isEligible = true;

    for (const cond of program.eligibility_conditions) {
      if (cond.field === 'facility_type') {
        const passed = facilityType === cond.value;
        traces.push({ label: cond.label, passed, current: facilityType, required: cond.value });
        if (!passed) isEligible = false;
      } else if (cond.field === 'indigent_4ps') {
        const passed = Boolean(isIndigentOr4Ps);
        traces.push({ label: cond.label, passed, current: isIndigentOr4Ps ? 'Yes' : 'No', required: 'Yes' });
        if (!passed) isEligible = false;
      } else if (cond.field === 'remaining_balance_min') {
        const passed = netRemainingBalance > cond.value;
        traces.push({ label: cond.label, passed, current: `₱${netRemainingBalance.toLocaleString()}`, required: `> ₱${cond.value}` });
        if (!passed) isEligible = false;
      }
    }

    return {
      program,
      isEligible,
      traces,
      netRemainingBalance,
    };
  });

  return {
    grossBillAmount,
    totalDeductions,
    netRemainingBalance,
    coveragePercent: grossBillAmount > 0 ? Math.round((totalDeductions / grossBillAmount) * 100) : 0,
    evaluatedPrograms: evaluated,
  };
}
