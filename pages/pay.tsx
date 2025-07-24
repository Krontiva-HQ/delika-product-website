import { useSearchParams } from "next/navigation";
import { PaystackModal } from "@/components/payment/paystack-modal";
import { useEffect, useState } from "react";

export default function PayPage() {
  const searchParams = useSearchParams();
  const amount = Number(searchParams?.get("amount") || 0);
  const orderId = searchParams?.get("orderId") || "";
  const customerId = searchParams?.get("customerId") || "";
  const [storeType, setStoreType] = useState<'restaurant' | 'pharmacy' | 'grocery'>('restaurant');

  // Get store type from localStorage or URL parameter
  useEffect(() => {
    const urlStoreType = searchParams?.get("storeType");
    if (urlStoreType && ['restaurant', 'pharmacy', 'grocery'].includes(urlStoreType)) {
      setStoreType(urlStoreType as 'restaurant' | 'pharmacy' | 'grocery');
    } else {
      // Fallback to localStorage
      const savedStoreType = localStorage.getItem('selectedStoreType');
      if (savedStoreType === 'groceries') {
        setStoreType('grocery');
      } else if (savedStoreType === 'pharmacy') {
        setStoreType('pharmacy');
      } else {
        setStoreType('restaurant');
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <PaystackModal
        open={true}
        onClose={() => { /* Optionally redirect to home or order summary */ }}
        onComplete={() => {
          // Only remove orderSubmissionResponse after payment is complete
          localStorage.removeItem('orderSubmissionResponse');
        }}
        amount={amount}
        orderId={orderId}
        customerId={customerId}
        storeType={storeType}
      />
    </div>
  );
} 