import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { smartphonesData, allBrands } from "../data/smartphones";

const SmartphoneHome = () => {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Filter and sort smartphones
  const filteredSmartphones = useMemo(() => {
    let result = [...smartphonesData];

    // Filter by brand
    if (selectedBrand !== "All") {
      result = result.filter((phone) => phone.brand === selectedBrand);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (phone) =>
          phone.name.toLowerCase().includes(query) ||
          phone.brand.toLowerCase().includes(query) ||
          phone.description.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedBrand, searchQuery, sortBy]);

  // Filter newly launched phones
  const newlyLaunchedPhones = useMemo(() => {
    return smartphonesData.filter((phone) => phone.isNewlyLaunched === true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent)]"></div>
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              New Collection Unveiled
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Innovation in <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
                Every Single Hand.
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl">
              Explore our handpicked curation of elite smartphones. From industry leaders to our bespoke, great Edition matching duos, find your perfect companion.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#catalog"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-95"
              >
                Browse Catalog
              </a>
              <a
                href="#categories"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-95"
              >
                Newly Launched
              </a>
              <Link
                to="/compare"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-95"
              >
                Compare Models
              </Link>
            </div>
          </div>

          {/* Interactive Floating Mockup */}
          <div className="hidden lg:flex justify-center relative">
            <div className="w-72 h-[550px] rounded-[48px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden transform rotate-6 hover:rotate-3 transition-transform duration-500">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                <div className="w-10 h-1 rounded-full bg-slate-700 ml-3"></div>
              </div>
              <div className="w-full h-full rounded-[40px] bg-gradient-to-tr from-indigo-900 via-purple-950 to-rose-900 relative overflow-hidden p-6 flex flex-col justify-between text-left">
                <span className="text-white/60 font-semibold text-xs uppercase tracking-widest mt-4">AeroOS 10</span>
                <div className="space-y-4 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                    ✨
                  </div>
                  <h3 className="text-2xl font-bold text-white">AeroGold Duo</h3>
                  <p className="text-xs text-white/70">Luxury redefined. Built with 24k gold leaf accents.</p>
                  <Link
                    to="/product/buy"
                    className="inline-block bg-white text-indigo-950 text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Discover
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Elite Smartphone Catalog</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Filter by brand, search models, or sort based on your needs.</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search models or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-2xl w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filters and Sorting bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-left border-b border-gray-200 dark:border-gray-800 pb-6">
          {/* Brand Pills */}
          <div className="flex flex-wrap gap-2">
            {allBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  selectedBrand === brand
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="default">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredSmartphones.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredSmartphones.map((phone) => (
              <div
                key={phone.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[32px] p-5 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Image Container with CSS Mockup */}
                <div className="relative h-60 bg-gray-50 dark:bg-gray-950 rounded-2xl flex items-center justify-center overflow-hidden mb-6">
                  {/* Tag */}
                  {phone.tag && (
                    <span className={`absolute top-3 left-3 z-15 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${
                      phone.tag === "Flagship"
                        ? "bg-gradient-to-r from-amber-100 to-rose-200 text-amber-900 border border-amber-200"
                        : "bg-indigo-100 text-indigo-850 dark:bg-indigo-900/80 dark:text-indigo-200"
                    }`}>
                      {phone.tag}
                    </span>
                  )}

                  {/* Rating */}
                  <span className="absolute top-3 right-3 z-15 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <span className="text-amber-500">★</span> {phone.rating}
                  </span>

                  {/* Product Image */}
                  <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                    {phone.image ? (
                      <>
                        <img
                          src={phone.image}
                          alt={phone.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <span className="text-gray-400 text-sm">Image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3 text-left">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                      {phone.brand}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {phone.name}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {phone.description}
                  </p>

                  <div className="flex items-end justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-sm font-semibold text-gray-400 line-through">
                        ₹{phone.originalPrice.toLocaleString("en-IN")}
                      </span>
                      <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                        ₹{phone.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <Link
                      to={`/product/${phone.id}`}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-200 flex items-center gap-1"
                    >
                      Details
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
            <span className="text-4xl">🔍</span>
            <h3 className="text-xl font-bold mt-4 text-gray-900 dark:text-white">No models found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Try checking for spelling or modifying your filters.</p>
            <button
              onClick={() => {
                setSelectedBrand("All");
                setSearchQuery("");
                setSortBy("default");
              }}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* Newly Launched Section */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 mb-3 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Just Released
            </span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Newly Launched Models</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Discover the latest flagship phones launched this season.</p>
          </div>
        </div>

        {/* Newly Launched Grid */}
        {newlyLaunchedPhones.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newlyLaunchedPhones.map((phone) => (
              <div
                key={phone.id}
                className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[32px] p-5 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
              >
                {/* New Badge */}
                <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                  NEW
                </div>

                {/* Image Container */}
                <div className="relative h-60 bg-gray-50 dark:bg-gray-950 rounded-2xl flex items-center justify-center overflow-hidden mb-6">
                  {phone.tag && (
                    <span className={`absolute top-3 left-3 z-15 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${
                      phone.tag === "Flagship"
                        ? "bg-gradient-to-r from-amber-100 to-rose-200 text-amber-900 border border-amber-200"
                        : "bg-indigo-100 text-indigo-850 dark:bg-indigo-900/80 dark:text-indigo-200"
                    }`}>
                      {phone.tag}
                    </span>
                  )}

                  <span className="absolute top-3 right-3 z-15 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <span className="text-amber-500">★</span> {phone.rating}
                  </span>

                  {/* Product Image */}
                  <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                    {phone.image ? (
                      <>
                        <img
                          src={phone.image}
                          alt={phone.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <span className="text-gray-400 text-sm">Image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3 text-left">
                  <div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                      {phone.brand}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {phone.name}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {phone.description}
                  </p>

                  <div className="flex items-end justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-sm font-semibold text-gray-400 line-through">
                        ₹{phone.originalPrice.toLocaleString("en-IN")}
                      </span>
                      <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                        ₹{phone.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <Link
                      to={`/product/${phone.id}`}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-200 flex items-center gap-1"
                    >
                      Details
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
            <span className="text-4xl">🚀</span>
            <h3 className="text-xl font-bold mt-4 text-gray-900 dark:text-white">Coming Soon</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Stay tuned for exciting new launches!</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default SmartphoneHome;
