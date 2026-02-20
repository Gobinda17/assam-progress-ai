
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../dashboard/components/Navbar.jsx';

function ChatHeader() {
    const { user } = useAuth();

    return (
        <Navbar user={user} />
    );
}

function EmptyState({ onSuggestionClick }) {
    const suggestions = [
        'What are the key findings in the ML research paper?',
        'Summarize the product documentation for API integration.',
        'What were the 2024 revenue highlights?',
        'List the technical specifications for the new module.',
    ];

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <i className="ri-chat-3-line text-2xl text-teal-500"></i>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Ask anything about your documents</h2>
            <p className="text-sm text-gray-500 mb-8">
                Get accurate, source-linked answers from your knowledge base
            </p>

            <div className="w-full max-w-md space-y-2">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => onSuggestionClick(s)}
                        className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-teal-50 rounded-lg text-sm text-gray-700 transition cursor-pointer flex items-center gap-3"
                    >
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                            <i className="ri-lightbulb-line text-teal-500 text-sm"></i>
                        </div>
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}

function MessageBubble({ message }) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
                {!isUser && (
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                            <i className="ri-robot-line text-white text-[10px]"></i>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">DocQuery AI</span>
                    </div>
                )}
                <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
                        ? 'bg-teal-500 text-white rounded-br-md'
                        : 'bg-slate-50 text-gray-800 rounded-bl-md border border-gray-100'
                        }`}
                >
                    {message.text}
                </div>
                {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {message.sources.map((src, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 rounded text-[11px] text-teal-700 font-medium"
                            >
                                <i className="ri-file-text-line text-[10px]"></i>
                                {src}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex justify-start mb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                        <i className="ri-robot-line text-white text-[10px]"></i>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">DocQuery AI</span>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-slate-50 border border-gray-100 flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
}

const mockResponses = {
    default: {
        text: "Based on the documents in our knowledge base, I found relevant information. The uploaded PDFs contain detailed insights across multiple categories including research papers, product documentation, and financial reports. Could you be more specific about what you\\'d like to know?",
        sources: ['Machine Learning Research Paper.pdf', 'Product Documentation v2.3.pdf'],
    },
    ml: {
        text: 'The Machine Learning Research Paper highlights several key findings: (1) A novel transformer architecture that achieves 94.2% accuracy on benchmark datasets, (2) Reduced training time by 37% compared to baseline models, and (3) Improved generalization across multiple domains including NLP and computer vision tasks.',
        sources: ['Machine Learning Research Paper.pdf'],
    },
    api: {
        text: 'The Product Documentation v2.3 describes the API integration process in detail: You need to authenticate using OAuth 2.0, then use the REST endpoints for CRUD operations. The base URL is configurable, and rate limiting is set at 1000 requests per minute. Webhooks are supported for real-time event notifications.',
        sources: ['Product Documentation v2.3.pdf'],
    },
    revenue: {
        text: 'According to the Annual Financial Report 2024, total revenue reached $142.5M, representing a 23% year-over-year growth. Key highlights include: Q4 revenue of $42.1M (strongest quarter), SaaS recurring revenue grew 31%, and international markets contributed 38% of total revenue.',
        sources: ['Annual Financial Report 2024.pdf'],
    },
    technical: {
        text: 'The Technical Specifications document outlines the following for the new module: Processing capacity of 10,000 documents/hour, support for PDF, DOCX, and TXT formats, vector embedding dimensions of 1536, and compatibility with OpenAI, Cohere, and local embedding models. Minimum RAM requirement is 16GB.',
        sources: ['Technical Specifications.pdf'],
    },
};

function getResponse(query) {
    const lower = query.toLowerCase();
    if (lower.includes('ml') || lower.includes('machine learning') || lower.includes('key findings'))
        return mockResponses.ml;
    if (lower.includes('api') || lower.includes('product documentation') || lower.includes('integration'))
        return mockResponses.api;
    if (lower.includes('revenue') || lower.includes('financial') || lower.includes('2024'))
        return mockResponses.revenue;
    if (lower.includes('technical') || lower.includes('specification') || lower.includes('module'))
        return mockResponses.technical;
    return mockResponses.default;
}

export default function ChatPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isLoading } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const initialQueryHandled = useRef(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isLoading, isAuthenticated, navigate]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (location.state?.query && !initialQueryHandled.current) {
            initialQueryHandled.current = true;
            handleSend(location.state.query);
        }
    }, [location.state]);

    const handleSend = (text) => {
        const query = text || input.trim();
        if (!query || isTyping) return;

        const userMsg = {
            id: `msg-${Date.now()}`,
            role: 'user',
            text: query,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            try {
                const response = getResponse(query);
                const assistantMsg = {
                    id: `msg-${Date.now() + 1}`,
                    role: 'assistant',
                    text: response.text,
                    sources: response.sources,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
            } catch {
                const errorMsg = {
                    id: `msg-${Date.now() + 1}`,
                    role: 'assistant',
                    text: 'Sorry, something went wrong while generating a response.',
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMsg]);
            } finally {
                setIsTyping(false);
            }
        }, 1200 + Math.random() * 800);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (isLoading || !isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <ChatHeader />

            <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
                {messages.length === 0 ? (
                    <EmptyState onSuggestionClick={(text) => handleSend(text)} />
                ) : (
                    <div className="flex-1 overflow-y-auto px-4 py-6">
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                        {isTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3">
                    <div className="max-w-3xl mx-auto flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question about your documents..."
                            className="flex-1 px-4 py-3 bg-slate-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className="w-11 h-11 flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 whitespace-nowrap"
                        >
                            <i className="ri-send-plane-fill text-base"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
