import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessage } from '../services/chatbotService';
import BookCard from './BookCard';

/**
 * ChatbotWidget - Enhanced chatbot with API integration
 * Features: Book search, order tracking, recommendations, FAQs
 */
const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            responseType: 'text',
            text: "👋 Hi! I'm your Book Store Assistant. Ask me about books, orders, or support!",
            quickActions: ['Search Books', 'Track Order', 'Recommendations', 'Help']
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [awaitingPhone, setAwaitingPhone] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text = inputValue) => {
        if (!text.trim() || isLoading) return;

        // Add user message
        const userMessage = { type: 'user', text: text.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const result = await sendMessage(text.trim(), phoneInput || null);

            if (result.success && result.data) {
                const response = result.data.response;

                // Check if we need phone for order tracking
                if (response.type === 'input_required' && response.inputType === 'order_id') {
                    // Extract order ID from the message if present
                    const orderIdMatch = text.match(/([a-f0-9]{24})/i);
                    if (orderIdMatch) {
                        setPendingOrderId(orderIdMatch[1]);
                        setAwaitingPhone(true);
                    }
                }

                const botMessage = {
                    type: 'bot',
                    responseType: response.type,
                    text: response.text,
                    books: response.books,
                    order: response.order,
                    orders: response.orders,
                    quickActions: response.quickActions
                };

                setMessages(prev => [...prev, botMessage]);
            } else {
                setMessages(prev => [...prev, {
                    type: 'bot',
                    responseType: 'error',
                    text: 'Sorry, I encountered an error. Please try again.',
                    quickActions: ['Help', 'Contact Support']
                }]);
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, {
                type: 'bot',
                responseType: 'error',
                text: 'Unable to connect. Please check your connection and try again.',
                quickActions: ['Try Again']
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action) => {
        const actionMap = {
            'Search Books': 'I want to search for books',
            'Track Order': 'I want to track my order',
            'Recommendations': 'recommend books',
            'Help': 'What can you help me with?',
            'Browse Categories': 'Show available categories',
            'Contact Support': 'How can I contact support?',
            'Odia Books': 'Show me Odia books',
            'English Books': 'Show me English books',
            'Browse Educational': 'Show me educational books',
            'Browse Novels': 'Show me novels',
            'More Categories': 'What categories do you have?',
            'Login': 'I need to login to see my orders',
            'Track by Order ID': 'Track order',
            'Track Another': 'Track another order',
            'Try Again': 'Hello',
            'Search Again': 'I want to search for books',
            'More Recommendations': 'recommend books',
            'FAQ': 'What are your FAQs?',
            'My Orders': 'Show my orders'
        };

        handleSend(actionMap[action] || action);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Render book card using the unified BookCard component
    const renderBookCard = (book) => (
        <BookCard
            key={book.id || book._id}
            book={{
                _id: book.id || book._id,
                title: book.title,
                author: book.author,
                image: book.coverImage || book.image,
                price: book.price,
                originalPrice: book.originalPrice,
                rating: book.rating,
                stock: book.inStock ? 1 : 0
            }}
            variant="mini"
            showAddToCart={false}
            showWishlist={false}
        />
    );

    // Render order status card
    const renderOrderCard = (order) => (
        <div className="bg-white/90 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{order.statusEmoji}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                    }`}>
                    {order.status}
                </span>
            </div>
            <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Order ID:</span> <code className="bg-gray-100 px-1 rounded text-xs">{order.id}</code></p>
                <p><span className="text-gray-500">Items:</span> {order.itemCount}</p>
                <p><span className="text-gray-500">Total:</span> <span className="font-semibold">₹{order.totalAmount}</span></p>
                {order.createdAt && (
                    <p><span className="text-gray-500">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                )}
            </div>
        </div>
    );

    // Render message content based on type
    const renderMessageContent = (msg) => {
        // User messages
        if (msg.type === 'user') {
            return <p className="whitespace-pre-wrap">{msg.text}</p>;
        }

        // Bot messages with different types
        return (
            <div className="space-y-3">
                {/* Main text */}
                {msg.text && (
                    <div className="whitespace-pre-wrap">
                        {msg.text.split('\n').map((line, i) => (
                            <p key={i} dangerouslySetInnerHTML={{
                                __html: line
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>')
                            }} />
                        ))}
                    </div>
                )}

                {/* Book list */}
                {msg.books && msg.books.length > 0 && (
                    <div className="space-y-2 mt-2">
                        {msg.books.slice(0, 3).map(renderBookCard)}
                        {msg.books.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                                +{msg.books.length - 3} more books
                            </p>
                        )}
                    </div>
                )}

                {/* Single order status */}
                {msg.order && renderOrderCard(msg.order)}

                {/* Order list */}
                {msg.orders && msg.orders.length > 0 && (
                    <div className="space-y-2">
                        {msg.orders.map((order, idx) => (
                            <div key={idx} className="bg-white/80 rounded-lg p-2 border text-sm">
                                <div className="flex justify-between items-center">
                                    <code className="text-xs bg-gray-100 px-1 rounded">{order.id.slice(-8)}...</code>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        'bg-yellow-100 text-yellow-700'
                                        }`}>{order.status}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    {order.itemCount} items • ₹{order.total} • {new Date(order.date).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-primary px-4 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl">
                                📚
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white">Book Store Assistant</h3>
                                <p className="text-xs text-white/80">
                                    {isLoading ? '⏳ Thinking...' : '🟢 Online'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${msg.type === 'user'
                                            ? 'bg-primary text-white rounded-br-md'
                                            : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                                            }`}
                                    >
                                        {renderMessageContent(msg)}
                                    </div>
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length > 0 && messages[messages.length - 1].quickActions && !isLoading && (
                            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                                <div className="flex flex-wrap gap-1.5">
                                    {messages[messages.length - 1].quickActions.slice(0, 4).map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuickAction(action)}
                                            className="px-3 py-1.5 text-xs font-medium bg-white text-gray-700 rounded-full border border-gray-200 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 border-t border-gray-100 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={isLoading ? "Please wait..." : "Type your message..."}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatbotWidget;
