import React from 'react';
import { Priority } from '../../types';
import { getPriorityText } from '../../utils/helpers';
import { FaFlag } from 'react-icons/fa';

interface PrioritySelectorProps {
  selectedPriority: number;
  onChange: (priority: number) => void;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({ 
  selectedPriority, 
  onChange 
}) => {
  const handleSelectPriority = (priority: number) => {
    onChange(priority);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case Priority.High:
        return 'text-red-500';
      case Priority.Medium:
        return 'text-yellow-500';
      case Priority.Low:
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="priority-selector">
      <span className="text-sm text-gray-600 mr-2">우선순위:</span>
      {[Priority.High, Priority.Medium, Priority.Low].map((priority) => (
        <button
          key={priority}
          onClick={() => handleSelectPriority(priority)}
          className={`priority-option ${
            selectedPriority === priority ? 'priority-option-selected' : ''
          }`}
        >
          <div className="flex items-center">
            <FaFlag className={getPriorityColor(priority)} />
            <span>{getPriorityText(priority)}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default PrioritySelector; 