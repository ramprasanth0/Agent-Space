import React, {
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";

const Alert = forwardRef(function Alert(
  { visibleDuration = 4000, fadeDuration = 500, type = "info", maxWidth = 480 } = {},
  ref
) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [kind, setKind] = useState(type);

  const fadeTimeout = useRef();
  const unmountTimeout = useRef();

  useImperativeHandle(
    ref,
    () => ({
      show(msg, opts = {}) {
        const hold = opts.visibleDuration ?? visibleDuration;
        const fade = opts.fadeDuration ?? fadeDuration;
        const nextType = opts.type ?? type;

        setKind(nextType);
        setMessage(msg);
        setVisible(true);

        if (fadeTimeout.current) window.clearTimeout(fadeTimeout.current);
        if (unmountTimeout.current) window.clearTimeout(unmountTimeout.current);

        fadeTimeout.current = window.setTimeout(() => setVisible(false), hold);
        unmountTimeout.current = window.setTimeout(() => setMessage(""), hold + fade);
      },
      hide() {
        if (fadeTimeout.current) window.clearTimeout(fadeTimeout.current);
        if (unmountTimeout.current) window.clearTimeout(unmountTimeout.current);
        setVisible(false);
        unmountTimeout.current = window.setTimeout(() => setMessage(""), fadeDuration);
      },
    }),
    [visibleDuration, fadeDuration, type]
  );

  useEffect(() => {
    return () => {
      if (fadeTimeout.current) window.clearTimeout(fadeTimeout.current);
      if (unmountTimeout.current) window.clearTimeout(unmountTimeout.current);
    };
  }, []);

  if (!message) return null;

  const tone =
    kind === "success"
      ? "bg-emerald-500 text-black"
      : kind === "error"
        ? "bg-rose-500 text-white"
        : kind === "warning"
          ? "bg-amber-500 text-black"
          : "bg-sky-500 text-black";

  const node = (
    <div
      className={`fixed left-1/2 -translate-x-1/2 transition-opacity ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        top: 16,
        zIndex: 2147483647,
        transitionProperty: "opacity",
        transitionDuration: `${fadeDuration}ms`,
        maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
      }}
      data-testid="app-alert"
    >
      <div className={`shadow-lg px-3 py-2 rounded-md border-0 text-sm flex items-center gap-2 ${tone}`}>
        <span>{message}</span>
      </div>
    </div>
  );

  return createPortal(node, document.body);
});

export default Alert;
