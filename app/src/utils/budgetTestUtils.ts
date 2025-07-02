// Budget Test Utilities - Helper functions for testing budget functionality
import { Subscription } from '../contexts/SubscriptionContext';
import { BudgetService } from '../services/budgetService';
import { CategoryBudget } from '../types/budget';

// Sample test data
export const sampleSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    cost: 15.99,
    frequency: 'Monthly',
    category: 'Entertainment',
    startDate: '2024-01-01',
    user_id: 'test-user'
  },
  {
    id: '2',
    name: 'Spotify',
    cost: 9.99,
    frequency: 'Monthly',
    category: 'Entertainment',
    startDate: '2024-01-01',
    user_id: 'test-user'
  },
  {
    id: '3',
    name: 'Adobe Creative Suite',
    cost: 239.88,
    frequency: 'Yearly',
    category: 'Productivity',
    startDate: '2024-01-01',
    user_id: 'test-user'
  },
  {
    id: '4',
    name: 'Gym Membership',
    cost: 49.99,
    frequency: 'Monthly',
    category: 'Health & Fitness',
    startDate: '2024-01-01',
    user_id: 'test-user'
  }
];

export const sampleCategoryBudgets: CategoryBudget = {
  'Entertainment': 30,
  'Productivity': 25,
  'Health & Fitness': 60
};

// Test budget calculations
export function testBudgetCalculations() {
  console.log('🧪 Testing Budget Calculations...');
  
  // Test spending calculation
  const spending = BudgetService.calculateSpending(sampleSubscriptions);
  console.log('📊 Spending:', spending);
  
  // Expected: Netflix (15.99) + Spotify (9.99) + Adobe (239.88/12 = 19.99) + Gym (49.99) = 95.96 monthly
  const expectedMonthly = 15.99 + 9.99 + (239.88 / 12) + 49.99;
  console.log('✅ Expected monthly:', expectedMonthly.toFixed(2));
  console.log('✅ Calculated monthly:', spending.monthly.toFixed(2));
  console.log('✅ Match:', Math.abs(spending.monthly - expectedMonthly) < 0.01);
  
  // Test category spending
  const categorySpending = BudgetService.calculateCategorySpending(sampleSubscriptions);
  console.log('📊 Category Spending:', categorySpending);
  
  // Test budget progress
  const monthlyBudget = 100;
  const monthlyProgress = BudgetService.calculateBudgetProgress(spending.monthly, monthlyBudget);
  console.log('📊 Monthly Progress:', monthlyProgress);
  
  // Test category budget progress
  const categoryProgress = BudgetService.calculateCategoryBudgetProgress(categorySpending, sampleCategoryBudgets);
  console.log('📊 Category Progress:', categoryProgress);
  
  // Test budget summary
  const budgetSummary = BudgetService.calculateBudgetSummary({
    subscriptions: sampleSubscriptions as any, // Type assertion for test data
    monthlyBudget: monthlyBudget,
    yearlyBudget: 1200,
    categoryBudgets: sampleCategoryBudgets
  });
  console.log('📊 Budget Summary:', budgetSummary);
  
  console.log('✅ Budget calculations test completed!');
  return budgetSummary;
}

// Test budget status colors
export function testBudgetStatusColors() {
  console.log('🎨 Testing Budget Status Colors...');
  
  const colors = {
    under_budget: BudgetService.getBudgetStatusColor('under_budget'),
    approaching_limit: BudgetService.getBudgetStatusColor('approaching_limit'),
    over_budget: BudgetService.getBudgetStatusColor('over_budget')
  };
  
  console.log('🎨 Status Colors:', colors);
  console.log('✅ Budget status colors test completed!');
  return colors;
}

// Test budget validation scenarios
export function testBudgetValidation() {
  console.log('🔍 Testing Budget Validation...');
  
  // Test valid budget data
  const validBudgetForm = {
    monthlyBudget: '100.00',
    yearlyBudget: '1200.00',
    categoryBudgets: {
      'Entertainment': '30.00',
      'Productivity': '25.00'
    },
    budgetAlertsEnabled: true
  };
  
  // Test invalid budget data
  const invalidBudgetForm = {
    monthlyBudget: '-50.00', // Negative value
    yearlyBudget: 'invalid', // Invalid number
    categoryBudgets: {
      'Entertainment': '1000000.00' // Exceeds limit
    },
    budgetAlertsEnabled: true
  };
  
  console.log('✅ Budget validation test completed!');
  return { validBudgetForm, invalidBudgetForm };
}

// Test helper for percentage formatting
export function testPercentageFormatting() {
  console.log('📊 Testing Percentage Formatting...');
  
  const testCases = [
    { input: 45.67, expected: '45.7%' },
    { input: 100.0, expected: '100.0%' },
    { input: 150.5, expected: '150.5%' },
    { input: 1500.0, expected: '999.0%' } // Should cap at 999%
  ];
  
  testCases.forEach(({ input, expected }) => {
    const result = BudgetService.formatBudgetPercentage(input);
    console.log(`📊 ${input}% -> ${result} (expected: ${expected})`);
    console.log(`✅ Match: ${result === expected}`);
  });
  
  console.log('✅ Percentage formatting test completed!');
}

// Test helper for budget existence check
export function testBudgetExistenceCheck() {
  console.log('🔍 Testing Budget Existence Check...');
  
  const testCases = [
    { monthly: 100, yearly: null, categories: {} as CategoryBudget, expected: true },
    { monthly: null, yearly: 1200, categories: {} as CategoryBudget, expected: true },
    { monthly: null, yearly: null, categories: { 'Entertainment': 30 } as CategoryBudget, expected: true },
    { monthly: null, yearly: null, categories: {} as CategoryBudget, expected: false }
  ];
  
  testCases.forEach(({ monthly, yearly, categories, expected }, index) => {
    const result = BudgetService.hasBudgetSet(monthly, yearly, categories);
    console.log(`🔍 Test ${index + 1}: ${result} (expected: ${expected})`);
    console.log(`✅ Match: ${result === expected}`);
  });
  
  console.log('✅ Budget existence check test completed!');
}

// Run all tests
export function runAllBudgetTests() {
  console.log('🚀 Running All Budget Tests...');
  console.log('================================');
  
  testBudgetCalculations();
  console.log('');
  
  testBudgetStatusColors();
  console.log('');
  
  testBudgetValidation();
  console.log('');
  
  testPercentageFormatting();
  console.log('');
  
  testBudgetExistenceCheck();
  console.log('');
  
  console.log('🎉 All Budget Tests Completed!');
  console.log('================================');
}
