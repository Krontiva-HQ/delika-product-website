# Finding and Fixing Direct API Calls

This document provides guidance on how to find and fix direct API calls in your codebase that might be exposing your API URLs in the browser.

## Common Patterns to Search For

Use your code editor's search functionality to find these patterns:

1. **Direct fetch calls with environment variables:**
   ```
   fetch(process.env.NEXT_PUBLIC_
   ```

2. **Specific API endpoints:**
   ```
   fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login
   ```

3. **API URL constants:**
   ```
   const API_URL = process.env.NEXT_PUBLIC_
   ```

4. **Axios or other HTTP clients:**
   ```
   axios.post(`${process.env.NEXT_PUBLIC_
   ```

## Common Locations to Check

1. **Authentication Components:**
   - `components/Login.jsx`
   - `components/SignUp.jsx`
   - `components/auth/`
   - `app/login/page.jsx`
   - `app/(auth)/`

2. **Authentication Context/Providers:**
   - `context/AuthContext.jsx`
   - `providers/AuthProvider.jsx`
   - `lib/auth.js`

3. **API or Fetch Utilities:**
   - `lib/api.js`
   - `utils/fetch.js`
   - `services/api.js`

4. **Custom Hooks:**
   - `hooks/useAuth.js`
   - `hooks/useFetch.js`

## How to Fix

For each direct API call you find, replace it with the corresponding API utility function:

### Login Example:

```javascript
// Before:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials),
});
const data = await response.json();

// After:
import { login } from '@/lib/api';
const data = await login(credentials);
```

### Other API Calls:

```javascript
// Before:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/some/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
const responseData = await response.json();

// After:
import { apiPost } from '@/lib/api';
const responseData = await apiPost('/some/endpoint', data);
```

## Testing Your Changes

After making these changes, test your application thoroughly:

1. **Login/Authentication:**
   - Test with correct credentials
   - Test with incorrect credentials
   - Check browser console and network tab to ensure API URLs are not visible

2. **Other Functionality:**
   - Test any features that interact with your API
   - Ensure all functionality works as expected

## Common Issues and Solutions

1. **CORS Errors:**
   - If you encounter CORS errors after migrating to API routes, make sure your API allows requests from your Next.js API routes.

2. **Authentication Issues:**
   - If authentication stops working, check that cookies or tokens are being properly handled by your API routes.

3. **Error Handling:**
   - Ensure your API utility functions properly handle and propagate errors from the API routes. 