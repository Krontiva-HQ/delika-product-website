"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<any>({ restaurants: [], groceries: [], pharmacies: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(null);
      try {
        // Build filter object from query params
        const filters: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          filters[key] = value;
        });
        // Call /filterWindow endpoint
        const res = await fetch('/filterWindow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters),
        });
        if (!res.ok) throw new Error('Failed to fetch results');
        const data = await res.json();
        setResults(data);
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      }
      setLoading(false);
    }
    fetchResults();
  }, [searchParams]);

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Search Results</h2>
      {results.restaurants.length === 0 && results.groceries.length === 0 && results.pharmacies.length === 0 ? (
        <div>No results found.</div>
      ) : (
        <>
          {results.restaurants.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">Restaurants</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.restaurants.map((r: any) => (
                  <li key={r.id} className="border rounded-lg p-4 flex flex-col items-center">
                    <img src={r.restaurantLogo?.url || r.restaurantLogo?.path || ''} alt={r.restaurantName} className="w-20 h-20 object-cover rounded-full mb-2" />
                    <div className="font-bold text-lg mb-1">{r.restaurantName}</div>
                    <div className="text-gray-500 text-sm mb-1">{r.restaurantAddress}</div>
                    <div className="text-gray-500 text-xs">{r.restaurantPhoneNumber}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {results.groceries.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">Groceries</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.groceries.map((g: any) => (
                  <li key={g.id} className="border rounded-lg p-4 flex flex-col items-center">
                    <img src={g.groceryshopLogo?.url || g.groceryshopLogo?.path || ''} alt={g.groceryshopName} className="w-20 h-20 object-cover rounded-full mb-2" />
                    <div className="font-bold text-lg mb-1">{g.groceryshopName}</div>
                    <div className="text-gray-500 text-sm mb-1">{g.groceryshopAddress}</div>
                    <div className="text-gray-500 text-xs">{g.groceryshopPhoneNumber}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {results.pharmacies.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">Pharmacies</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.pharmacies.map((p: any) => (
                  <li key={p.id} className="border rounded-lg p-4 flex flex-col items-center">
                    <img src={p.pharmacyLogo?.url || p.pharmacyLogo?.path || ''} alt={p.pharmacyName} className="w-20 h-20 object-cover rounded-full mb-2" />
                    <div className="font-bold text-lg mb-1">{p.pharmacyName}</div>
                    <div className="text-gray-500 text-sm mb-1">{p.pharmacyAddress}</div>
                    <div className="text-gray-500 text-xs">{p.pharmacyPhoneNumber}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
} 