// InputBox.js
import React, { useEffect, useState } from "react";

const InputBox = ({ icon, type, placeholder, value, onChange, required }) => {
  const [isFocused, setIsFocused] = useState(false);

  // Effect to keep the label "up" if there's a value
  useEffect(() => {
    if (value) {
      setIsFocused(true);
    } else {
      setIsFocused(false);
    }
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (!value) {
      setIsFocused(false);
    }
  };

  return (
    <div className="input-box relative mb-4">
      {icon && (
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        required={required}
        className="w-full p-3 pl-10 rounded-md bg-gray-700 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 " // Removed shadow effect
      />
      {/* The label disappears completely when typing starts */}
      <label
        className={`absolute left-10 transition-all duration-200 ${
          isFocused || value ? "opacity-0" : "opacity-0"
        }`}
      >
        {placeholder}
      </label>
    </div>
  );
};

export default InputBox;
