import React, { useState } from "react";

// Utility for random numbers
function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

function Star() {
  const makeStar = () => {
    const rand = Math.random();
    let color;
    if (rand < 0.05) {
      color = "#60a6ff";        // rare blue
    } else if (rand < 0.20) {
      // color = "black";          // sometimes black
    } else {
      color = "white";          // mostly white
    }
    return {
      top: randomBetween(0, 50),
      left: randomBetween(0, 100),
      size: randomBetween(1.5, 7),
      color,
      blur: Math.random() < 0.15 ? "blur(2px)" : "none",
      duration: randomBetween(5, 14),
      delay: randomBetween(0, 2),
      maxOpacity: randomBetween(0.85, 1)
    };
  };

  const [star, setStar] = React.useState(makeStar);

  function respawn() {
    setStar(makeStar());
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
        filter: star.blur,
        pointerEvents: "none",
        animation: `star-twinkle ${star.duration}s linear ${star.delay}s infinite`
      }}
      onAnimationIteration={respawn}
    />
  );
}

// Main starfield
export default function StarField({ starCount=5 }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ overflow: "hidden" }}
        aria-hidden="true"
      >
        {Array.from({ length: starCount }).map((_, i) => <Star key={i} />)}
      </div>
      <style>{`
        @keyframes star-twinkle {
          0%   { opacity: 0; filter: blur(1px);}
          15%  { opacity: 0.85; filter: blur(0px);}
          30%  { opacity: 1; filter: blur(0.5px) drop-shadow(0 0 8px #fff);}
          60%  { opacity: 0.10; filter: blur(2.5px);}
          90%  { opacity: 1; filter: blur(1px);}
          100% { opacity: 0; filter: blur(0.8px);}
        }
      `}</style>
    </>
  );
}