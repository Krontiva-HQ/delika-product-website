/**
 * Utility functions for making API calls through the Next.js API routes
 */

/**
 * Make a POST request to the API through the proxy
 * @param {string} endpoint - The API endpoint to call
 * @param {object} data - The data to send
 * @param {object} headers - Optional headers to include
 * @returns {Promise<object>} - The response data
 */
export async function apiPost(endpoint, data, headers = {}) {
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        data,
        headers,
      }),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'API request failed');
    }
    
    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Make a GET request to the API through the proxy
 * @param {string} endpoint - The API endpoint to call
 * @returns {Promise<object>} - The response data
 */
export async function apiGet(endpoint) {
  try {
    const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'API request failed');
    }
    
    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Make a login request through the dedicated auth API route
 * @param {object} credentials - The login credentials
 * @returns {Promise<object>} - The response data
 */
export async function login(credentials) {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Login failed');
    }
    
    return responseData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Get branches data
 * @returns {Promise<object>} - The branches data
 */
export async function getBranches() {
  try {
    const response = await fetch('/api/branches', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to fetch branches');
    }
    
    return responseData;
  } catch (error) {
    console.error('Branches API error:', error);
    throw error;
  }
}

/**
 * Get customer details
 * @param {string} customerId - Optional customer ID
 * @returns {Promise<object>} - The customer details
 */
export async function getCustomerDetails(customerId) {
  try {
    const queryParams = customerId ? `?customerId=${customerId}` : '';
    const response = await fetch(`/api/customer/details${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to fetch customer details');
    }
    
    return responseData;
  } catch (error) {
    console.error('Customer details API error:', error);
    throw error;
  }
}

/**
 * Update customer favorites
 * @param {object} data - The favorites data
 * @returns {Promise<object>} - The response data
 */
export async function updateFavorites(data) {
  try {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to update favorites');
    }
    
    return responseData;
  } catch (error) {
    console.error('Favorites API error:', error);
    throw error;
  }
}

/**
 * Submit restaurant approval
 * @param {object} data - The restaurant approval data
 * @returns {Promise<object>} - The response data
 */
export async function submitRestaurantApproval(data) {
  try {
    const response = await fetch('/api/restaurant/approval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to submit restaurant approval');
    }
    
    return responseData;
  } catch (error) {
    console.error('Restaurant approval API error:', error);
    throw error;
  }
}

/**
 * Submit rider approval
 * @param {object} data - The rider approval data
 * @returns {Promise<object>} - The response data
 */
export async function submitRiderApproval(data) {
  try {
    const response = await fetch('/api/rider/approval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to submit rider approval');
    }
    
    return responseData;
  } catch (error) {
    console.error('Rider approval API error:', error);
    throw error;
  }
} 