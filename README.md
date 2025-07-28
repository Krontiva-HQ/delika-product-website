# Delika Product Website

A comprehensive food delivery and retail platform built with Next.js 15, TypeScript, and Tailwind CSS. Delika connects customers with restaurants, grocery stores, and pharmacies for seamless ordering and delivery services.

## 🚀 Features

### Core Functionality
- **Multi-Vendor Platform**: Support for restaurants, grocery stores, and pharmacies
- **Real-time Order Tracking**: Live order status updates and delivery tracking
- **Location Services**: Google Maps integration with address autocomplete
- **Payment Processing**: Paystack integration for secure payments
- **User Authentication**: OTP-based authentication system
- **Favorites System**: Save and manage favorite restaurants/stores
- **Cart Management**: Persistent shopping cart across sessions

### User Experience
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Shadcn/ui components with Radix UI primitives
- **Interactive Elements**: Smooth animations with Framer Motion
- **Accessibility**: WCAG compliant components and navigation
- **Dark/Light Mode**: Theme support (planned)

### Business Features
- **Partner Onboarding**: Restaurant and courier signup forms
- **Inventory Management**: Real-time stock tracking
- **Analytics Dashboard**: Order analytics and insights
- **Customer Support**: Integrated chat widget
- **Marketing Tools**: Promotional banners and campaigns

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library built on Radix UI
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling with Zod validation

### Backend & APIs
- **Next.js API Routes** - Server-side API endpoints
- **Google Maps API** - Location services and geocoding
- **Paystack API** - Payment processing
- **External APIs** - Restaurant, grocery, and pharmacy data

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Turbopack** - Fast development bundler

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Google Maps API key
- Paystack API keys

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd delika-product-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your API keys:
   ```env
   # API Configuration
   API_URL=https://your-api-url.com
   
   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   
   # Paystack
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   
   # External APIs
   NEXT_PUBLIC_RESTAURANTS_API=your_restaurants_api_url
   NEXT_PUBLIC_GROCERIES_SHOPS_INVENTORY_API=your_groceries_api_url
   NEXT_PUBLIC_PHARMACY_SHOPS_INVENTORY_API=your_pharmacy_api_url
   
   # Email Service
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
delika-product-website/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── restaurants/              # Restaurant pages
│   ├── groceries/               # Grocery store pages
│   ├── pharmacy/                # Pharmacy pages
│   ├── checkout/                # Checkout flow
│   ├── cart/                    # Shopping cart
│   └── [other-pages]/           # Additional pages
├── components/                   # React components
│   ├── ui/                      # Shadcn/ui components
│   ├── auth-nav.tsx            # Authentication navigation
│   ├── cart-modal.tsx          # Shopping cart modal
│   ├── checkout-page.tsx       # Checkout process
│   └── [other-components]/     # Feature components
├── lib/                         # Utility libraries
│   ├── api.ts                  # API client functions
│   ├── google-maps.ts          # Maps integration
│   └── utils/                  # Helper utilities
├── types/                       # TypeScript type definitions
├── hooks/                       # Custom React hooks
├── public/                      # Static assets
└── docs/                        # Documentation
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Type checking
npx tsc --noEmit     # TypeScript type checking
```

### Code Style

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Tailwind CSS** for styling

### Component Development

Components are built using:
- **Shadcn/ui** for consistent design
- **Radix UI** for accessible primitives
- **React Hook Form** for form handling
- **Zod** for schema validation

## 🌐 API Integration

### Making API Calls

Use the utility functions in `lib/api.ts`:

```typescript
import { 
  apiGet, 
  apiPost, 
  login, 
  getBranches, 
  getCustomerDetails,
  submitOrder,
  calculateDeliveryPrices
} from '@/lib/api';

// Authentication
const loginResponse = await login({ 
  email: 'user@example.com', 
  password: 'password' 
});

// Get restaurant branches
const branches = await getBranches();

// Submit order
const orderResult = await submitOrder(orderData, 'restaurant');

// Calculate delivery fees
const deliveryFees = await calculateDeliveryPrices({
  pickup: { fromLatitude: 'lat', fromLongitude: 'lng' },
  dropOff: { toLatitude: 'lat', toLongitude: 'lng' },
  rider: true,
  pedestrian: false
});
```

### Environment Variables

API endpoints are configured through environment variables to keep sensitive URLs server-side:

```env
# Restaurant APIs
NEXT_PUBLIC_RESTAURANTS_API=https://api.restaurants.com
NEXT_PUBLIC_RESTAURANTS_SHOPS_INVENTORY_API=https://api.inventory.com

# Grocery APIs  
NEXT_PUBLIC_GROCERIES_SHOPS_INVENTORY_API=https://api.groceries.com

# Pharmacy APIs
NEXT_PUBLIC_PHARMACY_SHOPS_INVENTORY_API=https://api.pharmacy.com
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- **Netlify** - Static site hosting
- **Railway** - Full-stack deployment
- **AWS Amplify** - Cloud hosting
- **Docker** - Containerized deployment

## 📱 Features by Page

### Homepage (`/`)
- Hero section with call-to-action
- Brand showcase
- Feature highlights
- Newsletter signup

### Restaurants (`/restaurants`)
- Restaurant listings with filters
- Search and location-based results
- Menu browsing
- Order placement

### Groceries (`/groceries`)
- Grocery store inventory
- Category-based browsing
- Shopping cart functionality
- Checkout process

### Pharmacy (`/pharmacy`)
- Pharmacy product catalog
- Prescription management
- Health product ordering
- Delivery tracking

### Checkout (`/checkout`)
- Order review and confirmation
- Payment processing
- Delivery address management
- Order tracking

## 🔐 Security

- **API Proxy**: Sensitive API calls routed through Next.js API routes
- **Environment Variables**: Secrets kept server-side
- **Input Validation**: Zod schemas for form validation
- **Authentication**: OTP-based secure login
- **HTTPS**: Secure communication protocols

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use Shadcn/ui components for consistency
- Write meaningful commit messagesjust as it is fit
- Test thoroughly before submitting PRs
- Update documentation for new features.

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support and questions:
- **Email**: info@krontiva.africa
- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue in the repository

## 🗺️ Roadmap

- [ ] Dark mode support
- [ ] PWA capabilities
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Advanced payment methods
- [ ] Real-time notifications
- [ ] AI-powered recommendations

---

Built with ❤️ by the Krontiva Africa team (Dibe, Ronald, Debby)
