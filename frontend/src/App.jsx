// import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import StarField from './components/StarField'

export default function App() {
    return (
      <div className="min-h-screen bg-galaxy-violet relative overflow-hidden">
        <StarField starCount={150}/>
        <Home/>
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