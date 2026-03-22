import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api/axios';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';

const WELCOME = {
  id: 0,
  from: 'bot',
  text: "👋 Hi! I'm FreshBot. Ask me to find products, explore categories, or help with your cart!",
};

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [productResults, setProductResults] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setProductResults([]);

    try {
      const res = await sendChatMessage(input);
      const { response, data } = res.data;
      const botMsg = { id: Date.now() + 1, from: 'bot', text: response };
      setMessages(prev => [...prev, botMsg]);
      if (data && data.length > 0) setProductResults(data);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'bot',
        text: '⚠️ Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        id="chatbot-toggle"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow-2xl shadow-primary-900/60 flex items-center justify-center transition-all duration-300 hover:scale-110 animate-pulse-glow"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 animate-slideInRight">
          <div className="card overflow-hidden flex flex-col" style={{ height: '480px' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3 flex items-center gap-2 flex-shrink-0">
              <MdStorefront size={22} className="text-white" />
              <div>
                <h3 className="text-white font-semibold text-sm">FreshBot</h3>
                <p className="text-primary-200 text-xs">Always here to help 🌿</p>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white transition-colors">
                <FiX size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Product results */}
              {productResults.length > 0 && (
                <div className="space-y-2">
                  {productResults.map(p => (
                    <div key={p._id} className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl p-2">
                      <img src={p.image} alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{p.name}</p>
                        <p className="text-primary-400 text-xs font-bold">₹{p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-sm px-4 py-2">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-gray-800 flex gap-2 flex-shrink-0">
              <input
                id="chatbot-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="input text-sm py-2 flex-1"
                disabled={loading}
              />
              <button
                id="chatbot-send"
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary px-3 py-2 flex items-center"
              >
                <FiSend size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
