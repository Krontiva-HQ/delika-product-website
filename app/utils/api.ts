import { headers } from 'next/headers';

export const getAuthorizationHeader = () => {
  return `${process.env.NEXT_PUBLIC_XANO_AUTH_TOKEN}`;
};

export const getBaseHeaders = () => {
  return {
    'Authorization': getAuthorizationHeader(),
    'Content-Type': 'application/json',
  };
};

export const getClientHeaders = async () => {
  const headersList = await headers();
  const authHeader = headersList.get('Authorization');
  
  return {
    ...getBaseHeaders(),
    // Forward any additional headers from the client if needed
    ...(authHeader && { 
      'Client-Authorization': authHeader 
    }),
  };
}; 