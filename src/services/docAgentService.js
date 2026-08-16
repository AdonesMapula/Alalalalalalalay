/**
 * DocAgent - Autonomous Document Intelligence & Vault Eligibility Auditor
 * 
 * Capabilities:
 * 1. Autonomous OCR & Attribute Extraction (PhilSys CRN, PhilHealth PIN, SSS, TIN, Indigency, Expiration)
 * 2. Proactive Document Expiration & Renewal Monitoring
 * 3. Autonomous Renewal Packet & Request Form Generator
 * 4. Dynamic Civic Opportunity Gap-Filling & Readiness Optimization
 */

// Statutory Document Validity Periods (in Days)
export const STATUTORY_VALIDITY_DAYS = {
  'Barangay Certificate': 180, // 6 months (DILG Standard)
  'Barangay Indigency': 180, // 6 months
  'Barangay Clearance': 180, // 6 months
  'NBI Clearance': 365, // 1 year
  'Police Clearance': 180, // 6 months
  'Medical Certificate': 90, // 3 months
  'Clinical Abstract': 90, // 3 months
  'Certificate of Employment': 180, // 6 months
  'PhilHealth MDR': 365, // 1 year
  'School Registration / COR': 120, // 1 Semester (~4 months)
  'National ID / Gov ID': 3650, // 10 years / Lifetime (PhilSys)
  'Birth Certificate (PSA)': 36500, // Permanent / No expiration
  'PWD Identification Card': 1825, // 5 years (NCDA Standard)
};

// Document OCR Presets for instant realistic simulation
export const OCR_PRESET_TEMPLATES = {
  philsys: {
    type: 'National ID / Gov ID',
    name: 'PhilSys National ID (ePhilID)',
    issuer: 'Philippine Statistics Authority (PSA)',
    documentNumber: 'PH-CRN-9942-8810-7214',
    validityDays: 3650,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    attributes: {
      crn: 'PH-CRN-9942-8810-7214',
      fullName: 'Adones Mendoza Santos',
      birthDate: '1992-04-18',
      civilStatus: 'Married',
      citizenship: 'Filipino',
      address: 'Unit 402, Katipunan Ave, Quezon City, Metro Manila',
      bloodType: 'O+',
      securityHash: 'PSA-PHILSYS-SEC-8910-SHA256',
    },
    confidenceScore: 99.4,
    textClarity: 'Optimal (99%)',
  },
  indigency: {
    type: 'Barangay Certificate',
    name: 'Barangay Certificate of Indigency',
    issuer: 'Office of the Punong Barangay - Brgy. Loyola Heights, QC',
    documentNumber: 'BRGY-IND-2026-0841',
    validityDays: 180,
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&auto=format&fit=crop&q=80',
    attributes: {
      certificateNumber: 'BRGY-IND-2026-0841',
      barangay: 'Loyola Heights',
      city: 'Quezon City',
      purpose: 'Medical Assistance / DSWD AICS & Malasakit Center',
      issuedDate: new Date().toISOString().split('T')[0],
      statutoryBasis: 'Republic Act 11261 (First-Time Jobseekers) / Local Gov Code',
      signatory: 'Hon. Maria Elena Santos, Punong Barangay',
    },
    confidenceScore: 98.7,
    textClarity: 'High (98%)',
  },
  nbi: {
    type: 'NBI Clearance',
    name: 'NBI Clearance Multi-Purpose',
    issuer: 'National Bureau of Investigation (NBI)',
    documentNumber: 'NBI-CLEAR-8839-4410',
    validityDays: 365,
    thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&auto=format&fit=crop&q=80',
    attributes: {
      nbiId: 'NBI-CLEAR-8839-4410',
      statusRemarks: 'NO DEROGATORY RECORD / CLEAN',
      purpose: 'Multi-Purpose / Employment / Gov Loan',
      qrCodeVerified: true,
    },
    confidenceScore: 99.1,
    textClarity: 'Optimal (99%)',
  },
  medical: {
    type: 'Medical Certificate / Clinical Abstract',
    name: 'Clinical Abstract & Diagnosis Summary',
    issuer: 'Quezon City General Hospital - Department of Internal Medicine',
    documentNumber: 'QCGH-MED-9941',
    validityDays: 90,
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop&q=80',
    attributes: {
      hospital: 'Quezon City General Hospital',
      physician: 'Dr. Roberto G. Cruz, MD (PRC #0084920)',
      diagnosis: 'Acute Gastroenteritis / Dehydration - Resolved',
      philhealthClaimNo: 'PHIC-2026-MED-84910',
    },
    confidenceScore: 97.8,
    textClarity: 'Good (97%)',
  },
  psa_birth: {
    type: 'Birth Certificate (PSA)',
    name: 'PSA Certificate of Live Birth',
    issuer: 'Philippine Statistics Authority (PSA)',
    documentNumber: 'PSA-COLB-1992-0418-88',
    validityDays: 36500,
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&auto=format&fit=crop&q=80',
    attributes: {
      registryNumber: '92-0418-QC',
      motherMaidenName: 'Corazon Mendoza',
      fatherName: 'Manuel Santos',
      birthPlace: 'Quezon City, Metro Manila',
    },
    confidenceScore: 99.8,
    textClarity: 'Optimal (100%)',
  },
  senior_osca: {
    // Filed under the same 'National ID / Gov ID' type as PhilSys so it satisfies any
    // "valid government ID" requirement, not just senior-exclusive ones.
    type: 'National ID / Gov ID',
    name: 'OSCA Senior Citizen ID',
    issuer: 'Office for Senior Citizens Affairs (OSCA) - Quezon City',
    documentNumber: 'OSCA-QC-2026-05512',
    validityDays: 3650,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    attributes: {
      oscaId: 'OSCA-QC-2026-05512',
      fullName: 'Adones Mendoza Santos',
      birthDate: '1962-03-10',
      barangay: 'Loyola Heights',
      city: 'Quezon City',
      statutoryBasis: 'Republic Act No. 9994 (Expanded Senior Citizens Act) & RA 10645',
    },
    confidenceScore: 99.0,
    textClarity: 'Optimal (99%)',
  },
  pwd_id: {
    type: 'National ID / Gov ID',
    name: 'PWD Identification Card',
    issuer: 'National Council on Disability Affairs (NCDA) / City PDAO',
    documentNumber: 'PWD-QC-2026-11209',
    validityDays: 1825,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    attributes: {
      pwdId: 'PWD-QC-2026-11209',
      disabilityType: 'Orthopedic / Physical Disability',
      statutoryBasis: 'Republic Act No. 10754 (PWD Statutory Discounts & VAT Exemption)',
    },
    confidenceScore: 98.9,
    textClarity: 'High (98%)',
  },
  philhealth_mdr: {
    type: 'PhilHealth MDR',
    name: 'PhilHealth Member Data Record (MDR)',
    issuer: 'Philippine Health Insurance Corporation (PhilHealth)',
    documentNumber: 'PHIC-PIN-0219-8841-2207',
    validityDays: 365,
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop&q=80',
    attributes: {
      philhealthPin: 'PHIC-PIN-0219-8841-2207',
      memberStatus: 'Active / Contributing Member',
      dependents: 'Registered Senior Parent Dependent',
    },
    confidenceScore: 98.4,
    textClarity: 'High (98%)',
  },
  police_clearance: {
    type: 'Police Clearance',
    name: 'Philippine National Police Clearance',
    issuer: 'Philippine National Police (PNP) Clearance System',
    documentNumber: 'PNP-CLR-2026-77340',
    validityDays: 180,
    thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&auto=format&fit=crop&q=80',
    attributes: {
      pnpReferenceNo: 'PNP-CLR-2026-77340',
      statusRemarks: 'NO DEROGATORY RECORD / CLEAN',
      purpose: 'Local Employment / Barangay Requirement',
    },
    confidenceScore: 98.1,
    textClarity: 'Good (97%)',
  },
  coe: {
    type: 'Certificate of Employment (COE)',
    name: 'Certificate of Employment',
    issuer: 'Human Resources Department, Private Employer',
    documentNumber: 'COE-2026-40218',
    validityDays: 180,
    thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&auto=format&fit=crop&q=80',
    attributes: {
      position: 'Rank-and-File Employee',
      employmentStatus: 'Regular / Full-Time',
      dateHired: '2021-06-14',
    },
    confidenceScore: 97.5,
    textClarity: 'Good (97%)',
  },
  school_cor: {
    type: 'School Registration / Transcript',
    name: 'Certificate of Registration (COR)',
    issuer: 'Office of the University Registrar',
    documentNumber: 'COR-AY2026-2027-08841',
    validityDays: 120,
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&auto=format&fit=crop&q=80',
    attributes: {
      schoolYear: 'AY 2026-2027, 1st Semester',
      yearLevel: '2nd Year',
      enrollmentStatus: 'Officially Enrolled',
    },
    confidenceScore: 97.9,
    textClarity: 'Good (97%)',
  },
  csc_pds: {
    // Government job applications (Personal Data Sheet, CSC Form 212), distinct from
    // private-sector Certificate of Employment.
    type: 'Certificate of Employment (COE)',
    name: 'Personal Data Sheet (CSC Form 212)',
    issuer: 'Civil Service Commission (CSC)',
    documentNumber: 'CSC-PDS-2026-33017',
    validityDays: 180,
    thumbnail: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&auto=format&fit=crop&q=80',
    attributes: {
      formVersion: 'CS Form No. 212 (Revised 2017)',
      applicantStatus: 'Duly Accomplished & Signed',
      purpose: 'Government Employment Application',
    },
    confidenceScore: 98.0,
    textClarity: 'Good (97%)',
  },
  csc_eligibility: {
    type: 'Certificate of Employment (COE)',
    name: 'CSC Civil Service Eligibility Certificate',
    issuer: 'Civil Service Commission (CSC)',
    documentNumber: 'CSC-ELIG-2026-90142',
    validityDays: 36500,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    attributes: {
      eligibilityLevel: 'Professional (Career Service)',
      examDate: '2024-10-06',
      rating: '82.40%',
    },
    confidenceScore: 98.6,
    textClarity: 'Optimal (99%)',
  },
};

/**
 * 1. Autonomous Document Parser & Attribute Extractor (DocAgent OCR Engine)
 */
export async function scanAndExtractDocumentMetadata(fileOrName, customFields = {}) {
  // Simulate OCR latency for realistic agentic scanning experience
  await new Promise((resolve) => setTimeout(resolve, 650));

  const fileName = typeof fileOrName === 'string' ? fileOrName : fileOrName?.name || 'Government Document';
  const lower = fileName.toLowerCase();

  let template = OCR_PRESET_TEMPLATES.philsys;

  // Ordered most-specific-first so overlapping words (e.g. both NBI and Police clearances
  // contain "clearance") resolve to the right template instead of always matching NBI.
  if (lower.includes('police') || lower.includes('pnp')) {
    template = OCR_PRESET_TEMPLATES.police_clearance;
  } else if (lower.includes('nbi')) {
    template = OCR_PRESET_TEMPLATES.nbi;
  } else if (lower.includes('pwd') || lower.includes('disab')) {
    template = OCR_PRESET_TEMPLATES.pwd_id;
  } else if (lower.includes('senior') || lower.includes('osca')) {
    template = OCR_PRESET_TEMPLATES.senior_osca;
  } else if (lower.includes('philhealth') || lower.includes('mdr') || lower.includes('pmrf')) {
    template = OCR_PRESET_TEMPLATES.philhealth_mdr;
  } else if (lower.includes('indigen') || lower.includes('barangay') || lower.includes('residency')) {
    template = OCR_PRESET_TEMPLATES.indigency;
  } else if (lower.includes('medical') || lower.includes('abstract') || lower.includes('doctor') || lower.includes('hospital') || lower.includes('clinical')) {
    template = OCR_PRESET_TEMPLATES.medical;
  } else if (lower.includes('birth') || lower.includes('psa') || lower.includes('live birth')) {
    template = OCR_PRESET_TEMPLATES.psa_birth;
  } else if (lower.includes('personal data sheet') || lower.includes('pds') || lower.includes('form 212')) {
    template = OCR_PRESET_TEMPLATES.csc_pds;
  } else if (lower.includes('eligibility') || lower.includes('csc')) {
    template = OCR_PRESET_TEMPLATES.csc_eligibility;
  } else if (lower.includes('employment') || lower.includes('coe')) {
    template = OCR_PRESET_TEMPLATES.coe;
  } else if (lower.includes('school') || lower.includes('cor') || lower.includes('enrollment') || lower.includes('registration') || lower.includes('transcript') || lower.includes('matriculation')) {
    template = OCR_PRESET_TEMPLATES.school_cor;
  } else if (lower.includes('clearance')) {
    template = OCR_PRESET_TEMPLATES.nbi;
  }

  // Calculate Expiration Date
  const issuedDate = new Date();
  const validityDays = template.validityDays || 180;
  const expDateObj = new Date(issuedDate.getTime() + validityDays * 24 * 60 * 60 * 1000);
  const calculatedExpiration = expDateObj.toISOString().split('T')[0];

  return {
    name: customFields.name || template.name,
    type: customFields.type || template.type,
    issuer: customFields.issuer || template.issuer,
    documentNumber: customFields.documentNumber || template.documentNumber,
    expirationDate: customFields.expirationDate || calculatedExpiration,
    attributes: { ...template.attributes, ...(customFields.attributes || {}) },
    confidenceScore: template.confidenceScore,
    textClarity: template.textClarity,
    thumbnail: template.thumbnail,
    status: 'Valid',
    scannedAt: new Date().toISOString(),
  };
}

/**
 * 2. Proactive Expiration & Audit Evaluator
 */
export function auditVaultDocuments(documents = []) {
  const now = new Date();

  return documents.map((doc) => {
    if (!doc.expirationDate || doc.expirationDate === 'Lifetime' || doc.expirationDate === 'Permanent') {
      return {
        ...doc,
        auditStatus: 'Valid',
        daysUntilExpiration: 9999,
        isPermanent: true,
        urgencyLabel: 'Permanent / Lifetime Validity',
        urgencyColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    }

    const expDate = new Date(doc.expirationDate);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return {
        ...doc,
        auditStatus: 'Expired',
        daysUntilExpiration: diffDays,
        isExpired: true,
        urgencyLabel: `Expired (${Math.abs(diffDays)}d ago)`,
        urgencyColor: 'text-rose-700 bg-rose-50 border-rose-200',
      };
    }

    if (diffDays <= 30) {
      return {
        ...doc,
        auditStatus: 'Expiring Soon',
        daysUntilExpiration: diffDays,
        isExpiringSoon: true,
        urgencyLabel: `Expires in ${diffDays} days`,
        urgencyColor: 'text-amber-700 bg-amber-50 border-amber-200',
      };
    }

    return {
      ...doc,
      auditStatus: 'Valid',
      daysUntilExpiration: diffDays,
      isValid: true,
      urgencyLabel: `Valid (${diffDays}d left)`,
      urgencyColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  });
}

/**
 * 3. Autonomous Renewal Packet & Request Form Generator
 */
export function generateRenewalPacket(doc, user = {}) {
  const citizenName = `${user.firstName || 'Adones'} ${user.lastName || 'Santos'}`.trim();
  const address = user.address || 'Loyola Heights, Quezon City, Metro Manila';
  const currentDate = new Date().toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const docType = doc.type || 'Barangay Certificate';
  const isIndigency = doc.name?.toLowerCase().includes('indigen') || docType.toLowerCase().includes('indigen');
  const isNbi = doc.name?.toLowerCase().includes('nbi') || docType.toLowerCase().includes('nbi');

  let formalSubject = `Request for Re-issuance & Renewal of ${doc.name}`;
  let authorityTitle = 'Honorable Punong Barangay / Barangay Council';
  let legalBasis = 'Republic Act 11261 (First-Time Jobseekers Act) & DILG Memorandum Circular No. 2019-14';

  if (isNbi) {
    authorityTitle = 'The Director, National Bureau of Investigation (NBI)';
    legalBasis = 'NBI Electronic Clearance System & RA 11261 Priority Clearance Order';
  }

  const formalRequestLetter = `OFFICIAL REQUEST FOR DOCUMENT RENEWAL & RE-ISSUANCE

Date: ${currentDate}

TO:
${authorityTitle}
${doc.issuer || 'Local Government Office'}

FROM:
${citizenName}
Address: ${address}
Contact / Email: ${user.email || 'adones.santos@egov.ph'} | ${user.phone || '+63 917 842 1099'}
eGov PH Reference ID: ${user.egovId || 'PH-CRN-9942-8810-7214'}

SUBJECT: ${formalSubject}

Good day,

I am writing to formally request the renewal and re-issuance of my ${doc.name} (Previous Reference No: ${doc.documentNumber || 'N/A'}), which is expiring / scheduled for periodic update.

This document is required to maintain active compliance and eligibility for official Philippine Government Assistance Programs, including:
1. DSWD Crisis Intervention & Emergency Assistance (AICS)
2. Malasakit Center 100% Medical Zero-Balance Billing
3. Statutory Local Government Social Services & Employment Clearances

Pursuant to ${legalBasis}, I respectfully submit that all necessary prerequisites and valid identification credentials are ready and verified in my Alalay eGov Digital Vault.

Thank you for your prompt assistance and public service.

Respectfully yours,

____________________________________
${citizenName}
Verified Citizen Applicant`;

  return {
    documentId: doc.id,
    documentName: doc.name,
    authority: doc.issuer || authorityTitle,
    requestLetter: formalRequestLetter,
    feeNotice: '100% Free under RA 11261 for indigent assistance and first-time applicants.',
    turnaroundTime: isNbi ? '1-3 Working Days (Online NBI Quick Renewal)' : 'Same-day issuance (15-30 minutes at Barangay Hall)',
    checklist: [
      'Present 1 Valid Photo ID (PhilSys National ID / ePhilID preferred)',
      'Signed Copy of this Request Form',
      'Previous Document Reference / Number',
      'Proof of Residency (Barangay ID / Meralco / Water Bill)',
    ],
  };
}

/**
 * 4. Dynamic Civic Opportunity Gap-Filling & Readiness Optimization
 */
export function calculateOpportunityDocumentGaps(opportunities = [], auditedDocs = []) {
  const validDocNames = auditedDocs
    .filter((d) => d.auditStatus === 'Valid' || d.auditStatus === 'Expiring Soon')
    .map((d) => (d.name || '').toLowerCase());

  const gapAnalysis = opportunities.map((opp) => {
    const requirements = opp.requirements || [];
    let matchedCount = 0;
    const missingItems = [];

    requirements.forEach((req) => {
      const rName = (typeof req === 'string' ? req : req.name || '').toLowerCase();
      const isMet = validDocNames.some((vName) => {
        if (rName.includes('id') && (vName.includes('id') || vName.includes('philsys') || vName.includes('umid'))) return true;
        if (rName.includes('indigen') && (vName.includes('indigen') || vName.includes('barangay'))) return true;
        if (rName.includes('birth') && vName.includes('birth')) return true;
        if (rName.includes('nbi') && vName.includes('nbi')) return true;
        if (rName.includes('medical') && (vName.includes('medical') || vName.includes('abstract'))) return true;
        if (rName.includes('clearance') && (vName.includes('clearance') || vName.includes('police'))) return true;
        return false;
      });

      if (isMet) {
        matchedCount++;
      } else {
        missingItems.push(typeof req === 'string' ? req : req.name);
      }
    });

    const totalReqs = Math.max(requirements.length, 1);
    const readinessPercentage = Math.round((matchedCount / totalReqs) * 100);

    return {
      opportunityId: opp.id,
      title: opp.title,
      agency: opp.agency,
      category: opp.categoryName || opp.category,
      totalRequirements: totalReqs,
      matchedRequirementsCount: matchedCount,
      missingRequirements: missingItems,
      readinessPercentage,
      isFullyReady: missingItems.length === 0,
      isOneDocAway: missingItems.length === 1,
      sourceUrl: opp.officialSource?.url || 'https://www.gov.ph',
    };
  });

  // Sort by highest readiness percentage
  gapAnalysis.sort((a, b) => b.readinessPercentage - a.readinessPercentage);

  const oneDocAwayPrograms = gapAnalysis.filter((g) => g.isOneDocAway);
  const fullyReadyPrograms = gapAnalysis.filter((g) => g.isFullyReady);

  return {
    allGaps: gapAnalysis,
    oneDocAwayPrograms,
    fullyReadyPrograms,
    totalAuditedOpportunities: opportunities.length,
  };
}
