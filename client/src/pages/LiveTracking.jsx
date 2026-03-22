import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const STAGES = [
  { stage: 'confirmed',  label: 'Order Confirmed',       icon: '✅' },
  { stage: 'processing', label: 'Being Prepared',         icon: '👨‍🍳' },
  { stage: 'picked-up',  label: 'Picked Up',              icon: '📦' },
  { stage: 'on-the-way', label: 'On the Way',             icon: '🛵' },
  { stage: 'nearby',     label: 'Arriving Soon',          icon: '📍' },
  { stage: 'delivered',  label: 'Delivered!',             icon: '🎉' },
];

const LiveTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatMsg, setChatMsg] = useState('');
  const chatEndRef = useRef(null);

  // Fetch initial snapshot
  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const { data } = await axios.get(`/tracking/${orderId}`);
        // Merge order-level fields with tracking data for easy access
        setTracking({
          ...data.order,
          deliveryTracking: data.deliveryTracking || [],
          currentStage: data.currentStage,
          percentComplete: data.percentComplete || 0,
          deliveryAgent: data.deliveryAgent || data.order?.deliveryAgent,
          status: data.order?.status,
        });
      } catch (err) {
        toast.error('Could not load tracking info.');
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [orderId]);

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;
    socket.emit('track-order', { orderId });

    socket.on('delivery-update', (update) => {
      setTracking(prev => ({
        ...prev,
        deliveryTracking: update.stages,
        currentStage: update.currentStage,
        deliveryAgent: update.deliveryAgent,
        status: update.status,
        percentComplete: Math.round((update.stages.length / STAGES.length) * 100),
      }));
      toast.success(`🛵 Update: ${update.currentStage.label}`, { icon: '📍' });
    });

    socket.on('chat-history', (history) => setMessages(history));
    socket.on('new-message', (msg) => setMessages(prev => [...prev, msg]));

    return () => {
      socket.off('delivery-update');
      socket.off('chat-history');
      socket.off('new-message');
    };
  }, [socket, orderId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openChat = () => {
    setChatOpen(true);
    if (socket) socket.emit('join-chat', { orderId, userName: user?.name || 'Customer', role: 'user' });
  };

  const sendChat = () => {
    if (!chatMsg.trim() || !socket) return;
    socket.emit('send-message', { orderId, sender: user?.name || 'Customer', role: 'user', text: chatMsg });
    setChatMsg('');
  };

  const completedStages = tracking?.deliveryTracking?.length || 0;

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-20 flex justify-center">
      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  // Order pending — admin hasn't approved yet
  if (tracking?.status === 'pending' || (tracking?.deliveryTracking?.length === 0 && tracking?.status !== 'delivered')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fadeInUp">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors text-sm">
          ← Back to My Orders
        </button>
        <div className="card p-10 flex flex-col items-center gap-5">
          <div className="w-20 h-20 bg-yellow-900/30 border border-yellow-700/40 rounded-full flex items-center justify-center text-4xl animate-bounce">
            🛒
          </div>
          <h2 className="text-2xl font-bold text-white">Order Received!</h2>
          <p className="text-gray-400 text-center max-w-sm">
            Your order has been placed successfully. Our team is reviewing it and will start preparing it shortly.
          </p>

          {/* Status steps (static preview) */}
          <div className="w-full mt-4 space-y-3">
            {[
              { icon: '✅', label: 'Order Placed',     done: true  },
              { icon: '👨‍🍳', label: 'Being Prepared', done: false },
              { icon: '🛵', label: 'Out for Delivery', done: false },
              { icon: '🎉', label: 'Delivered',         done: false },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                s.done ? 'bg-primary-900/20 border-primary-800 text-white' : 'bg-gray-900/40 border-gray-800 text-gray-600'
              }`}>
                <span className="text-lg">{s.icon}</span>
                <span className="font-semibold text-sm">{s.label}</span>
                {s.done && <span className="ml-auto text-primary-500 text-xs font-bold">✓ Complete</span>}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-600 mt-2">This page will update automatically when your order is processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm">
        ← Back
      </button>

      <h1 className="text-3xl font-extrabold text-white mb-2">Live Order Tracking</h1>
      <p className="text-gray-500 text-sm mb-8 font-mono">Order #{orderId}</p>

      {/* Progress Bar */}
      <div className="card p-6 mb-6 animate-fadeInUp">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-400 font-medium">Delivery Progress</span>
          <span className="text-primary-400 font-bold text-sm">{tracking?.percentComplete || 0}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 mb-6 overflow-hidden">
          <div
            className="h-3 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
            style={{ width: `${tracking?.percentComplete || 0}%` }}
          />
        </div>

        {/* Stage Timeline */}
        <div className="relative">
          {STAGES.map((stage, idx) => {
            const isDone = idx < completedStages;
            const isActive = idx === completedStages - 1;
            return (
              <div key={stage.stage} className="flex items-start gap-4 mb-5 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500 ${
                    isDone
                      ? isActive
                        ? 'border-primary-500 bg-primary-900/50 shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-110'
                        : 'border-primary-700 bg-primary-900/30'
                      : 'border-gray-700 bg-gray-900/50 opacity-40'
                  }`}>
                    {stage.icon}
                  </div>
                  {idx < STAGES.length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 transition-all duration-500 ${idx < completedStages - 1 ? 'bg-primary-700' : 'bg-gray-800'}`} />
                  )}
                </div>
                <div className="pt-1.5">
                  <p className={`font-semibold text-sm ${isDone ? 'text-white' : 'text-gray-600'}`}>{stage.label}</p>
                  {isDone && tracking?.deliveryTracking?.[idx]?.completedAt && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(tracking.deliveryTracking[idx].completedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Agent Card */}
      {tracking?.deliveryAgent?.name && (
        <div className="card p-5 mb-6 animate-fadeInUp flex items-center gap-4">
          <img
            src={tracking.deliveryAgent.avatar || `https://i.pravatar.cc/80?u=${orderId}`}
            alt="Agent"
            className="w-14 h-14 rounded-full border-2 border-primary-500 object-cover"
          />
          <div className="flex-1">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Your Delivery Agent</p>
            <p className="text-white font-bold text-lg">{tracking.deliveryAgent.name}</p>
            <p className="text-primary-400 text-sm font-mono">{tracking.deliveryAgent.phone}</p>
          </div>
          <a
            href={`tel:${tracking.deliveryAgent.phone}`}
            className="w-12 h-12 bg-primary-600 hover:bg-primary-500 text-white rounded-full flex items-center justify-center text-xl transition-all active:scale-95 shadow-lg shadow-primary-900/30"
          >
            📞
          </a>
        </div>
      )}

      {/* Chat with Support Button */}
      <button
        onClick={openChat}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-lg rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-3"
      >
        <span className="text-2xl">💬</span> Chat with Support
      </button>

      {/* Live Chat Drawer */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setChatOpen(false)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-slideInUp">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gradient-to-r from-blue-900/30 to-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center text-lg">🎧</div>
                <div>
                  <p className="text-white font-bold">FreshMart Support</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-green-400 text-xs font-medium">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-gray-500 hover:text-white text-2xl">×</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8 text-sm">Connecting to support...</div>
              ) : messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'system' ? (
                    <p className="text-xs text-gray-600 border border-gray-800 px-3 py-1 rounded-full">{msg.text}</p>
                  ) : (
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                    }`}>
                      {msg.role !== 'user' && <p className="text-xs text-gray-500 mb-1 font-semibold">{msg.sender}</p>}
                      {msg.text}
                      <p className="text-[10px] opacity-60 mt-1 text-right">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 flex gap-3">
              <input
                type="text"
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={sendChat}
                disabled={!chatMsg.trim()}
                className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center text-xl transition-all active:scale-95 disabled:opacity-40"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracking;
