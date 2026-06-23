import React, { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CustomerReviews = () => {
  // Initial Reviews State
  const [reviewsList, setReviewsList] = useState([
    { id: 1, author: "Rahul V.", rating: 5, date: "2026-06-15", comment: "Superb craftsmanship! The Natural Titanium color on my new iPhone 15 Pro Max is elegant. Shipping was swift, taking only 2 days.", model: "iPhone 15 Pro Max", helpful: 24 },
    { id: 2, author: "Ayesha D.", rating: 5, date: "2026-06-12", comment: "Gifted the phone to my brother. The mahogany wooden box packaging and personalized gold engravings are absolutely gorgeous. Excellent initiative!", model: "phone", helpful: 41 },
    { id: 3, author: "Siddharth S.", rating: 4, date: "2026-06-10", comment: "The display on the Galaxy S24 Ultra is unmatched, especially under direct sunlight. Anti-reflective tech works! 4 stars because the delivery was delayed by a day.", model: "Galaxy S24 Ultra", helpful: 18 },
    { id: 4, author: "Pooja Hegde", rating: 5, date: "2026-06-08", comment: "Pixel 8 Pro cameras are exceptional. Magic Editor tools are super intuitive. The pure android experience feels clean and smooth.", model: "Pixel 8 Pro", helpful: 12 },
    { id: 5, author: "Vikram Rathore", rating: 3, date: "2026-06-01", comment: "OnePlus 12 performance is blazing fast, and the 100W charger is excellent. However, the camera zoom details at 30x could be sharper.", model: "OnePlus 12", helpful: 7 },
    { id: 6, author: "Divya N.", rating: 5, date: "2026-05-28", comment: "The Mother-of-Pearl backing on the new edition is stunning. It refracts pink and cream hues. Captures excellent bridal portrait details.", model: "Pearl Aura Flagship", helpful: 30 }
  ]);

  const [selectedStars, setSelectedStars] = useState("All");
  const [newReview, setNewReview] = useState({ author: "", rating: 5, comment: "", model: "iPhone 15 Pro Max" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = reviewsList.length;
    const sum = reviewsList.reduce((acc, curr) => acc + curr.rating, 0);
    const average = (sum / total).toFixed(1);

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach((r) => {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    });

    return { total, average, counts };
  }, [reviewsList]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (selectedStars === "All") return reviewsList;
    return reviewsList.filter((r) => r.rating === parseInt(selectedStars));
  }, [reviewsList, selectedStars]);

  const handleInputChange = (e) => {
    setNewReview({ ...newReview, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const reviewToAdd = {
      id: reviewsList.length + 1,
      author: newReview.author || "Anonymous",
      rating: newReview.rating,
      date: new Date().toISOString().split("T")[0],
      comment: newReview.comment,
      model: newReview.model,
      helpful: 0
    };

    setReviewsList([reviewToAdd, ...reviewsList]);
    setNewReview({ author: "", rating: 5, comment: "", model: "iPhone 15 Pro Max" });
    setShowAddForm(false);
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 5000);
  };

  const handleHelpfulIncrement = (id) => {
    setReviewsList(
      reviewsList.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r))
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-indigo-650 dark:text-indigo-400 font-semibold uppercase tracking-widest text-xs">
            Client Testimonials
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mt-3">
            What Our Customers Say
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
            Real feedback from verified buyers. We are proud to maintain a top-tier rating for our premier devices and flagships.
          </p>
        </div>

        {/* Ratings Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[32px] p-8 mb-12 shadow-sm text-left">
          {/* Average Rating Column */}
          <div className="text-center md:border-r border-gray-200 dark:border-gray-800 md:pr-8 py-4">
            <span className="text-6xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.average}
            </span>
            <div className="flex justify-center text-amber-500 text-xl font-bold mt-2">
              {"★".repeat(Math.round(stats.average))}
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-3">
              Based on {stats.total} Verified Reviews
            </p>
          </div>

          {/* Rating Bars Distribution */}
          <div className="md:col-span-2 md:pl-8 space-y-2 py-4">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.counts[stars] || 0;
              const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <span className="w-12 font-bold text-gray-650 dark:text-gray-400">{stars} Stars</span>
                  <div className="flex-grow h-3 bg-gray-100 dark:bg-gray-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right text-gray-500 font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter bar and Add Review button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-left">
          {/* Rating filter pills */}
          <div className="flex flex-wrap gap-2">
            {["All", "5", "4", "3"].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedStars(star)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedStars === star
                    ? "bg-indigo-650 text-white shadow-md"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-250 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {star === "All" ? "All Ratings" : `${star} Stars`}
              </button>
            ))}
          </div>

          {/* Write a review toggle */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
          >
            {showAddForm ? "Cancel Review" : "Write a Review"}
          </button>
        </div>

        {/* Success toast / alert */}
        {feedbackSuccess && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-xl font-semibold text-left">
            ✓ Thank you! Your testimonial has been posted and added to the review database in real-time.
          </div>
        )}

        {/* Interactive Add Review Form Card */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 mb-12 shadow-md text-left max-w-xl mx-auto">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6">Write Your Testimonial</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Reviewer Name</label>
                <input
                  type="text"
                  name="author"
                  required
                  value={newReview.author}
                  onChange={handleInputChange}
                  placeholder="Your Name (e.g. Priya Sharma)"
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-255 dark:border-gray-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Model Purchased</label>
                  <select
                    name="model"
                    value={newReview.model}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-255 dark:border-gray-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="iPhone 15 Pro Max">iPhone 15 Pro Max</option>
                    <option value="Galaxy S24 Ultra">Galaxy S24 Ultra</option>
                    <option value="Pixel 8 Pro">Pixel 8 Pro</option>
                    <option value="OnePlus 12">OnePlus 12</option>
                    <option value="redmi 12 pro">redmi 12 pro</option>
                    <option value="vivo x100 pro">vivo x100 pro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Star Rating</label>
                  <div className="flex gap-2 text-2xl pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className={`transition ${newReview.rating >= star ? "text-amber-500" : "text-gray-350"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Review Comments</label>
                <textarea
                  name="comment"
                  required
                  rows="3"
                  value={newReview.comment}
                  onChange={handleInputChange}
                  placeholder="Share details about your user experience, finish selection, and shopping concierge experience..."
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-255 dark:border-gray-850 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/10"
              >
                Post Review
              </button>
            </form>
          </div>
        )}

        {/* Reviews Cards Grid */}
        {filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[28px] p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Rating + Date row */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-500 font-bold text-sm">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">{review.date}</span>
                  </div>

                  {/* Comment */}
                  <p className="text-gray-750 dark:text-gray-300 text-sm leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-gray-850 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                      {review.author[0]}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                        {review.author}
                        <span className="inline-block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Verified Buyer
                        </span>
                      </h4>
                      <span className="text-xs text-gray-400 font-medium">Purchased: {review.model}</span>
                    </div>
                  </div>

                  {/* Helpful Button */}
                  <button
                    onClick={() => handleHelpfulIncrement(review.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition font-bold"
                  >
                    <span>👍 Helpful</span>
                    <span className="bg-gray-50 dark:bg-gray-950 px-2 py-0.5 rounded-md text-[10px] text-gray-500">
                      {review.helpful}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-250 dark:border-gray-800">
            <p className="text-gray-500">No testimonials matching that score. Write a review to get it started!</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CustomerReviews;
