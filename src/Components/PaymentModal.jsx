import { useState } from "react";

export default function PaymentModal({ course, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    // simulate delay
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md text-white shadow-lg">
        
        <h2 className="text-2xl font-bold mb-4">💳 Checkout</h2>

        <p className="mb-2 text-gray-300">{course.title}</p>
        <p className="mb-4 text-green-400 text-xl font-semibold">
          ₹{course.price}
        </p>

        {/* Fake Card Input */}
        <input
          placeholder="Card Number"
          className="w-full p-2 mb-3 rounded bg-gray-800"
        />
        <div className="flex gap-2">
          <input
            placeholder="MM/YY"
            className="w-1/2 p-2 mb-3 rounded bg-gray-800"
          />
          <input
            placeholder="CVV"
            className="w-1/2 p-2 mb-3 rounded bg-gray-800"
          />
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-green-600 py-2 rounded mt-2"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 text-sm text-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}