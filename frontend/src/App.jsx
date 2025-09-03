import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Home from './pages/Home';
import StarBackground from './components/StarField/StarBackground';
import lightBg from "../public/assets/light.jpg";

export default function App() {
  // 'system' mode follows OS theme, 'manual' mode respects user's toggle choice
  const [mode, setMode] = useState('system');
  const [theme, setTheme] = useState('agentspace-dark');

  // On initial load, set theme from localStorage or system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode');
    const savedTheme = localStorage.getItem('theme');

    if (savedMode === 'manual' && savedTheme) {
      setMode('manual');
      setTheme(savedTheme);
      return;
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setMode('system');
    setTheme(mq.matches ? 'agentspace-dark' : 'agentspace-light');
  }, []);

  // Listen for OS theme changes, but only if in 'system' mode
  useEffect(() => {
    if (mode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      setTheme(e.matches ? 'agentspace-dark' : 'agentspace-light');
    };

    mq.addEventListener?.('change', onChange);
    mq.addListener?.(onChange); // Fallback for older Safari

    return () => {
      mq.removeEventListener?.('change', onChange);
      mq.removeListener?.(onChange);
    };
  }, [mode]);

  // Apply theme to the DOM and persist settings when they change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme-mode', mode);
    if (mode === 'manual') {
      localStorage.setItem('theme', theme);
    }
  }, [theme, mode]);

  // Memoized callbacks to prevent re-renders in child components
  const toggleTheme = useCallback(() => {
    setMode('manual'); // User interaction switches mode to manual
    setTheme((t) => (t === 'agentspace-dark' ? 'agentspace-light' : 'agentspace-dark'));
  }, []);

  const useSystemTheme = useCallback(() => {
    setMode('system');
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mq.matches ? 'agentspace-dark' : 'agentspace-light');
    localStorage.removeItem('theme'); // Clear manual choice
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Backgrounds are swapped via CSS opacity for a smooth transition without re-mounting */}
      <video
        src="/assets/background_video.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0
                   [html[data-theme='agentspace-dark']_&]:opacity-100
                   [html[data-theme='agentspace-light']_&]:opacity-0
                   transition-opacity duration-300"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center z-0
                   [html[data-theme='agentspace-dark']_&]:opacity-0
                   [html[data-theme='agentspace-light']_&]:opacity-100
                   transition-opacity duration-300"
        style={{ backgroundImage: `url(${lightBg})` }}
        aria-hidden="true"
      />

      <StarBackground starCount={25} />
      <div className="relative overflow-hidden z-30">
        <Home toggleTheme={toggleTheme} useSystemTheme={useSystemTheme} mode={mode} />
      </div>
    </div>
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