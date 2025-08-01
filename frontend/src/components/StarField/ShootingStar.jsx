// import React, { useState, useEffect } from "react";
// function randomBetween(a, b) {
//   return Math.random() * (b - a) + a;
// }

// const DURATION = 1800; // ms

// export default function ShootingStar() {
//   const [config] = useState(() => {
//     const angle   = randomBetween(37, 47);
//     const radians = (angle * Math.PI) / 180;
//     const length  = randomBetween(10, 100);
//     const height  = randomBetween(1.2, 3.5);   // ◀️ Add this for varied thickness!
//     const startX  = randomBetween(-180, window.innerWidth * 0.6);
//     const startY  = randomBetween(10, window.innerHeight * 0.6);
//     const deltaX  = Math.cos(radians) * (window.innerWidth + 400);
//     const deltaY  = Math.sin(radians) * (window.innerWidth + 400);
//     return { startX, startY, deltaX, deltaY, angle, length, height };
//   });

//   const [style, setStyle] = useState({
//     left: config.startX,
//     top: config.startY,
//     opacity: 1
//   });

//   useEffect(() => {
//     let start = null;
//     let frame;
//     function animate(ts) {
//       if (!start) start = ts;
//       const progress = Math.min((ts - start) / DURATION, 1);
//       setStyle({
//         left: config.startX + config.deltaX * progress,
//         top:  config.startY + config.deltaY * progress,
//         opacity: 1 - progress
//       });
//       if (progress < 1) {
//         frame = requestAnimationFrame(animate);
//       }
//     }
//     frame = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(frame);
//   }, [config]);

//   return (
//     <div
//       className="shooting-star"
//       style={{
//         position: "absolute",
//         width: config.length + "px",
//         height: config.height + "px",             // ◀️ Use the varied thickness!
//         background: "linear-gradient(94deg, #5f91ff 60%, rgba(0,0,255,0) 100%)",
//         boxShadow: "0 0 14px 3px #b6e5ff99, 0 0 10px 1px #fff5",
//         borderRadius: "9999px",
//         pointerEvents: "none",
//         opacity: style.opacity,
//         left: style.left,
//         top: style.top,
//         transform: `rotate(${config.angle}deg)`,
//       }}
//     />
//   );
// }

import React, { useState, useEffect } from "react";
function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

const DURATION = 1800; // ms

export default function ShootingStar() {
  const w = typeof window !== "undefined" ? window.innerWidth : 1440;
  const h = typeof window !== "undefined" ? window.innerHeight : 900;
  const [config] = useState(() => {
    const angle = randomBetween(35, 47);
    const radians = (angle * Math.PI) / 180;
    const length = randomBetween(10, 100);
    const height = randomBetween(1.2, 3.5);
    const startX = randomBetween(-180, w * 0.6);
    const startY = randomBetween(20, h * 0.6);
    const deltaX = Math.cos(radians) * (w + 400);
    const deltaY = Math.sin(radians) * (w + 400);
    return { startX, startY, deltaX, deltaY, angle, length, height };
  });

  const [style, setStyle] = useState({
    left: config.startX,
    top: config.startY,
    opacity: 1
  });

  useEffect(() => {
    let start = null;
    let frame;
    function animate(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / DURATION, 1);
      setStyle({
        left: config.startX + config.deltaX * progress,
        top: config.startY + config.deltaY * progress,
        opacity: 1 - progress
      });
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [config]);

  return (
    <div
      className="shooting-star z-20"
      style={{
        position: "absolute",
        width: config.length + "px",
        height: config.height + "px",
        background: "linear-gradient(94deg, #5f91ff 60%, rgba(0,0,255,0) 100%)",
        boxShadow: "0 0 14px 3px #b6e5ff99, 0 0 10px 1px #fff5",
        borderRadius: "9999px",
        pointerEvents: "none",
        opacity: style.opacity,
        left: style.left,
        top: style.top,
        transform: `rotate(${config.angle}deg)`,
      }}
    />
  );
}