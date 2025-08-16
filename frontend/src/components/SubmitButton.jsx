import React from "react";

export default function SubmitButton({ loading, disabled, onClick }) {
  return (
    <div className="flex-grow mr-4">
      <button
        className="w-full bg-secondary text-black rounded-full py-2 hover:bg-secondary-content hover:text-white transition"
        onClick={onClick}
        disabled={loading || disabled}
        data-testid="inputcard-submit"
        aria-label="Submit query"
        type="button"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          "Go!"
        )}
      </button>
    </div>
  );
}
