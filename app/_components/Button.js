import React from 'react'; // Explicitly import React

const Button = ({ children, className, type = "button", disabled = false, onClick }) => {
  const baseStyle = "px-6 py-3 text-lg font-medium transition-colors duration-300 focus:outline-none focus:ring focus:ring-opacity-50 rounded-md";
  // Example: default styling, can be customized via className prop
  const defaultStyle = "bg-accent-500 hover:bg-accent-600 text-primary-800 focus:ring-accent-500";
  
  // Allow custom classes to override or extend default styles
  // Ensure there's a space before appending custom className if it exists
  const combinedClassName = `${baseStyle} ${defaultStyle} ${className ? className : ''}`.trim();

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;