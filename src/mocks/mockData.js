export const MOCK_CERTIFICATIONS = [
    { _id: '1', name: 'FSSC 22000' },
    { _id: '2', name: 'ISO 22000' },
    { _id: '3', name: 'HACCP' },
    { _id: '4', name: 'ISO 9001' },
    { _id: '5', name: 'GMP/cGMP' },
    { _id: '6', name: 'OHSA' },
];

export const MOCK_QUESTIONS = {
    CORE: [
        {
            _id: 'q1',
            text: 'Is your document control system formally defined and consistently applied?',
            tooltip: 'Approved procedures, version control, access control, obsolete document removal.',
            category: 'Documentation',
            weight: 1.5,
        },
        {
            _id: 'q2',
            text: 'Are required records complete and up to date for the last 3 months (or last full production cycle)?',
            tooltip: 'Monitoring logs, inspection records, batch/lot records, audit records.',
            category: 'Documentation',
            weight: 1.5,
        },
        {
            _id: 'q3',
            text: 'Are responsibilities formally assigned for compliance, quality, or safety functions?',
            tooltip: 'Org chart, role descriptions, designated compliance lead.',
            category: 'Governance',
            weight: 1.0,
        },
        {
            _id: 'q4',
            text: 'Are employees trained and competency-verified for roles impacting compliance?',
            tooltip: 'Training matrix, onboarding records, refresher training evidence.',
            category: 'Training',
            weight: 1.5,
        },
        {
            _id: 'q5',
            text: 'Has a formal risk assessment been completed and reviewed within the last 12 months?',
            tooltip: 'HACCP, risk register, HIRA, or equivalent depending on certification.',
            category: 'Risk',
            weight: 2.0,
        },
        {
            _id: 'q6',
            text: 'Are operational controls (PRPs, SOPs, procedures) implemented and monitored consistently?',
            tooltip: 'Documented procedures + evidence of monitoring.',
            category: 'Operations',
            weight: 1.5,
        },
        {
            _id: 'q7',
            text: 'Has an internal audit been conducted per schedule with corrective actions closed?',
            tooltip: 'Audit plan, audit report, closure evidence.',
            category: 'Verification',
            weight: 2.0,
        },
        {
            _id: 'q8',
            text: 'Is there a formal system for nonconformance, corrective action, and effectiveness verification?',
            tooltip: 'Root cause analysis, action tracking, closure verification.',
            category: 'CAPA',
            weight: 2.0,
        },
        {
            _id: 'q9',
            text: 'Are suppliers approved and periodically evaluated?',
            tooltip: 'Approved supplier list, COAs, audits, scorecards.',
            category: 'Supplier',
            weight: 1.5,
        },
        {
            _id: 'q10',
            text: 'Has a traceability test or emergency drill been conducted within required frequency?',
            tooltip: 'Mock recall, emergency drill report, time-to-trace record.',
            category: 'Verification',
            weight: 2.0,
        },
        {
            _id: 'q11',
            text: 'Are monitoring activities defined with acceptance criteria and records maintained?',
            tooltip: 'CCP logs, inspection logs, calibration records, safety checks.',
            category: 'Operations',
            weight: 1.5,
        },
        {
            _id: 'q12',
            text: 'Has management review been conducted within the last 12 months with documented outputs?',
            tooltip: 'KPIs, audit results, complaints, resources, improvement actions.',
            category: 'Governance',
            weight: 2.0,
        }
    ],
    HACCP: [
        {
            _id: 'haccp1',
            text: 'Is hazard analysis documented for all process steps?',
            category: 'Hazard Analysis',
            weight: 2.0,
        },
        {
            _id: 'haccp2',
            text: 'Are CCPs monitored and recorded at defined frequency?',
            category: 'CCP Monitoring',
            weight: 2.0,
        },
        {
            _id: 'haccp3',
            text: 'Are deviations documented with corrective actions taken?',
            category: 'Corrective Actions',
            weight: 2.0,
        },
        {
            _id: 'haccp4',
            text: 'Is the HACCP system verified periodically?',
            category: 'Verification',
            weight: 1.5,
        },
    ],
    FSSC_ADDONS: [
        {
            _id: 'fssc1',
            text: 'Are PRPs implemented according to ISO/TS 22002 requirements relevant to your sector?',
            tooltip: 'Sanitation, allergen control, pest control, zoning, maintenance.',
            category: 'Prerequisite Programs',
            weight: 2.0,
        },
        {
            _id: 'fssc2',
            text: 'Is a documented Food Defense plan implemented and tested?',
            tooltip: 'Threat assessment, mitigation measures, access control.',
            category: 'Food Defense',
            weight: 1.5,
        },
        {
            _id: 'fssc3',
            text: 'Is a Food Fraud vulnerability assessment completed and mitigation plan implemented?',
            tooltip: 'Raw material risk ranking and control measures.',
            category: 'Food Fraud',
            weight: 1.5,
        },
        {
            _id: 'fssc4',
            text: 'Is environmental monitoring conducted where required (e.g., high-risk areas)?',
            tooltip: 'Sampling plan, trend analysis, corrective actions.',
            category: 'Environmental Monitoring',
            weight: 1.5,
        },
        {
            _id: 'fssc5',
            text: 'Are additional FSSC requirements (e.g., logo use, culture, equipment management) addressed?',
            tooltip: 'Awareness training and documented controls.',
            category: 'Additional FSSC Requirements',
            weight: 1.0,
        },
    ],
    ISO22000_ADDONS: [
        {
            _id: 'iso1',
            text: 'Is a validated HACCP plan established including hazard analysis and control measures?',
            category: 'HACCP Plan',
            weight: 2.0,
        },
        {
            _id: 'iso2',
            text: 'Are CCPs/OPRPs identified with validated critical limits?',
            category: 'CCPs/OPRPs',
            weight: 2.0,
        },
        {
            _id: 'iso3',
            text: 'Is verification (internal audit, sampling, testing) performed as planned?',
            category: 'Verification',
            weight: 1.5,
        },
        {
            _id: 'iso4',
            text: 'Are changes to processes/products evaluated for food safety impact?',
            category: 'Change Management',
            weight: 1.5,
        },
    ],
    ISO9001_ADDONS: [
        {
            _id: 'iso9001_1',
            text: 'Have quality objectives and KPIs been established and monitored?',
            category: 'Performance Monitoring',
            weight: 1.5,
        },
        {
            _id: 'iso9001_2',
            text: 'Is customer feedback collected and analyzed?',
            category: 'Customer Satisfaction',
            weight: 1.5,
        },
        {
            _id: 'iso9001_3',
            text: 'Is control of nonconforming output formally managed?',
            category: 'Nonconforming Output',
            weight: 2.0,
        },
        {
            _id: 'iso9001_4',
            text: 'Are risks and opportunities identified and addressed?',
            category: 'Risk Management',
            weight: 1.5,
        },
    ],
    OHSA_ADDONS: [
        {
            _id: 'ohsa1',
            text: 'Is a documented hazard assessment completed and reviewed annually?',
            category: 'Hazard Assessment',
            weight: 2.0,
        },
        {
            _id: 'ohsa2',
            text: 'Are workplace inspections conducted and documented regularly?',
            category: 'Workplace Inspections',
            weight: 1.5,
        },
        {
            _id: 'ohsa3',
            text: 'Is incident reporting and investigation implemented?',
            category: 'Incident Management',
            weight: 2.0,
        },
        {
            _id: 'ohsa4',
            text: 'Are required safety trainings documented (e.g., WHMIS, working at heights)?',
            category: 'Safety Training',
            weight: 1.5,
        },
    ],
    GMP_ADDONS: [
        {
            _id: 'gmp1',
            text: 'Are GMP procedures/SOPs current, approved, and followed on the floor?',
            tooltip: 'Yes if SOPs exist, are controlled, and observed practices match procedures.',
            category: 'SOPs',
            weight: 2.0,
        },
        {
            _id: 'gmp2',
            text: 'Do you have hygiene, sanitation, and environmental controls appropriate to product risk?',
            tooltip: 'Yes if programs are documented, implemented, and verified with records.',
            category: 'Hygiene & Sanitation',
            weight: 1.5,
        },
        {
            _id: 'gmp3',
            text: 'Is material control in place (receiving, quarantine, release, traceability)?',
            tooltip: 'Yes if materials are status-controlled and releases are authorized and recorded.',
            category: 'Material Control',
            weight: 2.0,
        },
        {
            _id: 'gmp4',
            text: 'Do you maintain batch/production records with review and approvals?',
            tooltip: 'Yes if records are complete, reviewed, and deviations are addressed.',
            category: 'Batch Records',
            weight: 1.5,
        },
        {
            _id: 'gmp5',
            text: 'Are equipment cleaning/validation (as applicable) and calibration controlled?',
            tooltip: 'Yes if cleaning status is controlled and validation/calibration evidence exists.',
            category: 'Equipment Control',
            weight: 1.5,
        },
    ]
};

export const MOCK_ASSESSMENT_RESULT = {
    _id: 'res1',
    score: 75,
    tier: 'Amber',
    certification: { name: 'HACCP' },
    gaps: [
        {
            category: 'CCPs',
            questionText: 'Have you identified CCPs and established critical limits?',
            currentScore: 0,
            maxScore: 4,
            weight: 2,
            recommendation: 'Prioritize implementing a documented, repeatable process for CCPs with owners and records.'
        },
        {
            category: 'Risk Management',
            questionText: 'Do you perform risk assessment and maintain a risk register?',
            currentScore: 2,
            maxScore: 4,
            weight: 2,
            recommendation: 'Close remaining gaps in Risk Management to reach consistent implementation and evidence.'
        }
    ],
    createdAt: new Date().toISOString(),
};