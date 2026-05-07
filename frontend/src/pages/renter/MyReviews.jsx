import { useState, useEffect } from 'react'
import { getTenantRentals } from '../../api/rentalApi'
import { getMyReviews, submitReview, deleteReview } from '../../api/reviewApi'
import Spinner from '../../components/common/Spinner'
import { StarDisplay, StarInput } from '../../components/common/StarRating'
import toast from 'react-hot-toast'
import { Plus, Trash2, MapPin, Star } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function MyReviews() {
  const [rentals, setRentals] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(null)
  const [form, setForm] = useState({ rating: 0, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [r, rev] = await Promise.all([
        getTenantRentals(),
        getMyReviews()
      ])
      setRentals(r.data.rentals || [])
      setReviews(rev.data.reviews || [])
    } catch (err) {
      console.error('Failed to load reviews data:', err.message)
      setRentals([])
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e, rental) => {
    e.preventDefault()
    if (form.rating === 0) {
      toast.error('Please select a rating')
      return
    }
    setSubmitting(true)
    try {
      await submitReview({
        property_id: rental.property_id,
        rental_id: rental.id,
        rating: form.rating,
        comment: form.comment
      })
      toast.success('Review submitted!')
      setShowForm(null)
      setForm({ rating: 0, comment: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await deleteReview(id)
      toast.success('Review deleted')
      fetchData()
    } catch (err) {
      toast.error('Failed to delete review')
    }
  }

  const hasReviewed = (rental_id) => reviews.some(r => r.rental_id === rental_id)

  if (loading) return <Spinner size="lg" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">Rate and review properties you have rented</p>
      </div>

      {/* Rentals to review */}
      <div className="mb-8">
        <h2 className="font-semibold text-gray-700 mb-3">Your Rentals</h2>
        {rentals.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <Star size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No rentals to review yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rentals.map(r => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{r.property_title}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                      <MapPin size={11} /> {r.district}, {r.province}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(r.start_date)} → {r.end_date ? formatDate(r.end_date) : 'Ongoing'}
                    </p>
                  </div>

                  {hasReviewed(r.id) ? (
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                      <StarDisplay
                        rating={reviews.find(rev => rev.rental_id === r.id)?.rating}
                        size={14}
                      />
                      <span className="text-green-600 text-xs font-medium">Reviewed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowForm(r.id)
                        setForm({ rating: 0, comment: '' })
                      }}
                      className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <Plus size={14} /> Write Review
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {showForm === r.id && (
                  <form
                    onSubmit={(e) => handleSubmit(e, r)}
                    className="mt-4 bg-yellow-50 rounded-xl p-4 border border-yellow-200"
                  >
                    <h4 className="font-medium text-gray-700 mb-3">Rate this property</h4>
                    <div className="mb-3">
                      <StarInput
                        rating={form.rating}
                        onChange={(val) => setForm({ ...form, rating: val })}
                      />
                    </div>
                    <textarea
                      value={form.comment}
                      onChange={e => setForm({ ...form, comment: e.target.value })}
                      placeholder="Share your experience (optional)..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                      >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(null)}
                        className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submitted reviews */}
      {reviews.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">My Submitted Reviews</h2>
          <div className="space-y-3">
            {reviews.map(rev => (
              <div key={rev.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{rev.property_title}</h3>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                      <MapPin size={11} /> {rev.district}, {rev.province}
                    </div>
                    <div className="mt-2">
                      <StarDisplay rating={rev.rating} />
                    </div>
                    {rev.comment && (
                      <p className="text-gray-500 text-sm mt-2 italic">"{rev.comment}"</p>
                    )}
                    <p className="text-gray-400 text-xs mt-2">{formatDate(rev.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors ml-3"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}