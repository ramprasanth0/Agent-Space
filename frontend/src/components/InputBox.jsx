export default function InputBox({input,loading,setInput,handleClick}){
    return(
        <div className="p-6 w-full">
            <label className="text-thistle-600 flex items-center font-medium gap-2 mb-4">
                <div className="shrink-0">
                    Your Unhinged Queries:
                </div>
                <input className="bg-black text-white px-3 block py-2 border border-none rounded-2xl bg-center focus:outline-none focus:ring-4 focus:ring-purple-800 transition"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={loading}
                    placeholder="Is gravity fake?"
                />
            </label>
            <button
                className="mt-4 w-full bg-thistle text-night rounded-full py-2 hover:bg-thistle-100 hover:text-white transition"
                onClick={handleClick}
                disabled={loading || !input.trim()}
            >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Loading...
                    </span>
                ) : "Go!"}
            </button>
        </div>
    );
}