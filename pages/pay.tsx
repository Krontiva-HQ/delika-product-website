import { useSearchParams } from "next/navigation";
import { PaystackModal } from "@/components/payment/paystack-modal";
import { useEffect } from "react";

export default function PayPage() {
  const searchParams = useSearchParams();
  const amount = Number(searchParams?.get("amount") || 0);
  const orderId = searchParams?.get("orderId") || "";
  const customerId = searchParams?.get("customerId") || "";

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
      />
    </div>
  );
} 