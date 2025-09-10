
export const logToBackend = async (level, message, extra = {}) => {
  try {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/frontend-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, message, extra }),
    });
  } catch (err) {
    console.error("Failed to send frontend log to backend", err);
  }
};
