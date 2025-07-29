import { useEffect, useRef } from "react";

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

export default function StarField({ starCount = 120 }) {
  const ref = useRef();

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    // Remove old stars
    container.innerHTML = "";

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      const size = randomBetween(1, 6); // px
      const left = randomBetween(0, 100); // %
      const top = randomBetween(0, 100); // %
      const duration = randomBetween(8, 18); // seconds

      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.background = "white";
      star.style.borderRadius = "9999px";
      star.style.position = "absolute";
      star.style.left = `${left}%`;
      star.style.top = `${top}%`;
      star.style.opacity = randomBetween(0.4, 1);
      star.style.animation = `star-move ${duration}s linear infinite`;
      star.style.filter = "blur(0.5px)";

      container.appendChild(star);
    }
  }, [starCount]);

  return (
    <>
      <div
        ref={ref}
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          overflow: "hidden",
        }}
        aria-hidden="true"
      />
      {/* Put this in your global CSS or index.css */}
      <style>
        {`
          @keyframes star-move {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(100vh);
              opacity: 0;
            }
          }
        `}
      </style>
    </>
  );
}