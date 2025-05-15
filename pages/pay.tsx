import { useSearchParams } from "next/navigation";
import { PaystackModal } from "@/components/payment/paystack-modal";
import { useEffect } from "react";

export default function PayPage() {
  const searchParams = useSearchParams();
  const amount = Number(searchParams?.get("amount") || 0);
  const orderId = searchParams?.get("orderId") || "";
  const customerId = searchParams?.get("customerId") || "";

  // Retrieve and log the order response
  useEffect(() => {
    const orderResponse = localStorage.getItem('orderSubmissionResponse');
    if (orderResponse) {
      console.log('Order response carried to payment page:', JSON.parse(orderResponse));
      localStorage.removeItem('orderSubmissionResponse'); // Clean up after reading
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <PaystackModal
        open={true}
        onClose={() => { /* Optionally redirect to home or order summary */ }}
        onComplete={() => { /* Optionally redirect to thank you or order summary */ }}
        amount={amount}
        orderId={orderId}
        customerId={customerId}
      />
    </div>
  );
} 