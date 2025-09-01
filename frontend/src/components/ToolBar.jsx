import React, { forwardRef } from "react";
import ConversationToggle from "./ConversationToggle";
import ModelSelector from "./ModelSelector";
import SubmitButton from "./SubmitButton";

/**
 * Toolbar — lightweight, no runtime prop-type package.
 * Defaults are provided so caller mistakes won't throw.
 */
const Toolbar = forwardRef(function Toolbar(
  {
    mode = "one-liner",
    onModeChange = () => {},
    models = [],
    selected = [],
    setSelected = () => {},
    resetMessages = () => {},
    loading = false,
    disabled = false,
    onSubmit = () => {}
  },
  ref
) {
  return (
    <div ref={ref} className="flex items-center w-full">
      <ConversationToggle mode={mode} setMode={onModeChange} />

      <ModelSelector
        models={models}
        selected={selected}
        setSelectedModels={setSelected}
        mode={mode}
        resetMessages={resetMessages}
      />

      <div className="flex-grow">
        <SubmitButton loading={loading} disabled={disabled} onClick={onSubmit} />
      </div>
    </div>
  );
});

Toolbar.displayName = "Toolbar";

export default React.memo(Toolbar);
