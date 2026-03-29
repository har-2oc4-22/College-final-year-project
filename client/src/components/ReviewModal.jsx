import { useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { FiX, FiSend } from 'react-icons/fi';

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-3xl transition-all duration-150 hover:scale-110 ${
          star <= value ? 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]' : 'text-gray-700 hover:text-yellow-600'
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

const STAR_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent!' };

const ReviewModal = ({ product, onClose, onReviewed }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`/products/${product.productId}/reviews`, { rating, comment });
      toast.success('Review submitted! Thank you 🎉');
      onReviewed(product.productId);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Rate this Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Info */}
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              onError={e => { e.target.src = 'https://via.placeholder.com/48'; }}
            />
            <div>
              <p className="text-white font-semibold text-sm">{product.name}</p>
              <p className="text-gray-500 text-xs">Qty purchased: {product.qty}</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400 mb-2">How would you rate this product?</p>
            <div className="flex justify-center">
              <StarRating value={rating} onChange={setRating} />
            </div>
            {rating > 0 && (
              <p className="text-sm font-semibold text-yellow-400 animate-fadeIn">
                {STAR_LABELS[rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your review (optional)</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Tell others what you think about this product..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={500}
            />
            <p className="text-right text-xs text-gray-600 mt-1">{comment.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="btn-primary flex items-center gap-2 flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend size={15} />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
