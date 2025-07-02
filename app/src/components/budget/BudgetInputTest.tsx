// Budget Input Test Component - For testing budget input components
import React, { useState } from 'react';
import MonthlyBudgetSection from './MonthlyBudgetSection';
import YearlyBudgetSection from './YearlyBudgetSection';
import { validateAmount } from '../../utils/budgetValidation';

const BudgetInputTest: React.FC = () => {
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [yearlyBudget, setYearlyBudget] = useState('');
  const [monthlyError, setMonthlyError] = useState<string | undefined>();
  const [yearlyError, setYearlyError] = useState<string | undefined>();

  // Handle monthly budget change with validation
  const handleMonthlyChange = (value: string) => {
    setMonthlyBudget(value);
    
    // Validate the amount
    const errors = validateAmount(value, 'monthlyBudget');
    setMonthlyError(errors.length > 0 ? errors[0].message : undefined);
  };

  // Handle yearly budget change with validation
  const handleYearlyChange = (value: string) => {
    setYearlyBudget(value);
    
    // Validate the amount
    const errors = validateAmount(value, 'yearlyBudget');
    setYearlyError(errors.length > 0 ? errors[0].message : undefined);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Budget Input Components Test</h2>
        
        <div className="space-y-6">
          {/* Monthly Budget Section */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Monthly Budget Section</h3>
            <MonthlyBudgetSection
              value={monthlyBudget}
              onChange={handleMonthlyChange}
              error={monthlyError}
              currency="USD"
              disabled={false}
            />
          </div>

          {/* Yearly Budget Section */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Yearly Budget Section</h3>
            <YearlyBudgetSection
              value={yearlyBudget}
              onChange={handleYearlyChange}
              error={yearlyError}
              currency="USD"
              disabled={false}
              monthlyBudget={monthlyBudget}
            />
          </div>

          {/* Current Values Display */}
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Current Values:</h4>
            <div className="space-y-1 text-sm text-gray-400">
              <div>Monthly Budget: "{monthlyBudget}" {monthlyError && `(Error: ${monthlyError})`}</div>
              <div>Yearly Budget: "{yearlyBudget}" {yearlyError && `(Error: ${yearlyError})`}</div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Test Cases:</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleMonthlyChange('100.00')}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
              >
                Set Monthly: $100
              </button>
              <button
                onClick={() => handleYearlyChange('1200.00')}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
              >
                Set Yearly: $1200
              </button>
              <button
                onClick={() => handleMonthlyChange('-50')}
                className="px-3 py-1 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded"
              >
                Test Negative (Monthly)
              </button>
              <button
                onClick={() => handleYearlyChange('invalid')}
                className="px-3 py-1 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded"
              >
                Test Invalid (Yearly)
              </button>
              <button
                onClick={() => {
                  handleMonthlyChange('');
                  handleYearlyChange('');
                }}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded col-span-2"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetInputTest;
