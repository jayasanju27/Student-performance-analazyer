import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 text-left">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                AeroMobiles
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Experience the pinnacle of mobile innovation. Hand-crafted premium designs, state-of-the-art processors, and cameras curated to capture your absolute best moments.
            </p>
          </div>

          {/* Shop Links */}
          <div className="text-left">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">All Smartphones</Link>
              </li>
              <li>
                <Link to="/collections/flagship" className="hover:text-indigo-400 transition-colors">Flagship Models</Link>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors">Premium Bundles</a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors">Accessories</a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="text-left">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="hover:text-indigo-400 transition-colors">FAQ & Help Center</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact Support</Link>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors">Order Tracking</a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors">Warranty & Return Policy</a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="text-left space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Stay Connected</h3>
            <p className="text-sm text-gray-400">
              Subscribe to get notified about new premium collection drops and updates.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-900 text-white placeholder-gray-500 text-sm rounded-xl px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-800"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition duration-200"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Social Icons & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} AeroMobiles Inc. All rights reserved. Made with love for premium tech.
          </p>

          <div className="flex space-x-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 19 19">
                <use href="/icons.svg#github-icon"></use>
              </svg>
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 19">
                <use href="/icons.svg#discord-icon"></use>
              </svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 19 19">
                <use href="/icons.svg#x-icon"></use>
              </svg>
            </a>
            <a href="https://bsky.app" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 16 17">
                <use href="/icons.svg#bluesky-icon"></use>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
