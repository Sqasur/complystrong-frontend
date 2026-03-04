const CertificationSelection = ({ certifications, onSelect, loading }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Select a Certification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <button
              key={cert._id}
              onClick={() => onSelect(cert)}
              disabled={loading}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {cert.name}
              </h3>
              <p className="text-gray-600 text-sm">{cert.description}</p>
              <div className="mt-4 text-blue-600 font-medium">
                Start Assessment →
              </div>
            </button>
          ))}
        </div>
        {loading && (
          <div className="mt-4 text-center text-gray-600">
            Loading questions...
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationSelection;
