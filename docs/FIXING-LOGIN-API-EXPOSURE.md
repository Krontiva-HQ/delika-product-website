# Fixing API URL Exposure in Login Requests

This document provides specific instructions on how to fix the issue of API URLs being exposed in the browser console when making login requests.

## The Problem

When you make a direct API call using `fetch()` with `process.env.NEXT_PUBLIC_API_BASE_URL` in your client-side code, the full API URL is visible in the browser's network tab and console, even when the request fails (e.g., with incorrect credentials).

For example, if you have code like this:

```javascript
// This exposes your API URL in the browser
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

## The Solution

The solution is to use the API utility functions we've created, which make the requests through Next.js API routes instead of directly to your external API.

### Step 1: Find Your Login Code

Look for any code in your client components that makes direct API calls for login using `fetch()` with `process.env.NEXT_PUBLIC_API_BASE_URL`.

Common places to look:
- Login components
- Authentication context providers
- Auth-related hooks

### Step 2: Replace with the Login Utility Function

Replace the direct API call with the `login()` function from `lib/api.js`:

```javascript
import { login } from '@/lib/api';

// Replace this:
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await response.json();

// With this:
const data = await login({ email, password });
```

### Step 3: Test the Login

Test the login functionality with both correct and incorrect credentials to ensure:
1. Login works correctly with valid credentials
2. Error handling works correctly with invalid credentials
3. The API URL is no longer visible in the browser console or network tab

## Example Implementation

We've created an example login component that demonstrates the correct way to use the login function:

```jsx
// examples/LoginExample.jsx
'use client';

import { useState } from 'react';
import { login } from '@/lib/api';

export default function LoginExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Use the login function from lib/api.js
      const response = await login({ email, password });
      
      // Handle successful login
      setSuccess(true);
      console.log('Login successful:', response);
      
      // You can store the token or user data in localStorage or a state management solution
      // localStorage.setItem('token', response.token);
      
      // Redirect or update UI as needed
      // router.push('/dashboard');
    } catch (error) {
      // Handle login error
      setError(error.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

## How It Works

1. The `login()` function in `lib/api.js` makes a request to your Next.js API route at `/api/auth`
2. The API route in `app/api/auth/route.js` makes the actual request to your external API
3. The response is returned to the client without exposing the external API URL

This approach keeps your API URL hidden from the client side while still allowing your application to communicate with your API. 