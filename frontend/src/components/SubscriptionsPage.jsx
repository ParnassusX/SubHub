import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For a potential "Add Subscription" button
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth(); // Get token from context

  const fetchSubscriptions = async () => { // Make fetchSubscriptions a callable function
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions', { // Proxied request
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSubscriptions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSubscriptions([]); // Clear previous data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleDelete = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const responseData = await response.json();
          throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
        }
        // Refresh the list after successful deletion
        fetchSubscriptions();
      } catch (err) {
        // In a real app, you might want to show this error more gracefully
        alert(`Error deleting subscription: ${err.message}`);
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-white">Loading subscriptions...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error fetching subscriptions: {error}</div>;
  }

  return (
    <div className="p-4 bg-[#0f1a24] min-h-screen text-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Subscriptions</h1>
              <Link to="/subscriptions/new" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded no-underline">
                Add New Subscription
              </Link>
        </div>
        {subscriptions.length === 0 ? (
          <p>No subscriptions found. Add your first one!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#172736] border border-[#2e4e6b] rounded-xl">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Billing Cycle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Next Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2e4e6b]">
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{sub.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{sub.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{sub.billingCycle}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(sub.nextPaymentDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${sub.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/subscriptions/edit/${sub.id}`} className="text-indigo-400 hover:text-indigo-600 mr-3 no-underline">Edit</Link>
                          <button onClick={() => handleDelete(sub.id)} className="text-red-400 hover:text-red-600">Delete</button>
                        </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
