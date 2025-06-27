import React, { useState } from 'react';

const Categories: React.FC = () => {
  const [categories] = useState([
    { id: 1, name: 'Entertainment', count: 3, color: 'bg-purple-500' },
    { id: 2, name: 'Productivity', count: 2, color: 'bg-blue-500' },
    { id: 3, name: 'Health & Fitness', count: 1, color: 'bg-green-500' },
    { id: 4, name: 'News & Media', count: 2, color: 'bg-orange-500' },
    { id: 5, name: 'Cloud Storage', count: 1, color: 'bg-cyan-500' },
  ]);

  return (
    <div className="flex-1 bg-[#0f1a24] h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6">
        <h1 className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight">Categories</h1>
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors w-full sm:w-auto">
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6 hover:bg-[#20364b]/80 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 256 256">
                  <path d="M216,64H176a48,48,0,0,0-96,0H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm88,168H40V80H80V96a8,8,0,0,0,16,0V80h64V96a8,8,0,0,0,16,0V80h40Z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-semibold">{category.name}</h3>
                <p className="text-gray-400 text-sm">{category.count} subscriptions</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-gray-400 text-sm">Manage</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-400" viewBox="0 0 256 256">
                <path d="m221.66,133.66-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
              </svg>
            </div>
          </div>
        ))}
        
        {/* Add New Category Card */}
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] border-dashed p-6 hover:bg-[#20364b]/80 transition-colors cursor-pointer flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Add New Category</p>
          </div>
        </div>
      </div>

      {/* Category Management */}
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Category Management</h3>
      <div className="p-4">
        <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Auto-categorization</h4>
                <p className="text-gray-400 text-sm">Automatically assign categories to new subscriptions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Color coding</h4>
                <p className="text-gray-400 text-sm">Use colors to distinguish categories in charts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
