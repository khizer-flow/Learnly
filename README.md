# Learnly - Subscription-Based Learning Platform

A modern, full-stack learning platform built with React, TypeScript, Node.js, and MongoDB. Features user authentication, subscription management with Stripe, and a comprehensive lesson system with premium content support.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Subscription Management**: Stripe integration for premium subscriptions
- **Lesson System**: Comprehensive lesson management with categories and tags
- **Premium Content**: Protected premium lessons for subscribers
- **Responsive Design**: Modern, mobile-first UI built with Tailwind CSS
- **Real-time Updates**: React Query for efficient data fetching and caching

### User Features
- User registration and login
- Profile management
- Subscription management (upgrade, cancel, billing portal)
- Browse and search lessons
- Filter lessons by category and premium status
- Watch video lessons with premium content protection
- Responsive design for all devices

### Admin Features
- Lesson management (CRUD operations)
- User management
- Subscription monitoring
- Content categorization

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **React Query** for state management
- **React Hook Form** with Yup validation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Axios** for API communication

### Backend
- **Node.js** with TypeScript
- **Express.js** framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Stripe** for payment processing
- **bcryptjs** for password hashing
- **Express Rate Limit** for API protection
- **Helmet** for security headers

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Stripe account (for payments)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Subscription
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
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

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   VITE_APP_NAME=Learnly
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Schema

### User Model
```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  subscription?: {
    status: 'active' | 'inactive' | 'cancelled';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
  };
  refreshTokens: string[];
}
```

### Lesson Model
```typescript
{
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number; // in minutes
  category: string;
  tags: string[];
  isPremium: boolean;
  author: string;
  order: number;
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Lessons
- `GET /api/lessons` - Get all lessons (with pagination and filters)
- `GET /api/lessons/:id` - Get lesson by ID
- `GET /api/lessons/search` - Search lessons
- `GET /api/lessons/category/:category` - Get lessons by category
- `POST /api/lessons` - Create lesson (admin only)
- `PUT /api/lessons/:id` - Update lesson (admin only)
- `DELETE /api/lessons/:id` - Delete lesson (admin only)

### Subscriptions
- `POST /api/subscriptions/checkout` - Create Stripe checkout session
- `POST /api/subscriptions/billing-portal` - Create billing portal session
- `GET /api/subscriptions/status` - Get subscription status
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/subscriptions/webhook` - Stripe webhook handler

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- Protected routes for premium content

## 💳 Stripe Integration

The platform integrates with Stripe for subscription management:

1. **Setup Stripe Account**
   - Create a Stripe account
   - Get your API keys
   - Create products and prices in Stripe dashboard

2. **Configure Webhooks**
   - Set up webhook endpoint: `POST /api/subscriptions/webhook`
   - Configure events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

3. **Environment Variables**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Update environment variables for production

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📱 Usage

### For Users
1. Register an account or sign in
2. Browse available lessons
3. Upgrade to premium for access to premium content
4. Watch lessons and track your progress
5. Manage your subscription through the billing portal

### For Admins
1. Access admin features through the dashboard
2. Create and manage lessons
3. Monitor user subscriptions
4. Manage content categories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email khankhizerjahangir@gmail.com or create an issue in the repository.

## 🔄 Changelog

### Version 1.0.0
- Initial release
- User authentication system
- Subscription management with Stripe
- Lesson browsing and viewing
- Premium content protection
- Responsive design
- Admin dashboard






