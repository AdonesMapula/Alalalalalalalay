// Hospital Dictionary & Medical Terms Reference for AI RAG Grounding

export const BILLING_TERMS = [
  {
    id: '1',
    category: 'Room Rates',
    term: 'Ward Room (Daily)',
    standardCost: 1500,
    philhealthCoverage: '100% (Case dependent)',
    description: 'Standard hospital ward room with shared facilities'
  },
  {
    id: '2',
    category: 'Consultation',
    term: 'ER Consult Fee',
    standardCost: 800,
    philhealthCoverage: '₱0.00',
    description: 'Emergency room consultation fee'
  },
  {
    id: '3',
    category: 'PhilHealth Case Rates',
    term: 'Dengue Fever (Case Rate)',
    standardCost: 0,
    philhealthCoverage: '₱10,000.00 max',
    description: 'PhilHealth coverage for dengue fever case'
  },
  {
    id: '4',
    category: 'Forms & Documents',
    term: 'CF1 (Claim Form 1)',
    standardCost: 0,
    philhealthCoverage: 'N/A',
    description: 'PhilHealth Member Claim Form containing member & employer certifications'
  },
  {
    id: '5',
    category: 'Assistance Programs',
    term: 'Malasakit Center Nav',
    standardCost: 0,
    philhealthCoverage: '100% for Indigents',
    description: 'One-stop shop inside government hospitals processing PhilHealth, PCSO, DOH, and DSWD assistance'
  }
];

export const LAB_REFERENCES = [
  {
    id: '1',
    biomarker: 'White Blood Cells (WBC)',
    laymanTerm: 'Infection Fighting Cells',
    maleRange: '4.5 - 11.0',
    femaleRange: '4.5 - 11.0',
    unit: 'x10^9/L',
    description: 'White blood cells are an essential part of the immune system that fight infections.',
    highDescription: 'Elevated WBC (Leukocytosis) is above standard baseline and may indicate inflammation or infection.',
    lowDescription: 'Low WBC (Leukopenia) indicates reduced immune defense.'
  },
  {
    id: '2',
    biomarker: 'Hemoglobin (HGB)',
    laymanTerm: 'Oxygen Carrying Protein',
    maleRange: '13.8 - 17.2',
    femaleRange: '12.1 - 15.1',
    unit: 'g/dL',
    description: 'Iron-rich protein in red blood cells that transports oxygen from lungs to body tissues.'
  },
  {
    id: '3',
    biomarker: 'Platelets (PLT)',
    laymanTerm: 'Blood Clotting Cells',
    maleRange: '150 - 400',
    femaleRange: '150 - 400',
    unit: 'x10^9/L',
    description: 'Specialized cells that clump together to help blood clot and prevent bleeding.'
  },
  {
    id: '4',
    biomarker: 'Fasting Blood Sugar (FBS)',
    laymanTerm: 'Blood Glucose',
    maleRange: '70 - 99',
    femaleRange: '70 - 99',
    unit: 'mg/dL',
    description: 'Measures blood sugar level after an overnight fast.'
  }
];

export const MEDICAL_TERMS = [
  {
    id: '1',
    term: 'Complete Blood Count (CBC)',
    laymanTerm: 'General Blood Test',
    category: 'Diagnostic',
    definition: 'A common blood test that evaluates overall health and detects a wide range of disorders including anemia and infection.'
  },
  {
    id: '2',
    term: 'Indigent Patient',
    laymanTerm: 'Financially Disadvantaged Citizen',
    category: 'Government Classification',
    definition: 'Patients classified by MSWD / DSWD as belonging to lower income deciles eligible for 100% subsidized healthcare assistance.'
  },
  {
    id: '3',
    term: 'No Balance Billing (NBB)',
    laymanTerm: 'Zero Out-of-Pocket Policy',
    category: 'PhilHealth Policy',
    definition: 'Government mandate stating indigent patients admitted to basic ward accommodations in government hospitals must pay zero balance.'
  }
];

export function getDictionaryContext() {
  let context = '\n\n## HOSPITAL & GOVERNMENT DICTIONARY REFERENCE\n';
  context += 'Use the following hospital-specific terminology and validated data:\n\n';

  context += '### BILLING TERMS:\n';
  BILLING_TERMS.forEach((term) => {
    context += `• ${term.term} (${term.category}): Standard Cost: ₱${term.standardCost}. PhilHealth: ${term.philhealthCoverage}. ${term.description || ''}\n`;
  });

  context += '\n### LAB REFERENCE RANGES (GROUND TRUTH):\n';
  LAB_REFERENCES.forEach((ref) => {
    context += `• ${ref.biomarker} (${ref.laymanTerm}): Normal ${ref.maleRange} ${ref.unit}. ${ref.description || ''}\n`;
  });

  context += '\n### MEDICAL & ASSISTANCE TERMS:\n';
  MEDICAL_TERMS.forEach((term) => {
    context += `• ${term.term} (${term.laymanTerm}): ${term.definition}\n`;
  });

  return context;
}

export function getLabReferenceContext() {
  let context = '\n\n## AUTHORITATIVE LABORATORY REFERENCE RANGES (GROUND TRUTH):\n';
  LAB_REFERENCES.forEach((ref) => {
    context += `• ${ref.biomarker} ("${ref.laymanTerm}"): Range ${ref.maleRange} ${ref.unit}. Note: ${ref.description || ''}\n`;
  });
  return context;
}
