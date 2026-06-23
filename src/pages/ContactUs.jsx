import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ContactUs = () => {
  const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activePin, setActivePin] = useState(null);

  const mockStores = [
    { id: "blr", city: "Bangalore", address: "102, Indiranagar Double Rd, Stage 2", phone: "+91 80 4912 3456", coords: { x: 45, y: 75 } },
    { id: "del", city: "New Delhi", address: "GF-14, Connaught Place, Inner Circle", phone: "+91 11 2341 7890", coords: { x: 40, y: 25 } },
    { id: "mum", city: "Mumbai", address: "Block B, Bandra Kurla Complex", phone: "+91 22 6678 1234", coords: { x: 28, y: 55 } }
  ];

  const handleInputChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-indigo-650 dark:text-indigo-400 font-semibold uppercase tracking-widest text-xs">
            Connect With Us
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mt-3">
            We'd Love to Help You
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
            Have questions about our premium smartphones, , or need technical support? Send us a message or visit one of our flagship boutiques.
          </p>
        </div>

        {/* Contact Form and Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 text-left items-start">
          {/* Glassmorphic Form Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[32px] p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white mb-6">Send Message</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-xl font-semibold">
                ✓ Message sent successfully! Our concierge will contact you within 2 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formState.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formState.subject}
                    onChange={handleInputChange}
                    placeholder="Support / Multi-Order"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Message</label>
                <textarea
                  name="message"
                  required
                  rows="4"
                  value={formState.message}
                  onChange={handleInputChange}
                  placeholder="How can we assist you today?"
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          </div>

          {/* Boutique Details & Social Info */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[32px] p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-950 dark:text-white mb-6">Flagship Boutiques</h2>
              <div className="space-y-6">
                {mockStores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => setActivePin(store.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      activePin === store.id
                        ? "bg-indigo-50/50 dark:bg-gray-950 border-indigo-500"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-950"
                    }`}
                  >
                    <h3 className="font-bold text-md text-indigo-650 dark:text-indigo-400">{store.city} Flagship</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">{store.address}</p>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">Phone: {store.phone}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact info cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-600 text-white p-6 rounded-[24px]">
                <span className="text-2xl">📞</span>
                <h4 className="font-bold text-md mt-3">Hotline Support</h4>
                <p className="text-xs text-indigo-200 mt-1">1800-419-8800</p>
                <p className="text-[10px] text-indigo-300 mt-2">Available 24/7</p>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-[24px]">
                <span className="text-2xl">✉️</span>
                <h4 className="font-bold text-md mt-3">Email Us</h4>
                <p className="text-xs text-gray-500 mt-1">concierge@aeromobiles.com</p>
                <p className="text-[10px] text-gray-400 mt-2">Response in 1 hour</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map Section */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[40px] p-8 text-left shadow-sm">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Store Locator Map</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click boutique pins to see hours and active details.</p>
            </div>
            <div className="flex gap-2">
              {mockStores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActivePin(s.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    activePin === s.id
                      ? "bg-indigo-600 text-white border-transparent"
                      : "bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-850"
                  }`}
                >
                  {s.city}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Mock SVG Map Graphic */}
          <div className="relative bg-slate-900 rounded-3xl h-[300px] border border-gray-800 flex items-center justify-center overflow-hidden">
            {/* Soft grid decoration */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

            {/* Stylized SVG Map outlines */}
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-20 pointer-events-none">
              <path d="M20,10 Q30,15 40,8 T60,20 T80,15 T90,30 T85,55 T75,80 T50,90 T30,85 T10,60 Z" fill="none" stroke="#6366f1" strokeWidth="1" />
              <path d="M30,30 Q45,35 50,45 T65,60" fill="none" stroke="#4f46e5" strokeWidth="0.5" strokeDasharray="3 3" />
            </svg>

            {/* Interactive Pins */}
            {mockStores.map((store) => (
              <button
                key={store.id}
                onClick={() => setActivePin(store.id)}
                className="absolute group transition-transform hover:scale-110 focus:outline-none"
                style={{ left: `${store.coords.x}%`, top: `${store.coords.y}%` }}
              >
                {/* Ping rings */}
                <span className={`absolute -inset-2 rounded-full ${activePin === store.id ? "bg-indigo-400/30 animate-ping" : "bg-transparent"}`}></span>
                {/* Pin Head */}
                <div className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-md transition-all ${
                  activePin === store.id ? "bg-indigo-600 scale-125" : "bg-indigo-400"
                }`}>
                  <span className="text-[8px] text-white font-extrabold">{store.city[0]}</span>
                </div>

                {/* Map Tooltip popover */}
                {activePin === store.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-slate-950 text-white rounded-2xl p-4 w-52 shadow-xl border border-gray-800 z-30 text-left pointer-events-auto">
                    <h4 className="font-bold text-sm text-indigo-400">{store.city} Boutique</h4>
                    <p className="text-[10px] text-gray-400 mt-1">{store.address}</p>
                    <div className="text-[9px] text-gray-500 mt-2 font-semibold">
                      Hours: 10:00 AM – 9:00 PM <br />
                      Support: Live on Site
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
