/**
 * Mock data for certifications and questions.
 * This file serves as a fallback when the backend is unavailable
 * and as a reference for the data structure.
 */

export const MOCK_CERTIFICATIONS = [
    { _id: '1', name: 'FSSC 22000' },
    { _id: '2', name: 'ISO 22000' },
    { _id: '3', name: 'HACCP' },
    { _id: '4', name: 'ISO 9001' },
    { _id: '5', name: 'GMP / cGMP' },
    { _id: '6', name: 'SOC 2 Type II' },
];

export const MOCK_QUESTIONS = {
    CORE: [
        {
            _id: 'q1',
            text: 'Is there a documented management system scope, policy, and objectives?',
            tooltip: 'Yes if the scope is defined, leadership has approved a policy, and objectives are measurable and tracked.',
            category: 'Leadership & Scope',
            weight: 1.5,
        },
        {
            _id: 'q2',
            text: 'Are roles, responsibilities, and authorities defined and communicated?',
            tooltip: 'Yes if org chart/RACI exists and owners can explain responsibilities.',
            category: 'Governance',
            weight: 1.0,
        },
        {
            _id: 'q3',
            text: 'Do you perform risk assessment and maintain a risk register?',
            tooltip: 'Yes if risks are identified, evaluated, owned, and reviewed on a schedule.',
            category: 'Risk Management',
            weight: 2.0,
        },
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
