import React from 'react';

const QuestionCard = ({ question, currentAnswer, onOptionSelect }) => {
    if (!question) return null;

    const options = [
        { value: 'yes', label: 'Yes', score: 2, sub: 'Fully in place' },
        { value: 'partial', label: 'Partial', score: 1, sub: 'Some gaps' },
        { value: 'no', label: 'No', score: 0, sub: 'Not in place' },
        { value: 'na', label: 'N/A', score: -1, sub: 'Not applicable' },
    ];

    return (
        <div className="bg-white p-0 sm:p-2 animate-fadeIn w-full">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-6 leading-snug">
                {question.text}
            </h3>

            <div className="grid grid-cols-1 gap-3">
                {options.map((opt) => {
                    const isSelected = currentAnswer?.value === opt.value;
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onOptionSelect(opt)}
                            className={`group flex items-center justify-between px-5 py-4 border-2 rounded-xl transition-all duration-200 text-left ${isSelected
                                ? 'border-indigo-600 bg-indigo-50 shadow-sm ring-1 ring-indigo-600'
                                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-slate-400'
                                        }`}
                                >
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                </div>
                                <div>
                                    <p className={`font-bold text-[15px] ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                                        {opt.label}
                                    </p>
                                </div>
                            </div>
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {opt.sub}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionCard;