import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) => {
    const isDisabled = disabled || variant === 'disabled';

    const baseStyles = 'rounded-md font-medium transition-colors px-6 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'bg-primary hover:bg-red-700 text-white focus:ring-primary',
        disabled: 'bg-gray-400 text-gray-700 cursor-not-allowed',
    };

    const variantStyles = isDisabled ? variants.disabled : variants.primary;

    return (
        <button
            type={type}
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
            className={`${baseStyles} ${variantStyles} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
