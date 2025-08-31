import React, { useState } from "react";
import "../styles/Chatbot.css";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I’m CourtifyBot 🤖. Ask me anything!", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const toggleChat = () => setOpen(!open);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    const botReply = getBotReply(input.toLowerCase());

    setMessages([...messages, userMsg, { text: botReply, sender: "bot" }]);
    setInput("");
  };

  const getBotReply = (msg) => {
    if (msg.includes("book"))
      return "To book a court, go to the 'Courts' page and click 'Book Now'.";
    if (msg.includes("cancel"))
      return "You can cancel bookings from the 'My Bookings' page. Refunds apply if within 24 hours.";
    if (msg.includes("payment"))
      return "We support PayPal, credit/debit cards, and XRPL crypto payments.";
    if (msg.includes("refund"))
      return "Refunds are available for cancellations within 24 hours of booking.";
    if (msg.includes("add a court"))
      return "As a Court Owner, you can add courts by going to Dashboard → 'Add New Court'.";
    if (msg.includes("delete a court"))
      return "To delete a court, go to Dashboard → 'Manage My Courts' and click the delete icon.";
    if (msg.includes("update a court") || msg.includes("edit court"))
      return "Visit 'Manage My Courts' in your dashboard to update court details.";
    if (msg.includes("edit profile") || msg.includes("update profile"))
      return "To edit your profile, click the Edit button on the sidebar.";
    if (msg.includes("hello") || msg.includes("hi"))
      return "Hello there! 👋 How can I assist you today?";
    if (msg.includes("thank"))
      return "You're welcome! 😊 Let me know if you need anything else.";
    if (msg.includes("contact") || msg.includes("help"))
      return "You can always reach us at courtify@gmail.com 📩.";

    return "Sorry, I didn’t understand that. Try asking about bookings, payments, court management, or contact courtify@gmail.com.";
  };

  return (
    <div className="chatbot-wrapper">
      <button className="chat-toggle" onClick={toggleChat}>
        {open ? "×" : "🤖"}
      </button>

      {open && (
        <div className="chatbot-container">
          <div className="chat-header">CourtifyBot</div>
          <div className="chat-window">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.sender}`}>{msg.text}</div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
