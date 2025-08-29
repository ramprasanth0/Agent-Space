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
    <div style={style}
      className="bg-amber-500 text-black text-sm px-3 py-1 rounded-md shadow-lg"
      role="alert">
      {msg}
    </div>,
    document.body
  );
});

export default Alert;
