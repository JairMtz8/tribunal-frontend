// src/components/common/Input.jsx
import { forwardRef } from 'react';
import { handleUppercaseInput } from '../../utils/textTransform';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  uppercase = true,  // Por defecto convertir a mayúsculas
  className = '',
  type = 'text',
  ...props
}, ref) => {
  // Aplicar transformación solo a inputs de texto (no a email, date, etc.)
  const shouldTransform = uppercase && (type === 'text' || type === 'tel');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <input
          ref={ref}
          type={type}
          onInput={shouldTransform ? handleUppercaseInput : undefined}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
            ${shouldTransform ? 'uppercase' : ''}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
