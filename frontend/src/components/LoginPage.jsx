// frontend/src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { loginAction } = useAuth(); // Get loginAction from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
          loginAction(data); // Use loginAction from context
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4 bg-[#0f1a24] min-h-screen text-white flex flex-col justify-center items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#172736] p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="mb-4 text-red-500 bg-red-900 p-3 rounded">{error}</div>}
        {/* Email, Password inputs, Submit button - similar to AddSubscriptionForm styling */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b]" required />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b]" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login</button>
      </form>
      <p className="mt-4 text-center">
        Don't have an account? <Link to="/signup" className="text-blue-400 hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
