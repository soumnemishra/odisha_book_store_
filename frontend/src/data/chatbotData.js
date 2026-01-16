// FAQ data for the chatbot
// Triggers are keywords that will match user input
// Response is what the bot will reply with

export const faqData = [
    {
        id: 'shipping',
        triggers: ['shipping', 'delivery', 'ship', 'deliver', 'courier', 'days'],
        question: 'Shipping & Delivery',
        response: '🚚 We offer **free shipping** on orders over ₹500. Standard delivery takes 3-5 business days. Express delivery (1-2 days) is available for ₹99 extra.',
    },
    {
        id: 'returns',
        triggers: ['return', 'refund', 'exchange', 'money back', 'cancel'],
        question: 'Returns & Refunds',
        response: '↩️ We have a **7-day return policy**. Books must be in original condition. Refunds are processed within 5-7 business days after we receive the return.',
    },
    {
        id: 'payment',
        triggers: ['payment', 'pay', 'cod', 'cash', 'upi', 'card', 'debit', 'credit'],
        question: 'Payment Options',
        response: '💳 We accept **all major cards**, UPI, Net Banking, and **Cash on Delivery (COD)**. All transactions are 100% secure.',
    },
    {
        id: 'categories',
        triggers: ['category', 'genre', 'types', 'what books', 'kind of books'],
        question: 'Book Categories',
        response: '📚 We have **Educational, Novels, Poetry, Biography, Travel, History, Childrens books** and more! Browse our categories to explore.',
    },
    {
        id: 'language',
        triggers: ['language', 'odia', 'english', 'hindi', 'oriya'],
        question: 'Available Languages',
        response: '🌐 Most of our books are in **Odia (Oriya)**. We also have select titles in **English** and **Hindi**.',
    },
    {
        id: 'order_status',
        triggers: ['order', 'status', 'track', 'where is my', 'tracking'],
        question: 'Order Status',
        response: '📦 To track your order, log in to your account and go to "My Orders". You can also contact us with your order ID at support@odishabookstore.com',
    },
    {
        id: 'contact',
        triggers: ['contact', 'phone', 'email', 'call', 'reach', 'support', 'help'],
        question: 'Contact Us',
        response: '📞 Email us at **support@odishabookstore.com** or call **+91 9876543210**. Our support team is available Mon-Sat, 9 AM - 6 PM.',
    },
    {
        id: 'bulk',
        triggers: ['bulk', 'wholesale', 'school', 'library', 'institution', 'discount'],
        question: 'Bulk Orders',
        response: '🏫 For bulk/institutional orders, please email **orders@odishabookstore.com** with your requirements. Special discounts available for schools and libraries.',
    },
];

// Quick reply buttons shown in chat
export const quickReplies = [
    { id: 'shipping', label: '🚚 Shipping' },
    { id: 'payment', label: '💳 Payment' },
    { id: 'returns', label: '↩️ Returns' },
    { id: 'contact', label: '📞 Contact' },
];

// Welcome message when chat opens
export const welcomeMessage = {
    type: 'bot',
    text: "👋 Hi! I'm your Odisha Book Store assistant. How can I help you today?",
};

// Fallback when no match found
export const fallbackMessage = {
    type: 'bot',
    text: "I'm sorry, I couldn't understand that. Please try asking about:\n• Shipping & Delivery\n• Returns & Refunds\n• Payment Options\n• Book Categories\n\nOr email us at **support@odishabookstore.com**",
};

// Function to find matching FAQ
export const findFaqResponse = (userInput) => {
    const input = userInput.toLowerCase().trim();

    for (const faq of faqData) {
        for (const trigger of faq.triggers) {
            if (input.includes(trigger)) {
                return { type: 'bot', text: faq.response, faqId: faq.id };
            }
        }
    }

    return fallbackMessage;
};
