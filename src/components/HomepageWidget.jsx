import { useState } from 'react';

const HomepageWidget = ({ onStartAssessment }) => {
  const [selectedCertification, setSelectedCertification] = useState('');
  const [auditTimeline, setAuditTimeline] = useState('');

  const certifications = [
    { value: 'FSSC22000', label: 'FSSC 22000' },
    { value: 'ISO22000', label: 'ISO 22000' },
    { value: 'HACCP', label: 'HACCP' },
    { value: 'ISO9001', label: 'ISO 9001' },
    { value: 'GMP', label: 'GMP / cGMP' },
    { value: 'OHSA', label: 'OHSA / COR' }
  ];

  const timelines = [
    { value: '<30', label: '<30 days' },
    { value: '30-90', label: '30–90 days' },
    { value: '>90', label: '>90 days' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCertification && auditTimeline) {
      onStartAssessment(selectedCertification, auditTimeline);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Audit Readiness Check
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-2">
            SELECT CERTIFICATION PROGRAM
          </label>
          <select
            id="certification"
            value={selectedCertification}
            onChange={(e) => setSelectedCertification(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          >
            <option value="">Choose a certification...</option>
            {certifications.map((cert) => (
              <option key={cert.value} value={cert.value}>
                {cert.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
            WHEN IS YOUR AUDIT?
          </label>
          <select
            id="timeline"
            value={auditTimeline}
            onChange={(e) => setAuditTimeline(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          >
            <option value="">Select timeline...</option>
            {timelines.map((timeline) => (
              <option key={timeline.value} value={timeline.value}>
                {timeline.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!selectedCertification || !auditTimeline}
          className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Start 3-min check
        </button>
      </form>
    </div>
  );
};

export default HomepageWidget;
