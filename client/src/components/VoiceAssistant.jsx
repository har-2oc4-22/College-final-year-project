import { useState, useEffect, useRef } from 'react';
import { FiMic, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { parseSmartCart } from '../api/axios';
import toast from 'react-hot-toast';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const { cartCount, addItem } = useCart();
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setShowStatus(true);
      };

      recognition.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error !== 'no-speech') {
          toast.error(`Microphone Error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // We handle the final processing via a separate effect watching the listening state trigger
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, []);

  // Process the final transcript once listening ends natively
  useEffect(() => {
    if (!isListening && transcript && !isProcessing) {
      processVoiceCommand(transcript);
    }
  }, [isListening, transcript]);

  const toggleListen = () => {
    if (isProcessing) return; // Prevent clicking while AI is matching cart

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (!recognitionRef.current) {
        return toast.error("Your browser doesn't support the Voice API. Try Chrome!");
      }
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const processVoiceCommand = async (finalText) => {
    setIsProcessing(true);
    let addedCount = 0;

    try {
      // Send JSON with `text` key — what the backend smartListController expects
      const response = await parseSmartCart({ text: finalText });
      const items = response.data.items;

      if (!items || items.length === 0) {
        toast.error("Couldn't find any groceries matching your voice command.");
      } else {
        for (const item of items) {
          if (item.found && item.product) {
            // addItem expects a product ID string, not the whole object
            await addItem(item.product._id, item.requestedQuantity);
            addedCount++;
          }
        }
        
        if (addedCount > 0) {
          toast.success(`🎙️ Voice added ${addedCount} item${addedCount > 1 ? 's' : ''} to cart!`, {
            style: { borderRadius: '10px', background: '#1f2937', color: '#f9fafb' },
          });
        } else {
          toast.error("None of the spoken items were found in our store.");
        }
      }
    } catch (err) {
      console.error('Voice AI error:', err);
      toast.error(err.response?.data?.message || 'Voice AI Engine failed. Try again!');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setShowStatus(false);
        setTranscript('');
      }, 3000);
    }
  };

  if (!recognitionRef.current && !showStatus) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4 pointer-events-none">
      
      {/* Floating Status Card */}
      <div 
        className={`pointer-events-auto transition-all duration-300 transform origin-bottom-left ${
          showStatus ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10'
        }`}
      >
        <div className="bg-gray-900 border border-primary-500/30 rounded-2xl shadow-2xl p-4 w-64 md:w-80 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2 text-primary-400 font-bold text-sm">
            {isListening && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
            {isListening ? 'Listening...' : isProcessing ? 'AI Processing...' : 'Command Finished'}
          </div>
          <p className="text-white text-sm min-h-[40px] italic">
            {transcript || "Speak clearly: 'Add 2 apples and a milk'"}
          </p>
        </div>
      </div>

      {/* Futuristic Floating Button */}
      <button
        onClick={toggleListen}
        disabled={isProcessing}
        className={`pointer-events-auto h-16 w-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 
          ${isListening 
            ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
            : isProcessing 
              ? 'bg-primary-600 cursor-wait' 
              : 'bg-gray-800 border-2 border-primary-500 hover:bg-gray-700 hover:scale-110 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
          }
        `}
      >
        {isProcessing ? (
          <div className="animate-spin text-white">
            <FiLoader size={28} />
          </div>
        ) : isListening ? (
          <div className="relative flex items-center justify-center">
            <span className="absolute animate-ping h-full w-full rounded-full bg-white opacity-40"></span>
            <FiMic size={28} />
          </div>
        ) : (
          <FiMic size={28} className="text-primary-400 group-hover:text-white" />
        )}
      </button>

    </div>
  );
};

export default VoiceAssistant;
