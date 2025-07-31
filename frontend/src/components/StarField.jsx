import { useEffect, useRef, useState } from "react";

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

//Twinkling StarField

function Star({ box, id }) {
  const [star, setStar] = useState({
    top: randomBetween(0, 100),
    left: randomBetween(0, 100),
    size: randomBetween(1.5, 7),
    duration: randomBetween(5, 14),
    delay: randomBetween(-4, 0),
    maxOpacity: randomBetween(0.85, 1),
    color: Math.random() < 0.2 ? "black" : "white", // rare blue star
    blur: Math.random() < 0.2 ? "blur(2.5px)" : "none"
  });

  function respawn() {
    setStar({
      top: randomBetween(0, 100),
      left: randomBetween(0, 100),
      size: randomBetween(1.5, 7),
      duration: randomBetween(5, 14),
      delay: 0,
      maxOpacity: randomBetween(0.85, 1),
      color: Math.random() < 0.1 ? "#60a6ff" : "white",
      blur: Math.random() < 0.2 ? "blur(2.5px)" : "none"
    });
  }

  return (
    <div
      style={{
        width: star.size + "px",
        height: star.size + "px",
        background: star.color,
        position: "absolute",
        borderRadius: "50%",
        left: star.left + "%",
        top: star.top + "%",
        opacity: star.maxOpacity,
        animationName: "star-twinkle",
        animationDuration: `${star.duration}s`,
        animationDelay: `${star.delay}s`,
        animationIterationCount: "infinite",
        filter: star.blur,
        pointerEvents: "none"
      }}
      onAnimationIteration={respawn}
    />
  );
}

export default function StarField({ starCount = 50 }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ overflow: "hidden" }}
        aria-hidden="true"
      >
        {Array.from({ length: starCount }).map((_, i) => (
          <Star key={i} id={i} box={null} />
        ))}
      </div>
      <style>
        {`
          @keyframes star-twinkle {
            0%   { opacity: 0;   filter: blur(1px); }
            15%  { opacity: 0.85; filter: blur(0px);}
            20%  { opacity: 1;   filter: blur(0) drop-shadow(0 0 10px #fff); }
            50%  { opacity: .25; filter: blur(2px);}
            80%  { opacity: 1;   filter: blur(.5px);}
            100% { opacity: 0;   filter: blur(1.5px);}
          }
        `}
      </style>
    </>
  );
}



//Falling StarField
// export default function StarField({ starCount = 120 }) {
//   const ref = useRef();

//   useEffect(() => {
//     const container = ref.current;
//     if (!container) return;
//     // Remove old stars
//     container.innerHTML = "";

//     for (let i = 0; i < starCount; i++) {
//       const star = document.createElement("div");
//       const size = randomBetween(1, 10); // px
//       const left = randomBetween(0, 100); // %
//       const top = randomBetween(0, 100); // %
//       const duration = randomBetween(8, 18); // seconds

//       star.style.width = `${size}px`;
//       star.style.height = `${size}px`;
//       star.style.background = "grey";
//       star.style.borderRadius = "9999px";
//       star.style.position = "absolute";
//       star.style.left = `${left}%`;
//       star.style.top = `${top}%`;
//       star.style.opacity = randomBetween(0.4, 1);
//       star.style.animation = `star-move ${duration}s linear infinite`;
//       star.style.filter = "blur(0.5px)";

//       container.appendChild(star);
//     }
//   }, [starCount]);

//   return (
//     <>
//       <div
//         ref={ref}
//         className="pointer-events-none absolute inset-0 z-0"
//         style={{
//           overflow: "hidden",
//         }}
//         aria-hidden="true"
//       />
//       {/* Put this in your global CSS or index.css */}
//       <style>
//         {`
//           @keyframes star-move {
//             0% {
//               transform: translateY(0);
//               opacity: 1;
//             }
//             90% {
//               opacity: 1;
//             }
//             100% {
//               transform: translateY(100vh);
//               opacity: 0;
//             }
//           }
//         `}
//       </style>
//     </>
//   );
// }
