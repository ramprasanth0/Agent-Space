export default function ResponseCard({ response }) {
  if (!Array.isArray(response) || response.length === 0) return null;

  if (response.length === 1) {
    // Single agent: center, not grid, can stretch wider if desired
    const res = response[0];
    return (
      <div className="">
        <div
          className="bg-english-violet-600 text-night m-6 rounded-3xl p-6"
        >
          <div className="font-bold mb-2">{res.provider}</div>
          <div>{res.response}</div>
        </div>
      </div>
    );
  }

  const gridColsClass =
    response.length === 2
      ? "grid-cols-2"
      : response.length === 3
      ? "grid-cols-3"
      : response.length === 4
      ? "grid-cols-4"
      : "grid-cols-1";

  return (
    <div className={`grid ${gridColsClass} gap-4 p-6`}>
      {response.map((res, idx) => (
        <div
          key={res.provider || idx}
          className="bg-english-violet-600 text-night rounded-3xl p-3"
        >
          <div className="font-bold mb-2">{res.provider}</div>
          <div className="m-2">{res.response}</div>
        </div>
      ))}
    </div>
  );
}



//static response card
// export default function ResponseCard({response}){
//     return(
//         <div>
//             {Array.isArray(response) ? (
//                 <div className="flex flex-wrap gap-4 justify-center">
//                     {response.map((res, idx) => (
//                         <div key={res.provider || idx} className="bg-english-violet-600 text-night shadow-md rounded-3xl mt-3 m-3 p-6 pt max-w-md w-full">
//                             <div className="font-bold mb-2">{res.provider}</div>
//                             {res.response}
//                         </div>
//                     ))}
//                 </div>
//             ) : response && (
//                 <div className="bg-english-violet-600 text-night shadow-md rounded-3xl mt-3 m-3 p-6 pt max-w-md w-full">{response}</div>
//         )}
//         </div>
//     );

// }
