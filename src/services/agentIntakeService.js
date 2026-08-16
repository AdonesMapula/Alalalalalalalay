/**
 * ALALAY Conversational Intake Agent Service
 *
 * The agent replaces government forms with a smart conversational interview.
 * It reads from the citizen's profile + document vault first, then only asks
 * for the fields it genuinely cannot fill on its own.
 *
 * Architecture:
 * - INTAKE_PROGRAMS: Program registry (cards shown in Phase 1)
 * - INTAKE_FORM_TEMPLATES: Full field definitions per program
 * - buildIntakeSession(): Initializes session, pre-fills from profile/docs
 * - getActiveGapFields(): Returns only the fields that must be asked
 * - extractFieldValue(): Extracts structured value from free-text reply
 * - processUserReply(): The main agentic loop step — fills a field, returns next question
 * - detectContradiction(): Cross-field consistency checker
 */

import { getApiKey } from './geminiService';

// =============================================================================
// PROGRAM REGISTRY (Phase 1 — Program Selector Cards)
// =============================================================================

export const INTAKE_PROGRAMS = [
  {
    id: 'sss-salary-loan',
    title: 'SSS Salary Loan',
    shortTitle: 'SSS Loan',
    agency: 'Social Security System',
    color: '#1d4ed8',
    gradient: 'from-blue-700 to-blue-500',
    icon: '💼',
    tagline: 'Borrow up to 2 months salary from your contributions',
    benefit: 'Up to ₱40,000+',
    officialUrl: 'https://www.sss.gov.ph',
    estimatedMinutes: 2,
    profileFieldsUsed: ['Full Name', 'Birthday', 'Address', 'Employment Status'],
    gapFieldsCount: 3,
  },
  {
    id: 'dswd-aics',
    title: 'DSWD Emergency Assistance',
    shortTitle: 'DSWD AICS',
    agency: 'Dept. of Social Welfare & Development',
    color: '#b45309',
    gradient: 'from-amber-700 to-orange-500',
    icon: '🤝',
    tagline: 'Emergency cash grant for indigent families in crisis',
    benefit: '₱3,000 – ₱10,000 cash grant',
    officialUrl: 'https://www.dswd.gov.ph',
    estimatedMinutes: 3,
    profileFieldsUsed: ['Full Name', 'Birthday', 'Address', 'Civil Status', 'Income'],
    gapFieldsCount: 3,
  },
  {
    id: 'philhealth-cf1',
    title: 'PhilHealth Hospital Claim',
    shortTitle: 'PhilHealth CF1',
    agency: 'Philippine Health Insurance Corp.',
    color: '#047857',
    gradient: 'from-emerald-700 to-green-500',
    icon: '🏥',
    tagline: 'Claim your PhilHealth benefits for hospital confinement',
    benefit: 'Covers hospitalization costs',
    officialUrl: 'https://www.philhealth.gov.ph',
    estimatedMinutes: 2,
    profileFieldsUsed: ['Full Name', 'Birthday', 'Address'],
    gapFieldsCount: 4,
  },
  {
    id: 'dole-tupad',
    title: 'DOLE TUPAD Employment',
    shortTitle: 'TUPAD',
    agency: 'Dept. of Labor & Employment',
    color: '#6d28d9',
    gradient: 'from-violet-700 to-purple-500',
    icon: '👷',
    tagline: '10–30 days emergency wage employment with community work',
    benefit: 'Daily minimum wage × days',
    officialUrl: 'https://dole.gov.ph',
    estimatedMinutes: 2,
    profileFieldsUsed: ['Full Name', 'Birthday', 'Address', 'Civil Status'],
    gapFieldsCount: 4,
  },
];

// =============================================================================
// FORM FIELD TEMPLATES — Full definitions per program
//
// source: 'profile'   → auto-fill from citizen profile
//         'documents' → try to pull from Document Locker
//         'ask'       → must ask in conversation
// =============================================================================

export const INTAKE_FORM_TEMPLATES = {

  'sss-salary-loan': {
    title: 'SSS Salary Loan Application (Form E-6)',
    agency: 'Social Security System (SSS)',
    fields: [
      {
        id: 'full_name',
        label: 'Full Name',
        type: 'text',
        source: 'profile',
        fallback: (u) =>
          `${u?.firstName || ''} ${u?.middleName ? u.middleName + ' ' : ''}${u?.lastName || ''}`.trim(),
      },
      {
        id: 'birth_date',
        label: 'Date of Birth',
        type: 'date',
        source: 'profile',
        fallback: (u) => u?.birthDate || u?.birth_date || '',
      },
      {
        id: 'address',
        label: 'Permanent Address',
        type: 'text',
        source: 'profile',
        fallback: (u) => u?.address || '',
      },
      {
        id: 'civil_status',
        label: 'Civil Status',
        type: 'text',
        source: 'profile',
        fallback: (u) => u?.civilStatus || u?.civil_status || 'Single',
      },
      {
        id: 'employment_status',
        label: 'Employment Status',
        type: 'text',
        source: 'profile',
        fallback: (u) => u?.employmentStatus || u?.employment_status || 'Employed',
      },
      {
        id: 'monthly_income',
        label: 'Monthly Salary / Income',
        type: 'text',
        source: 'profile',
        fallback: (u) => u?.monthlyIncome || u?.monthly_income || '',
      },
      {
        id: 'sss_number',
        label: 'SSS Number',
        type: 'text',
        source: 'ask',
        docKeywords: ['sss', 'umid', 'social security'],
        question:
          "What is your SSS number? You'll find it on your SSS card, UMID, or any SSS document.",
        followUp:
          "It's a 10-digit number in this format: ##-#######-# — like 03-1234567-8. Can you check your SSS card or payslip?",
        validationHint: 'Format: ##-#######-# (e.g. 03-1234567-8)',
        validator: (v) => v === 'N/A' || /\d{2}-?\d{7}-?\d/.test(v.replace(/\s/g, '')),
        invalidMessage:
          "That doesn't look like a valid SSS number. They follow the format ##-#######-# (10 digits with dashes). Can you double-check?",
      },
      {
        id: 'employer_name',
        label: 'Current Employer / Company Name',
        type: 'text',
        source: 'ask',
        question: 'What is the name of your current employer or company?',
        validationHint: 'Full company name as registered',
        validator: (v) => v && v.trim().length > 1,
        skipIf: (session) => {
          const emp = (session.filledFields['employment_status']?.value || '').toLowerCase();
          return emp.includes('self') || emp.includes('unemploy') || emp.includes('freelan');
        },
        skipValue: 'Self-Employed / Freelance',
      },
      {
        id: 'bank_account',
        label: 'Disbursement Account (Bank / E-wallet)',
        type: 'text',
        source: 'ask',
        question:
          'Where should SSS deposit the loan? Please share your bank name and account number, or your GCash / Maya number.',
        validationHint: 'e.g. BDO Savings – 1234567890  or  GCash – 09171234567',
        validator: (v) => v && v.trim().length > 5,
        invalidMessage:
          "I need either a bank account number or an e-wallet number to complete this field. For example: 'BDO – 1234567890' or 'GCash – 09171234567'.",
      },
    ],
    submissionGuide: [
      'Visit your nearest SSS branch, or log in to My.SSS at https://www.sss.gov.ph',
      'Submit this completed E-6 form together with your SSS ID or UMID',
      'SSS typically processes within 3–5 business days',
      'The loan amount will be credited directly to your nominated bank or e-wallet account',
    ],
  },

  'dswd-aics': {
    title: 'DSWD AICS Financial Assistance Request',
    agency: 'DSWD Crisis Intervention Unit / Malasakit Center',
    fields: [
      {
        id: 'full_name',
        label: 'Full Name',
        type: 'text',
        source: 'profile',
        fallback: (u) =>
          `${u?.firstName || ''} ${u?.middleName ? u.middleName + ' ' : ''}${u?.lastName || ''}`.trim(),
      },
      {
        id: 'birth_date',
        label: 'Date of Birth',
        type: 'date',
        source: 'profile',
        fallback: (u) => u?.birthDate || u?.birth_date || '',
      },
      {
        id: 'address',
        label: 'Home Address',
        type: 'text',
        source: 'profile',
        fallback: (u) => u?.address || '',
      },
      {
        id: 'civil_status',
        label: 'Civil Status',
        type: 'text',
        source: 'profile',
        fallback: (u) => u?.civilStatus || u?.civil_status || 'Single',
      },
      {
        id: 'monthly_income',
        label: 'Household Monthly Income',
        type: 'text',
        source: 'profile',
        fallback: (u) => u?.monthlyIncome || u?.monthly_income || '',
      },
      {
        id: 'is_pwd',
        label: 'Person with Disability (PWD)',
        type: 'text',
        source: 'profile',
        fallback: (u) => (u?.isPwd || u?.is_pwd ? 'Yes' : 'No'),
      },
      {
        id: 'is_senior',
        label: 'Senior Citizen (Age 60+)',
        type: 'text',
        source: 'profile',
        fallback: (u) => (u?.isSeniorCitizen || u?.is_senior_citizen ? 'Yes' : 'No'),
      },
      {
        id: 'household_size',
        label: 'Number of People in Household',
        type: 'number',
        source: 'ask',
        question:
          'How many people live in your household? Include yourself, your spouse, children, and any dependents you support.',
        validationHint: 'Just a number — e.g. 4 or 6',
        validator: (v) => !isNaN(parseInt(v)) && parseInt(v) >= 1 && parseInt(v) <= 20,
        invalidMessage:
          "Please enter the number of people in your household as a number — for example, type 4 or 5.",
      },
      {
        id: 'crisis_description',
        label: 'Reason for Assistance / Crisis Situation',
        type: 'textarea',
        source: 'ask',
        isComplex: true,
        question:
          'Briefly describe the emergency or crisis situation you need assistance for. (For example: hospitalization, loss of job, calamity, death of breadwinner, etc.)',
        validationHint: 'A sentence or two describing what happened',
        validator: (v) => v && v.trim().split(' ').length >= 3,
        invalidMessage:
          "Can you say a little more about your situation? Just a short sentence is enough — for example, 'My husband lost his job and we can't afford food.'",
      },
      {
        id: 'assistance_type',
        label: 'Type of Assistance Requested',
        type: 'select',
        source: 'ask',
        question:
          'What kind of assistance are you requesting?\n\n1 — Medical / Hospital\n2 — Food / Basic Needs\n3 — Burial Assistance\n4 — Educational Assistance\n5 — Other (describe)',
        validationHint: 'Type 1, 2, 3, 4, or 5 — or describe what you need',
        validator: (v) => v && v.trim().length > 0,
        options: ['Medical/Hospital', 'Food/Basic Needs', 'Burial', 'Educational', 'Other'],
      },
    ],
    submissionGuide: [
      'Go to the nearest DSWD Field Office, City Social Welfare Office (CSWDO), or Malasakit Center desk',
      'Bring this completed form and a Barangay Certificate of Indigency',
      'A Social Case Study Report (SCSR) may be required for assistance over ₱5,000',
      'Cash assistance of ₱3,000–₱10,000 is typically released on the same day for complete submissions',
    ],
  },

  'philhealth-cf1': {
    title: 'PhilHealth Claim Form 1 (CF1) — Hospital Confinement',
    agency: 'Philippine Health Insurance Corporation (PhilHealth)',
    fields: [
      {
        id: 'full_name',
        label: 'Member Name',
        type: 'text',
        source: 'profile',
        fallback: (u) =>
          `${u?.firstName || ''} ${u?.middleName ? u.middleName + ' ' : ''}${u?.lastName || ''}`.trim(),
      },
      {
        id: 'birth_date',
        label: 'Date of Birth',
        type: 'date',
        source: 'profile',
        fallback: (u) => u?.birthDate || u?.birth_date || '',
      },
      {
        id: 'address',
        label: 'Permanent Address',
        type: 'text',
        source: 'profile',
        fallback: (u) => u?.address || '',
      },
      {
        id: 'philhealth_number',
        label: 'PhilHealth Identification Number (PIN)',
        type: 'text',
        source: 'ask',
        docKeywords: ['philhealth', 'mdr', 'pmrf', 'health insurance', 'pin'],
        question:
          "What is your PhilHealth Identification Number (PIN)? It's a 12-digit number on your PhilHealth ID or Member Data Record (MDR).",
        followUp:
          "You can also find it in the PhilHealth member portal at https://www.philhealth.gov.ph — log in and look for 'PIN'. It looks like: 12-345678901-2.",
        validationHint: '12-digit number, e.g. 12-345678901-2',
        validator: (v) => v === 'N/A' || v.replace(/[-\s]/g, '').length >= 10,
        invalidMessage:
          "PhilHealth PINs are at least 10 digits. Can you check your PhilHealth card or Member Data Record again?",
      },
      {
        id: 'hospital_name',
        label: 'Hospital / Health Facility Name',
        type: 'text',
        source: 'ask',
        question:
          'What is the name of the hospital or health facility where you are or were admitted?',
        validator: (v) => v && v.trim().length > 3,
        invalidMessage: "Please enter the full name of the hospital — for example, 'Philippine General Hospital' or 'Ospital ng Maynila'.",
      },
      {
        id: 'admission_date',
        label: 'Date of Admission',
        type: 'text',
        source: 'ask',
        isDate: true,
        question:
          'What was the date you were admitted to the hospital? (e.g. August 10, 2026 or 08/10/2026)',
        validator: (v) => v && v.trim().length > 4,
      },
      {
        id: 'diagnosis',
        label: 'Primary Diagnosis / Illness',
        type: 'text',
        source: 'ask',
        isComplex: true,
        question:
          "What is the primary diagnosis or medical condition? You can copy it from your Clinical Abstract or Medical Certificate — just tell me what it says.",
        validator: (v) => v && v.trim().length > 2,
      },
      {
        id: 'attending_physician',
        label: 'Attending Physician',
        type: 'text',
        source: 'ask',
        question: "What is the full name of your attending physician or doctor?",
        validator: (v) => v && v.trim().length > 3,
      },
    ],
    submissionGuide: [
      'Submit this CF1 form to the PhilHealth desk inside the hospital or to your nearest LHIO',
      'Attach: Clinical Abstract, Statement of Account (SOA), and Official Receipts',
      'PhilHealth will directly deduct the covered amount from your hospital bill',
      'For questions, visit https://www.philhealth.gov.ph or call PhilHealth at (02) 8441-7444',
    ],
  },

  'dole-tupad': {
    title: 'DOLE TUPAD Community Employment Application',
    agency: 'Department of Labor and Employment (DOLE)',
    fields: [
      {
        id: 'full_name',
        label: 'Full Name',
        type: 'text',
        source: 'profile',
        fallback: (u) =>
          `${u?.firstName || ''} ${u?.middleName ? u.middleName + ' ' : ''}${u?.lastName || ''}`.trim(),
      },
      {
        id: 'birth_date',
        label: 'Date of Birth',
        type: 'date',
        source: 'profile',
        fallback: (u) => u?.birthDate || u?.birth_date || '',
      },
      {
        id: 'address',
        label: 'Home Address',
        type: 'text',
        source: 'profile',
        fallback: (u) => u?.address || '',
      },
      {
        id: 'civil_status',
        label: 'Civil Status',
        type: 'text',
        source: 'profile',
        fallback: (u) => u?.civilStatus || u?.civil_status || 'Single',
      },
      {
        id: 'employment_status',
        label: 'Current Employment Status',
        type: 'text',
        source: 'profile',
        fallback: (u) => u?.employmentStatus || u?.employment_status || 'Unemployed',
      },
      {
        id: 'barangay',
        label: 'Barangay',
        type: 'text',
        source: 'ask',
        question:
          "What barangay do you currently live in? (e.g. Barangay San Isidro, Quezon City — or just the barangay name is fine)",
        validator: (v) => v && v.trim().length > 2,
      },
      {
        id: 'contact_number',
        label: 'Contact Number',
        type: 'text',
        source: 'ask',
        question:
          "What is the best phone number to reach you? DOLE may contact you about your work schedule.",
        validationHint: 'e.g. 09171234567 or +63 917 123 4567',
        validator: (v) => v && v.replace(/[-\s+()]/g, '').length >= 10,
        invalidMessage:
          "Please provide a valid 11-digit Philippine mobile number like 09171234567 — or a landline with area code.",
      },
      {
        id: 'skills',
        label: 'Skills / Work Experience',
        type: 'textarea',
        source: 'ask',
        isComplex: true,
        question:
          "What skills or work experience do you have? Any skill counts for TUPAD — masonry, carpentry, janitorial, farming, cooking, sewing, electronics repair, etc.",
        validator: (v) => v && v.trim().length > 2,
        invalidMessage:
          "Any skill at all is welcome for TUPAD! Just mention one or two things you know how to do — like 'I know how to clean and cook' or 'I can do basic carpentry.'",
      },
      {
        id: 'last_employer',
        label: 'Last Employer (if any)',
        type: 'text',
        source: 'ask',
        question:
          "Who was your last employer or company? If you've never been formally employed or are self-employed, just say 'None' — that's perfectly fine for TUPAD.",
        validator: (v) => v && v.trim().length > 0,
      },
    ],
    submissionGuide: [
      'Submit this application at your local Barangay Hall or City/Municipal PESO (Public Employment Service Office)',
      "Bring a valid government-issued ID (PhilSys, Voter's ID, or Barangay ID)",
      'DOLE will notify you by text about your assigned community work schedule',
      'Wages are paid at regional minimum wage rate at the end of your assigned work period',
    ],
  },
};

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * Initialize a new intake session.
 * Pre-fills all fields it can from the citizen profile and document vault.
 * Returns a session object with filledFields and gapFields queue.
 */
export function buildIntakeSession(benefitId, user, documents = []) {
  const template = INTAKE_FORM_TEMPLATES[benefitId];
  if (!template) return null;

  const filledFields = {};
  const gapFields = [];

  template.fields.forEach((field) => {
    if (field.source === 'profile') {
      const val = field.fallback ? field.fallback(user) : '';
      filledFields[field.id] = {
        value: val || '',
        source: 'profile',
        confident: Boolean(val && val.trim().length > 0),
      };
      return;
    }

    // Try to pull from document locker
    if (field.docKeywords && documents.length > 0) {
      const matched = documents.find((doc) =>
        field.docKeywords.some((kw) => (doc.name || '').toLowerCase().includes(kw))
      );
      if (matched) {
        const docValue = matched.document_number || matched.name || '';
        if (docValue) {
          filledFields[field.id] = { value: docValue, source: 'documents', confident: true };
          return;
        }
      }
    }

    // Must ask
    gapFields.push(field);
  });

  const program = INTAKE_PROGRAMS.find((p) => p.id === benefitId);

  return {
    benefitId,
    programTitle: program?.title || template.title,
    template,
    filledFields,
    gapFields,
    currentQuestionIndex: 0,
    conversationHistory: [],
    isComplete: false,
    startedAt: new Date().toISOString(),
  };
}

/**
 * Get the gap fields that still need to be asked (applies skipIf logic).
 */
export function getActiveGapFields(session) {
  return session.gapFields.filter((field) => {
    // If already filled (by a previous reply), skip
    if (session.filledFields[field.id]) return false;

    // Apply skipIf condition
    if (field.skipIf && field.skipIf(session)) {
      if (!session.filledFields[field.id]) {
        session.filledFields[field.id] = {
          value: field.skipValue || 'N/A',
          source: 'auto-skipped',
          confident: true,
        };
      }
      return false;
    }

    return true;
  });
}

/**
 * Get the current field that the agent is asking about.
 */
export function getCurrentField(session) {
  const active = getActiveGapFields(session);
  if (active.length === 0) return null;
  return active[0];
}

// =============================================================================
// FIELD VALUE EXTRACTION — Core agentic intelligence
// =============================================================================

const NEGATIVE_EXPRESSIONS = [
  'none', 'wala', 'n/a', 'hindi', 'di ko alam', "don't know", 'walang', 'no', 'never',
  'not applicable', 'di marunong', 'hindi ko alam', 'unknown', 'no employer', 'walang employer',
  'di employed', 'wala akong', 'self',
];

/**
 * Extract a structured field value from the citizen's free-text reply.
 * Uses regex for simple types, Gemini (temperature: 0) for complex fields.
 */
export async function extractFieldValue(field, userMessage) {
  const msg = userMessage.trim();
  const lower = msg.toLowerCase();

  // --- Handle negatives / "I don't know" ---
  if (NEGATIVE_EXPRESSIONS.some((n) => lower === n || lower.startsWith(n + ' ') || lower.endsWith(' ' + n))) {
    if (field.id === 'last_employer' || field.id === 'employer_name') {
      return { value: 'N/A', confidence: 'high' };
    }
    if (!field.validator || field.validator('N/A')) {
      return { value: 'N/A', confidence: 'high' };
    }
  }

  // --- Field-specific regex extractors ---

  if (field.id === 'sss_number') {
    const match = msg.match(/\d{2}[-\s]?\d{7}[-\s]?\d/);
    if (match) {
      const cleaned = match[0].replace(/\s/g, '').replace(/(\d{2})(\d{7})(\d)/, '$1-$2-$3');
      return { value: cleaned, confidence: 'high' };
    }
  }

  if (field.id === 'philhealth_number') {
    const match = msg.match(/\d{2}[-\s]?\d{9}[-\s]?\d{1,2}/);
    if (match) return { value: match[0].replace(/\s/g, ''), confidence: 'high' };
    // Try just a run of 10-12 digits
    const digits = msg.replace(/[-\s]/g, '').match(/\d{10,12}/);
    if (digits) return { value: digits[0], confidence: 'medium' };
  }

  if (field.id === 'contact_number') {
    const match = msg.match(/(\+?63|0)[-\s]?\d{3}[-\s]?\d{3,4}[-\s]?\d{4}/);
    if (match) return { value: match[0], confidence: 'high' };
    const digits = msg.replace(/[-\s+()]/g, '').match(/\d{10,11}/);
    if (digits) return { value: digits[0], confidence: 'medium' };
  }

  if (field.id === 'household_size') {
    // Handle Filipino number words
    const wordMap = { 'isa': 1, 'dalawa': 2, 'tatlo': 3, 'apat': 4, 'lima': 5, 'anim': 6, 'pito': 7, 'walo': 8 };
    for (const [word, num] of Object.entries(wordMap)) {
      if (lower.includes(word)) return { value: String(num), confidence: 'high' };
    }
    const match = msg.match(/\b([1-9]\d?)\b/);
    if (match) return { value: match[1], confidence: 'high' };
  }

  if (field.isDate || field.type === 'date') {
    const datePatterns = [
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i,
      /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
    ];
    for (const p of datePatterns) {
      const m = msg.match(p);
      if (m) return { value: m[0], confidence: 'high' };
    }
  }

  if (field.id === 'assistance_type') {
    const map = { '1': 'Medical/Hospital', '2': 'Food/Basic Needs', '3': 'Burial', '4': 'Educational', '5': 'Other' };
    const num = msg.match(/^[1-5]/);
    if (num && map[num[0]]) return { value: map[num[0]], confidence: 'high' };
    for (const [, label] of Object.entries(map)) {
      if (lower.includes(label.toLowerCase().split('/')[0].toLowerCase())) {
        return { value: label, confidence: 'high' };
      }
    }
    return { value: msg, confidence: 'medium' };
  }

  // --- Gemini extraction for complex / free-text fields ---
  if (field.isComplex) {
    const apiKey = getApiKey();
    if (apiKey) {
      try {
        const extractionPrompt =
          `You are a structured data extractor for Philippine government forms.\n` +
          `Extract the value for the field "${field.label}" from the citizen's message.\n` +
          `Citizen said: "${msg}"\n` +
          `Return ONLY valid JSON with no markdown: {"value": "<extracted value>", "confidence": "high|medium|low"}\n` +
          `Rules:\n` +
          `- Extract the relevant content verbatim or lightly cleaned\n` +
          `- Preserve Filipino/Taglish words as-is\n` +
          `- If the message is relevant, always extract something — even if just a few words\n` +
          `- Only return {"value": null, "confidence": "low"} if truly irrelevant or empty\n` +
          `- Never invent or add information not in the message`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: extractionPrompt }] }],
              generationConfig: { temperature: 0.0, maxOutputTokens: 150 },
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.value) return parsed;
          }
        }
      } catch {
        // Fall through to default
      }
    }
  }

  // --- Default: use raw message for simple text fields ---
  if (msg.length > 0) {
    return { value: msg, confidence: 'medium' };
  }

  return { value: null, confidence: 'low' };
}

// =============================================================================
// CONTRADICTION DETECTION
// =============================================================================

/**
 * Check if a newly extracted value contradicts already-filled fields.
 * Returns a clarification question string, or null if no contradiction.
 */
export function detectContradiction(session, fieldId, newValue) {
  const filled = session.filledFields;

  if (fieldId === 'sss_number' && newValue && newValue !== 'N/A') {
    const emp = (filled['employment_status']?.value || '').toLowerCase();
    if (emp.includes('unemploy')) {
      return "Quick note — you said you're currently unemployed, but you have an SSS number. That's totally fine! SSS loans are available to former and current members. I'll keep your employment status as 'Unemployed' on the form — just let me know if you want to change it.";
    }
  }

  if (fieldId === 'household_size' && newValue) {
    const income = (filled['monthly_income']?.value || '').toLowerCase();
    const size = parseInt(newValue);
    const isHighIncome =
      income.includes('50,000') || income.includes('75,000') || income.includes('100,000');
    if (isHighIncome && size >= 1) {
      return `Just to clarify — your profile shows a higher monthly income. For DSWD AICS, they assess per-capita income (total income ÷ household members). With ${size} members, your per-capita income would be included in the assessment. I've noted this on the form.`;
    }
  }

  return null;
}

// =============================================================================
// MAIN AGENTIC LOOP STEP
// =============================================================================

/**
 * Process the citizen's reply for the current gap field.
 * Returns the updated session and the agent's next message.
 */
export async function processUserReply(session, userMessage) {
  const activeGaps = getActiveGapFields(session);

  if (activeGaps.length === 0) {
    return {
      session: { ...session, isComplete: true },
      agentMessage: null,
      fieldFilled: null,
      isComplete: true,
    };
  }

  const currentField = activeGaps[0];
  const extraction = await extractFieldValue(currentField, userMessage);

  // --- Extraction failed or value invalid ---
  if (!extraction.value || extraction.value === null) {
    return {
      session,
      agentMessage: currentField.invalidMessage || currentField.followUp ||
        `I didn't quite catch that. ${currentField.validationHint ? '(' + currentField.validationHint + ')' : 'Could you try again?'}`,
      fieldFilled: null,
      isComplete: false,
    };
  }

  // --- Validate the extracted value ---
  const isValid = !currentField.validator || currentField.validator(extraction.value);
  if (!isValid) {
    return {
      session,
      agentMessage: currentField.invalidMessage ||
        `That doesn't seem right. ${currentField.validationHint ? currentField.validationHint + '. ' : ''}Can you try again?`,
      fieldFilled: null,
      isComplete: false,
    };
  }

  // --- Fill the field ---
  const updatedSession = {
    ...session,
    filledFields: {
      ...session.filledFields,
      [currentField.id]: {
        value: extraction.value,
        source: 'conversation',
        confident: extraction.confidence === 'high',
        rawInput: userMessage,
      },
    },
    conversationHistory: [
      ...session.conversationHistory,
      { role: 'citizen', text: userMessage, fieldId: currentField.id },
    ],
  };

  // --- Check for contradictions ---
  const contradiction = detectContradiction(updatedSession, currentField.id, extraction.value);

  // --- Determine next question ---
  const nextGaps = getActiveGapFields(updatedSession);
  const isComplete = nextGaps.length === 0;
  const nextField = nextGaps[0] || null;

  let agentMessage;
  if (isComplete) {
    agentMessage =
      `✅ Your application is complete! I've filled in all ${Object.keys(updatedSession.filledFields).length} fields.\n\nPlease review everything on the right — you can edit any field before printing.`;
  } else {
    const confirmMsg = extraction.confidence === 'high' ? '✓ Got it.' : `I'll note "${extraction.value}" for ${currentField.label}.`;
    const contradictionNote = contradiction ? `\n\n⚠️ ${contradiction}\n\n` : '\n\n';
    agentMessage = `${confirmMsg}${contradictionNote}${nextField.question}`;
  }

  return {
    session: { ...updatedSession, isComplete },
    agentMessage,
    fieldFilled: { id: currentField.id, value: extraction.value, label: currentField.label },
    isComplete,
    contradiction,
  };
}

/**
 * Generate the agent's opening greeting for a new intake session.
 * Tells the citizen what it already knows and what it needs to ask.
 */
export function generateOpeningGreeting(session, user) {
  const firstName = user?.firstName || 'there';
  const autoFilled = Object.entries(session.filledFields)
    .filter(([, v]) => v.source === 'profile' || v.source === 'documents')
    .map(([, v]) => v);

  const activeGaps = getActiveGapFields(session);
  const gapCount = activeGaps.length;
  const programTitle = session.programTitle;

  const alreadyKnow = autoFilled.length > 0
    ? `I already have your name, birthday, and address from your profile — so I won't ask for those. `
    : '';

  const askPart =
    gapCount === 0
      ? 'Actually, I already have everything I need! Your form is ready to review.'
      : gapCount === 1
        ? `I just need to ask you 1 thing.`
        : `I just need to ask you ${gapCount} things.`;

  return (
    `Hi ${firstName}! I'll help you apply for the **${programTitle}**.\n\n` +
    `${alreadyKnow}${askPart} This should take about ${Math.max(1, Math.ceil(gapCount * 0.5))} minute${gapCount > 2 ? 's' : ''}.\n\n` +
    `${gapCount > 0 ? activeGaps[0].question : ''}`
  );
}

/**
 * Count fields by source for the session summary display.
 */
export function getSessionStats(session) {
  const fields = Object.values(session.filledFields);
  return {
    fromProfile: fields.filter((f) => f.source === 'profile').length,
    fromDocuments: fields.filter((f) => f.source === 'documents').length,
    fromConversation: fields.filter((f) => f.source === 'conversation').length,
    autoSkipped: fields.filter((f) => f.source === 'auto-skipped').length,
    total: fields.length,
    templateTotal: session.template.fields.length,
  };
}
