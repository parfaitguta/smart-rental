import { useState, useEffect } from 'react'
import { getLandlordReviews } from '../../api/reviewApi'
import Spinner from '../../components/common/Spinner'
import { StarDisplay } from '../../components/common/StarRating'
import { Star, TrendingUp } from 'lucide-react'
import { formatDate } from '../../utils/helpers'

export default function LandlordReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLandlordReviews()
      .then(res => setReviews(res.data.reviews))
      .finally(() => setLoading(false))
  }, [])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percent: reviews.length > 0
      ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100)
      : 0
  }))

  if (loading) return <Spinner size="lg" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Property Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">Reviews from your tenants</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Star size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No reviews yet</p>
          <p className="text-gray-300 text-sm mt-1">Reviews will appear here when tenants rate your properties</p>
        </div>
      ) : (
        <>
          {/* Rating Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-yellow-500" /> Rating Summary
            </h2>
            <div className="flex gap-8 items-center flex-wrap">
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-800">{avgRating}</p>
                <StarDisplay rating={Math.round(avgRating)} size={20} />
                <p className="text-gray-400 text-sm mt-1">{reviews.length} review(s)</p>
              </div>
              <div className="flex-1 space-y-2 min-w-48">
                {ratingCounts.map(({ star, count, percent }) => (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-4">{star}</span>
                    <Star size={12} className="text-yellow-400 fill-yellow-400 shrink-0" />
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-gray-400 w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map(rev => (
              <div key={rev.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{rev.property_title}</h3>
                    <p className="text-blue-600 text-sm">{rev.renter_name}</p>
                  </div>
                  <div className="text-right">
                    <StarDisplay rating={rev.rating} />
                    <p className="text-gray-400 text-xs mt-1">{formatDate(rev.created_at)}</p>
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-gray-500 text-sm italic mt-2 bg-gray-50 rounded-lg p-3">
                    "{rev.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}