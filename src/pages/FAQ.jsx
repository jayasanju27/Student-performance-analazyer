import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const faqData = [
  {
    question: "How long does delivery take?",
    answer:
      "Most smartphone orders are delivered within 2–5 business days depending on your location.",
  },
  {
    question: "Do you offer Cash on Delivery (COD)?",
    answer:
      "Yes, Cash on Delivery is available in selected locations across India.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Products can be returned within 7 days of delivery if they are damaged or defective.",
  },
  {
    question: "Do smartphones come with a warranty?",
    answer:
      "Yes, all smartphones come with the manufacturer's official warranty.",
  },
  {
    question: "Are EMI options available?",
    answer:
      "Yes, we provide No-Cost EMI and standard EMI options through major banks and credit cards.",
  },
  {
    question: "How can I track my order?",
    answer:
      "You can track your order from the Orders section in your account dashboard.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />

      <section className="bg-gradient-to-b from-blue-50 via-white to-gray-50 min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold uppercase tracking-widest">
              Help Center
            </span>

            <h1 className="text-5xl font-bold text-gray-900 mt-4">
              Frequently Asked Questions
            </h1>

            <p className="mt-4 text-lg text-gray-600">
              Find answers to common questions about orders, delivery,
              payments, warranties, and more.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex justify-between items-center p-6 text-left"
                >
                  <span className="font-semibold text-lg text-gray-900">
                    {item.question}
                  </span>

                  <span className="text-2xl font-bold text-blue-600">
                    {activeIndex === index ? "−" : "+"}
                  </span>
                </button>

                {activeIndex === index && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Support Section */}
          <div className="mt-16 bg-white rounded-3xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Still Need Help?
            </h2>

            <p className="mt-3 text-gray-600">
              Our support team is available 24/7 to assist you.
            </p>

            <Link to="/contact" className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition">
              Contact Support
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
};

export default FAQ;
