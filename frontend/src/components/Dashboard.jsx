// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const IconPlaceholder = ({ name }) => <div className="text-white w-[24px] h-[24px]">{name}</div>;

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);
  const [totalYearlyCost, setTotalYearlyCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth(); // Get token from context

  const [currentDate, setCurrentDate] = useState(new Date()); // For calendar month navigation
  const [paymentDates, setPaymentDates] = useState({}); // Store payment dates like { 'YYYY-MM-DD': true }

  useEffect(() => {
    // Added token dependency to re-fetch if token changes (e.g. after login)
    if (!token) { // Don't fetch if not authenticated
        setLoading(false);
        // setError("Please login to view subscriptions."); // Optional: set an error or specific message
        setSubscriptions([]); // Clear any existing subscriptions
        setPaymentDates({});
        setTotalMonthlyCost(0);
        setTotalYearlyCost(0);
        return;
    }
    const fetchSubscriptionsAndCalculateSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/subscriptions', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSubscriptions(data);

        let monthly = 0;
        let yearly = 0;
        const newPaymentDates = {};

        data.forEach(sub => {
          const amount = parseFloat(sub.amount) || 0;
          if (sub.billingCycle === 'Monthly') {
            monthly += amount;
            yearly += amount * 12;
          } else if (sub.billingCycle === 'Yearly') {
            monthly += amount / 12;
            yearly += amount;
          } else if (sub.billingCycle === 'Quarterly') {
            monthly += amount / 3;
            yearly += amount * 4;
          }
          if (sub.nextPaymentDate) {
             // Assuming nextPaymentDate is in a format that can be parsed by Date
            const paymentDateStr = new Date(sub.nextPaymentDate).toISOString().split('T')[0];
            newPaymentDates[paymentDateStr] = true;
          }
        });
        setPaymentDates(newPaymentDates);
        setTotalMonthlyCost(monthly);
        setTotalYearlyCost(yearly);
        setError(null);
      } catch (err) {
        // ... error handling ...
        setError(err.message);
        setSubscriptions([]);
        setTotalMonthlyCost(0);
        setTotalYearlyCost(0);
        setPaymentDates({});
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptionsAndCalculateSummary();
  }, [token]); // Added token as a dependency

  // Calendar helper functions and rendering logic
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const numDays = daysInMonth(year, month);
  const startingDay = firstDayOfMonth(year, month);

  const calendarDays = [];
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="p-2 border border-[#2e4e6b] h-16"></div>);
  }
  for (let day = 1; day <= numDays; day++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isPayment = paymentDates[dayStr];
    calendarDays.push(
      <div key={day} className={`p-2 border border-[#2e4e6b] h-16 flex flex-col items-center justify-center ${isPayment ? 'bg-blue-500' : ''}`}>
        {day}
        {isPayment && <span className="text-xs mt-1">Pay</span>}
      </div>
    );
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    // ... (outer structure and sidebar - remains the same) ...
    <div className="relative flex size-full min-h-screen flex-col bg-[#0f1a24] text-white overflow-x-hidden" style={{ fontFamily: 'Epilogue, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          {/* Sidebar (remains unchanged) */}
          <div className="layout-content-container flex flex-col w-80">
             {/* ... Same sidebar JSX as before ... */}
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-[#0f1a24] p-4">
              <div className="flex flex-col gap-4">
                <h1 className="text-white text-base font-medium leading-normal">SubscriptionHub</h1>
                <div className="flex flex-col gap-2">
                  <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#20364b] no-underline">
                    <IconPlaceholder name="House" />
                    <p className="text-white text-sm font-medium leading-normal">Dashboard</p>
                  </Link>
                  <Link to="/subscriptions" className="flex items-center gap-3 px-3 py-2 no-underline">
                    <IconPlaceholder name="List" />
                    <p className="text-white text-sm font-medium leading-normal">Subscriptions</p>
                  </Link>
                  <Link to="/reports" className="flex items-center gap-3 px-3 py-2 no-underline">
                    <IconPlaceholder name="Chart" />
                    <p className="text-white text-sm font-medium leading-normal">Reports</p>
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-3 py-2 no-underline">
                    <IconPlaceholder name="Gear" />
                    <p className="text-white text-sm font-medium leading-normal">Settings</p>
                  </Link>
                  <Link to="/help" className="flex items-center gap-3 px-3 py-2 no-underline">
                    <IconPlaceholder name="Help" />
                    <p className="text-white text-sm font-medium leading-normal">Help</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">Dashboard</p>
            </div>
            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Summary</h3>
            {/* ... (Summary loading/error/data JSX - remains unchanged) ... */}
            {loading && <div className="p-4 text-white">Loading summary...</div>}
            {error && <div className="p-4 text-red-500">Error loading summary: {error}</div>}
            {!loading && !error && (
              <div className="flex flex-wrap gap-4 p-4">
                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#2e4e6b]">
                  <p className="text-white text-base font-medium leading-normal">Total Monthly</p>
                  <p className="text-white tracking-light text-2xl font-bold leading-tight">${totalMonthlyCost.toFixed(2)}</p>
                </div>
                <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#2e4e6b]">
                  <p className="text-white text-base font-medium leading-normal">Total Yearly</p>
                  <p className="text-white tracking-light text-2xl font-bold leading-tight">${totalYearlyCost.toFixed(2)}</p>
                </div>
              </div>
            )}

            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Upcoming Payments</h3>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <button onClick={prevMonth} className="px-3 py-1 bg-[#20364b] rounded hover:bg-[#2e4e6b]">Prev</button>
                <h4 className="text-xl font-semibold">{monthName} {year}</h4>
                <button onClick={nextMonth} className="px-3 py-1 bg-[#20364b] rounded hover:bg-[#2e4e6b]">Next</button>
              </div>
              <div className="grid grid-cols-7 gap-px bg-[#2e4e6b] border border-[#2e4e6b]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                  <div key={dayName} className="p-2 text-center font-medium text-xs bg-[#172736]">{dayName}</div>
                ))}
                {calendarDays}
              </div>
            </div>

            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Subscriptions</h3>
            <div className="p-4">
              <p>View all subscriptions on the <Link to="/subscriptions" className="text-blue-400 hover:underline">Subscriptions page</Link>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
