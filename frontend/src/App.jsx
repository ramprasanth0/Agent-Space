// import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import StarBackground from './components/StarField/StarBackground'

export default function App() {
  return (

    //static image as background
    // <div className="min-h-screen bg-[url(./assets/background.png)] bg-cover bg-center relative overflow-hidden">


    //video clip as background

    <div className='min-h-screen relative overflow-hidden'>
      <video
        src="/assets/background_video.mp4" // place video in `public/assets/`
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover bg-black/50 z-10"
      />
      <StarBackground starCount={25} />
      <div
        className="relative z-30">
        <Home />
      </div>
    </div>
  )
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