"use client"

    import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { getCustomerDetails } from "@/lib/api"
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
    History,
    ArrowUpRight,
    ArrowDownLeft,
    AlertTriangle,
    CheckCircle
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
    const [isLoadingBalance, setIsLoadingBalance] = useState(false)

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

    // Wallet state - start with 0, will be updated from API
    const [walletData, setWalletData] = useState({
        balance: 0,
    })

    // Contact form state
    const [showContactForm, setShowContactForm] = useState(false)
    const [contactFormData, setContactFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        isDataRequest: false,
        contactReason: ''
    })
    const [isSubmittingContact, setIsSubmittingContact] = useState(false)

    // Helper function to safely convert values to numbers
    const toNumber = (value: any): number => {
        if (typeof value === 'number' && !isNaN(value)) return value;
        const parsed = parseFloat(value?.toString());
        return isNaN(parsed) ? 0 : parsed;
    }

    // Fetch delikaBalance from customer details API
    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (!userData?.id) {
                // If no user ID, try to get from localStorage
                try {
                    const storedUserData = localStorage.getItem('userData');
                    if (!storedUserData) {
                        console.log('[Settings] No user data available');
                        return;
                    }

                    const parsedUserData = JSON.parse(storedUserData);
                    if (!parsedUserData.id) {
                        console.log('[Settings] No user ID found in stored data');
                        return;
                    }

                    setIsLoadingBalance(true);
                    console.log('[Settings] Fetching wallet balance for user:', parsedUserData.id);

                    const customerDetails = await getCustomerDetails(parsedUserData.id);
                    console.log('[Settings] Customer details response:', customerDetails);

                    // Extract delikaBalance from API response
                    const balance = customerDetails.delikaBalance ||
                        customerDetails.walletBalance ||
                        customerDetails.balance ||
                        customerDetails.customerTable?.[0]?.delikaBalance ||
                        customerDetails.customerTable?.[0]?.walletBalance ||
                        0;

                    const numericBalance = toNumber(balance);
                    console.log('[Settings] Extracted delikaBalance:', balance, '-> Converted to numeric:', numericBalance);

                    setWalletData({ balance: numericBalance });

                    // Also update localStorage for other components
                    localStorage.setItem('delikaBalance', numericBalance.toString());

                } catch (error) {
                    console.error('[Settings] Error fetching wallet balance:', error);
                    // Fallback to localStorage
                    const fallbackBalance = parseFloat(localStorage.getItem('delikaBalance') || '0');
                    console.log('[Settings] Fallback to localStorage balance:', fallbackBalance);
                    setWalletData({ balance: fallbackBalance });
                } finally {
                    setIsLoadingBalance(false);
                }
            } else {
                // If we have userData with ID, use it directly
                try {
                    setIsLoadingBalance(true);
                    console.log('[Settings] Fetching wallet balance for user:', userData.id);

                    const customerDetails = await getCustomerDetails(userData.id);
                    console.log('[Settings] Customer details response:', customerDetails);

                    // Extract delikaBalance from API response
                    const balance = customerDetails.delikaBalance ||
                        customerDetails.walletBalance ||
                        customerDetails.balance ||
                        customerDetails.customerTable?.[0]?.delikaBalance ||
                        customerDetails.customerTable?.[0]?.walletBalance ||
                        0;

                    const numericBalance = toNumber(balance);
                    console.log('[Settings] Extracted delikaBalance:', balance, '-> Converted to numeric:', numericBalance);

                    setWalletData({ balance: numericBalance });

                    // Also update localStorage for other components
                    localStorage.setItem('delikaBalance', numericBalance.toString());

                } catch (error) {
                    console.error('[Settings] Error fetching wallet balance:', error);
                    // Fallback to localStorage
                    const fallbackBalance = parseFloat(localStorage.getItem('delikaBalance') || '0');
                    console.log('[Settings] Fallback to localStorage balance:', fallbackBalance);
                    setWalletData({ balance: fallbackBalance });
                } finally {
                    setIsLoadingBalance(false);
                }
            }
        };

        fetchWalletBalance();
    }, [userData?.id]); // Re-fetch when user ID changes

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





    const toggleNotificationSetting = (setting: string) => {
        const newValue = !preferences[setting as keyof typeof preferences]
        setPreferences({ ...preferences, [setting]: newValue })
        localStorage.setItem(setting, newValue.toString())
    }

    const handleContactFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmittingContact(true)

        try {
            const payload = {
                delika_user_id: userData?.id || null,
                email: contactFormData.email,
                phoneNumber: contactFormData.phoneNumber,
                contactReason: contactFormData.contactReason
            }

            const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/emailSupport', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                toast({
                    title: "Request Submitted",
                    description: "Your data protection request has been submitted successfully. We'll get back to you soon.",
                })
                setShowContactForm(false)
                setContactFormData({
                    name: '',
                    email: '',
                    phoneNumber: '',
                    isDataRequest: false,
                    contactReason: ''
                })
            } else {
                throw new Error('Failed to submit request')
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit your request. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmittingContact(false)
        }
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
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="wallet">Wallet</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
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
                                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
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
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
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
                                            onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
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
                                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
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
                                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
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
                                    {isLoadingBalance ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-lg text-gray-500">Loading balance...</span>
                                        </div>
                                    ) : (
                                        <p className="text-4xl font-bold text-orange-500">₵{walletData.balance.toFixed(2)}</p>
                                    )}

                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // Re-trigger the balance fetch
                                                const fetchWalletBalance = async () => {
                                                    try {
                                                        setIsLoadingBalance(true);
                                                        const userId = userData?.id || JSON.parse(localStorage.getItem('userData') || '{}').id;
                                                        if (!userId) return;

                                                        console.log('[Settings] Manual refresh - Fetching wallet balance for user:', userId);
                                                        const customerDetails = await getCustomerDetails(userId);
                                                        console.log('[Settings] Manual refresh - Customer details response:', customerDetails);

                                                        const balance = customerDetails.delikaBalance ||
                                                            customerDetails.walletBalance ||
                                                            customerDetails.balance ||
                                                            customerDetails.customerTable?.[0]?.delikaBalance ||
                                                            customerDetails.customerTable?.[0]?.walletBalance ||
                                                            0;

                                                        const numericBalance = toNumber(balance);
                                                        console.log('[Settings] Manual refresh - Updated balance to:', numericBalance);

                                                        setWalletData({ balance: numericBalance });
                                                        localStorage.setItem('delikaBalance', numericBalance.toString());

                                                        toast({
                                                            title: "Balance Updated",
                                                            description: `Current balance: ₵${numericBalance.toFixed(2)}`,
                                                        });

                                                    } catch (error) {
                                                        console.error('[Settings] Manual refresh error:', error);
                                                        toast({
                                                            title: "Error",
                                                            description: "Failed to refresh balance. Please try again.",
                                                            variant: "destructive",
                                                        });
                                                    } finally {
                                                        setIsLoadingBalance(false);
                                                    }
                                                };
                                                fetchWalletBalance();
                                            }}
                                            disabled={isLoadingBalance}
                                            className="flex items-center gap-2"
                                        >
                                            <Wallet className="w-4 h-4" />
                                            {isLoadingBalance ? 'Refreshing...' : 'Refresh Balance'}
                                        </Button>
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
                                    onChange={(e) => setPreferences({ ...preferences, defaultDeliveryAddress: e.target.value })}
                                    placeholder="Enter your default delivery address"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                                <Textarea
                                    id="deliveryInstructions"
                                    value={preferences.deliveryInstructions}
                                    onChange={(e) => setPreferences({ ...preferences, deliveryInstructions: e.target.value })}
                                    placeholder="e.g., Ring doorbell, Leave at gate, Call when you arrive, etc."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preferredTime">Preferred Delivery Time</Label>
                                <Select
                                    value={preferences.preferredDeliveryTime}
                                    onValueChange={(value) => setPreferences({ ...preferences, preferredDeliveryTime: value })}
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
                                        onValueChange={(value) => setPreferences({ ...preferences, language: value })}
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
                                        onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
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
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.orderUpdates ? 'bg-orange-500' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.orderUpdates ? 'translate-x-6' : 'translate-x-1'
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
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.pushNotifications ? 'bg-orange-500' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
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
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.smsNotifications ? 'bg-orange-500' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.smsNotifications ? 'translate-x-6' : 'translate-x-1'
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
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.promotionalEmails ? 'bg-orange-500' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.promotionalEmails ? 'translate-x-6' : 'translate-x-1'
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
                                            onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
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
                                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                        placeholder="Must be at least 8 characters"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={securityData.confirmPassword}
                                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
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
                                            setSecurityData({ ...securityData, twoFactorEnabled: newValue })
                                            localStorage.setItem('twoFactorEnabled', newValue.toString())
                                            toast({
                                                title: newValue ? "2FA Enabled" : "2FA Disabled",
                                                description: newValue
                                                    ? "Two-factor authentication has been enabled for your account."
                                                    : "Two-factor authentication has been disabled.",
                                            })
                                        }}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securityData.twoFactorEnabled ? 'bg-orange-500' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securityData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* About Tab */}
                <TabsContent value="about">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-orange-500" />
                                About Delika
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">Learn more about Delika and our services</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* App Information */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About Delika</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Delika is your premier food delivery platform, connecting you with the best restaurants,
                                        groceries, and pharmacies in your area. We bring convenience to your doorstep with
                                        fast, reliable delivery services and a seamless ordering experience.
                                    </p>
                                </div>

                                <div className="bg-orange-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">App Version</h4>
                                            <p className="text-sm text-gray-600">v1.01</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Latest Release</p>
                                            <p className="text-sm font-medium text-orange-600">Current</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Legal Links */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Legal Information</h3>

                                <div className="space-y-3">
                                    <a
                                        href="/terms"
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div>
                                            <h4 className="font-medium text-gray-900">Terms of Use</h4>
                                            <p className="text-sm text-gray-500">Read our terms and conditions</p>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-gray-400" />
                                    </a>

                                    <a
                                        href="/privacy-policy"
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div>
                                            <h4 className="font-medium text-gray-900">Privacy Policy</h4>
                                            <p className="text-sm text-gray-500">Learn how we protect your data</p>
                                        </div>
                                        <ArrowUpRight className="w-4 h-4 text-gray-400" />
                                    </a>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Contact & Support</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Mail className="w-4 h-4 text-orange-500" />
                                            <h4 className="font-medium text-gray-900">Email Support</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">support@krontiva.africa</p>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Phone className="w-4 h-4 text-orange-500" />
                                            <h4 className="font-medium text-gray-900">Phone Support</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">+233 256899200</p>
                                    </div>
                                </div>
                            </div>

                            {/* App Features */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">What We Offer</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">🍽️ Restaurant Delivery</h4>
                                        <p className="text-sm text-gray-600">Order from your favorite restaurants with fast delivery</p>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">🛒 Grocery Shopping</h4>
                                        <p className="text-sm text-gray-600">Fresh groceries delivered to your doorstep</p>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">💊 Pharmacy Services</h4>
                                        <p className="text-sm text-gray-600">Medicines and health products delivered safely</p>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">🚚 Fast Delivery</h4>
                                        <p className="text-sm text-gray-600">Reliable delivery with real-time tracking</p>
                                    </div>
                                </div>
                            </div>

                            {/* Data Protection Section */}
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-red-900 mb-2">Data Protection Rights</h3>
                                            <p className="text-red-700 mb-4">
                                                Contact support if you think we breached your rights. We take your privacy seriously
                                                and are committed to protecting your personal data.
                                            </p>
                                            <Button
                                                onClick={() => setShowContactForm(true)}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                Contact Data Protection Officer
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Contact Form Modal */}
                {showContactForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-orange-500" />
                                    Data Protection Request
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Submit your data protection request</p>
                            </div>

                            <form onSubmit={handleContactFormSubmit} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactName">Full Name *</Label>
                                    <Input
                                        id="contactName"
                                        value={contactFormData.name}
                                        onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Email Address *</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        value={contactFormData.email}
                                        onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                                        required
                                        placeholder="Enter your email address"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contactPhone">Phone Number *</Label>
                                    <Input
                                        id="contactPhone"
                                        type="tel"
                                        value={contactFormData.phoneNumber}
                                        onChange={(e) => setContactFormData({ ...contactFormData, phoneNumber: e.target.value })}
                                        required
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isDataRequest"
                                            checked={contactFormData.isDataRequest}
                                            onChange={(e) => setContactFormData({ ...contactFormData, isDataRequest: e.target.checked })}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor="isDataRequest">Are you requesting for your data?</Label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contactReason">Request Type *</Label>
                                    <Select
                                        value={contactFormData.contactReason}
                                        onValueChange={(value) => setContactFormData({ ...contactFormData, contactReason: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your request type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Request access to my account data">Request access to my account data</SelectItem>
                                            <SelectItem value="Download a copy of my personal data (GDPR-style)">Download a copy of my personal data (GDPR-style)</SelectItem>
                                            <SelectItem value="Request deletion of my account and personal data">Request deletion of my account and personal data</SelectItem>
                                            <SelectItem value="Ask about how my data is used">Ask about how my data is used</SelectItem>
                                            <SelectItem value="Unsubscribe or stop marketing emails">Unsubscribe or stop marketing emails</SelectItem>
                                            <SelectItem value="Request to deactivate account temporarily">Request to deactivate account temporarily</SelectItem>
                                            <SelectItem value="Contact Krontiva's Data Protection Officer">Contact Krontiva's Data Protection Officer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowContactForm(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmittingContact || !contactFormData.name || !contactFormData.email || !contactFormData.phoneNumber || !contactFormData.contactReason}
                                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                                    >
                                        {isSubmittingContact ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Submit Request
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </Tabs>
        </div>
    )
} 