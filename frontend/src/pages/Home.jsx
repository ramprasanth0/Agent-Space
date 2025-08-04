import { useRef } from "react"
import HeroSection from "../components/HeroSection"
import MoodToggle from "../components/MoodToggle"
import Alert from "../components/Alert"

export default function Home() {
  const alertRef = useRef();
  return (
    <div>
      <header className="text-5xl text-indigo-200 font-extrabold text-center drop-shadow-glow mb-6 mt-5 pb-28 pt-20">
        <div className="absolute top-6 right-20">
            <MoodToggle />
        </div>
        <h1 className="text-tekhelet-900 font-minecraft text-5xl md:text-4xl lg:text-5xl font-extrabold">
          Agent Space
        </h1>
      </header>
      {/* <header className="relative mb-6 mt-5 pb-28 pt-20 w-full">
      <div className="flex justify-between items-center w-full px-20">
        <div /> {/* Empty for left space, or put a logo here */}
        {/* <MoodToggle />
      </div>
      <h1 className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-tekhelet-900 font-minecraft text-5xl md:text-4xl lg:text-5xl font-extrabold text-indigo-200 drop-shadow-glow text-center">
        Agent Space
      </h1>
    </header> */} 
      <main className="flex justify-center relative mt-20">
        <Alert ref={alertRef} />
        <HeroSection alertRef={alertRef}/>
      </main>
    </div>
  )
}
