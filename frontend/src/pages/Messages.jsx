import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Messages.css';

const Messages = () => {
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        const userId = searchParams.get('user');
        if (userId) {
            // Load specific user conversation
            setSelectedUser({ id: userId, username: 'User' });
            fetchMessages(userId);
        }
    }, [searchParams]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/conversations');
            setConversations(res.data.data || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            // Demo data
            setConversations([
                { id: '1', user: { id: '1', username: 'player1' }, last_message: 'Hey, chơi game không?', unread: 2 },
                { id: '2', user: { id: '2', username: 'player2' }, last_message: 'GG, trận hay quá!', unread: 0 },
                { id: '3', user: { id: '3', username: 'gamer_pro' }, last_message: 'Cùng ranked nhé', unread: 1 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await api.get(`/messages/${userId}`);
            setMessages(res.data.data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
            // Demo messages
            setMessages([
                { id: 1, sender_id: userId, content: 'Hey, bạn khỏe không?', created_at: new Date(Date.now() - 3600000).toISOString() },
                { id: 2, sender_id: user?.id, content: 'Khỏe, cậu sao?', created_at: new Date(Date.now() - 3500000).toISOString() },
                { id: 3, sender_id: userId, content: 'Chơi game ko?', created_at: new Date(Date.now() - 3400000).toISOString() },
                { id: 4, sender_id: user?.id, content: 'OK, chơi Caro đi!', created_at: new Date(Date.now() - 3300000).toISOString() },
            ]);
        }
    };

    const selectConversation = (conv) => {
        setSelectedUser(conv.user);
        fetchMessages(conv.user.id);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            await api.post('/messages', {
                receiver_id: selectedUser.id,
                content: newMessage
            });

            // Add message locally
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender_id: user?.id,
                content: newMessage,
                created_at: new Date().toISOString()
            }]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            // Still add locally for demo
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender_id: user?.id,
                content: newMessage,
                created_at: new Date().toISOString()
            }]);
            setNewMessage('');
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="messages-page">
            {/* Sidebar - Conversations */}
            <div className={`conversations-sidebar ${selectedUser ? 'hidden-mobile' : ''}`}>
                <div className="sidebar-header">
                    <h2>💬 Tin nhắn</h2>
                </div>
                <div className="conversations-list">
                    {conversations.length === 0 ? (
                        <div className="empty-state">
                            <UsersIcon size={32} />
                            <p>Chưa có tin nhắn</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`conversation-item ${selectedUser?.id === conv.user.id ? 'active' : ''}`}
                                onClick={() => selectConversation(conv)}
                            >
                                <div className="conv-avatar">
                                    <UsersIcon size={20} />
                                </div>
                                <div className="conv-info">
                                    <span className="conv-name">{conv.user.username}</span>
                                    <span className="conv-last">{typeof conv.last_message === 'string' ? conv.last_message : conv.last_message?.content || ''}</span>
                                </div>
                                {conv.unread > 0 && (
                                    <span className="unread-badge">{conv.unread}</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`chat-area ${!selectedUser ? 'hidden-mobile' : ''}`}>
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <button className="back-btn-mobile" onClick={() => setSelectedUser(null)}>
                                <ArrowLeft size={20} />
                            </button>
                            <div className="chat-user">
                                <div className="user-avatar-sm">
                                    <UsersIcon size={18} />
                                </div>
                                <span>{selectedUser.username}</span>
                            </div>
                        </div>

                        <div className="messages-container">
                            {messages.map((msg, index) => (
                                <div
                                    key={msg.id || index}
                                    className={`message ${msg.sender_id === user?.id || msg.is_mine ? 'sent' : 'received'}`}
                                >
                                    <div className="message-content">
                                        {typeof msg.content === 'string' ? msg.content : msg.content?.text || JSON.stringify(msg.content)}
                                    </div>
                                    <span className="message-time">{formatTime(msg.created_at)}</span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input" onSubmit={sendMessage}>
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <UsersIcon size={64} />
                        <h3>Chọn cuộc trò chuyện</h3>
                        <p>Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
