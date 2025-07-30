import { useState, useEffect } from "react";
import { UserData } from "@/types/user";

export function usePolicyAcceptance(userData: UserData | null) {
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [hasCheckedPolicy, setHasCheckedPolicy] = useState(false);

  useEffect(() => {
    if (userData && !hasCheckedPolicy) {
      // Check if user has accepted the policy in customerTable
      const customerTable = userData.customerTable;
      const policyAccepted = customerTable && customerTable.length > 0 && 
        customerTable.some(customer => customer.privacyPolicyAccepted === true);
      
      if (!policyAccepted) {
        setShowPolicyModal(true);
      }
      
      setHasCheckedPolicy(true);
    }
  }, [userData, hasCheckedPolicy]);

  const handlePolicyAccept = async () => {
    if (!userData) return;

    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      // Call API to update policy acceptance
      const response = await fetch('/api/auth/update-policy-acceptance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          authToken,
          userId: userData.id 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update policy acceptance');
      }

      // Update user data in localStorage
      const updatedUserData = {
        ...userData,
        customerTable: userData.customerTable.map(customer => ({
          ...customer,
          privacyPolicyAccepted: true
        }))
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      setShowPolicyModal(false);
    } catch (error) {
      console.error('Failed to update policy acceptance:', error);
      // Still update localStorage even if API call fails
      const updatedUserData = {
        ...userData,
        customerTable: userData.customerTable.map(customer => ({
          ...customer,
          privacyPolicyAccepted: true
        }))
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setShowPolicyModal(false);
    }
  };

  const handlePolicyDecline = () => {
    // Log out the user if they decline
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.reload();
  };

  return {
    showPolicyModal,
    handlePolicyAccept,
    handlePolicyDecline
  };
} 