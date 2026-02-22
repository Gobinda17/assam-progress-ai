
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../dashboard/components/Navbar.jsx';

const API_URL = "http://localhost:5000/api";

const categories = [
    'All',
    'Health',
    'Education',
    'Infrastructure',
    'Employment',
    'Women & Youth',
    'Tea Tribes',
    'Agriculture',
    'Law & Order',
];

function ChatHeader() {
    const { user } = useAuth();

    return (
        <Navbar user={user} />
    );
}

function EmptyState({ onSuggestionClick, selectedCategories }) {
    const suggestions = [
        'Provide an overview of the latest health initiatives in Assam.',
        'What are the recent developments in Assam’s education sector?',
        'Summarize the progress on infrastructure projects in Assam.',
        'How is Assam performing in terms of employment generation?',
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

            {selectedCategories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6 mt-2">
                    {selectedCategories.map((cat) => (
                        <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 rounded-full text-xs font-medium text-teal-700">
                            <i className="ri-filter-3-line text-xs"></i>
                            {cat}
                        </span>
                    ))}
                </div>
            )}
            {selectedCategories.length === 0 && <div className="mb-6" />}

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

function CategoryBar({ selected, onToggle }) {
    const scrollRef = useRef(null);
    const isAll = selected.length === 0 || selected.includes('All');

    return (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
            <div className="max-w-3xl mx-auto">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Departments</p>
                <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <button
                        onClick={() => onToggle('All')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer border ${isAll
                            ? 'bg-teal-500 text-white border-teal-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600'
                            }`}
                    >
                        All
                    </button>
                    {categories.filter(c => c !== 'All').map((cat) => (
                        <button
                            key={cat}
                            onClick={() => onToggle(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer border ${selected.includes(cat)
                                ? 'bg-teal-500 text-white border-teal-500'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
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

export default function ChatPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isLoading } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const initialQueryHandled = useRef(false);
    const threadIdRef = useRef(null);
    const streamAbortRef = useRef(null);

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
        if (historyLoaded && location.state?.query && !initialQueryHandled.current) {
            initialQueryHandled.current = true;
            handleSend(location.state.query);
        }
    }, [location.state, historyLoaded]);

    useEffect(() => {
        const loadHistory = async () => {
            if (isLoading || !isAuthenticated) return;

            try {
                const response = await fetch(`${API_URL}/chat/history`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to load chat history.');
                }

                const data = await response.json();
                threadIdRef.current = data?.threadId || null;

                const savedMessages = Array.isArray(data?.messages)
                    ? data.messages.map((message, index) => ({
                        id: `history-${index}-${message.createdAt || Date.now()}`,
                        role: message.role,
                        text: message.text || '',
                        sources: Array.isArray(message.citations)
                            ? message.citations
                                .map((item) => {
                                    if (item?.pageNo) return `${item.documentName} (p.${item.pageNo})`;
                                    return item?.documentName;
                                })
                                .filter(Boolean)
                            : [],
                        timestamp: message.createdAt ? new Date(message.createdAt) : new Date(),
                    }))
                    : [];

                setMessages(savedMessages);
            } catch {
                setMessages([]);
                threadIdRef.current = null;
            } finally {
                setHistoryLoaded(true);
            }
        };

        loadHistory();
    }, [isLoading, isAuthenticated]);

    useEffect(() => {
        return () => {
            streamAbortRef.current?.abort();
        };
    }, []);

    const parseSSEChunk = (chunk) => {
        const lines = chunk
            .split('\n')
            .map((line) => line.replace(/\r$/, ''));

        let event = 'message';
        let dataStr = '';

        for (const line of lines) {
            if (line.startsWith('event:')) {
                event = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
                dataStr += line.slice(5).trim();
            }
        }

        let data = null;
        if (dataStr) {
            try {
                data = JSON.parse(dataStr);
            } catch {
                data = null;
            }
        }

        return { event, data };
    };

    const streamChatSSE = async ({ question, category, assistantId }) => {
        streamAbortRef.current?.abort();
        const controller = new AbortController();
        streamAbortRef.current = controller;

        const params = new URLSearchParams({ question, category });
        if (threadIdRef.current) {
            params.set('threadId', threadIdRef.current);
        }

        const response = await fetch(`${API_URL}/chat/stream?${params.toString()}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                Accept: 'text/event-stream',
            },
            signal: controller.signal,
        });

        if (!response.ok || !response.body) {
            throw new Error('Unable to connect to chat stream.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let doneReceived = false;

        const appendAssistantToken = (delta) => {
            if (!delta) return;

            setMessages((prev) => {
                const idx = prev.findIndex((m) => m.id === assistantId);
                if (idx === -1) {
                    return [
                        ...prev,
                        {
                            id: assistantId,
                            role: 'assistant',
                            text: delta,
                            sources: [],
                            timestamp: new Date(),
                        },
                    ];
                }

                const next = [...prev];
                next[idx] = {
                    ...next[idx],
                    text: `${next[idx].text || ''}${delta}`,
                };
                return next;
            });
        };

        const setAssistantSources = (citations = []) => {
            const sources = citations.map((item) => {
                if (item?.pageNo) return `${item.documentName} (p.${item.pageNo})`;
                return item?.documentName;
            }).filter(Boolean);

            setMessages((prev) => {
                const idx = prev.findIndex((m) => m.id === assistantId);
                if (idx === -1) {
                    return [
                        ...prev,
                        {
                            id: assistantId,
                            role: 'assistant',
                            text: '',
                            sources,
                            timestamp: new Date(),
                        },
                    ];
                }

                const next = [...prev];
                next[idx] = {
                    ...next[idx],
                    sources,
                };
                return next;
            });
        };

        while (!doneReceived) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const chunks = buffer.split('\n\n');
            buffer = chunks.pop() || '';

            for (const chunk of chunks) {
                if (!chunk.trim()) continue;

                const { event, data } = parseSSEChunk(chunk);

                if (event === 'thread' && data?.threadId) {
                    threadIdRef.current = data.threadId;
                } else if (event === 'token') {
                    appendAssistantToken(data?.delta || '');
                } else if (event === 'citations') {
                    setAssistantSources(data?.citations || []);
                } else if (event === 'error') {
                    throw new Error(data?.message || 'Stream error');
                } else if (event === 'done') {
                    doneReceived = true;
                    break;
                }
            }
        }
    };

    const handleToggleCategory = (cat) => {
        if (cat === 'All') {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(prev => {
                if (prev.includes(cat)) {
                    return prev.filter(c => c !== cat);
                } else {
                    return [...prev, cat];
                }
            });
        }
    }

    const handleSend = async (text) => {
        const query = text || input.trim();
        if (!query || isTyping) return;

        const userMsg = {
            id: `msg-${Date.now()}`,
            role: 'user',
            text: query,
            timestamp: new Date(),
            category: selectedCategories.length > 0 ? selectedCategories.join(', ') : undefined,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const assistantId = `msg-${Date.now() + 1}`;
        const category = selectedCategories.length === 1
            ? selectedCategories[0].toLowerCase()
            : 'all';

        try {
            await streamChatSSE({
                question: query,
                category,
                assistantId,
            });
        } catch (err) {
            setMessages((prev) => {
                const idx = prev.findIndex((m) => m.id === assistantId);
                const fallbackText = 'Sorry, something went wrong while generating a response.';

                if (idx === -1) {
                    return [
                        ...prev,
                        {
                            id: assistantId,
                            role: 'assistant',
                            text: err?.message || fallbackText,
                            timestamp: new Date(),
                        },
                    ];
                }

                const next = [...prev];
                next[idx] = {
                    ...next[idx],
                    text: next[idx].text || err?.message || fallbackText,
                };
                return next;
            });
        } finally {
            setIsTyping(false);
        }

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
            <CategoryBar
                selected={selectedCategories}
                onToggle={handleToggleCategory}
            />

            <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
                {messages.length === 0 ? (
                    <EmptyState onSuggestionClick={(text) => handleSend(text)} selectedCategories={selectedCategories} />
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
                    <div className="max-w-3xl mx-auto">
                        {selectedCategories.length > 0 && (
                            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                {selectedCategories.map((cat) => (
                                    <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 rounded-full text-xs font-medium text-teal-700">
                                        <i className="ri-price-tag-3-line text-[10px]"></i>
                                        {cat}
                                        <button
                                            onClick={() => handleToggleCategory(cat)}
                                            className="ml-0.5 hover:text-teal-900 cursor-pointer"
                                        >
                                            <i className="ri-close-line text-xs"></i>
                                        </button>
                                    </span>
                                ))}
                                <button
                                    onClick={() => setSelectedCategories([])}
                                    className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                        <div className='flex items-center gap-2'>
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
        </div>
    );
}
