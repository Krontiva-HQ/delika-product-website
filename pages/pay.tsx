import { useSearchParams } from "next/navigation";
import { PaystackModal } from "@/components/payment/paystack-modal";

export default function PayPage() {
  const searchParams = useSearchParams();
  const amount = Number(searchParams?.get("amount") || 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <PaystackModal
        open={true}
        onClose={() => { /* Optionally redirect to home or order summary */ }}
        onComplete={() => { /* Optionally redirect to thank you or order summary */ }}
        amount={amount}
      />
    </div>
  );
} 