import { useState, useEffect } from 'react';
import { Star, Send, MessageCircle, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './GameRatingComment.css';

const GameRatingComment = ({ gameId }) => {
    const { user, isAuthenticated } = useAuth();
    const [rating, setRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [avgRating, setAvgRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        if (gameId) {
            fetchComments();
            fetchRating();
        }
    }, [gameId]);

    const fetchRating = async () => {
        try {
            const res = await api.get(`/games/${gameId}/ratings`);
            if (res.data.success) {
                setAvgRating(res.data.data.average || 0);
                setTotalRatings(res.data.data.total || 0);
                if (res.data.data.userRating) {
                    setUserRating(res.data.data.userRating);
                    setRating(res.data.data.userRating);
                }
            }
        } catch (error) {
            console.log('Rating not available yet');
        }
    };

    const fetchComments = async () => {
        try {
            const res = await api.get(`/games/${gameId}/comments`);
            if (res.data.success) {
                setComments(res.data.data || []);
            }
        } catch (error) {
            console.log('Comments not available yet');
            setComments([]);
        }
    };

    const submitRating = async (stars) => {
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để đánh giá!');
            return;
        }
        try {
            setRating(stars);
            setUserRating(stars);
            await api.post(`/games/${gameId}/ratings`, { stars });
            fetchRating();
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    };

    const submitComment = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để bình luận!');
            return;
        }
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await api.post(`/games/${gameId}/comments`, { content: newComment });
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        return `${days} ngày trước`;
    };

    return (
        <div className="game-rating-comment">
            {/* Rating Section */}
            <div className="rating-section">
                <div className="rating-header">
                    <h3>⭐ Đánh giá game</h3>
                    <div className="avg-rating">
                        <span className="avg-value">{avgRating.toFixed(1)}</span>
                        <span className="avg-total">({totalRatings} đánh giá)</span>
                    </div>
                </div>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                            onClick={() => submitRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            title={`${star} sao`}
                        >
                            <Star size={28} fill={(hoverRating || rating) >= star ? '#ffc107' : 'none'} />
                        </button>
                    ))}
                    {userRating > 0 && (
                        <span className="your-rating">Bạn đã đánh giá {userRating} ⭐</span>
                    )}
                </div>
            </div>

            {/* Comments Section */}
            <div className="comments-section">
                <button
                    className="toggle-comments-btn"
                    onClick={() => setShowComments(!showComments)}
                >
                    <MessageCircle size={18} />
                    Bình luận ({comments.length})
                    <span className="toggle-icon">{showComments ? '▲' : '▼'}</span>
                </button>

                {showComments && (
                    <>
                        {/* Comment Form */}
                        <form className="comment-form" onSubmit={submitComment}>
                            <input
                                type="text"
                                placeholder={isAuthenticated ? "Viết bình luận..." : "Đăng nhập để bình luận"}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={!isAuthenticated || loading}
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim() || loading || !isAuthenticated}
                                className="submit-comment-btn"
                            >
                                <Send size={18} />
                            </button>
                        </form>

                        {/* Comments List */}
                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="comment-item">
                                        <div className="comment-avatar">
                                            <User size={20} />
                                        </div>
                                        <div className="comment-content">
                                            <div className="comment-header">
                                                <span className="comment-author">
                                                    {comment.username || comment.user?.username || 'Ẩn danh'}
                                                </span>
                                                <span className="comment-time">
                                                    {formatTime(comment.created_at)}
                                                </span>
                                            </div>
                                            <p className="comment-text">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GameRatingComment;
