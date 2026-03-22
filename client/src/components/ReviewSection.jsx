import { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { FiStar } from 'react-icons/fi';

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button key={star} type="button" onClick={() => onChange(star)} className={`transition-colors ${star <= value ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300`}>
        <FiStar size={22} fill={star <= value ? 'currentColor' : 'none'} />
      </button>
    ))}
  </div>
);

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      axios.get(`/products/${productId}/reviews`)
        .then(({ data }) => setReviews(data.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a star rating');
    setSubmitting(true);
    try {
      const { data } = await axios.post(`/products/${productId}/reviews`, { rating, comment });
      setReviews(data.data || []);
      setRating(0);
      setComment('');
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-white">Customer Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-yellow-400">{avgRating}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(s => (
                <FiStar key={s} size={16} className={s <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} fill={s <= Math.round(avgRating) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      {/* Write Review Form */}
      <div className="card mb-6">
        <h4 className="text-white font-semibold mb-4">Write a Review</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Your Rating</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Comment (optional)</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Share your experience..." value={comment} onChange={e => setComment(e.target.value)} />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div key={i} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-white font-medium">{review.name}</p>
                  <div className="flex mt-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <FiStar key={s} size={13} className={s <= review.rating ? 'text-yellow-400' : 'text-gray-600'} fill={s <= review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <span className="text-gray-500 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              {review.comment && <p className="text-gray-300 text-sm mt-2">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
