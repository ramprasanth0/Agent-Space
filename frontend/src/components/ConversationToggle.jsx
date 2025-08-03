import oneLinerIcon from '../assets/bolt-icon.svg'
import conversationIcon from '../assets/conversation-icon-cropped.svg'


export default function ConversationToggle() {
  // DaisyUI listens to data-theme, but prefers using their dropdown/switch logic and a button:
  function setConversationMode() {
    //logic to toggle conversation mode
  }
  return (
    <div className="ml-4">
        <label className="swap swap-rotate tooltip" data-tip="Switch mode">
            {/* this hidden checkbox controls the state */}
            <input type="checkbox" className="conversation-controller"/>

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

        {/* <label className="swap swap-rotate tooltip"> */}
            {/* Checkbox controls swap state */}
            {/* <input type="checkbox" className="conversation-controller" value="" /> */}

            {/* Conversation image: shows when OFF */}
            {/* <img
                src={conversationIcon}
                alt="Conversation Mode"
                className="swap-off h-10 w-10"
                draggable="false"
            /> */}

            {/* One-liner image: shows when ON */}
            {/* <img
                src={oneLinerIcon}
                alt="One-liner Mode"
                className="swap-on h-10 w-10"
                draggable="false"
            />
        </label> */}
    </div>
  );
}
