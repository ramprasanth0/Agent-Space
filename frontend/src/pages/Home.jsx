import { useState, useEffect } from "react"
import HeroSection from "../components/HeroSection"
import MoodToggle from "../components/MoodToggle"
import InfoCard from "../components/InfoCard"
import FeedbackForm from "../components/FeedbackForm"

export default function Home({ toggleTheme }) {
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
      <header className={`
        text-5xl text-indigo-200 font-extrabold text-center drop-shadow-glow 
        pb-16 pt-10 transition-all duration-300
        ${hasStartedChat ? 'header-collapsed' : ''}`
      }>
        {/* <div className="absolute top-6 right-10">
          <MoodToggle toggleTheme={toggleTheme} />
        </div>
        <div className="absolute top-9 left-10">
          <InfoCard />
        </div> */}
        <div className="flex justify-between items-center px-4 md:px-10 mb-4">
          <InfoCard className="scale-90 md:scale-100" />
          <MoodToggle toggleTheme={toggleTheme} />
        </div>
        <h1 className="text-content-title font-minecraft text-5xl sm:text-4xl lg:text-5xl font-extrabold">
          Agent Space
        </h1>
      </header>
      <main className={`
        flex justify-center relative 
        ${hasStartedChat ? 'mt-0' : 'mt-10 sm:mt-20'}
      `}>

        <HeroSection hasStartedChat={hasStartedChat} setHasStartedChat={setHasStartedChat} />
        {/* </div> */}
      </main>

      {/* Feedback floating widget */}
      <FeedbackForm />
    </div>
  )
}
