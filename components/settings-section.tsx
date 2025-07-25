"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { 
  User, 
  MapPin, 
  Bell, 
  Shield,
  Mail,
  Phone,
  Save,
  Edit3,
  Lock,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Wallet,
  Plus,
  Minus,
  History,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react"
import { UserData } from "@/components/auth-nav"

interface SettingsSectionProps {
  userData?: UserData | null;
  onUserDataUpdate?: (userData: UserData) => void;
}

export function SettingsSection({ userData, onUserDataUpdate }: SettingsSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: userData?.fullName || "",
    email: userData?.email || "",
    phoneNumber: userData?.phoneNumber || "",
    address: userData?.address || "",
    dateOfBirth: userData?.dateOfBirth || "",
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    // Delivery preferences
    defaultDeliveryAddress: localStorage.getItem('defaultDeliveryAddress') || "",
    deliveryInstructions: localStorage.getItem('deliveryInstructions') || "",
    preferredDeliveryTime: localStorage.getItem('preferredDeliveryTime') || "anytime",
    
    // Notification preferences
    orderUpdates: localStorage.getItem('orderUpdates') !== 'false',
    promotionalEmails: localStorage.getItem('promotionalEmails') !== 'false',
    smsNotifications: localStorage.getItem('smsNotifications') !== 'false',
    pushNotifications: localStorage.getItem('pushNotifications') !== 'false',
    
    // App preferences
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'en',
    currency: localStorage.getItem('currency') || 'GHS',
  })

  // Security state
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: localStorage.getItem('twoFactorEnabled') === 'true',
  })

  // Wallet state
  const [walletData, setWalletData] = useState({
    balance: parseFloat(localStorage.getItem('delikaBalance') || '0'),
    addAmount: "",
    withdrawAmount: "",
  })

  // Mock transaction history
  const [transactions] = useState([
    { id: '1', type: 'credit', amount: 100, description: 'Added to wallet', date: '2024-01-15', status: 'completed' },
    { id: '2', type: 'debit', amount: 25.50, description: 'Order #ORD-2024-001', date: '2024-01-14', status: 'completed' },
    { id: '3', type: 'credit', amount: 50, description: 'Auto-reload', date: '2024-01-13', status: 'completed' },
    { id: '4', type: 'debit', amount: 15.75, description: 'Order #ORD-2024-002', date: '2024-01-12', status: 'completed' },
    { id: '5', type: 'debit', amount: 32.25, description: 'Order #ORD-2024-003', date: '2024-01-10', status: 'completed' },
  ])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // Simulate API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update localStorage (in a real app, this would be API call)
      const updatedUserData = { ...userData, ...profileData } as UserData
      localStorage.setItem('userData', JSON.stringify(updatedUserData))
      
      if (onUserDataUpdate) {
        onUserDataUpdate(updatedUserData)
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePreferences = () => {
    // Save preferences to localStorage
    Object.entries(preferences).forEach(([key, value]) => {
      localStorage.setItem(key, value.toString())
    })
    
    toast({
      title: "Preferences Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const handleChangePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (securityData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      })
      
      setSecurityData({
        ...securityData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddMoney = async () => {
    const amount = parseFloat(walletData.addAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add.",
        variant: "destructive",
      })
      return
    }

    if (amount > 1000) {
      toast({
        title: "Amount Too Large",
        description: "Maximum amount per transaction is ₵1,000.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newBalance = walletData.balance + amount
      setWalletData({...walletData, balance: newBalance, addAmount: ""})
      localStorage.setItem('delikaBalance', newBalance.toString())
      
      toast({
        title: "Money Added",
        description: `₵${amount.toFixed(2)} has been added to your wallet successfully.`,
      })
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to add money. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleWithdrawMoney = async () => {
    const amount = parseFloat(walletData.withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      })
      return
    }

    if (amount > walletData.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Simulate withdrawal processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newBalance = walletData.balance - amount
      setWalletData({...walletData, balance: newBalance, withdrawAmount: ""})
      localStorage.setItem('delikaBalance', newBalance.toString())
      
      toast({
        title: "Withdrawal Successful",
        description: `₵${amount.toFixed(2)} has been withdrawn from your wallet.`,
      })
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }



  const toggleNotificationSetting = (setting: string) => {
    const newValue = !preferences[setting as keyof typeof preferences]
    setPreferences({...preferences, [setting]: newValue})
    localStorage.setItem(setting, newValue.toString())
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-orange-500" />
          Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  Personal Information
                </h2>
                <p className="text-sm text-gray-600 mt-1">Update your personal details and contact information</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="Your current address"
                  />
                </div>
              </div>
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet">
          <div className="space-y-6">
            {/* Balance Overview */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-orange-500" />
                  Delika Balance
                </h2>
                <p className="text-sm text-gray-600 mt-1">Manage your digital wallet and transactions</p>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">Current Balance</p>
                  <p className="text-4xl font-bold text-orange-500">₵{walletData.balance.toFixed(2)}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="addAmount">Add Money</Label>
                      <div className="flex gap-2 mt-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-3 text-gray-400">₵</span>
                          <Input
                            id="addAmount"
                            type="number"
                            value={walletData.addAmount}
                            onChange={(e) => setWalletData({...walletData, addAmount: e.target.value})}
                            placeholder="0.00"
                            className="pl-8"
                            min="1"
                            max="1000"
                          />
                        </div>
                        <Button 
                          onClick={handleAddMoney}
                          disabled={isSaving || !walletData.addAmount}
                          className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {isSaving ? 'Adding...' : 'Add'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setWalletData({...walletData, addAmount: "20"})}
                      >
                        ₵20
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setWalletData({...walletData, addAmount: "50"})}
                      >
                        ₵50
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setWalletData({...walletData, addAmount: "100"})}
                      >
                        ₵100
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="withdrawAmount">Withdraw Money</Label>
                      <div className="flex gap-2 mt-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-3 text-gray-400">₵</span>
                          <Input
                            id="withdrawAmount"
                            type="number"
                            value={walletData.withdrawAmount}
                            onChange={(e) => setWalletData({...walletData, withdrawAmount: e.target.value})}
                            placeholder="0.00"
                            className="pl-8"
                            min="1"
                            max={walletData.balance}
                          />
                        </div>
                        <Button 
                          onClick={handleWithdrawMoney}
                          disabled={isSaving || !walletData.withdrawAmount || parseFloat(walletData.withdrawAmount) > walletData.balance}
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Minus className="w-4 h-4" />
                          {isSaving ? 'Processing...' : 'Withdraw'}
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Available for withdrawal: ₵{walletData.balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>



            {/* Transaction History */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <History className="w-5 h-5 text-orange-500" />
                  Recent Transactions
                </h3>
                <p className="text-sm text-gray-600 mt-1">Your latest wallet activity</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.type === 'credit' ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}₵{transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">
                    View All Transactions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Delivery Preferences
              </h2>
              <p className="text-sm text-gray-600 mt-1">Set your delivery preferences and app settings</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultAddress">Default Delivery Address</Label>
                <Textarea
                  id="defaultAddress"
                  value={preferences.defaultDeliveryAddress}
                  onChange={(e) => setPreferences({...preferences, defaultDeliveryAddress: e.target.value})}
                  placeholder="Enter your default delivery address"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                <Textarea
                  id="deliveryInstructions"
                  value={preferences.deliveryInstructions}
                  onChange={(e) => setPreferences({...preferences, deliveryInstructions: e.target.value})}
                  placeholder="e.g., Ring doorbell, Leave at gate, Call when you arrive, etc."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Delivery Time</Label>
                <Select 
                  value={preferences.preferredDeliveryTime} 
                  onValueChange={(value) => setPreferences({...preferences, preferredDeliveryTime: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anytime">Anytime</SelectItem>
                    <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
                    <SelectItem value="evening">Evening (6PM - 10PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={preferences.language} 
                    onValueChange={(value) => setPreferences({...preferences, language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="tw">Twi</SelectItem>
                      <SelectItem value="ga">Ga</SelectItem>
                      <SelectItem value="ha">Hausa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select 
                    value={preferences.currency} 
                    onValueChange={(value) => setPreferences({...preferences, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">GHS (₵)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSavePreferences} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                  <Save className="w-4 h-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-500" />
                Notification Settings
              </h2>
              <p className="text-sm text-gray-600 mt-1">Choose how you want to be notified about orders and promotions</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">Order Updates</h4>
                    <p className="text-sm text-gray-500">Get notified about your order status changes</p>
                  </div>
                  <button
                    onClick={() => toggleNotificationSetting('orderUpdates')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.orderUpdates ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.orderUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications on your device</p>
                  </div>
                  <button
                    onClick={() => toggleNotificationSetting('pushNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.pushNotifications ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Get SMS updates for important events</p>
                  </div>
                  <button
                    onClick={() => toggleNotificationSetting('smsNotifications')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.smsNotifications ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">Promotional Emails</h4>
                    <p className="text-sm text-gray-500">Receive deals and offers via email</p>
                  </div>
                  <button
                    onClick={() => toggleNotificationSetting('promotionalEmails')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.promotionalEmails ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.promotionalEmails ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSavePreferences} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
                  <Save className="w-4 h-4" />
                  Save Notification Settings
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            {/* Change Password Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-500" />
                  Change Password
                </h2>
                <p className="text-sm text-gray-600 mt-1">Update your account password for better security</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                    placeholder="Must be at least 8 characters"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    placeholder="Re-enter your new password"
                  />
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={isSaving || !securityData.currentPassword || !securityData.newPassword}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
                  >
                    <Lock className="w-4 h-4" />
                    {isSaving ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  Two-Factor Authentication
                </h2>
                <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium">Enable Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Protect your account with SMS verification</p>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !securityData.twoFactorEnabled
                      setSecurityData({...securityData, twoFactorEnabled: newValue})
                      localStorage.setItem('twoFactorEnabled', newValue.toString())
                      toast({
                        title: newValue ? "2FA Enabled" : "2FA Disabled",
                        description: newValue 
                          ? "Two-factor authentication has been enabled for your account." 
                          : "Two-factor authentication has been disabled.",
                      })
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      securityData.twoFactorEnabled ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securityData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 