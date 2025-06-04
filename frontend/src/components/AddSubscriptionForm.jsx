// frontend/src/components/AddSubscriptionForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // To redirect after successful submission
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function AddSubscriptionForm() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth(); // Get token from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!name || !category || !billingCycle || !nextPaymentDate || !amount) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          category,
          billingCycle,
          nextPaymentDate,
          amount: parseFloat(amount),
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage('Subscription added successfully!');
      // Clear form
      setName('');
      setCategory('');
      setBillingCycle('Monthly');
      setNextPaymentDate('');
      setAmount('');

      // Optional: Redirect to subscriptions list after a short delay
      setTimeout(() => navigate('/subscriptions'), 1500);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 bg-[#0f1a24] min-h-screen text-white flex justify-center items-start">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-[#172736] p-8 rounded-xl shadow-md mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Subscription</h2>

        {error && <div className="mb-4 text-red-500 bg-red-900 p-3 rounded">{error}</div>}
        {successMessage && <div className="mb-4 text-green-500 bg-green-900 p-3 rounded">{successMessage}</div>}

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b] focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b] focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-300 mb-1">Billing Cycle</label>
          <select
            id="billingCycle"
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
            className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b] focus:outline-none focus:border-blue-500"
          >
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
            <option value="Quarterly">Quarterly</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="nextPaymentDate" className="block text-sm font-medium text-gray-300 mb-1">Next Payment Date</label>
          <input
            type="date"
            id="nextPaymentDate"
            value={nextPaymentDate}
            onChange={(e) => setNextPaymentDate(e.target.value)}
            className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b] focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b] focus:outline-none focus:border-blue-500"
            step="0.01"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Subscription
        </button>
      </form>
    </div>
  );
}
