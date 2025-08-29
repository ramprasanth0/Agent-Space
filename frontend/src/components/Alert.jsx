// Alert.jsx  (pure JS)
import React, {
  forwardRef, useImperativeHandle, useEffect,
  useRef, useState
} from "react";
import { createPortal } from "react-dom";

const Alert = forwardRef(function Alert(
  { visibleDuration = 4000, fadeDuration = 300 } = {},
  ref
) {
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [targetRect, setTargetRect] = useState(null);

  const fadeTimer = useRef();
  const clearTimer = useRef();

  useImperativeHandle(ref, () => ({
    show(text, targetEl) {
      if (!targetEl) return;            // need a target
      setTargetRect(targetEl.getBoundingClientRect());
      setMsg(text);
      setOpen(true);

      clearTimeout(fadeTimer.current);
      clearTimeout(clearTimer.current);
      fadeTimer.current = setTimeout(() => setOpen(false), visibleDuration);
      clearTimer.current = setTimeout(() => setMsg(""), visibleDuration + fadeDuration);
    }
  }), [visibleDuration, fadeDuration]);

  useEffect(() => () => {
    clearTimeout(fadeTimer.current);
    clearTimeout(clearTimer.current);
  }, []);

  if (!msg || !targetRect) return null;

  const style = {
    position: "fixed",
    left: targetRect.left + targetRect.width / 2,
    top: targetRect.top - 40,        // 40 px above the bar
    transform: "translateX(-50%)",
    zIndex: 10_000,
    opacity: open ? 1 : 0,
    transition: `opacity ${fadeDuration}ms`,
    pointerEvents: open ? "auto" : "none"
  };

  return createPortal(
    <div style={style}>
      <div
        role="alert"
        className="alert alert-info shadow-lg py-1 bg-amber-500 px-3 text-black text-sm items-center gap-2 min-h-0 rounded-md border-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{msg}</span>
      </div>
    </div>,
    document.body
  );
});

export default Alert;
