import React, { useState, useEffect } from "react";
// import ShootingStar from "./ShootingStar";
// import StarField from "./StarField";

// export default function StarBackground({ starCount}) {
//   // Shooting star timer state
//   const [shootingStars, setShootingStars] = useState([]);
//   useEffect(() => {
//     let running = true;
//     function spawnStar() {
//       if (!running) return;
//       setShootingStars(arr => [...arr, Date.now() + Math.random()]);
//       // 8-24 seconds between streaks
//       setTimeout(spawnStar, Math.random() * 16000 + 8000);
//     }
//     spawnStar();
//     return () => { running = false; };
//   }, []);
//   useEffect(() => {
//     if (shootingStars.length === 0) return;
//     const timeout = setTimeout(
//       () => setShootingStars(arr => arr.slice(1)), 2400 // match your shooting star's duration
//     );
//     return () => clearTimeout(timeout);
//   }, [shootingStars]);

//   return (
//     <>
//       {/* NO gradient, just plain dark night sky */}
//       <div className="starfield-bg" />
//       <div
//         className="pointer-events-none absolute inset-0 z-0"
//         style={{ overflow: "hidden" }}
//         aria-hidden="true"
//       >
//         {/* Stable twinkling stars */}
//         {Array.from({ length: starCount }).map((_, i) =>
//           <StarField key={i} />
//         )}
//         {/* Rare shooting stars */}
//         {shootingStars.map(key => <ShootingStar key={key} />)}
//       </div>
//       <style>{`
//         .starfield-bg {
//           position: fixed;
//           inset: 0;
//           width: 100vw;
//           height: 100vh;
//           background: #140d21; /* Or 'black', to your taste */
//           z-index: -1;
//         }
//         @keyframes star-twinkle {
//           0%   { opacity: 0;    filter: blur(1px);}
//           15%  { opacity: 0.85; filter: blur(0);}
//           25%  { opacity: 1;    filter: blur(0) drop-shadow(0 0 6px #fff);}
//           50%  { opacity: 0.25; filter: blur(2px);}
//           75%  { opacity: 1;    filter: blur(.5px);}
//           100% { opacity: 0;    filter: blur(1.5px);}
//         }
//       `}</style>
//     </>
//   );
// }

import StarField from "./StarField";
import ShootingStar from "./ShootingStar";

export default function StarBackground({ starCount = 5 }) {
  const [shootingStars, setShootingStars] = useState([]);
  useEffect(() => {
    let running = true;
    function spawnStar() {
      if (!running) return;
      setShootingStars(arr => [...arr, Date.now() + Math.random()]);
      setTimeout(spawnStar, Math.random() * 16000 + 8000);
    }
    spawnStar();
    return () => { running = false; };
  }, []);
  useEffect(() => {
    if (shootingStars.length === 0) return;
    const timeout = setTimeout(
      () => setShootingStars(arr => arr.slice(1)), 2400
    );
    return () => clearTimeout(timeout);
  }, [shootingStars]);

  return (
    <>
      <div className="starfield-bg" />
      <StarField starCount={starCount} />
      {shootingStars.map(key => <ShootingStar key={key} />)}
      <style>{`
        .starfield-bg {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: #140d21;
          z-index: -1;
        }
      `}</style>
    </>
  );
}