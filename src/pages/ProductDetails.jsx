import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { smartphonesData } from "../data/smartphones";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the selected phone
  const phone = useMemo(() => {
    return smartphonesData.find((p) => p.id === id);
  }, [id]);

  // If phone not found, redirect to catalog or show error
  if (!phone) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 px-4">
          <span className="text-5xl">📱</span>
          <h2 className="text-2xl font-bold mt-4">Model Not Found</h2>
          <p className="text-gray-500 mt-2">The smartphone you are looking for does not exist in our catalog.</p>
          <Link to="/" className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm">
            Back to Home Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Selected color index state
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("specs"); // specs or reviews
  const [cartAdded, setCartAdded] = useState(false);
  const [buyNowStarted, setBuyNowStarted] = useState(false);

  const selectedColor = phone.colors[selectedColorIndex] || phone.colors[0];

  // Pick 3 related phones (excluding current one)
  const relatedPhones = useMemo(() => {
    return smartphonesData.filter((p) => p.id !== phone.id).slice(0, 3);
  }, [phone.id]);

  const handleAddToCart = () => {
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 3000);
  };

  const handleBuyNow = () => {
    setBuyNowStarted(true);
    setTimeout(() => {
      setBuyNowStarted(false);
      alert("Order simulated! Thank you for purchasing " + phone.name);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-550 dark:text-gray-400 mb-8 text-left">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Catalog</Link>
          <span>/</span>
          <span className="text-gray-400">{phone.brand}</span>
          <span>/</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">{phone.name}</span>
        </div>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16 text-left">
          {/* Left Column: Visual Mockup */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[40px] p-8 flex items-center justify-center min-h-[450px] sm:min-h-[500px] relative overflow-hidden shadow-sm">
              {/* Backglow corresponding to selected color */}
              <div
                className="absolute inset-0 opacity-10 blur-3xl pointer-events-none transition-all duration-500"
                style={{
                  background: `radial-gradient(circle, ${selectedColor.value} 0%, transparent 70%)`
                }}
              ></div>

              {/* Styled Mockup Phone Body */}
              <div
                className="w-56 h-[400px] rounded-[48px] p-1.5 shadow-2xl relative transition-all duration-500 border-4 border-slate-700/80 bg-slate-900"
                style={{
                  boxShadow: `0 25px 50px -12px ${selectedColor.value}40`
                }}
              >
                {/* Screen Face */}
                <div
                  className="w-full h-full rounded-[40px] p-6 flex flex-col justify-between text-white transition-all duration-500 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${selectedColor.value} 0%, #111827 100%)`
                  }}
                >
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-center border border-white/5 shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-indigo-900/30 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-blue-500"></div></div>
                  </div>

                  {/* Inside Screen Content */}
                  <div className="mt-4 flex justify-between items-center opacity-70">
                    <span className="text-[10px] font-bold">12:00</span>
                    <span className="text-[10px] font-bold">5G</span>
                  </div>

                  <div className="text-center space-y-2 mb-6">
                    <span className="text-[10px] tracking-widest font-mono uppercase bg-white/10 px-2 py-0.5 rounded-md">
                      {selectedColor.name}
                    </span>
                    <h4 className="text-xl font-bold font-sans tracking-wide leading-tight">
                      {phone.name}
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Swatch Picker */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 text-center">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Select Finish
              </h4>
              <div className="flex justify-center gap-3">
                {phone.colors.map((color, index) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColorIndex(index)}
                    title={color.name}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColorIndex === index
                        ? "border-indigo-600 scale-110"
                        : "border-gray-200 dark:border-gray-800 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                  ></button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                {selectedColor.name}
              </p>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="space-y-8">
            {/* Title & Brand */}
            <div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                {phone.brand}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold mt-2 text-gray-900 dark:text-white leading-tight">
                {phone.name}
              </h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-2 mt-4 text-sm">
                <div className="flex text-amber-500 font-bold">
                  {"★".repeat(Math.floor(phone.rating))}
                  {phone.rating % 1 !== 0 && "½"}
                </div>
                <span className="font-semibold">{phone.rating}</span>
                <span className="text-gray-400">|</span>
                <a href="#details-tabs" onClick={() => setActiveTab("reviews")} className="text-indigo-650 hover:underline">
                  {phone.reviewsCount} Customer Reviews
                </a>
              </div>
            </div>

            {/* Price section */}
            <div className="bg-indigo-50/50 dark:bg-gray-900/50 rounded-3xl p-6 border border-indigo-100/50 dark:border-gray-850 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Special Retail Price</span>
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">
                  ₹{phone.price.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{phone.originalPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Save ₹{(phone.originalPrice - phone.price).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Overview</h3>
              <p className="text-gray-650 dark:text-gray-300 leading-relaxed">
                {phone.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleAddToCart}
                className={`flex-1 font-semibold px-8 py-4 rounded-2xl transition duration-200 active:scale-98 ${
                  cartAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25"
                }`}
              >
                {cartAdded ? "✓ Added to Cart" : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={buyNowStarted}
                className="flex-1 bg-gray-900 dark:bg-white dark:text-gray-950 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition duration-200 disabled:opacity-50"
              >
                {buyNowStarted ? "Simulating..." : "Buy Now"}
              </button>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-gray-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                  ✓
                </div>
                <span>Free Express Delivery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-gray-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                  ✓
                </div>
                <span>1 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Tabs Section */}
        <section id="details-tabs" className="mb-20 text-left">
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8">
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
                activeTab === "specs"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Full Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
                activeTab === "reviews"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              User Reviews ({phone.reviews.length})
            </button>
          </div>

          {activeTab === "specs" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(phone.specs).map(([key, value]) => (
                <div key={key} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl flex justify-between gap-4">
                  <span className="font-semibold text-gray-450 uppercase tracking-wider text-xs">
                    {key}
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {phone.reviews.map((review, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-[24px] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-gray-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                        {review.author[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-950 dark:text-white">{review.author}</h4>
                        <span className="text-xs text-gray-450">{review.date}</span>
                      </div>
                    </div>
                    <div className="flex text-amber-500 font-bold text-sm">
                      {"★".repeat(review.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-650 dark:text-gray-300 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Products */}
        <section className="text-left border-t border-gray-200 dark:border-gray-800 pt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Smartphones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPhones.map((related) => (
              <Link
                key={related.id}
                to={`/product/${related.id}`}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col gap-4 group"
              >
                <div className="h-40 bg-gray-50 dark:bg-gray-950 rounded-2xl flex items-center justify-center overflow-hidden">
                  <div className={`w-20 h-28 rounded-2xl bg-gradient-to-tr ${related.gradient} p-1 shadow border border-white/10 group-hover:scale-105 transition-transform duration-300`}></div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{related.brand}</span>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white mt-1 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                    {related.name}
                  </h3>
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-2">
                    ₹{related.price.toLocaleString("en-IN")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;
