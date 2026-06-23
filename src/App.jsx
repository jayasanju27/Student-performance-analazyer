import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Import Pages
import SmartphoneHome from "./pages/SmartphoneHome";
import ProductDetails from "./pages/ProductDetails";
import ContactUs from "./pages/ContactUs";
import CustomerReviews from "./pages/CustomerReviews";
import FAQ from "./pages/FAQ";
import CompareModels from "./pages/CompareModels";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SmartphoneHome />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/reviews" element={<CustomerReviews />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/compare" element={<CompareModels />} />
      </Routes>
    </Router>
  );
}

export default App;
