import React, { forwardRef } from "react";
import ConversationToggle from "./ConversationToggle";
import ModelSelector from "./ModelSelector";
import SubmitButton from "./SubmitButton";

const Toolbar = forwardRef(
    ({ mode, models, selectedModels, setSelectedModels,
        loading, onSubmit, onModeChange }, ref) => (
        <div ref={ref} className="flex items-center w-full">
            <ConversationToggle mode={mode} setMode={onModeChange} />
            <ModelSelector
                models={models}
                selected={selectedModels}
                setSelectedModels={setSelectedModels}
                mode={mode}
                resetMessages={() => { }}
            />
            <div className="flex-grow">
                <SubmitButton loading={loading} onClick={onSubmit} disabled={loading} />
            </div>
        </div>
    ));
export default Toolbar;
