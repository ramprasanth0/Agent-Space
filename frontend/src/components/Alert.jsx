import { useImperativeHandle, useState, useRef, useEffect, forwardRef } from "react";

const Alert = forwardRef(function Alert(_, ref) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const fadeTimeout = useRef();
  const unmountTimeout = useRef();

  useImperativeHandle(ref, () => ({
    show(msg) {
      setMessage(msg);
      setVisible(true);
      clearTimeout(fadeTimeout.current);
      clearTimeout(unmountTimeout.current);
      fadeTimeout.current = setTimeout(() => setVisible(false), 3000); // Hold 2s
      unmountTimeout.current = setTimeout(() => setMessage(""), 3500); // Fade .5s
    },
  }), []);

  useEffect(() => () => {
    clearTimeout(fadeTimeout.current);
    clearTimeout(unmountTimeout.current);
  }, []);

  if (!message) return null;

  return (
    <div
      className={
        `absolute left-1/2 -translate-x-1/2 z-50
        transition-opacity duration-500
        ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`
      }
      style={{
        top: "-2.5rem", // floats above the card, adjust as needed
        transitionProperty: "opacity",
        transitionDuration: "500ms",
        width: "fit-content",
      }}
    >
      <div role="alert" className="alert alert-info shadow-lg py-1 bg-amber-500 px-3 text-black text-sm items-center gap-2 min-h-0 rounded-md border-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 stroke-current mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
});

export default Alert;