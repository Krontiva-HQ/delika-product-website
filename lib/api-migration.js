/**
 * This file provides helper functions to make it easier to migrate from direct API calls
 * to our new API utility functions. It maps the old NEXT_PUBLIC_ environment variables
 * to the corresponding API utility functions.
 */

import {
  apiPost,
  login,
  authRequest,
  getBranches,
  getCustomerDetails,
  updateFavorites,
  submitRestaurantApproval,
  submitRiderApproval,
  submitOrder
} from './api';

/**
 * Map of environment variable names to their corresponding API utility functions
 */
const apiMappings = {
  // Auth
  'NEXT_PUBLIC_API_BASE_URL/auth/login': (data) => login(data),
  'NEXT_PUBLIC_API_BASE_URL/auth/register': (data) => authRequest('register', data),
  'NEXT_PUBLIC_API_BASE_URL/auth/reset-password': (data) => authRequest('reset-password', data),
  
  // Branches
  'NEXT_PUBLIC_BRANCHES_API': {
    GET: () => getBranches(),
    POST: (data) => apiPost('/delikaquickshipper_branches_table', data)
  },
  
  // Customer details
  'NEXT_PUBLIC_CUSTOMER_DETAILS_API': {
    GET: (customerId) => getCustomerDetails(customerId),
    POST: (data) => apiPost('/get/customer/details', data)
  },
  
  // Favorites
  'NEXT_PUBLIC_FAVORITES_API': (data) => updateFavorites(data),
  
  // Restaurant approval
  'RESTAURANT_APPROVAL_API': (data) => submitRestaurantApproval(data),
  
  // Rider approval
  'RIDER_APPROVAL_API': (data) => submitRiderApproval(data),

  // Orders
  'NEXT_PUBLIC_ORDERS_API': (data) => submitOrder(data)
};

/**
 * Instructions for migrating from direct API calls to our new API utility functions:
 * 
 * 1. Find all instances of fetch() calls that use NEXT_PUBLIC_ environment variables
 * 2. Replace them with the corresponding API utility function
 * 
 * Example:
 * 
 * Before:
 * ```
 * const response = await fetch(process.env.NEXT_PUBLIC_BRANCHES_API, {
 *   method: 'GET',
 *   headers: { 'Content-Type': 'application/json' },
 * });
 * const data = await response.json();
 * ```
 * 
 * After:
 * ```
 * import { getBranches } from '@/lib/api';
 * const data = await getBranches();
 * ```
 */

export { apiMappings }; 