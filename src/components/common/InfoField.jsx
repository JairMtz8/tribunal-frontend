// src/components/common/InfoField.jsx
const InfoField = ({ label, value, className = '' }) => {
  const isEmpty = value === null || value === undefined || value === '';

  return (
    <div className={className}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900">
        {isEmpty ? (
          <span className="text-gray-400 italic">N/A</span>
        ) : (
          value
        )}
      </p>
    </div>
  );
};

export default InfoField;
