import oneLinerIcon from '../assets/bolt-icon.svg'
import conversationIcon from '../assets/conversation-icon-cropped.svg'


export default function ConversationToggle({mode,setMode}) {
  function setConversationMode(e) {
    //logic to toggle conversation mode
    setMode(e.target.checked?"conversation" : "one-liner")
  }
  return (
    <div className="ml-4">
        <label className="swap swap-rotate tooltip" data-tip="Switch mode">
            {/* this hidden checkbox controls the state */}
            <input 
                type="checkbox" 
                className="conversation-controller"
                onChange={setConversationMode}
                checked={mode === "conversation"}
            />

            {/* One-liner icon: shows when OFF */}
            <img
                src={oneLinerIcon}
                alt="One-liner Mode"
                className="swap-off h-10 w-10"
                data-tip="One-liner: Single Q/A session"
                draggable="false"
            />

            {/* Conversation image*/}
            <img
                src={conversationIcon}
                alt="Conversation Mode"
                className="swap-on h-10 w-10"
                data-tip="Conversation: Multi-turn"
                draggable="false"
            />
        </label>
    </div>
  );
}
