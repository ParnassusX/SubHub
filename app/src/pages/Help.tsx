import React from 'react';

const Help: React.FC = () => {
  const faqs = [
    {
      question: "How do I add a new subscription?",
      answer: "Navigate to the Subscriptions page and fill out the form with your subscription details including name, cost, frequency, and start date."
    },
    {
      question: "Can I track yearly subscriptions?",
      answer: "Yes! You can set the payment frequency to either Monthly or Yearly when adding a subscription."
    },
    {
      question: "How are the totals calculated?",
      answer: "Monthly totals show your recurring monthly costs. Yearly subscriptions are divided by 12 to show their monthly equivalent."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export all your subscription data from the Settings page under Data & Privacy."
    },
    {
      question: "How do I delete a subscription?",
      answer: "Click the 'Delete' button next to any subscription in your list. You'll be asked to confirm the deletion."
    }
  ];

  return (
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto">
      <div className="flex flex-wrap justify-between gap-3 p-4 sm:p-6">
        <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight">Help & Support</h1>
      </div>

      {/* Quick Actions */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6 hover:bg-[#20364b]/80 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 256 256">
                <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-white font-medium">Contact Support</h4>
              <p className="text-gray-400 text-sm">Get help from our team</p>
            </div>
          </div>
        </div>

        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6 hover:bg-[#20364b]/80 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 256 256">
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V88H40V56Zm0,144H40V104H216v96Z"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-white font-medium">User Guide</h4>
              <p className="text-gray-400 text-sm">Learn how to use SubHub</p>
            </div>
          </div>
        </div>

        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6 hover:bg-[#20364b]/80 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 256 256">
                <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-white font-medium">Report Bug</h4>
              <p className="text-gray-400 text-sm">Found an issue? Let us know</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Frequently Asked Questions</h3>
      <div className="p-4">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6">
              <h4 className="text-white font-medium mb-2">{faq.question}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Getting Started</h3>
      <div className="p-4">
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Add your first subscription</h4>
                <p className="text-gray-400 text-sm">Go to the Subscriptions page and add your streaming services, software, or other recurring payments.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Review your dashboard</h4>
                <p className="text-gray-400 text-sm">Check your Dashboard to see spending summaries and upcoming payments.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Analyze your spending</h4>
                <p className="text-gray-400 text-sm">Use the Reports page to understand your subscription patterns and find savings opportunities.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="text-white font-medium">Organize with categories</h4>
                <p className="text-gray-400 text-sm">Use Categories to group similar subscriptions and get better insights.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
