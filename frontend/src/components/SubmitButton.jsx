import React from "react";
import submitIcon from '../assets/submit_icon.svg';

export default function SubmitButton({ loading, disabled, onClick }) {
  return (
    <div className="my-5 mr-6 flex items-center justify-center">
      <button
        className="w-full flex items-center justify-center bg-accent-content text-black rounded-xl py-2 hover:bg-secondary-content hover:text-white transition"
        onClick={onClick}
        disabled={loading || disabled}
        data-testid="inputcard-submit"
        aria-label="Submit query"
        type="button"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-black group-hover:text-white"
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
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </span>
        ) : (
          <img
            src={submitIcon}
            alt="Submit"
            className="h-8 w-8"
            data-tip="submit"
            draggable="false"
            style={{ background: 'transparent' }}
          />
        )}
      </button>
    </div>
  );
}
