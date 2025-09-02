import { useState } from "react";

// Inline SVG components
const MailCloseIcon = () => (
  <svg className="swap-off h-10 w-10 text-content-title" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const MailOpenIcon = () => (
  <svg className="swap-on h-10 w-10 text-content-title" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z" />
  </svg>
);

export default function FeedbackForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/feedback', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: form.message }),
      });
      if (!res.ok) throw new Error("Failed to send feedback");
      alert("Feedback sent!");
      setForm({ message: "" });
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error sending feedback.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <label className="swap swap-rotate" aria-label="Toggle feedback form">
        <input
          type="checkbox"
          checked={open}
          onChange={() => setOpen(!open)}
          aria-label="Toggle feedback form"
        />

        {/* Mail closed (default) */}
        <MailCloseIcon />

        {/* Mail open (when toggled) */}
        <MailOpenIcon />
      </label>

      {open && (
        <div className="mt-3 bg-white shadow-xl rounded-lg p-4 w-72">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your Feedback"
              className="border text-black p-2 rounded"
              required
            />
            <button
              type="submit"
              disabled={sending}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
