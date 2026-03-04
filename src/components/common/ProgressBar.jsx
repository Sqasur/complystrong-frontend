import React from 'react';

/**
 * Reusable progress bar component.
 * @param {Object} props
 * @param {number} props.progress - Percentage of progress (0-100).
 * @param {string} props.label - Optional label to display above the bar.
 * @param {string} props.subLabel - Optional sub-label to display below the bar.
 * @param {string} props.color - Tailwind color class for the bar (default: bg-blue-600).
 */
const ProgressBar = ({ progress, label, color = 'bg-emerald-500' }) => {
    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
            )}
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                    className={`${color} h-full rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
