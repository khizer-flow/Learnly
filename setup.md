# Quick Setup Guide

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Stripe account

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your configuration
# - Set your MongoDB URI
# - Add your JWT secrets
# - Configure Stripe keys
# - Set client URL

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_APP_NAME=Learnly" > .env

# Start development server
npm run dev
```

### 4. Database Setup

Make sure MongoDB is running and accessible. The application will automatically create the necessary collections.

### 5. Stripe Setup

1. Create a Stripe account
2. Get your API keys from the dashboard
3. Create products and prices for subscriptions
4. Set up webhooks pointing to `/api/subscriptions/webhook`

### 6. Test the Application

1. Open http://localhost:3000
2. Register a new account
3. Browse lessons
4. Test subscription flow

## 🔧 Common Issues

### MongoDB Connection
- Ensure MongoDB is running
- Check connection string in .env
- Verify network access

### Stripe Integration
- Use test keys for development
- Verify webhook configuration
- Check Stripe dashboard for errors

### CORS Issues
- Ensure CLIENT_URL is set correctly
- Check frontend API URL configuration

## 📝 Environment Variables Reference

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/learnly
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_APP_NAME=Learnly
```

## 🎯 Next Steps

1. Add sample lessons to the database
2. Configure Stripe products and prices
3. Set up production environment
4. Deploy to your preferred platform

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review the API documentation in `/docs/API.md`
- Create an issue in the repository for bugs
- Contact support for additional help
