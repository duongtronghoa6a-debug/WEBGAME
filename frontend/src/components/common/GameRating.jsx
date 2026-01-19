import { useState, useEffect } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import Pagination from './Pagination';
import './GameRating.css';

/**
 * Game Rating & Comment Component
 * Cho phép đánh giá sao và bình luận cho game
 */
const GameRating = ({ gameId, gameName }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        if (gameId) {
            fetchReviews();
        }
    }, [gameId, currentPage]);

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/games/${gameId}/reviews?page=${currentPage}&limit=${itemsPerPage}`);
            setReviews(res.data.data || []);
            setAvgRating(res.data.avgRating || 0);
            setTotalReviews(res.data.total || 0);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            // Demo reviews
            setReviews([
                { id: 1, username: 'player1', rating: 5, comment: 'Game rất hay!', created_at: new Date().toISOString() },
                { id: 2, username: 'gamer_pro', rating: 4, comment: 'Đồ họa đẹp, gameplay ổn', created_at: new Date(Date.now() - 86400000).toISOString() },
                { id: 3, username: 'newbie', rating: 5, comment: 'Dễ chơi, dễ nghiện', created_at: new Date(Date.now() - 172800000).toISOString() },
            ]);
            setAvgRating(4.7);
            setTotalReviews(3);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Vui lòng chọn số sao đánh giá');
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/games/${gameId}/reviews`, {
                rating,
                comment
            });
            setRating(0);
            setComment('');
            fetchReviews();
            alert('Đánh giá thành công!');
        } catch (error) {
            console.error('Error submitting review:', error);
            // Demo: add locally
            setReviews(prev => [{
                id: Date.now(),
                username: 'Bạn',
                rating,
                comment,
                created_at: new Date().toISOString()
            }, ...prev]);
            setRating(0);
            setComment('');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (value, interactive = false) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const filled = interactive
                ? i <= (hoverRating || rating)
                : i <= value;

            stars.push(
                <Star
                    key={i}
                    size={interactive ? 28 : 16}
                    className={`star ${filled ? 'filled' : ''}`}
                    onClick={() => interactive && setRating(i)}
                    onMouseEnter={() => interactive && setHoverRating(i)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                />
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const totalPages = Math.ceil(totalReviews / itemsPerPage);

    return (
        <div className="game-rating">
            <h3>
                <MessageSquare size={20} />
                Đánh giá & Bình luận
            </h3>

            {/* Rating Summary */}
            <div className="rating-summary">
                <div className="avg-rating">
                    <span className="rating-value">{avgRating.toFixed(1)}</span>
                    <div className="stars">{renderStars(Math.round(avgRating))}</div>
                    <span className="rating-count">{totalReviews} đánh giá</span>
                </div>
            </div>

            {/* Submit Form */}
            <form className="rating-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Đánh giá của bạn:</label>
                    <div className="stars interactive">{renderStars(rating, true)}</div>
                </div>
                <div className="form-group">
                    <textarea
                        placeholder="Nhập bình luận của bạn..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    <Send size={16} />
                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
            </form>

            {/* Reviews List */}
            <div className="reviews-list">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="no-reviews">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                ) : (
                    <>
                        {reviews.map(review => (
                            <div key={review.id} className="review-item">
                                <div className="review-header">
                                    <span className="review-user">{review.username}</span>
                                    <div className="review-stars">{renderStars(review.rating)}</div>
                                    <span className="review-date">{formatDate(review.created_at)}</span>
                                </div>
                                {review.comment && (
                                    <p className="review-comment">{review.comment}</p>
                                )}
                            </div>
                        ))}

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={totalReviews}
                            itemsPerPage={itemsPerPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default GameRating;
