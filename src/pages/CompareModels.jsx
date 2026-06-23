import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { smartphonesData } from "../data/smartphones";

const CompareModels = () => {
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPhones = smartphonesData.filter((phone) =>
    phone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    phone.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePhoneSelection = (phone) => {
    if (selectedPhones.find((p) => p.id === phone.id)) {
      setSelectedPhones(selectedPhones.filter((p) => p.id !== phone.id));
    } else {
      if (selectedPhones.length < 4) {
        setSelectedPhones([...selectedPhones, phone]);
      }
    }
  };

  const clearSelection = () => {
    setSelectedPhones([]);
  };

  const specs = [
    { key: "processor", label: "Processor" },
    { key: "display", label: "Display" },
    { key: "camera", label: "Camera" },
    { key: "battery", label: "Battery" },
    { key: "os", label: "Operating System" },
    { key: "storage", label: "Storage" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      {/* Header Section */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900 via-purple-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Compare <br />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              Smartphone Models
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mt-4">
            Select up to 4 phones to compare their specifications side-by-side and make an informed decision.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Selection Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Phone Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Phones</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choose up to 4 phones to compare ({selectedPhones.length}/4)
              </p>

              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Phone List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPhones.map((phone) => (
                  <button
                    key={phone.id}
                    onClick={() => togglePhoneSelection(phone)}
                    disabled={!selectedPhones.find((p) => p.id === phone.id) && selectedPhones.length >= 4}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedPhones.find((p) => p.id === phone.id)
                        ? "bg-purple-600 text-white border-2 border-purple-600"
                        : selectedPhones.length >= 4
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50"
                        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <div className="font-semibold text-sm">{phone.name}</div>
                    <div className="text-xs opacity-75">₹{phone.price.toLocaleString("en-IN")}</div>
                  </button>
                ))}
              </div>

              {selectedPhones.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="lg:col-span-2">
            {selectedPhones.length > 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Header with Phone Cards */}
                <div className="grid gap-4 p-6 border-b border-gray-200 dark:border-gray-800" style={{ gridTemplateColumns: `repeat(${selectedPhones.length}, 1fr)` }}>
                  {selectedPhones.map((phone) => (
                    <div
                      key={phone.id}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 text-center relative group"
                    >
                      <button
                        onClick={() => togglePhoneSelection(phone)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">{phone.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{phone.brand}</p>
                      
                      {/* Product Image */}
                      {phone.image && (
                        <div className="relative w-20 h-24 mx-auto mt-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={phone.image}
                            alt={phone.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          <span className="text-amber-500">★</span> {phone.rating}
                        </span>
                      </div>
                      <div className="mt-2 text-lg font-bold text-purple-600 dark:text-purple-400">
                        ₹{phone.price.toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Specifications */}
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {specs.map((spec) => (
                    <div key={spec.key} className="grid gap-4 p-6" style={{ gridTemplateColumns: `200px repeat(${selectedPhones.length}, 1fr)` }}>
                      <div className="font-bold text-gray-900 dark:text-white text-sm">{spec.label}</div>
                      {selectedPhones.map((phone) => (
                        <div key={phone.id} className="text-sm text-gray-600 dark:text-gray-400">
                          {phone.specs[spec.key]}
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Price Comparison */}
                  <div className="grid gap-4 p-6 bg-purple-50 dark:bg-purple-900/10" style={{ gridTemplateColumns: `200px repeat(${selectedPhones.length}, 1fr)` }}>
                    <div className="font-bold text-gray-900 dark:text-white text-sm">Price</div>
                    {selectedPhones.map((phone) => (
                      <div key={phone.id} className="text-sm">
                        <span className="line-through text-gray-400 text-xs">₹{phone.originalPrice.toLocaleString("en-IN")}</span>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          ₹{phone.price.toLocaleString("en-IN")}
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Save ₹{(phone.originalPrice - phone.price).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Rating */}
                  <div className="grid gap-4 p-6" style={{ gridTemplateColumns: `200px repeat(${selectedPhones.length}, 1fr)` }}>
                    <div className="font-bold text-gray-900 dark:text-white text-sm">Rating</div>
                    {selectedPhones.map((phone) => (
                      <div key={phone.id} className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500">★</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{phone.rating}</span>
                          <span className="text-xs text-gray-500">({phone.reviewsCount})</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid gap-4 p-6 bg-gray-50 dark:bg-gray-800" style={{ gridTemplateColumns: `200px repeat(${selectedPhones.length}, 1fr)` }}>
                    <div className="font-bold text-gray-900 dark:text-white text-sm">Action</div>
                    {selectedPhones.map((phone) => (
                      <Link
                        key={phone.id}
                        to={`/product/${phone.id}`}
                        className="inline-flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-3 py-2 rounded-lg transition-all"
                      >
                        View Details
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <span className="text-5xl">📱</span>
                <h3 className="text-xl font-bold mt-4 text-gray-900 dark:text-white">Select Phones to Compare</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Choose 1-4 phones from the left panel to see detailed specifications side-by-side</p>
              </div>
            )}
          </div>
        </div>

        {/* All Models Section for Reference */}
        <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Available Models</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {smartphonesData.map((phone) => (
              <button
                key={phone.id}
                onClick={() => togglePhoneSelection(phone)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedPhones.find((p) => p.id === phone.id)
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-600"
                    : selectedPhones.length >= 4
                    ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-purple-600"
                }`}
                disabled={!selectedPhones.find((p) => p.id === phone.id) && selectedPhones.length >= 4}
              >
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">{phone.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{phone.brand}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    ₹{phone.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-amber-500">★ {phone.rating}</span>
                </div>
                {selectedPhones.find((p) => p.id === phone.id) && (
                  <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">✓ Selected</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CompareModels;
