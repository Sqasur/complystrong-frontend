import { useState } from 'react';

const QuestionWizard = ({ certification, questions, answers, onAnswerChange, onSubmit, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion._id] : null;

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const buildOptionPayload = (value) => {

    const mapping = {
      yes: 2,
      partial: 1,
      no: 0,
      na: -1,
    };

    return {
      value,
      label:
        value === 'yes'
          ? 'Yes'
          : value === 'partial'
          ? 'Partial'
          : value === 'no'
          ? 'No'
          : 'N/A',
      score: mapping[value],
    };
  };

  const handleOptionSelect = (value) => {
    if (!currentQuestion) return;
    const option = buildOptionPayload(value);
    onAnswerChange(currentQuestion._id, option);
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === questions.length) {
      onSubmit();
    }
  };

  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-800">
              {certification?.name}
            </h2>
            <span className="text-sm text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {answeredCount} of {questions.length} answered
          </div>
        </div>

        {currentQuestion && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                {currentQuestion.category}
              </span>
              <button
                type="button"
                className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                title={currentQuestion.tooltip || 'Click Yes if you consistently meet this requirement in practice and documentation.'}
              >
                <span className="mr-1">What counts as Yes?</span>
                <span className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-400 text-gray-500 text-xs">
                  i
                </span>
              </button>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.text}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {['yes', 'partial', 'no', 'na'].map((value) => {
                const option = buildOptionPayload(value);
                const isSelected = currentAnswer?.selectedOption?.value === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleOptionSelect(value)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-full h-full rounded-full bg-white scale-50" />
                          )}
                        </div>
                        <span className="text-gray-800 font-medium">{option.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {value === 'yes'
                          ? 'Fully in place'
                          : value === 'partial'
                          ? 'Some gaps'
                          : value === 'no'
                          ? 'Not in place'
                          : 'Not applicable'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length || loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionWizard;