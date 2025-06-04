// frontend/src/components/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }
      setSuccessMessage('Signup successful! Please login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="p-4 bg-[#0f1a24] min-h-screen text-white flex flex-col justify-center items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#172736] p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && <div className="mb-4 text-red-500 bg-red-900 p-3 rounded">{error}</div>}
        {successMessage && <div className="mb-4 text-green-500 bg-green-900 p-3 rounded">{successMessage}</div>}
        {/* Email, Password inputs, Submit button */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b]" required />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded bg-[#20364b] border border-[#2e4e6b]" required />
        </div>
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Sign Up</button>
      </form>
       <p className="mt-4 text-center">
        Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
      </p>
    </div>
  );
}
