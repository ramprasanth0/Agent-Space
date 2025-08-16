import React from "react";
import StructuredContentDisplay from "./StructuredContentDisplay";

export default function ResponseCard({ userQuestion, response, loadingModels }) {
  if (!Array.isArray(response) || response.length === 0) return null;
  const gridColsClass =
    response.length === 1 ? "grid-cols-1"
      : response.length === 2 ? "grid-cols-2"
        : response.length === 3 ? "grid-cols-3"
          : response.length === 4 ? "grid-cols-4"
            : "grid-cols-1";

  return (
    <div className={`grid ${gridColsClass} gap-4 p-6`}>
      {response.map((res, idx) => (
        <div
          key={res.provider || idx}
          className="bg-[var(--color-response_card_bg)] rounded-3xl m-2 p-3"
        >
          <div className="m-3 mb-0 font-bold text-[var(--color-tab_unselected)]">
            {res.provider}
          </div>
          <div className="m-2 mt-0 rounded-xl overflow-x-auto font-bold p-2 text-[var(--color-response_card_content)]">
            {userQuestion}
          </div>

          <div className="m-2 mt-4 rounded-xl overflow-x-auto p-2">
            {loadingModels.includes(res.provider) && !res.response ? (
              // Show skeleton only if no response yet
              <div className="space-y-2 w-full">
                <div className="skeleton bg-white h-4 w-3/4"></div>
                <div className="skeleton bg-white h-6 w-full"></div>
                <div className="skeleton bg-white h-6 w-full"></div>
              </div>
            ) : res.response ? (
              // Show structured content (works for both streaming and final)
              <StructuredContentDisplay content={res.response} />
            ) : null}
            
            {/* Show streaming indicator if still loading but has partial content */}
            {loadingModels.includes(res.provider) && res.response && (
              <div className="flex items-center gap-2 mt-2 text-sm opacity-70">
                <span className="loading loading-dots loading-xs"></span>
                <span>Generating...</span>
              </div>
            )}
          </div>
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
