import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, UserMinus, MessageSquare, Search, Check, X, Users as UsersIcon } from 'lucide-react';
import api from '../services/api';
import Pagination from '../components/common/Pagination';
import './Friends.css';

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [activeTab, setActiveTab] = useState('friends');
    const [loading, setLoading] = useState(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalFriends, setTotalFriends] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchFriends();
        fetchPendingRequests();
    }, []);

    const fetchFriends = async () => {
        try {
            const res = await api.get('/friends');
            // API returns: { id, friend: {id, username, avatar_url}, status, ... }
            // Flatten to: { id, username, avatar_url, status }
            const friendsData = (res.data.data || []).map(f => ({
                id: f.friend?.id || f.id,
                username: f.friend?.username || 'Unknown',
                avatar_url: f.friend?.avatar_url || null,
                status: 'offline' // Can enhance later with online status
            }));
            setFriends(friendsData);
        } catch (error) {
            console.error('Error fetching friends:', error);
            setFriends([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const res = await api.get('/friends/requests');
            // API returns: { id, sender_id, sender_username, sender_avatar, created_at }
            // Map to: { id, username, avatar_url, created_at }
            const requestsData = (res.data.data || []).map(r => ({
                id: r.id,
                sender_id: r.sender_id,
                username: r.sender_username || 'Unknown',
                avatar_url: r.sender_avatar || null,
                created_at: r.created_at
            }));
            setPendingRequests(requestsData);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setPendingRequests([]);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await api.get(`/users?search=${searchQuery}`);
            const users = res.data.data || [];

            // Check friend status for each user
            const usersWithStatus = await Promise.all(
                users.map(async (user) => {
                    try {
                        const statusRes = await api.get(`/friends/status/${user.id}`);
                        return { ...user, friendStatus: statusRes.data.data };
                    } catch {
                        return { ...user, friendStatus: null };
                    }
                })
            );
            setSearchResults(usersWithStatus);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const sendFriendRequest = async (userId) => {
        try {
            await api.post('/friends/request', { friend_id: userId });
            alert('Đã gửi lời mời kết bạn!');
            // Refresh search to update status
            handleSearch();
        } catch (error) {
            console.error('Error sending request:', error);
            alert('Lỗi khi gửi lời mời');
        }
    };

    const cancelFriendRequest = async (requestId) => {
        try {
            await api.delete(`/friends/${requestId}`);
            alert('Đã hủy lời mời kết bạn!');
            handleSearch();
        } catch (error) {
            console.error('Error canceling request:', error);
            alert('Lỗi khi hủy lời mời');
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            await api.put(`/friends/${requestId}/accept`);
            fetchFriends();
            fetchPendingRequests();
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            await api.put(`/friends/${requestId}/reject`);
            fetchPendingRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    const removeFriend = async (friendId) => {
        if (!confirm('Bạn có chắc muốn hủy kết bạn?')) return;
        try {
            await api.delete(`/friends/${friendId}`);
            setFriends(prev => prev.filter(f => f.id !== friendId));
        } catch (error) {
            console.error('Error removing friend:', error);
        }
    };

    // Render friend action button based on status
    const renderFriendButton = (user) => {
        const status = user.friendStatus;

        // Already friends
        if (status?.status === 'accepted') {
            return (
                <span className="btn btn-outline btn-sm disabled">
                    ✓ Đã là bạn
                </span>
            );
        }

        // Pending - I sent the request
        if (status?.status === 'pending' && status?.is_sender) {
            return (
                <button
                    className="btn btn-outline btn-sm danger"
                    onClick={() => cancelFriendRequest(status.request_id)}
                >
                    <X size={16} />
                    Hủy yêu cầu
                </button>
            );
        }

        // Pending - I received the request
        if (status?.status === 'pending' && !status?.is_sender) {
            return (
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => acceptRequest(status.request_id)}
                >
                    <Check size={16} />
                    Chấp nhận
                </button>
            );
        }

        // No relationship - show add button
        return (
            <button
                className="btn btn-outline btn-sm"
                onClick={() => sendFriendRequest(user.id)}
            >
                <UserPlus size={16} />
                Kết bạn
            </button>
        );
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
        <div className="friends-page">
            <div className="page-header">
                <h1>👥 Bạn bè</h1>
                <p>Quản lý danh sách bạn bè và kết bạn mới</p>
            </div>

            {/* Search */}
            <div className="search-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn btn-primary" onClick={handleSearch}>
                        Tìm
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map(user => (
                            <div key={user.id} className="user-card">
                                <div className="user-avatar">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.username} />
                                    ) : (
                                        <UsersIcon size={24} />
                                    )}
                                </div>
                                <div className="user-info">
                                    <span className="username">{user.username}</span>
                                </div>
                                {renderFriendButton(user)}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('friends')}
                >
                    Bạn bè ({friends.length})
                </button>
                <button
                    className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Lời mời ({pendingRequests.length})
                </button>
            </div>

            {/* Content */}
            <div className="tab-content">
                {activeTab === 'friends' && (
                    <div className="friends-list">
                        {friends.length === 0 ? (
                            <div className="empty-state">
                                <UsersIcon size={48} />
                                <p>Chưa có bạn bè nào</p>
                                <span>Hãy tìm kiếm và kết bạn!</span>
                            </div>
                        ) : (
                            friends.map(friend => (
                                <div key={friend.id} className="friend-card">
                                    <div className="friend-avatar">
                                        {friend.avatar_url ? (
                                            <img src={friend.avatar_url} alt={friend.username} />
                                        ) : (
                                            <UsersIcon size={24} />
                                        )}
                                        <span className={`status-dot ${friend.status || 'offline'}`}></span>
                                    </div>
                                    <div className="friend-info">
                                        <span className="username">{friend.username}</span>
                                        <span className="status-text">
                                            {friend.status === 'online' ? 'Đang online' : 'Offline'}
                                        </span>
                                    </div>
                                    <div className="friend-actions">
                                        <Link to={`/messages?user=${friend.id}`} className="btn btn-outline btn-sm">
                                            <MessageSquare size={16} />
                                        </Link>
                                        <button
                                            className="btn btn-outline btn-sm danger"
                                            onClick={() => removeFriend(friend.id)}
                                        >
                                            <UserMinus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Pagination */}
                        {friends.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil((totalFriends || friends.length) / itemsPerPage)}
                                onPageChange={setCurrentPage}
                                totalItems={totalFriends || friends.length}
                                itemsPerPage={itemsPerPage}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'pending' && (
                    <div className="pending-list">
                        {pendingRequests.length === 0 ? (
                            <div className="empty-state">
                                <UserPlus size={48} />
                                <p>Không có lời mời kết bạn</p>
                            </div>
                        ) : (
                            pendingRequests.map(request => (
                                <div key={request.id} className="request-card">
                                    <div className="user-avatar">
                                        {request.avatar_url ? (
                                            <img src={request.avatar_url} alt={request.username} />
                                        ) : (
                                            <UsersIcon size={24} />
                                        )}
                                    </div>
                                    <div className="user-info">
                                        <span className="username">{request.username}</span>
                                        <span className="request-time">Đã gửi lời mời</span>
                                    </div>
                                    <div className="request-actions">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => acceptRequest(request.id)}
                                        >
                                            <Check size={16} />
                                            Chấp nhận
                                        </button>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => rejectRequest(request.id)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friends;
