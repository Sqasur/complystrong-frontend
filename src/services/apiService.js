import axios from 'axios';
import { MOCK_CERTIFICATIONS, MOCK_QUESTIONS } from '../mocks/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Computes assessment results entirely client-side from answers and questions.
 */
function computeLocalResult(certificationId, answers, questions) {
    const certification = MOCK_CERTIFICATIONS.find(c => c._id === certificationId) || { _id: certificationId, name: 'Unknown' };
    const questionMap = new Map(questions.map(q => [q._id, q]));

    let totalScore = 0;
    let maxScore = 0;
    const gaps = [];

    answers.forEach(answer => {
        const question = questionMap.get(answer.questionId);
        if (!question) return;

        const rawScore = Number(answer?.selectedOption?.score);
        if (rawScore === -1) return; // N/A

        const weight = Number(question.weight) || 1;
        const maxQ = 2 * weight;
        const bounded = Math.max(0, Math.min(2, rawScore));
        const current = bounded * weight;

        maxScore += maxQ;
        totalScore += current;

        if (bounded <= 1) {
            gaps.push({
                category: question.category,
                questionText: question.text,
                currentScore: current,
                maxScore: maxQ,
                weight,
                recommendation: bounded === 1
                    ? `Close remaining gaps in ${question.category} to reach consistent implementation and evidence.`
                    : `Prioritize implementing a documented, repeatable process for ${question.category} with owners and records.`
            });
        }
    });

    const score = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const tier = score >= 80 ? 'Green' : score >= 55 ? 'Amber' : 'Red';
    const topGaps = [...gaps]
        .sort((a, b) => b.weight !== a.weight ? b.weight - a.weight : (a.currentScore / a.weight) - (b.currentScore / b.weight))
        .slice(0, 5);

    return {
        _id: 'local',
        certification,
        score,
        tier,
        gaps: topGaps,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Gets questions for a certification (for local fallback use).
 */
function getLocalQuestions(certificationId) {
    let questions = [...MOCK_QUESTIONS.CORE];
    if (certificationId === '1') questions = [...questions, ...(MOCK_QUESTIONS.FSSC_ADDONS || [])];
    else if (certificationId === '2') questions = [...questions, ...(MOCK_QUESTIONS.ISO22000_ADDONS || [])];
    else if (certificationId === '3') questions = [...questions, ...(MOCK_QUESTIONS.HACCP || [])];
    else if (certificationId === '4') questions = [...questions, ...(MOCK_QUESTIONS.ISO9001_ADDONS || [])];
    else if (certificationId === '5') questions = [...questions, ...(MOCK_QUESTIONS.GMP_ADDONS || [])];
    else if (certificationId === '6') questions = [...questions, ...(MOCK_QUESTIONS.OHSA_ADDONS || [])];
    return questions;
}

/**
 * API service to handle all network requests.
 * Includes fallback to client-side computation when API is unavailable.
 */
const apiService = {
    async getCertifications() {
        try {
            const response = await axios.get(`${API_BASE_URL}/certifications`);
            return response.data;
        } catch (error) {
            console.warn('API getCertifications failed, using mock data.', error);
            return MOCK_CERTIFICATIONS;
        }
    },

    async getQuestions(certificationId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/certifications/${certificationId}/questions`);
            return response.data;
        } catch (error) {
            console.warn('API getQuestions failed, using mock data.', error);
            const certification = MOCK_CERTIFICATIONS.find(c => c._id === certificationId) || { name: 'Unknown' };
            const questions = getLocalQuestions(certificationId);
            return { certification, questions };
        }
    },

    async submitAssessment(certificationId, answers) {
        try {
            const response = await axios.post(`${API_BASE_URL}/assessments`, {
                certificationId,
                answers,
            });
            return response.data;
        } catch (error) {
            console.warn('API submitAssessment failed, computing result locally.', error);
            // Compute real result from actual answers client-side
            const questions = getLocalQuestions(certificationId);
            const result = computeLocalResult(certificationId, answers, questions);
            // Store in sessionStorage so Results page can read it
            sessionStorage.setItem('localResult', JSON.stringify(result));
            return result;
        }
    },

    async getAssessment(id) {
        // If this is a local result, read from sessionStorage
        if (id === 'local') {
            const stored = sessionStorage.getItem('localResult');
            if (stored) return JSON.parse(stored);
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/assessments/${id}`);
            return response.data;
        } catch (error) {
            console.warn('API getAssessment failed.', error);
            // Try sessionStorage as last resort
            const stored = sessionStorage.getItem('localResult');
            if (stored) return JSON.parse(stored);
            return null;
        }
    }
};

export default apiService;

