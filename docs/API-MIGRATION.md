# API Migration Guide

This document provides instructions for migrating from direct API calls to our new API utility functions. This migration is necessary to prevent API URLs from being exposed in the client-side code.

## Why Migrate?

When you make direct API calls using `NEXT_PUBLIC_` environment variables, the API URLs are exposed in the client-side code and can be seen in the browser's network tab. This is a security risk, especially for sensitive endpoints.

By using our new API utility functions, all API calls are proxied through Next.js API routes, keeping your actual API URLs hidden from the client side.

## How to Migrate

### 1. Find Direct API Calls

Look for code that makes direct API calls using `fetch()` with `process.env.NEXT_PUBLIC_` variables:

```javascript
// Example of a direct API call
const response = await fetch(process.env.NEXT_PUBLIC_BRANCHES_API, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
});
const data = await response.json();
```

### 2. Replace with API Utility Functions

Import the appropriate utility function from `@/lib/api` and use it instead:

```javascript
// Example using API utility function
import { getBranches } from '@/lib/api';
const data = await getBranches();
```

## Common API Calls and Their Replacements

### Authentication

```javascript
// Before
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials),
});
const data = await response.json();

// After
import { login } from '@/lib/api';
const data = await login(credentials);
```

### Branches

```javascript
// Before
const response = await fetch(process.env.NEXT_PUBLIC_BRANCHES_API, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
});
const data = await response.json();

// After
import { getBranches } from '@/lib/api';
const data = await getBranches();
```

### Customer Details

```javascript
// Before
const response = await fetch(`${process.env.NEXT_PUBLIC_CUSTOMER_DETAILS_API}?customerId=${customerId}`, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
});
const data = await response.json();

// After
import { getCustomerDetails } from '@/lib/api';
const data = await getCustomerDetails(customerId);
```

### Favorites

```javascript
// Before
const response = await fetch(process.env.NEXT_PUBLIC_FAVORITES_API, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(favoriteData),
});
const data = await response.json();

// After
import { updateFavorites } from '@/lib/api';
const data = await updateFavorites(favoriteData);
```

### Restaurant Approval

```javascript
// Before
const response = await fetch(process.env.RESTAURANT_APPROVAL_API, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(restaurantData),
});
const data = await response.json();

// After
import { submitRestaurantApproval } from '@/lib/api';
const data = await submitRestaurantApproval(restaurantData);
```

### Rider Approval

```javascript
// Before
const response = await fetch(process.env.RIDER_APPROVAL_API, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(riderData),
});
const data = await response.json();

// After
import { submitRiderApproval } from '@/lib/api';
const data = await submitRiderApproval(riderData);
```

### Generic API Calls

For API endpoints that don't have a specific utility function:

```javascript
// Before
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/some/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
const responseData = await response.json();

// After
import { apiPost } from '@/lib/api';
const responseData = await apiPost('/some/endpoint', data);
```

## Need Help?

If you need help migrating a specific API call, please refer to the `lib/api.js` file for all available utility functions or contact the development team. 