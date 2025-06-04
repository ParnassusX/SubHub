// frontend/src/components/EditSubscriptionForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function EditSubscriptionForm() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [amount, setAmount] = useState('');
  const [originalData, setOriginalData] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { id } = useParams(); // Get subscription ID from URL
  const { token } = useAuth(); // Get token from context

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const response = await fetch(`/api/subscriptions/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setName(data.name);
        setCategory(data.category);
        setBillingCycle(data.billingCycle);
        // Format date for input type="date" (YYYY-MM-DD)
        setNextPaymentDate(data.nextPaymentDate ? new Date(data.nextPaymentDate).toISOString().split('T')[0] : '');
        setAmount(data.amount.toString());
        setOriginalData(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSubscriptionData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!name || !category || !billingCycle || !nextPaymentDate || !amount) {
      setError('All fields are required.');
      return;
    }

    // Only include fields that have changed to avoid sending empty optional fields
    const updatedFields = {};
    if (name !== originalData.name) updatedFields.name = name;
    if (category !== originalData.category) updatedFields.category = category;
    if (billingCycle !== originalData.billingCycle) updatedFields.billingCycle = billingCycle;
    if (nextPaymentDate !== (originalData.nextPaymentDate ? new Date(originalData.nextPaymentDate).toISOString().split('T')[0] : '')) updatedFields.nextPaymentDate = nextPaymentDate;
    if (parseFloat(amount) !== originalData.amount) updatedFields.amount = parseFloat(amount);

    if (Object.keys(updatedFields).length === 0) {
        setSuccessMessage("No changes detected.");
        setTimeout(() => navigate('/subscriptions'), 1500);
        return;
    }

    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage('Subscription updated successfully!');
      setTimeout(() => navigate('/subscriptions'), 1500);

    } catch (err) {
      setError(err.message);
    }
  };

  if (!originalData && !error) {
    return <div className="p-4 text-white">Loading subscription data...</div>;
  }

  return (
    <div className="p-4 bg-[#0f1a24] min-h-screen text-white flex justify-center items-start">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-[#172736] p-8 rounded-xl shadow-md mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Subscription</h2>
        {error && <div className="mb-4 text-red-500 bg-red-900 p-3 rounded">{error}</div>}
        {successMessage && <div className="mb-4 text-green-500 bg-green-900 p-3 rounded">{successMessage}</div>}

        {/* Form input fields, similar to AddSubscriptionForm, pre-filled */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b] focus:outline-none focus:border-blue-500" required />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
          <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b] focus:outline-none focus:border-blue-500" required />
        </div>
        <div className="mb-4">
          <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-300 mb-1">Billing Cycle</label>
          <select id="billingCycle" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b] focus:outline-none focus:border-blue-500">
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
            <option value="Quarterly">Quarterly</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="nextPaymentDate" className="block text-sm font-medium text-gray-300 mb-1">Next Payment Date</label>
          <input type="date" id="nextPaymentDate" value={nextPaymentDate} onChange={(e) => setNextPaymentDate(e.target.value)} className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b] focus:outline-none focus:border-blue-500" required />
        </div>
        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
          <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b] focus:outline-none focus:border-blue-500" step="0.01" required />
        </div>
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Update Subscription</button>
      </form>
    </div>
  );
}
