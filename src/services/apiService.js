import axios from 'axios';
import { MOCK_CERTIFICATIONS, MOCK_QUESTIONS, MOCK_ASSESSMENT_RESULT } from '../mocks/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * API service to handle all network requests.
 * Includes fallback to mock data when API is unavailable.
 */
const apiService = {
    /**
     * Fetches the list of all available certifications.
     */
    async getCertifications() {
        try {
            const response = await axios.get(`${API_BASE_URL}/certifications`);
            return response.data;
        } catch (error) {
            console.warn('API getCertifications failed, using mock data.', error);
            return MOCK_CERTIFICATIONS;
        }
    },

    /**
     * Fetches questions for a specific certification.
     */
    async getQuestions(certificationId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/certifications/${certificationId}/questions`);
            return response.data;
        } catch (error) {
            console.warn('API getQuestions failed, using mock data.', error);

            const certification = MOCK_CERTIFICATIONS.find(c => c._id === certificationId) || { name: 'Unknown' };
            let questions = [...MOCK_QUESTIONS.CORE];

            if (certificationId === '1') { // FSSC 22000
                questions = [...questions, ...(MOCK_QUESTIONS.FSSC_ADDONS || [])];
            } else if (certificationId === '2') { // ISO 22000
                questions = [...questions, ...(MOCK_QUESTIONS.ISO22000_ADDONS || [])];
            } else if (certificationId === '3') { // HACCP
                questions = [...questions, ...(MOCK_QUESTIONS.HACCP || [])];
            } else if (certificationId === '4') { // ISO 9001
                questions = [...questions, ...(MOCK_QUESTIONS.ISO9001_ADDONS || [])];
            } else if (certificationId === '6') { // OHSA / COR
                questions = [...questions, ...(MOCK_QUESTIONS.OHSA_ADDONS || [])];
            }

            return {
                certification,
                questions
            };
        }
    },

    /**
     * Submits an assessment and returns the processed results.
     */
    async submitAssessment(certificationId, answers) {
        try {
            const response = await axios.post(`${API_BASE_URL}/assessments`, {
                certificationId,
                answers,
            });
            return response.data;
        } catch (error) {
            console.warn('API submitAssessment failed, using mock data.', error);
            return MOCK_ASSESSMENT_RESULT;
        }
    },

    /**
     * Retrieves a previously saved assessment by ID.
     */
    async getAssessment(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/assessments/${id}`);
            return response.data;
        } catch (error) {
            console.warn('API getAssessment failed, using mock data.', error);
            return MOCK_ASSESSMENT_RESULT;
        }
    }
};

export default apiService;
