import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Wallet } from "lucide-react";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'momo' | 'cash') => void;
  totalAmount: number;
}

export function PaymentMethodModal({
  isOpen,
  onClose,
  onSelectMethod,
  totalAmount
}: PaymentMethodModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Select Payment Method
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center text-lg font-medium">
            Total Amount: GH₵ {totalAmount.toFixed(2)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2 p-4 hover:bg-orange-50 hover:border-orange-200"
              onClick={() => onSelectMethod('momo')}
            >
              <Phone className="h-8 w-8 text-orange-500" />
              <span className="font-medium">Mobile Money</span>
              <span className="text-sm text-gray-500">Pay with Momo</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2 p-4 hover:bg-orange-50 hover:border-orange-200"
              onClick={() => onSelectMethod('cash')}
            >
              <Wallet className="h-8 w-8 text-orange-500" />
              <span className="font-medium">Cash on Delivery</span>
              <span className="text-sm text-gray-500">Pay when delivered</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 