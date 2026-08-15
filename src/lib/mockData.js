export const INITIAL_USER = {
  id: 'usr_88492026',
  firstName: 'Adones',
  middleName: 'Mendoza',
  lastName: 'Santos',
  fullName: 'Adones Mendoza Santos',
  email: 'adones.santos@egov.ph',
  phone: '+63 917 842 1099',
  address: 'Unit 402, Katipunan Ave, Quezon City, Metro Manila 1108',
  birthDate: '1992-04-18',
  civilStatus: 'Married',
  citizenship: 'Filipino',
  employmentStatus: 'Employed (Private Sector)',
  monthlyIncome: '₱35,000 - ₱45,000',
  isSeniorCitizen: false,
  isSoloParent: false,
  isPWD: false,
  hasDependents: true,
  dependentCount: 2,
  dependentSeniorParent: true,
  egovId: 'PH-CRN-9942-8810-7214',
  egovVerified: true,
  consentGiven: true,
  consentDate: '2026-08-10T14:32:00Z',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const INITIAL_DOCUMENTS = [];

export const CATEGORIES = [
  { id: 'all', name: 'All Services', icon: 'Sparkles', color: '#007AFF', count: 24 },
  { id: 'health', name: 'Health', icon: 'HeartPulse', color: '#FF2D55', count: 6 },
  { id: 'finance', name: 'Finance', icon: 'Coins', color: '#34C759', count: 5 },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#AF52DE', count: 4 },
  { id: 'employment', name: 'Employment', icon: 'Briefcase', color: '#FF9500', count: 4 },
  { id: 'travel', name: 'Travel', icon: 'Plane', color: '#30B0C7', count: 2 },
  { id: 'housing', name: 'Housing', icon: 'Home', color: '#5856D6', count: 3 },
  { id: 'social', name: 'Social Services', icon: 'Users', color: '#FF3B30', count: 5 },
  { id: 'business', name: 'Business', icon: 'Building2', color: '#5AC8FA', count: 3 },
  { id: 'gov_services', name: 'Gov Services', icon: 'FileText', color: '#8E8E93', count: 6 },
  { id: 'discounts', name: 'Discounts & Benefits', icon: 'Gift', color: '#FFCC00', count: 4 },
];

export const OPPORTUNITIES = [
  {
    id: 'opp_philhealth_senior',
    title: 'PhilHealth Senior Citizen & Dependent Lifetime Benefits',
    agency: 'PhilHealth',
    category: 'health',
    categoryName: 'Health',
    categoryColor: '#FF2D55',
    shortDesc: 'Automatic health insurance coverage and hospital bill discounts for qualified seniors and registered dependents under Republic Act 10645.',
    fullDesc: 'Under Republic Act No. 10645, all senior citizens aged 60 and above, along with qualified dependents registered on Member Data Records, are entitled to comprehensive PhilHealth coverage without premium payment requirements.',
    matchScore: 94,
    matchStatus: 'Likely Eligible',
    confidence: '98% Confident',
    deadline: 'Open Year-Round',
    isApproved: true,
    benefits: [
      'Automatic 100% PhilHealth benefit package for inpatient hospital confinements',
      'PhilHealth Konsulta primary care checkups, diagnostic tests, and maintenance medicines',
      'No-Balance-Billing (NBB) policy in accredited DOH public hospital wards',
      'Expanded hemodialysis sessions covered up to 156 sessions per year'
    ],
    whyYouQualify: [
      { text: 'Registered senior parent declared as active dependent on PhilHealth MDR', status: 'met' },
      { text: 'PhilHealth Member Data Record is active and verified', status: 'met' },
      { text: 'Philippine National ID verified via eGov simulation', status: 'met' },
      { text: 'Valid residency in Metro Manila local government unit', status: 'met' }
    ],
    requirements: [
      { name: 'Philippine National ID or Senior Citizen OSCA ID', status: 'met', sourceRef: 'PhilHealth Circular 2024-0012' },
      { name: 'Updated PhilHealth Member Data Record (MDR)', status: 'met', sourceRef: 'Sec 5, RA 10645' },
      { name: 'Barangay Certificate of Residency', status: 'met', sourceRef: 'DOH-PhilHealth Joint Admin Order' },
      { name: 'Duly accomplished PMRF (PhilHealth Member Registration Form)', status: 'needs_action', sourceRef: 'PhilHealth Online Portal' }
    ],
    missingItems: [
      'Fill out the updated online dependent confirmation form on PhilHealth Member Portal'
    ],
    officialSource: {
      agency: 'Philippine Health Insurance Corporation (PhilHealth)',
      url: 'https://www.philhealth.gov.ph/benefits/senior_citizen/',
      pageTitle: 'Mandatory PhilHealth Coverage for All Senior Citizens (RA 10645)',
      lastScrapedAt: '2026-08-12T04:15:22Z',
      lastVerifiedAt: '2026-08-14T09:00:00Z',
      sourceHash: 'sha256-a94f10e42d7c',
      scraperConfidence: '99.4%'
    }
  },
  {
    id: 'opp_doh_maip',
    title: 'DOH Medical Assistance for Indigent & Financially-Incapacitated Patients (MAIP)',
    agency: 'Department of Health (DOH)',
    category: 'health',
    categoryName: 'Health',
    categoryColor: '#FF2D55',
    shortDesc: 'Direct government financial subsidy covering hospital bills, laboratory exams, specialized chemotherapy, and implants in Malasakit Centers.',
    fullDesc: 'The MAIP Program under Administrative Order No. 2020-0060 provides emergency medical assistance for indigent and financially incapacitated Filipino patients confined or receiving outpatient care in government hospitals.',
    matchScore: 89,
    matchStatus: 'Likely Eligible',
    confidence: '95% Confident',
    deadline: 'Ongoing Assistance',
    isApproved: true,
    benefits: [
      'Subsidized or 100% covered hospital confinement fees beyond PhilHealth',
      'Assistance for critical surgeries, pacemakers, and orthopedic implants',
      'Outpatient dialysis, CT scan, MRI, and chemotherapy medication vouchers'
    ],
    whyYouQualify: [
      { text: 'Valid Government Issued ID present in profile', status: 'met' },
      { text: 'Active PhilHealth record attached', status: 'met' },
      { text: 'Income bracket within social service subsidy thresholds', status: 'met' }
    ],
    requirements: [
      { name: 'Valid Government ID (PhilSys ID)', status: 'met', sourceRef: 'DOH AO 2020-0060 Sec 4.1' },
      { name: 'Clinical Abstract / Medical Certificate from attending physician', status: 'missing', sourceRef: 'Malasakit Center Standard OP' },
      { name: 'Hospital Statement of Account / Pharmacy Prescription', status: 'missing', sourceRef: 'Social Services Assessment Unit' },
      { name: 'Barangay Certificate of Indigency or Residency', status: 'met', sourceRef: 'DSWD-DOH Harmonized Criteria' }
    ],
    missingItems: [
      'Medical Abstract / Certificate from accredited hospital',
      'Hospital billing statement or doctor prescription'
    ],
    officialSource: {
      agency: 'Department of Health (DOH)',
      url: 'https://doh.gov.ph/programs/medical-assistance-program/',
      pageTitle: 'DOH MAIP Guidelines and Malasakit Center Integration',
      lastScrapedAt: '2026-08-11T18:30:10Z',
      lastVerifiedAt: '2026-08-13T11:45:00Z',
      sourceHash: 'sha256-e81c00994fa1',
      scraperConfidence: '98.8%'
    }
  },
  {
    id: 'opp_pagibig_mp2',
    title: 'Pag-IBIG MP2 (Modified Pag-IBIG II) High-Yield Savings Program',
    agency: 'Pag-IBIG Fund (HDMF)',
    category: 'finance',
    categoryName: 'Finance',
    categoryColor: '#34C759',
    shortDesc: 'Government-guaranteed voluntary savings with historically 7.0%+ annual tax-free dividends for active and previous Pag-IBIG members.',
    fullDesc: 'MP2 is a voluntary 5-year savings facility designed for Pag-IBIG Fund members who want to earn higher dividends than the regular savings program. Dividends are tax-free and 100% government-guaranteed.',
    matchScore: 96,
    matchStatus: 'Likely Eligible',
    confidence: '99% Confident',
    deadline: 'Open Anytime (5-Year Maturity)',
    isApproved: true,
    benefits: [
      'Tax-free annual dividend earnings (average 6.5% - 7.5% per annum)',
      '100% Government guaranteed principal capital',
      'Flexible deposit amounts starting from as low as ₱500/month',
      'Option for annual dividend payout or 5-year compounded payout'
    ],
    whyYouQualify: [
      { text: 'Employed citizen with active Pag-IBIG MID record', status: 'met' },
      { text: 'National ID verified', status: 'met' },
      { text: 'Certificate of Employment valid', status: 'met' }
    ],
    requirements: [
      { name: 'Pag-IBIG Member ID (MID) Number', status: 'met', sourceRef: 'HDMF Circular No. 407' },
      { name: 'Valid Government Issued Photo ID', status: 'met', sourceRef: 'Pag-IBIG MP2 Online Application' },
      { name: 'Initial minimum remittance (₱500.00)', status: 'action_required', sourceRef: 'Virtual Pag-IBIG Portal' }
    ],
    missingItems: [],
    officialSource: {
      agency: 'Home Development Mutual Fund (Pag-IBIG)',
      url: 'https://www.pagibigfund.gov.ph/Membership_ModifiedPagIBIG2.html',
      pageTitle: 'Pag-IBIG MP2 Savings Guidelines & Dividend Rates',
      lastScrapedAt: '2026-08-14T02:00:15Z',
      lastVerifiedAt: '2026-08-14T10:20:00Z',
      sourceHash: 'sha256-bb98402a1883',
      scraperConfidence: '99.7%'
    }
  },
  {
    id: 'opp_ched_tulong_dunong',
    title: 'CHED Tulong Dunong Program (TDP-TER) Tertiary Education Grant',
    agency: 'Commission on Higher Education (CHED)',
    category: 'education',
    categoryName: 'Education',
    categoryColor: '#AF52DE',
    shortDesc: 'Up to ₱15,000 per academic year financial assistance for qualified tertiary students enrolled in SUCs, LUCs, and recognized private HEIs.',
    fullDesc: 'The Tulong Dunong Program for Tertiary Education (TDP-TER) provides grants-in-aid to support qualified undergraduate students pursuing degree courses across Philippine higher education institutions.',
    matchScore: 82,
    matchStatus: 'Possibly Eligible',
    confidence: '92% Confident',
    deadline: 'September 30, 2026 (AY 2026-2027 Cohort)',
    isApproved: true,
    benefits: [
      '₱7,500 grant per semester (total ₱15,000 per academic year)',
      'Subsidy for school supplies, books, connectivity, and living expenses',
      'Priority consideration for UniFAST tertiary tuition subsidies'
    ],
    whyYouQualify: [
      { text: 'Household with eligible college-age dependents', status: 'met' },
      { text: 'Residency verified within Region NCR', status: 'met' },
      { text: 'Household income meets CHED GIA bracket', status: 'met' }
    ],
    requirements: [
      { name: 'Certificate of Registration / Enrollment in CHED-recognized HEI', status: 'missing', sourceRef: 'CHED-UniFAST Joint Memo 2024-03' },
      { name: 'Certificate of Tax Exemption or BIR 2316 of Household Head', status: 'met', sourceRef: 'TDP Application Checklist' },
      { name: 'Barangay Certificate of Indigency / Residency', status: 'met', sourceRef: 'CHED Regional Office Memo' }
    ],
    missingItems: [
      'Official Certificate of Matriculation / Enrollment from college registrar'
    ],
    officialSource: {
      agency: 'Commission on Higher Education & UniFAST',
      url: 'https://ched.gov.ph/tulong-dunong-program/',
      pageTitle: 'TDP-TER Guidelines for Tertiary Students',
      lastScrapedAt: '2026-08-10T12:10:00Z',
      lastVerifiedAt: '2026-08-13T16:00:00Z',
      sourceHash: 'sha256-4c703e19fa4b',
      scraperConfidence: '97.2%'
    }
  },
  {
    id: 'opp_dole_tupad',
    title: 'DOLE TUPAD Emergency Community Employment Program',
    agency: 'Department of Labor and Employment (DOLE)',
    category: 'employment',
    categoryName: 'Employment',
    categoryColor: '#FF9500',
    shortDesc: 'Community-based safety net providing emergency wage employment (10-30 days at regional minimum wage) with GSIS micro-insurance.',
    fullDesc: 'Tulong Panghanapbuhay sa Ating Disadvantaged/Displaced Workers (TUPAD) is a community-based package of assistance that provides emergency employment for displaced workers, underemployed, and seasonal workers.',
    matchScore: 68,
    matchStatus: 'Needs Review',
    confidence: '88% Confident',
    deadline: 'Continuous Local Barangay Batches',
    isApproved: true,
    benefits: [
      '100% regional daily minimum wage payout for 10 to 30 days',
      'Free GSIS Group Personal Accident Insurance (GPAI) coverage',
      'Free Basic Occupational Safety and Health (BOSH) orientation',
      'Free personal protective gear (TUPAD shirt, cap, safety gloves)'
    ],
    whyYouQualify: [
      { text: 'Philippine citizen resident in accredited municipality', status: 'met' },
      { text: 'Valid National ID on file', status: 'met' },
      { text: 'Current employment status indicates regular work (may limit eligibility to seasonal relatives)', status: 'review' }
    ],
    requirements: [
      { name: 'Barangay Certificate of Displaced / Underemployed Status', status: 'missing', sourceRef: 'DOLE Department Order No. 239' },
      { name: 'Valid Government Issued ID', status: 'met', sourceRef: 'DOLE Regional Field Office' }
    ],
    missingItems: [
      'Barangay endorsement or informal sector displacement certificate'
    ],
    officialSource: {
      agency: 'Department of Labor and Employment (DOLE)',
      url: 'https://www.dole.gov.ph/tupad-program/',
      pageTitle: 'DOLE TUPAD Program Citizen Guidelines',
      lastScrapedAt: '2026-08-09T08:22:45Z',
      lastVerifiedAt: '2026-08-12T14:10:00Z',
      sourceHash: 'sha256-ff71092a017d',
      scraperConfidence: '96.5%'
    }
  },
  {
    id: 'opp_pagibig_4ph',
    title: 'Pag-IBIG 4PH (Pambansang Pabahay Para sa Pilipino) Subsidized Housing Loan',
    agency: 'Department of Human Settlements and Urban Development (DHSUD)',
    category: 'housing',
    categoryName: 'Housing',
    categoryColor: '#5856D6',
    shortDesc: 'Subsidized low-interest residential housing loans with up to 30-year payment terms and government interest rate reduction subsidy.',
    fullDesc: 'Under the 4PH national housing initiative, qualified citizens and wage earners can acquire condo-type or single-attached housing units at subsidized annual interest rates as low as 3.0% for the first 5 years.',
    matchScore: 91,
    matchStatus: 'Likely Eligible',
    confidence: '97% Confident',
    deadline: 'Project-by-Project Registration',
    isApproved: true,
    benefits: [
      'Special subsidized interest rates starting at 3% - 4% p.a.',
      'Up to 30-year repayment amortization term',
      'No equity required for designated socialized township developments',
      'Inclusive of Mortgage Redemption Insurance (MRI)'
    ],
    whyYouQualify: [
      { text: 'Regular Pag-IBIG monthly contribution member in good standing', status: 'met' },
      { text: 'Monthly verifiable household income meets capacity threshold', status: 'met' },
      { text: 'Proof of employment and government ID verified', status: 'met' }
    ],
    requirements: [
      { name: 'Pag-IBIG Housing Loan Application Form', status: 'action_required', sourceRef: 'Pag-IBIG Circular 430' },
      { name: 'Certificate of Employment and Compensation (COE)', status: 'met', sourceRef: 'Credit Assessment Matrix' },
      { name: 'Two (2) Valid Government IDs', status: 'met', sourceRef: 'KYC Document Checklist' },
      { name: 'Updated NBI Clearance or Police Clearance', status: 'expiring', sourceRef: 'Background Verification Rule' }
    ],
    missingItems: [
      'Renew NBI clearance before submitting loan docket (current expires in 18 days)'
    ],
    officialSource: {
      agency: 'Pag-IBIG Fund & DHSUD',
      url: 'https://www.pagibigfund.gov.ph/housingloan4ph.html',
      pageTitle: 'Pambansang Pabahay Para sa Pilipino (4PH) Loan Terms',
      lastScrapedAt: '2026-08-13T20:15:30Z',
      lastVerifiedAt: '2026-08-14T08:30:00Z',
      sourceHash: 'sha256-789bb314e022',
      scraperConfidence: '99.1%'
    }
  },
  {
    id: 'opp_dti_negosyo_starter',
    title: 'DTI Negosyo Center MSME Starter & Livelihood Grant',
    agency: 'Department of Trade and Industry (DTI)',
    category: 'business',
    categoryName: 'Business',
    categoryColor: '#5AC8FA',
    shortDesc: 'Free business registration assistance, product packaging design, mentor coaching, and livelihood starter kits up to ₱10,000 value.',
    fullDesc: 'The DTI Pangkabuhayan sa Pagbangon at Pagpapanibago (PPG) and Negosyo Center Micro-Enterprise development programs provide direct support to aspiring entrepreneurs and micro-business starters.',
    matchScore: 86,
    matchStatus: 'Likely Eligible',
    confidence: '94% Confident',
    deadline: 'Ongoing Quarterly Cohorts',
    isApproved: true,
    benefits: [
      'Free Business Name Registration consultation and digital voucher',
      'Free attendance to DTI SME Roving Academy mentorship sessions',
      'Eligibility for DTI Livelihood Starter Kit worth ₱8,000 - ₱10,000 in tools/materials',
      'Linkage to SB Corp zero-collateral micro-financing programs'
    ],
    whyYouQualify: [
      { text: 'Filipino citizen of legal age with validated government ID', status: 'met' },
      { text: 'Proof of residency in accredited city/municipality', status: 'met' }
    ],
    requirements: [
      { name: 'Valid Government Issued Identification', status: 'met', sourceRef: 'DTI Negosyo Center Act RA 10644' },
      { name: 'Barangay Clearance / Residency Certificate', status: 'met', sourceRef: 'DTI PPG Memo Circular 2024-08' },
      { name: 'DTI Simple Business Plan Proposal Form', status: 'missing', sourceRef: 'Negosyo Center Assessment Kit' }
    ],
    missingItems: [
      'Fill out the 1-page DTI business proposal template at local Negosyo Center'
    ],
    officialSource: {
      agency: 'Department of Trade and Industry (DTI)',
      url: 'https://www.dti.gov.ph/negosyo/programs/livelihood-kits/',
      pageTitle: 'DTI Negosyo Center MSME Assistance Guidelines',
      lastScrapedAt: '2026-08-11T14:40:00Z',
      lastVerifiedAt: '2026-08-13T10:15:00Z',
      sourceHash: 'sha256-32d184a7e910',
      scraperConfidence: '98.0%'
    }
  },
  {
    id: 'opp_pwd_senior_fare_discount',
    title: 'Mandatory 20% Transport & Fare Discount for Seniors, PWDs & Students',
    agency: 'Department of Transportation (DOTr) & LTFRB',
    category: 'discounts',
    categoryName: 'Discounts & Benefits',
    categoryColor: '#FFCC00',
    shortDesc: 'Statutory 20% fare deduction on MRT-3, LRT-1, LRT-2, buses, jeepneys, domestic flights, and passenger ferries under Philippine law.',
    fullDesc: 'Mandated under Republic Act Nos. 9994, 10754, and 11314, all qualified senior citizens, persons with disability, and students are entitled to a 20% fare discount on all public land, air, and water transport services across the Philippines.',
    matchScore: 98,
    matchStatus: 'Likely Eligible',
    confidence: '100% Confident',
    deadline: 'Permanent Statutory Benefit',
    isApproved: true,
    benefits: [
      '20% deduction on base fare for all domestic airlines (Philippine Airlines, Cebu Pacific, AirAsia)',
      '20% fare discount on MRT-3, LRT-1, LRT-2, and PNR commuter trains',
      '20% fare discount on public utility buses, modern and traditional jeepneys, and TNVS',
      'VAT exemption on transport tickets and passenger terminal fees'
    ],
    whyYouQualify: [
      { text: 'Household profile includes senior citizen dependent with valid PhilSys ID', status: 'met' },
      { text: 'National ID verified with official PSA security seal', status: 'met' }
    ],
    requirements: [
      { name: 'OSCA Senior Citizen ID, PWD Card, or Valid PhilSys ID showing birth date', status: 'met', sourceRef: 'LTFRB Memorandum Circular 2023-019' },
      { name: 'Presentation at ticket counter or inputting ID number during airline booking', status: 'met', sourceRef: 'CAB Economic Regulation No. 3' }
    ],
    missingItems: [],
    officialSource: {
      agency: 'LTFRB & Department of Transportation (DOTr)',
      url: 'https://ltfrb.gov.ph/fare-discount-policy/',
      pageTitle: 'LTFRB 20% Fare Discount Implementation Rules',
      lastScrapedAt: '2026-08-14T05:12:00Z',
      lastVerifiedAt: '2026-08-14T11:00:00Z',
      sourceHash: 'sha256-664ea001bc99',
      scraperConfidence: '99.9%'
    }
  }
];

export const KNOWLEDGE_SOURCES = [
  {
    id: 'src_philhealth',
    agencyName: 'Philippine Health Insurance Corporation (PhilHealth)',
    agencyType: 'Government Owned and Controlled Corp (GOCC)',
    officialUrl: 'https://www.philhealth.gov.ph',
    category: 'Health',
    categoryColor: '#FF2D55',
    status: 'Active',
    scrapingFrequency: 'Every 6 Hours',
    lastScrapedAt: '12 minutes ago',
    lastVerifiedAt: '2026-08-14T12:00:00Z',
    healthScore: 99.4,
    documentsIndexed: 418,
    opportunitiesDetected: 9,
    allowedPaths: ['/benefits/*', '/circulars/2026/*', '/members/senior-citizen'],
    priority: 'High',
    notes: 'Configured by Super Admin for RA 10645 & Konsulta benefit continuous scraping.'
  },
  {
    id: 'src_sss',
    agencyName: 'Social Security System (SSS)',
    agencyType: 'Social Insurance Institution',
    officialUrl: 'https://www.sss.gov.ph',
    category: 'Finance',
    categoryColor: '#34C759',
    status: 'Active',
    scrapingFrequency: 'Daily',
    lastScrapedAt: '1 hour ago',
    lastVerifiedAt: '2026-08-14T08:30:00Z',
    healthScore: 98.2,
    documentsIndexed: 620,
    opportunitiesDetected: 14,
    allowedPaths: ['/portal/benefits/*', '/loans/*', '/pension/*'],
    priority: 'High',
    notes: 'Monitors calamity loan announcements, retirement pension rules, and sickness benefit policies.'
  },
  {
    id: 'src_doh',
    agencyName: 'Department of Health (DOH)',
    agencyType: 'Executive Department',
    officialUrl: 'https://doh.gov.ph',
    category: 'Health',
    categoryColor: '#FF2D55',
    status: 'Active',
    scrapingFrequency: 'Every 12 Hours',
    lastScrapedAt: '3 hours ago',
    lastVerifiedAt: '2026-08-13T22:00:00Z',
    healthScore: 97.9,
    documentsIndexed: 310,
    opportunitiesDetected: 7,
    allowedPaths: ['/programs/medical-assistance/*', '/malasakit-centers/*'],
    priority: 'High',
    notes: 'Tracks MAIP allocations, Malasakit center coverage, and national immunization programs.'
  },
  {
    id: 'src_dswd',
    agencyName: 'Department of Social Welfare and Development (DSWD)',
    agencyType: 'Executive Department',
    officialUrl: 'https://www.dswd.gov.ph',
    category: 'Social Services',
    categoryColor: '#FF3B30',
    status: 'Active',
    scrapingFrequency: 'Daily',
    lastScrapedAt: '5 hours ago',
    lastVerifiedAt: '2026-08-14T01:15:00Z',
    healthScore: 99.1,
    documentsIndexed: 540,
    opportunitiesDetected: 11,
    allowedPaths: ['/programs-services/*', '/aics/*', '/4ps/*'],
    priority: 'High',
    notes: 'Monitors AICS cash assistance, solo parent welfare benefits, and social pension for indigent seniors.'
  },
  {
    id: 'src_ched',
    agencyName: 'Commission on Higher Education (CHED)',
    agencyType: 'Higher Education Commission',
    officialUrl: 'https://ched.gov.ph',
    category: 'Education',
    categoryColor: '#AF52DE',
    status: 'Active',
    scrapingFrequency: 'Daily',
    lastScrapedAt: '8 hours ago',
    lastVerifiedAt: '2026-08-13T19:00:00Z',
    healthScore: 96.5,
    documentsIndexed: 280,
    opportunitiesDetected: 6,
    allowedPaths: ['/scholarships/*', '/unifast/*', '/tulong-dunong/*'],
    priority: 'Medium',
    notes: 'Crawls Tulong Dunong grants, UniFAST tertiary subsidies, and merit scholarships.'
  },
  {
    id: 'src_pagibig',
    agencyName: 'Home Development Mutual Fund (Pag-IBIG)',
    agencyType: 'National Housing & Savings Fund',
    officialUrl: 'https://www.pagibigfund.gov.ph',
    category: 'Housing & Finance',
    categoryColor: '#5856D6',
    status: 'Active',
    scrapingFrequency: 'Daily',
    lastScrapedAt: '2 hours ago',
    lastVerifiedAt: '2026-08-14T10:00:00Z',
    healthScore: 99.8,
    documentsIndexed: 390,
    opportunitiesDetected: 8,
    allowedPaths: ['/Membership_ModifiedPagIBIG2.html', '/housingloan4ph.html'],
    priority: 'High',
    notes: 'Tracks MP2 dividend rate updates, 4PH housing subsidies, and calamity loan rates.'
  },
  {
    id: 'src_dti',
    agencyName: 'Department of Trade and Industry (DTI)',
    agencyType: 'Executive Department',
    officialUrl: 'https://www.dti.gov.ph',
    category: 'Business',
    categoryColor: '#5AC8FA',
    status: 'Active',
    scrapingFrequency: 'Every 2 Days',
    lastScrapedAt: '18 hours ago',
    lastVerifiedAt: '2026-08-12T16:00:00Z',
    healthScore: 95.8,
    documentsIndexed: 215,
    opportunitiesDetected: 5,
    allowedPaths: ['/negosyo/*', '/programs/livelihood-kits/*'],
    priority: 'Medium',
    notes: 'Extracts MSME starter kits, P3 micro loans, and youth entrepreneurship initiatives.'
  }
];

export const AI_DETECTED_QUEUE = [
  {
    id: 'queue_1',
    title: 'SSS Special Calamity Loan Package for Metro Manila Monsoon Victims',
    agency: 'Social Security System (SSS)',
    sourceUrl: 'https://www.sss.gov.ph/portal/circulars/2026/08/calamity-loan-ncr.html',
    category: 'Finance',
    categoryColor: '#34C759',
    extractedAt: '2026-08-14T11:45:00Z',
    confidence: 96.8,
    status: 'Pending Review',
    extractedRequirements: [
      'Must have at least 36 monthly contributions',
      'Must be residing in an NDRRMC declared state of calamity area',
      'Must submit Barangay Certificate of Damage/Residency'
    ],
    extractedBenefits: [
      'Up to ₱20,000 loan payable in 24 monthly installments',
      'Lowered 6% interest rate with first 2 months grace period'
    ],
    sourceEvidenceSnippet: '“Pursuant to SSS Circular No. 2026-041, qualified members affected by southwest monsoon flooding in declared areas may apply for calamity assistance loan via My.SSS portal until Oct 31, 2026.”',
    potentialCitizenReach: '~140,000 eligible citizens in NCR'
  },
  {
    id: 'queue_2',
    title: 'TESDA Online Program Free AI & Cloud Practitioner Digital Upskilling Grant',
    agency: 'Technical Education and Skills Development Authority (TESDA)',
    sourceUrl: 'https://www.tesda.gov.ph/programs/digital-skills-2026',
    category: 'Education',
    categoryColor: '#AF52DE',
    extractedAt: '2026-08-14T09:20:00Z',
    confidence: 94.2,
    status: 'Pending Review',
    extractedRequirements: [
      'Filipino citizen at least 18 years old',
      'Valid National ID (PhilSys)',
      'Basic computer literacy and internet connectivity'
    ],
    extractedBenefits: [
      '100% Free self-paced certified digital curriculum',
      'Voucher for National Certificate (NC III) assessment examination',
      'Direct endorsement to DOLE JobStart partner IT firms'
    ],
    sourceEvidenceSnippet: '“TESDA announces 50,000 scholarship slots under the Digital Transformation Skills Fund in partnership with international cloud providers.”',
    potentialCitizenReach: '~50,000 digital trainees'
  }
];

export const NOTIFICATIONS = [
  {
    id: 'notif_1',
    type: 'expiring_document',
    title: 'Document Expiring Soon',
    message: 'Your NBI Clearance will expire in 18 days (Sep 02, 2026). Renew now to keep your Pag-IBIG 4PH and job applications verified.',
    time: '2 hours ago',
    read: false,
    badgeColor: '#FF9500',
    icon: 'AlertTriangle',
    actionText: 'Renew / Upload'
  },
  {
    id: 'notif_2',
    type: 'matched_opportunity',
    title: 'High Eligibility Match Detected',
    message: 'You have a 94% match for the PhilHealth Senior Citizen & Dependent Benefit based on your verified eGov profile data.',
    time: 'Yesterday',
    read: false,
    badgeColor: '#007AFF',
    icon: 'Sparkles',
    actionText: 'View Match'
  },
  {
    id: 'notif_3',
    type: 'source_updated',
    title: 'Official Source Policy Update',
    message: 'PhilHealth updated guidelines for Konsulta primary medicine benefit distribution at local health centers.',
    time: '2 days ago',
    read: true,
    badgeColor: '#34C759',
    icon: 'RefreshCw',
    actionText: 'Read Source'
  },
  {
    id: 'notif_4',
    type: 'security_audit',
    title: 'eGov Identity Sync Completed',
    message: 'Your profile data and PSA National ID records were securely synchronized in Simulation Mode.',
    time: '3 days ago',
    read: true,
    badgeColor: '#8E8E93',
    icon: 'ShieldCheck',
    actionText: 'View Audit'
  }
];

export const AUDIT_LOGS = [
  {
    id: 'aud_1',
    action: 'SOURCE_CRAWL_SUCCESS',
    actor: 'ALALAY AI Scraper Daemon #4',
    target: 'PhilHealth Senior Citizen Circulars',
    timestamp: '2026-08-15T08:30:12Z',
    status: 'Success',
    details: 'Fetched 418 pages. 0 errors. Extracted 9 valid opportunity nodes with source cryptographic hash sha256-a94f10.'
  },
  {
    id: 'aud_2',
    action: 'OPPORTUNITY_APPROVED',
    actor: 'Super Admin (Sec. Office Admin #1)',
    target: 'Pag-IBIG 4PH Subsidized Housing Loan',
    timestamp: '2026-08-14T10:00:00Z',
    status: 'Approved',
    details: 'Verified source against official HDMF Memo 430. Published to citizen recommendation feed.'
  },
  {
    id: 'aud_3',
    action: 'EGOV_SIMULATION_SYNC',
    actor: 'Citizen Adones M. Santos',
    target: 'National ID & PhilHealth Records',
    timestamp: '2026-08-10T14:32:00Z',
    status: 'Completed',
    details: 'Citizen consented under RA 10173. Retrieved 3 simulated eGov credential tokens.'
  },
  {
    id: 'aud_4',
    action: 'AI_GUARDRAIL_TRIGGER',
    actor: 'ALALAY AI Core Guardrail',
    target: 'User Question: Guarantee Loan Approval',
    timestamp: '2026-08-09T16:12:00Z',
    status: 'Guardrail Enforced',
    details: 'AI clarified that only SSS can make final loan credit decisions; displayed official agency disclaimer.'
  }
];
