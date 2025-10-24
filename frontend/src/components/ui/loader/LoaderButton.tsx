import React from "react";

const LoaderButton = ({ type }) => {
  const displayTextMap = {
    1: "Creating",
    2: "Updating",
    3: "Fetching",
  };

  const displayText = displayTextMap[type] || "Processing";
  return (
    <div className="flex items-center justify-center px-6 py-2 bg-gray-300 text-white rounded-md">
      <svg
        className="animate-spin h-5 w-5 mr-2 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      {displayText}...
    </div>
  );
};

export default LoaderButton;
