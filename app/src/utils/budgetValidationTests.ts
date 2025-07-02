// Budget Validation and Error Handling Tests
import {
  validateAmount,
  validateCategoryName,
  validateBudgetForm,
  validateField,
  convertFormDataToApiFormat,
  convertApiDataToFormFormat
} from './budgetValidation';
import {
  handleBudgetError,
  formatErrorForUser,
  isRetryableError
} from './budgetErrorHandling';
import { BudgetFormData } from '../types/budget';

// Test data
const validFormData: BudgetFormData = {
  monthlyBudget: '100.00',
  yearlyBudget: '1200.00',
  categoryBudgets: {
    'Entertainment': '30.00',
    'Productivity': '25.00',
    'Health & Fitness': '45.00'
  },
  budgetAlertsEnabled: true
};

const invalidFormData: BudgetFormData = {
  monthlyBudget: '-50.00', // Negative value
  yearlyBudget: 'invalid', // Invalid number
  categoryBudgets: {
    'Entertainment': '1000000.00', // Exceeds limit
    '': '20.00', // Empty category name
    'Invalid@Category!': '15.00' // Invalid characters
  },
  budgetAlertsEnabled: true
};

// Test amount validation
export function testAmountValidation() {
  console.log('🧪 Testing Amount Validation...');
  
  const testCases = [
    { value: '100.00', expected: 0 }, // Valid
    { value: '0', expected: 0 }, // Zero is valid
    { value: '', expected: 0 }, // Empty is valid (not required)
    { value: '-50', expected: 1 }, // Negative
    { value: 'invalid', expected: 1 }, // Invalid number
    { value: '1000000', expected: 1 }, // Exceeds limit
  ];

  testCases.forEach(({ value, expected }, index) => {
    const errors = validateAmount(value, 'testField');
    console.log(`Test ${index + 1}: "${value}" -> ${errors.length} errors (expected: ${expected})`);
    console.log(`✅ Pass: ${errors.length === expected}`);
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.map(e => e.message).join(', ')}`);
    }
  });

  console.log('✅ Amount validation tests completed!');
}

// Test category name validation
export function testCategoryNameValidation() {
  console.log('🧪 Testing Category Name Validation...');
  
  const testCases = [
    { value: 'Entertainment', expected: 0 }, // Valid
    { value: 'Health & Fitness', expected: 0 }, // Valid with special chars
    { value: '', expected: 1 }, // Empty
    { value: 'A'.repeat(51), expected: 1 }, // Too long
    { value: 'Invalid@Category!', expected: 1 }, // Invalid characters
  ];

  testCases.forEach(({ value, expected }, index) => {
    const errors = validateCategoryName(value);
    console.log(`Test ${index + 1}: "${value}" -> ${errors.length} errors (expected: ${expected})`);
    console.log(`✅ Pass: ${errors.length === expected}`);
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.map(e => e.message).join(', ')}`);
    }
  });

  console.log('✅ Category name validation tests completed!');
}

// Test form validation
export function testFormValidation() {
  console.log('🧪 Testing Form Validation...');
  
  // Test valid form
  const validResult = validateBudgetForm(validFormData);
  console.log(`Valid form: ${validResult.isValid} (expected: true)`);
  console.log(`✅ Pass: ${validResult.isValid === true}`);
  
  // Test invalid form
  const invalidResult = validateBudgetForm(invalidFormData);
  console.log(`Invalid form: ${invalidResult.isValid} (expected: false)`);
  console.log(`✅ Pass: ${invalidResult.isValid === false}`);
  console.log(`   Errors found: ${invalidResult.errors.length}`);
  
  if (invalidResult.errors.length > 0) {
    console.log('   Error details:');
    invalidResult.errors.forEach(error => {
      console.log(`     ${error.field}: ${error.message}`);
    });
  }

  console.log('✅ Form validation tests completed!');
}

// Test data conversion
export function testDataConversion() {
  console.log('🧪 Testing Data Conversion...');
  
  // Test form to API conversion
  const apiData = convertFormDataToApiFormat(validFormData);
  console.log('Form to API conversion:');
  console.log(`  Monthly budget: ${apiData.monthlyBudget} (expected: 100)`);
  console.log(`  Yearly budget: ${apiData.yearlyBudget} (expected: 1200)`);
  console.log(`  Category budgets: ${Object.keys(apiData.categoryBudgets).length} categories`);
  console.log(`  Alerts enabled: ${apiData.budgetAlertsEnabled} (expected: true)`);
  
  // Test API to form conversion
  const formData = convertApiDataToFormFormat(apiData);
  console.log('API to Form conversion:');
  console.log(`  Monthly budget: "${formData.monthlyBudget}" (expected: "100")`);
  console.log(`  Yearly budget: "${formData.yearlyBudget}" (expected: "1200")`);
  console.log(`  Category budgets: ${Object.keys(formData.categoryBudgets).length} categories`);
  console.log(`  Alerts enabled: ${formData.budgetAlertsEnabled} (expected: true)`);
  
  console.log('✅ Data conversion tests completed!');
}

// Test error handling
export function testErrorHandling() {
  console.log('🧪 Testing Error Handling...');
  
  // Test different error types
  const testErrors = [
    new Error('Network error'),
    { code: 'PGRST116', message: 'Not found' },
    { code: '23514', message: 'Check constraint violation' },
    { validationErrors: [{ field: 'test', message: 'Test error', code: 'INVALID_AMOUNT' as const }] },
    'Simple string error'
  ];

  testErrors.forEach((error, index) => {
    const budgetError = handleBudgetError(error);
    const formatted = formatErrorForUser(budgetError);
    const retryable = isRetryableError(budgetError);
    
    console.log(`Error ${index + 1}:`);
    console.log(`  Type: ${budgetError.type}`);
    console.log(`  Title: ${formatted.title}`);
    console.log(`  Message: ${formatted.message}`);
    console.log(`  Retryable: ${retryable}`);
    console.log(`  Suggestion: ${formatted.suggestion}`);
  });

  console.log('✅ Error handling tests completed!');
}

// Test field validation
export function testFieldValidation() {
  console.log('🧪 Testing Field Validation...');
  
  const testCases = [
    { field: 'monthlyBudget' as const, value: '100.00', expectedErrors: 0 },
    { field: 'monthlyBudget' as const, value: '-50', expectedErrors: 1 },
    { field: 'yearlyBudget' as const, value: 'invalid', expectedErrors: 1 },
    { field: 'categoryBudgets' as const, value: { 'Entertainment': '30.00' }, expectedErrors: 0 },
    { field: 'budgetAlertsEnabled' as const, value: true, expectedErrors: 0 }
  ];

  testCases.forEach(({ field, value, expectedErrors }, index) => {
    const errors = validateField(field, value);
    console.log(`Field test ${index + 1}: ${field} = ${JSON.stringify(value)}`);
    console.log(`  Errors: ${errors.length} (expected: ${expectedErrors})`);
    console.log(`  ✅ Pass: ${errors.length === expectedErrors}`);
    
    if (errors.length > 0) {
      console.log(`  Error messages: ${errors.map(e => e.message).join(', ')}`);
    }
  });

  console.log('✅ Field validation tests completed!');
}

// Test edge cases
export function testEdgeCases() {
  console.log('🧪 Testing Edge Cases...');
  
  // Test empty form
  const emptyForm: BudgetFormData = {
    monthlyBudget: '',
    yearlyBudget: '',
    categoryBudgets: {},
    budgetAlertsEnabled: false
  };
  
  const emptyResult = validateBudgetForm(emptyForm);
  console.log(`Empty form validation: ${emptyResult.isValid} (expected: true)`);
  console.log(`✅ Pass: ${emptyResult.isValid === true}`);
  
  // Test form with only category budgets
  const categoryOnlyForm: BudgetFormData = {
    monthlyBudget: '',
    yearlyBudget: '',
    categoryBudgets: {
      'Entertainment': '50.00'
    },
    budgetAlertsEnabled: true
  };
  
  const categoryOnlyResult = validateBudgetForm(categoryOnlyForm);
  console.log(`Category-only form validation: ${categoryOnlyResult.isValid} (expected: true)`);
  console.log(`✅ Pass: ${categoryOnlyResult.isValid === true}`);
  
  // Test inconsistent monthly/yearly budgets
  const inconsistentForm: BudgetFormData = {
    monthlyBudget: '100.00',
    yearlyBudget: '500.00', // Should be ~1200 for consistency
    categoryBudgets: {},
    budgetAlertsEnabled: true
  };
  
  const inconsistentResult = validateBudgetForm(inconsistentForm);
  console.log(`Inconsistent budget form validation: ${inconsistentResult.isValid} (expected: false)`);
  console.log(`✅ Pass: ${inconsistentResult.isValid === false}`);
  
  if (!inconsistentResult.isValid) {
    console.log(`  Found inconsistency warning: ${inconsistentResult.errors.some(e => e.message.includes('inconsistent'))}`);
  }

  console.log('✅ Edge cases tests completed!');
}

// Run all validation tests
export function runAllValidationTests() {
  console.log('🚀 Running All Budget Validation Tests...');
  console.log('===========================================');
  
  testAmountValidation();
  console.log('');
  
  testCategoryNameValidation();
  console.log('');
  
  testFormValidation();
  console.log('');
  
  testDataConversion();
  console.log('');
  
  testErrorHandling();
  console.log('');
  
  testFieldValidation();
  console.log('');
  
  testEdgeCases();
  console.log('');
  
  console.log('🎉 All Budget Validation Tests Completed!');
  console.log('===========================================');
}

// Export test runner for easy access
export default runAllValidationTests;
