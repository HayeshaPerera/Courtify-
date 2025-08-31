import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ViewCourt.css";
import Footer from "../components/Footer";

const initialReviews = [
  { id: 1, user: "Joan Perkins", rating: 5, comment: "This court is a great addition. Featuring a mid-century vibe and very well maintained." },
  { id: 2, user: "Frank Garrett", rating: 4, comment: "Nice facility, but I had trouble finding parking." },
  { id: 3, user: "Randy Palmer", rating: 4, comment: "It was decent. Could use better lighting for night sessions." }
];

const StarRating = ({ rating, onRate, disabled = false, size = "1.2rem" }) => (
  <span className="star-rating" style={{ fontSize: size }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star ${star <= rating ? "filled" : ""} ${onRate ? "clickable" : ""}`}
        onClick={() => !disabled && onRate && onRate(star)}
        role={onRate ? "button" : "img"}
        aria-label={star <= rating ? "Filled star" : "Empty star"}
        tabIndex={onRate && !disabled ? 0 : -1}
        onKeyDown={e => {
          if (onRate && !disabled && (e.key === "Enter" || e.key === " ")) onRate(star);
        }}
      >
        ★
      </span>
    ))}
  </span>
);

const ViewCourt = () => {
  
  const location = useLocation();
  const navigate = useNavigate();
  const court = location.state?.court;

  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [cart, setCart] = useState([]);


  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => ratingCounts[r.rating - 1]++);

  const total = reviews.length;
  const averageRating = total ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : null;

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = () => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem("courtCart") || "[]");
    if (existingCart.some(item => item.Id === court.Id)) {
      alert("Court already in cart!");
      return;
    }
    const updatedCart = [...existingCart, court];
    localStorage.setItem("courtCart", JSON.stringify(updatedCart));
    alert("Court added to cart!");
  };

  const handleStarSelect = (star) => {
    setNewReview((prev) => ({ ...prev, rating: star }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setReviews([
        {
          id: Date.now(),
          user: "You",
          rating: Number(newReview.rating),
          comment: newReview.comment
        },
        ...reviews
      ]);
      setNewReview({ rating: 5, comment: "" });
      setSubmitting(false);
    }, 600);
  };

  if (!court) {
    return (
      <div className="viewcourt-container">
        <div className="alert alert-warning mt-5 text-center">
          No court details found. Please go back and try again.
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  return (
        <div className="viewcourt-container">
       <div className="viewcourt-container">
          <div className="viewcourt-image-wrapper">
            <img src={court.Image} alt={court.Name} className="viewcourt-image" />

            {/* Overlay content: Title and buttons */}
            <div className="viewcourt-overlay">
              <h2 className="viewcourt-title-overlay">{court.Name}</h2>
              <div className="viewcourt-overlay-buttons">
                <button
                  className="btn-paynow-modern"
                  onClick={() => navigate("/confirmbooking", { state: { court } })}
                >
                  Book Now
                </button>
                <button className="btn-addcart-modern" onClick={handleAddToCart}>
                  <img
                    src="/cart.png"
                    alt="Add to Cart"
                    style={{
                      width: "20px",
                      height: "20px",
                      verticalAlign: "middle",
                      marginRight: "8px"
                    }}
                  />
                  Add to Cart
                </button>
                <button className="btn-goback-modern" onClick={() => navigate(-1)}>
                  Go Back
                </button>

                
              </div>
            </div>
          </div>

          {/* Court Details section stays below */}
           <h2 className="viewcourt-title-modern">COURT DETAILS</h2>
           <p className="viewcourt-caption">Explore Court Details!</p>
        <div className="viewcourt-details-section-modern">
         
          <div className="viewcourt-details-card">
            <div className="viewcourt-detail-item full-width">
              <span className="detail-label">Location:</span>
              <div className="map-container">
                <iframe
                  title="court-location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(court.Name)}&output=embed`}
                  width="100%"
                  height="250"
                  style={{ border: 0, borderRadius: "12px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
            <div className="viewcourt-detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{court.Type}</span>
            </div>
            <div className="viewcourt-detail-item">
              <span className="detail-label">Price Per Hour:</span>
              <span className="detail-value price-highlight">${court.PricePerHour}</span>
            </div>
            <div className="viewcourt-detail-item">
              <span className="detail-label">Available Date:</span>
              <span className="detail-value">{formatDate(court.AvailableDate)}</span>
            </div>
            <div className="viewcourt-detail-item">
              <span className="detail-label">Available Hours:</span>
              <span className="detail-value">
                {court.AvailableStartTime || "Not specified"} - {court.AvailableEndTime || "Not specified"}
              </span>
            </div>
            <div className="viewcourt-detail-item full-width">
              <span className="detail-label">Description:</span>
              <span className="detail-value">{court.Description || "No description provided."}</span>
            </div>
          </div>
        </div>

        </div>



        {/* ---------- Review UI Below ---------- */}
        <div className="viewcourt-review-section">
          <h3 className="review-title">User Ratings</h3>
          {averageRating ? (
            <div className="rating-summary">
              <div className="rating-score">
                <div className="rating-value">{averageRating}</div>
                <div className="stars"><StarRating rating={Math.round(averageRating)} size="1.3rem" /></div>
                <div className="review-count">based on {total} reviews</div>
              </div>
              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map((star, i) => (
                  <div className="bar-row" key={star}>
                    <span>{star} ★</span>
                    <div className="bar">
                      <div
                        className={`fill ${star === 5 ? "excellent" : star === 4 ? "good" : star === 3 ? "avg" : star === 2 ? "below" : "poor"}`}
                        style={{ width: `${(ratingCounts[star - 1] / total) * 100 || 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="no-ratings">No reviews yet.</div>}

              <div className="review-form-card">
                <form className="review-form" onSubmit={handleReviewSubmit}>
                  <label className="review-label">Your Rating:</label>
                  <StarRating
                    rating={newReview.rating}
                    onRate={handleStarSelect}
                    disabled={submitting}
                    size="1.2rem"
                  />
                  <textarea
                    name="comment"
                    value={newReview.comment}
                    onChange={handleReviewChange}
                    placeholder="Write your comment..."
                    required
                    disabled={submitting}
                    className="review-textarea"
                  />
                  <button
                    type="submit"
                    className="review-submit-btn"
                    disabled={submitting || !newReview.comment.trim()}
                  >
                    {submitting ? "Submitting..." : "Write a Review"}
                  </button>
                </form>
              </div>
              <div className="court-review-list">
                {reviews.map((r) => (
                  <div className="court-review-card" key={r.id}>
                    <div className="court-review-header">
                      <div className="review-user-info">
                        <div className="user-avatar">{r.user.charAt(0)}</div>
                        <span className="court-review-user">{r.user}</span>
                      </div>
                      <StarRating rating={r.rating} size="1.1rem" />
                    </div>
                    <p className="court-review-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
        </div>
      <Footer />
    </div>
  );
};

export default ViewCourt;
