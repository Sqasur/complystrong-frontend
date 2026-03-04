const Results = ({ assessment, onRestart }) => {
  const getTierStyles = (tier) => {
    if (tier === 'Green') return { label: 'Green', color: 'text-green-600', bg: 'bg-green-100' };
    if (tier === 'Amber') return { label: 'Amber', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { label: 'Red', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const tier = getTierStyles(assessment.tier);
  const topGaps = (assessment.gaps || []).slice(0, 5);

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleBookCall = () => {
    window.open('https://calendly.com', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Assessment Results
          </h2>
          <p className="text-gray-600">
            {assessment.certification.name}
          </p>
        </div>

        <div className={`rounded-lg p-8 mb-8 ${tier.bg}`}>
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${tier.color}`}>
              {assessment.score}%
            </div>
            <div className="text-xl font-semibold text-gray-800 mb-1">
              Audit Readiness Score
            </div>
            <div className="text-sm font-semibold text-gray-700 mb-3">
              Tier:&nbsp;
              <span
                className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide ${
                  tier.label === 'Green'
                    ? 'bg-green-200 text-green-800'
                    : tier.label === 'Amber'
                    ? 'bg-amber-200 text-amber-800'
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {tier.label}
              </span>
            </div>
          </div>
        </div>

        {topGaps.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Top 5 Gaps
            </h3>
            <div className="space-y-4">
              {topGaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold text-red-800 bg-red-200 px-2 py-1 rounded">
                      {gap.category}
                    </span>
                    <span className="text-sm text-gray-600">
                      {gap.currentScore} / {gap.maxScore} points
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium mb-2">{gap.questionText}</p>
                  <p className="text-sm text-gray-700">
                    <strong>Recommendation:</strong> {gap.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}


        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-semibold"
          >
            Download mini report (PDF)
          </button>
          <button
            type="button"
            onClick={handleBookCall}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Book a readiness call
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
