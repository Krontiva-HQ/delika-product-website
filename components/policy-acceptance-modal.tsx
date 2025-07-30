"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface PolicyAcceptanceModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function PolicyAcceptanceModal({ isOpen, onAccept, onDecline }: PolicyAcceptanceModalProps) {
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleAccept = () => {
    if (hasAccepted) {
      onAccept();
    }
  };

  const handleDecline = () => {
    onDecline();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Terms of Use Acceptance Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-4">
              Welcome to Delika! Before you can continue using our services, we need you to review and accept our updated Terms of Use.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-2">Key Terms:</h3>
              <ul className="text-sm space-y-2 text-gray-700">
                <li>• You agree to use our platform responsibly and in accordance with our policies</li>
                <li>• We collect and process your data as outlined in our Privacy Policy</li>
                <li>• Delivery services are provided by our partner Perjuma Ghana</li>
                <li>• Payment processing is handled securely through our payment partners</li>
                <li>• You must be at least 18 years old to use our services</li>
                <li>• We reserve the right to modify these terms with notice</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                By accepting, you acknowledge that you have read and understood our{" "}
                <Link href="/terms" className="text-orange-600 hover:text-orange-700 underline">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="text-orange-600 hover:text-orange-700 underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="policy-acceptance"
              checked={hasAccepted}
              onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
            />
            <Label htmlFor="policy-acceptance" className="text-sm text-gray-700">
              I have read and agree to the Terms of Use and Privacy Policy
            </Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="px-6"
          >
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!hasAccepted}
            className="px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Accept & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 