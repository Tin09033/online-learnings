import { useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your MASTERTALK assistant. How can I help you today? Here are some things I can help with:\n\n• Course enrollment\n• Payment inquiries\n• Account issues\n• Technical support'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickReplies = [
    'How do I enroll in a course?',
    'How do I make a payment?',
    'I forgot my password',
    'How do I contact support?'
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(input);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('enroll') || lowerInput.includes('course')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'To enroll in a course:\n\n1. Browse our courses at /courses\n2. Click on a course you like\n3. Click "Enroll Now"\n4. Complete the enrollment process\n\nNeed more help? Contact us at support@mastertalk.com'
      };
    }
    
    if (lowerInput.includes('payment') || lowerInput.includes('pay')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'For payment inquiries:\n\n1. After enrollment, you\'ll receive payment instructions\n2. Upload your payment proof in the MyPortal\n3. Our admin team will verify your payment\n\nFor urgent matters, email: billing@mastertalk.com'
      };
    }
    
    if (lowerInput.includes('password') || lowerInput.includes('forgot')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'To reset your password:\n\n1. Go to the login page\n2. Click "Forgot Password"\n3. Enter your email address\n4. Check your email for reset instructions\n\nStill having issues? Contact support@mastertalk.com'
      };
    }
    
    if (lowerInput.includes('contact') || lowerInput.includes('support') || lowerInput.includes('help')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'You can reach us through:\n\n📧 Email: support@mastertalk.com\n📱 Phone: +63 XXX XXX XXXX\n⏰ Hours: Mon-Fri, 9AM-6PM\n\nWe typically respond within 24 hours!'
      };
    }

    if (lowerInput.includes('certificate') || lowerInput.includes('certification')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'To earn a certificate:\n\n1. Complete all lessons in a course\n2. Finish all quizzes and assignments\n3. Achieve 100% course completion\n\nYour certificates will be available in your profile!'
      };
    }

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Hello! Great to hear from you! 👋\n\nI\'m here to help with any questions about MASTERTALK. Feel free to ask about courses, enrollment, payments, or anything else!'
      };
    }

    return {
      id: Date.now() + 1,
      type: 'bot',
      text: 'Thanks for your message! I\'m here to help.\n\nFor specific inquiries, you can:\n• Email us at support@mastertalk.com\n• Check our FAQ section\n• Contact our support team\n\nHow else can I assist you?'
    };
  };

  const handleQuickReply = (reply) => {
    setInput(reply);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">MASTERTALK Assistant</h3>
                  <p className="text-primary-100 text-xs">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[85%] ${
                      message.type === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user'
                          ? 'bg-primary-600'
                          : 'bg-gradient-to-br from-primary-600 to-primary-700'
                      }`}
                    >
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white rounded-tr-sm'
                          : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {messages.length === 1 && (
              <div className="px-4 pb-2 bg-gray-50">
                <p className="text-xs text-gray-500 mb-2">Quick replies:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs bg-white border border-primary-200 text-primary-600 px-3 py-1.5 rounded-full hover:bg-primary-50 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-primary-500 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </motion.button>
    </>
  );
};

export default ChatBot;
