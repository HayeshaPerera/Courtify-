import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hi! I'm CourtifyBot 🤖. Ask me anything about court bookings, payments, or account management!", 
      sender: "bot",
      timestamp: new Date().toLocaleTimeString()
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "How to book a court?",
    "Payment methods",
    "Cancel booking",
    "Add new court"
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const messagesEndRef = useRef(null);
  const { userDetails } = useSelector((state) => state.user);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setOpen(!open);
    if (!open) {
      // Welcome message with user's name if available
      const welcomeMsg = userDetails?.Name 
        ? `Welcome back, ${userDetails.Name}! 👋 How can I help you today?`
        : "Hi there! 👋 How can I assist you with Courtify today?";
      
      if (messages.length === 1) {
        setMessages(prev => [...prev, {
          text: welcomeMsg,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    }
  };

  const simulateTyping = () => {
    setIsTyping(true);
    return new Promise(resolve => {
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, Math.random() * 1000 + 500); // Random delay 500-1500ms
    });
  };

  const handleSend = async (messageText = null) => {
    const messageToSend = messageText || input;
    if (!messageToSend.trim()) return;

    const userMsg = { 
      text: messageToSend, 
      sender: "user",
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setShowSuggestions(false);
    
    await simulateTyping();
    
    const botReply = getBotReply(messageToSend.toLowerCase());
    setMessages(prev => [...prev, { 
      text: botReply, 
      sender: "bot",
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const getBotReply = (msg) => {
    const userName = userDetails?.Name ? ` ${userDetails.Name}` : "";
    
    // Enhanced responses with more context
    if (msg.includes("book") && msg.includes("court")) {
      return `To book a court${userName}:\n1. Go to the 'Courts' page\n2. Browse available courts\n3. Select your preferred date & time\n4. Click 'Book Now'\n5. Complete payment\n\n💡 Tip: Book early for better availability!`;
    }
    
    if (msg.includes("cancel") && msg.includes("booking")) {
      return `To cancel a booking${userName}:\n1. Visit 'My Bookings' page\n2. Find your booking\n3. Click 'Cancel'\n4. Confirm cancellation\n\n⚠️ Note: Refunds apply only within 24 hours of booking.`;
    }
    
    if (msg.includes("payment") || msg.includes("pay")) {
      return `We accept multiple payment methods${userName}:\n💳 Credit/Debit Cards\n💰 PayPal\n🚀 XRPL Cryptocurrency\n\n🔒 All payments are secure and encrypted!`;
    }
    
    if (msg.includes("refund")) {
      return `Refund Policy${userName}:\n✅ Full refund within 24 hours\n⏰ 50% refund within 48 hours\n❌ No refund after 48 hours\n\n📧 Contact support for special circumstances.`;
    }
    
    if (msg.includes("add") && (msg.includes("court") || msg.includes("new"))) {
      if (userDetails?.UserRole === "CourtOwner") {
        return `To add a new court${userName}:\n1. Go to Dashboard\n2. Click 'Add New Court'\n3. Fill in court details\n4. Upload images\n5. Set pricing & availability\n6. Submit for approval\n\n📸 High-quality images get more bookings!`;
      } else {
        return `To become a Court Owner${userName}:\n1. Contact our support team\n2. Provide venue details\n3. Complete verification\n4. Start listing your courts!\n\n📧 Email: courtify@gmail.com`;
      }
    }
    
    if (msg.includes("delete") && msg.includes("court")) {
      return `To delete a court${userName}:\n1. Go to 'Manage My Courts'\n2. Find the court to delete\n3. Click the delete (🗑️) button\n4. Select deletion reason\n5. Confirm deletion\n\n⚠️ This action cannot be undone!`;
    }
    
    if (msg.includes("update") || msg.includes("edit")) {
      if (msg.includes("court")) {
        return `To update court details${userName}:\n1. Visit 'Manage My Courts'\n2. Click 'Edit' on desired court\n3. Update information\n4. Save changes\n\n💡 Keep information up-to-date for better bookings!`;
      } else if (msg.includes("profile")) {
        return `To edit your profile${userName}:\n1. Click your profile icon\n2. Select 'Edit Profile'\n3. Update your information\n4. Save changes\n\n👤 Complete profiles build trust!`;
      }
    }
    
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
      const greetings = [
        `Hello${userName}! 👋 Ready to find the perfect court?`,
        `Hi there${userName}! 🎾 What can I help you with today?`,
        `Hey${userName}! 🏀 Looking to book or manage courts?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    if (msg.includes("thank")) {
      const responses = [
        `You're very welcome${userName}! 😊 Happy to help anytime!`,
        `My pleasure${userName}! 🤖 That's what I'm here for!`,
        `Glad I could help${userName}! 🎯 Enjoy your court time!`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (msg.includes("contact") || msg.includes("help") || msg.includes("support")) {
      return `Need human support${userName}? 🤝\n\n📧 Email: courtify@gmail.com\n📱 Phone: +1-800-COURTIFY\n💬 Live Chat: Available 9 AM - 6 PM\n🌐 Help Center: courtify.com/help\n\nWe typically respond within 2 hours!`;
    }
    
    if (msg.includes("price") || msg.includes("cost") || msg.includes("fee")) {
      return `Court pricing varies${userName}:\n🏸 Badminton: $8-15/hour\n🎾 Tennis: $15-25/hour\n⚽ Futsal: $20-30/hour\n🏀 Basketball: $25-35/hour\n\n💰 Prices depend on location, facilities, and peak hours!`;
    }
    
    if (msg.includes("time") || msg.includes("hours") || msg.includes("available")) {
      return `Court availability${userName}:\n🌅 Peak Hours: 6-9 AM, 5-9 PM\n💰 Higher rates during peak times\n⏰ Most courts: 6 AM - 10 PM\n📅 Book 2-7 days in advance for best slots\n\n🔍 Check specific court pages for exact hours!`;
    }

    if (msg.includes("location") || msg.includes("where") || msg.includes("near")) {
      return `Finding courts near you${userName}:\n📍 Use location filter on Courts page\n🗺️ Map view shows nearby options\n📱 Enable location services for accuracy\n🚗 Distance shown for each court\n\n🔍 Search by area name or zip code!`;
    }

    // Fallback with suggestions
    return `I didn't quite catch that${userName}. 🤔\n\nTry asking about:\n• Court bookings & cancellations\n• Payment methods & refunds\n• Adding or managing courts\n• Pricing & availability\n• Account settings\n\n📧 Or contact courtify@gmail.com for complex queries!`;
  };

  const quickActions = [
    { text: "📅 How to book?", action: "How to book a court?" },
    { text: "💳 Payments", action: "What payment methods do you accept?" },
    { text: "❌ Cancel booking", action: "How to cancel booking?" },
    { text: "🏟️ Add court", action: "How to add a new court?" },
    { text: "💰 Pricing", action: "What are the court prices?" },
    { text: "📞 Contact", action: "How to contact support?" }
  ];

  return (
    <div className="chatbot-wrapper">
      <button className="chat-toggle" onClick={toggleChat}>
        {open ? "×" : "🤖"}
        {!open && <span className="chat-badge">💬</span>}
      </button>

      {open && (
        <div className="chatbot-container">
          <div className="chat-header">
            <div className="header-content">
              <span className="bot-avatar">🤖</span>
              <div>
                <div className="bot-name">CourtifyBot</div>
                <div className="bot-status">
                  {isTyping ? "Typing..." : "Online"}
                </div>
              </div>
            </div>
            <button className="minimize-btn" onClick={toggleChat}>−</button>
          </div>
          
          <div className="chat-window">
            {messages.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.sender}`}>
                <div className={`message ${msg.sender}`}>
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{msg.timestamp}</div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message-wrapper bot">
                <div className="message bot typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            {showSuggestions && (
              <div className="suggestions">
                <div className="suggestions-title">Quick actions:</div>
                <div className="suggestions-grid">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      className="suggestion-btn"
                      onClick={() => handleSuggestionClick(action.action)}
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              onFocus={() => setShowSuggestions(false)}
            />
            <button 
              onClick={() => handleSend()} 
              disabled={!input.trim()}
              className="send-btn"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .chatbot-wrapper {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chat-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2ed573 0%, #1e7e34 100%);
          color: white;
          border: none;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .chat-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0,0,0,0.2);
        }

        .chat-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .chatbot-container {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .chat-header {
          background: linear-gradient(135deg, #2ed573 0%, #1e7e34 100%);
          color: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bot-avatar {
          font-size: 24px;
        }

        .bot-name {
          font-weight: 600;
          font-size: 16px;
        }

        .bot-status {
          font-size: 12px;
          opacity: 0.8;
        }

        .minimize-btn {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .minimize-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .chat-window {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          background: #f8f9fa;
        }

        .message-wrapper {
          margin-bottom: 15px;
          display: flex;
        }

        .message-wrapper.user {
          justify-content: flex-end;
        }

        .message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
          word-wrap: break-word;
          white-space: pre-line;
        }

        .message.bot {
          background: white;
          color: #333;
          border: 1px solid #e9ecef;
          margin-right: auto;
        }

        .message.user {
          background: linear-gradient(135deg, #2ed573 0%, #1e7e34 100%);
          color: white;
          margin-left: auto;
        }

        .message-text {
          line-height: 1.4;
        }

        .message-time {
          font-size: 10px;
          opacity: 0.6;
          margin-top: 4px;
          text-align: right;
        }

        .message.bot .message-time {
          text-align: left;
        }

        .typing {
          padding: 12px 16px !important;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #999;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .suggestions {
          margin-top: 10px;
          padding: 15px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .suggestions-title {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .suggestions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .suggestion-btn {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 20px;
          padding: 8px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .suggestion-btn:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }

        .chat-input {
          padding: 15px;
          background: white;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 10px;
        }

        .chat-input input {
          flex: 1;
          border: 1px solid #e9ecef;
          border-radius: 25px;
          padding: 12px 16px;
          outline: none;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .chat-input input:focus {
          border-color: #2ed573;
        }

        .send-btn {
          background: linear-gradient(135deg, #2ed573 0%, #1e7e34 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 16px;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .chatbot-container {
            width: 90vw;
            height: 70vh;
            right: 5vw;
          }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
