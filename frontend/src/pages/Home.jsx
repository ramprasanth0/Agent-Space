import UserInput from "../components/UserInput"

export default function Home(){
    return (
    <div className="min-h-screen">
      <header className="pt-10 pb-64 flex justify-center">
        <h1 className="text-4xl md:text-4xl lg:text-5xl font-extrabold text-indigo-700">Agent Space</h1>
      </header>
      <main className="flex justify-center">
        <UserInput />
      </main>
    </div>
    )
}
