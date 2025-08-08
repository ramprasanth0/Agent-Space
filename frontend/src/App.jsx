import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './pages/Home';
import StarBackground from './components/StarField/StarBackground';

export default function App() {
  // Centralized theme state:
  const [theme, setTheme] = useState("agentspace-dark");

  // On mount, restore from localStorage or system preference
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved);
    } else {
      // Checks system color-scheme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? "agentspace-dark" : "agentspace-light");
    }
  }, []);

  // Keep <html data-theme> and localStorage in sync with state
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(t => t === "agentspace-dark" ? "agentspace-light" : "agentspace-dark");
  };

  const isDark = theme === "agentspace-dark";

  return (
    <>
      {isDark ? (
        // Dark theme: video background
        <div className="min-h-screen relative overflow-hidden">
          <video
            src="/assets/background_video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover bg-black/50 z-0"
            aria-hidden="true"
          />
          <StarBackground starCount={25} />
          <div className="relative z-30">
            <Home theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      ) : (
        // Light theme: static image
        <div className="min-h-screen bg-[url(./assets/light.jpg)] bg-cover bg-center relative overflow-hidden">
          <StarBackground starCount={25} />
          <div className="relative z-30">
            <Home theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      )}
    </>
  );
}


//testing
// export default function App() {
//   return <h1 className="text-3xl text-red-500 font-bold">TAILWIND?</h1>
// }



///static stars
{/* <span
  aria-hidden="true"
  className="pointer-events-none select-none absolute inset-0 z-0"
  style={{
    backgroundImage: `
      radial-gradient(white 1px, transparent 1.5px),
      radial-gradient(white 1px, transparent 1.5px)
    `,
    backgroundSize: '50px 50px, 100px 100px',
    backgroundPosition: '0 0, 25px 25px',
    opacity: 0.12,
    pointerEvents: 'none',
    zIndex: 0
  }}>
</span> */}