import { useRef, useState, useEffect } from "react"
import HeroSection from "../components/HeroSection"
import MoodToggle from "../components/MoodToggle"
import Alert from "../components/Alert"
import InfoCard from "../components/InfoCard"

export default function Home({ toggleTheme }) {
  const alertRef = useRef();
  const [hasStartedChat, setHasStartedChat] = useState(false);

  useEffect(() => {
    if (hasStartedChat) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [hasStartedChat]);
  return (
    <div>
      {/* <header className="relative text-5xl text-indigo-200 font-extrabold text-center drop-shadow-glow mb-6 mt-5 pb-28 pt-20"> */}
      <header className={`text-5xl text-indigo-200 font-extrabold text-center drop-shadow-glow pb-28 pt-20 transition-all duration-300 
                        ${hasStartedChat ? 'header-collapsed' : ''}`}>
        <div className="absolute top-6 right-10">
          <MoodToggle toggleTheme={toggleTheme} />
        </div>
        <div className="absolute top-9 left-10">
          <InfoCard />
        </div>
        <h1 className="text-content-title font-minecraft text-5xl md:text-4xl lg:text-5xl font-extrabold">
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
      <main
        className={`flex justify-center relative ${hasStartedChat ? 'mt-0' : 'mt-20'}`}
      >
        <Alert ref={alertRef} />
        <HeroSection alertRef={alertRef} setHasStartedChat={setHasStartedChat} />
        {/* </div> */}
      </main>
    </div>
  )
}
