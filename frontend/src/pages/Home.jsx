import UserInput from "../components/UserInput"

export default function Home(){
    return (
    <div>
      <header className="text-5xl text-indigo-200 font-extrabold text-center drop-shadow-glow mb-6 pb-28 pt-20">
        <h1 className="text-lavenderfloral font-minecraft text-5xl md:text-4xl lg:text-5xl font-extrabold">
          Agent Space
        </h1>
      </header>
      <main className="flex justify-center">
        <UserInput />
      </main>
    </div>
    )
}
