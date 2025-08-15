# Learnly Deployment Guide

This guide covers deploying the Learnly subscription-based learning platform to various environments.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- MongoDB (local or cloud)
- Stripe account with API keys
- Git repository access

## Environment Setup

### 1. Environment Variables

Create environment files for each environment:

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
STRIPE_PRICE_ID=price_your_stripe_price_id_here

# Client Configuration
CLIENT_URL=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.your-domain.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
VITE_APP_NAME=Learnly
VITE_APP_VERSION=1.0.0
```

## Local Development

### Using Docker Compose

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Subscription
   ```

2. **Set up environment variables:**
   ```bash
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env
   # Edit the .env files with your configuration
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Manual Setup

1. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or install MongoDB locally
   ```

3. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## Production Deployment

### Option 1: Docker Compose (Recommended)

1. **Build production images:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
   ```

2. **Deploy with production configuration:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Option 2: Cloud Platforms

#### Railway

1. **Connect your repository to Railway**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically on push to main branch**

#### Render

1. **Create a new Web Service**
2. **Connect your GitHub repository**
3. **Configure build settings:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. **Set environment variables**

#### Heroku

1. **Install Heroku CLI**
2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

3. **Add MongoDB addon:**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   # ... other variables
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

#### DigitalOcean App Platform

1. **Create a new app in DigitalOcean**
2. **Connect your GitHub repository**
3. **Configure services:**
   - Backend service
   - Frontend service
   - Database service
4. **Set environment variables**

### Option 3: Kubernetes

1. **Create Kubernetes manifests:**
   ```yaml
   # k8s/namespace.yaml
   apiVersion: v1
   kind: Namespace
   metadata:
     name: learnly
   ```

2. **Deploy MongoDB:**
   ```bash
   kubectl apply -f k8s/mongodb.yaml
   ```

3. **Deploy backend:**
   ```bash
   kubectl apply -f k8s/backend.yaml
   ```

4. **Deploy frontend:**
   ```bash
   kubectl apply -f k8s/frontend.yaml
   ```

5. **Set up ingress:**
   ```bash
   kubectl apply -f k8s/ingress.yaml
   ```

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas account**
2. **Create a new cluster**
3. **Set up database access:**
   - Create database user
   - Set network access (IP whitelist)
4. **Get connection string**
5. **Update MONGODB_URI in environment variables**

### Local MongoDB

1. **Install MongoDB:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS
   brew install mongodb-community
   ```

2. **Start MongoDB service:**
   ```bash
   sudo systemctl start mongodb
   ```

## Stripe Configuration

### 1. Create Stripe Account

1. **Sign up at https://stripe.com**
2. **Complete account verification**
3. **Get API keys from dashboard**

### 2. Set Up Products and Prices

1. **Create a product in Stripe dashboard**
2. **Create a recurring price for subscription**
3. **Note the price ID (starts with 'price_')**

### 3. Configure Webhooks

1. **Go to Stripe Dashboard > Webhooks**
2. **Add endpoint:**
   ```
   https://your-domain.com/api/subscriptions/webhook
   ```
3. **Select events:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy webhook secret**

### 4. Update Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

## SSL/HTTPS Setup

### Using Let's Encrypt

1. **Install Certbot:**
   ```bash
   sudo apt-get install certbot
   ```

2. **Obtain certificate:**
   ```bash
   sudo certbot certonly --standalone -d your-domain.com
   ```

3. **Configure Nginx:**
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       # ... rest of configuration
   }
   ```

### Using Cloudflare

1. **Add domain to Cloudflare**
2. **Update nameservers**
3. **Enable SSL/TLS encryption mode: Full (strict)**
4. **Set up page rules for redirects**

## Monitoring and Logging

### Application Monitoring

1. **Set up health checks:**
   ```bash
   curl https://your-domain.com/health
   ```

2. **Monitor application logs:**
   ```bash
   # Docker
   docker-compose logs -f
   
   # Kubernetes
   kubectl logs -f deployment/backend
   ```

### Database Monitoring

1. **Set up MongoDB monitoring:**
   - MongoDB Atlas provides built-in monitoring
   - Set up alerts for connection issues

2. **Monitor database performance:**
   ```bash
   # Connect to MongoDB
   mongosh "mongodb://username:password@host:port/database"
   
   # Check slow queries
   db.getProfilingStatus()
   ```

## Backup Strategy

### Database Backups

1. **Automated backups with MongoDB Atlas**
2. **Manual backups:**
   ```bash
   mongodump --uri="mongodb://username:password@host:port/database"
   ```

3. **Restore from backup:**
   ```bash
   mongorestore --uri="mongodb://username:password@host:port/database" dump/
   ```

### Application Backups

1. **Backup environment variables**
2. **Backup SSL certificates**
3. **Backup configuration files**

## Security Considerations

### Environment Variables

1. **Never commit .env files to version control**
2. **Use strong, unique secrets**
3. **Rotate secrets regularly**

### Network Security

1. **Use HTTPS everywhere**
2. **Set up firewall rules**
3. **Limit database access**

### Application Security

1. **Keep dependencies updated**
2. **Run security scans regularly**
3. **Monitor for vulnerabilities**

## Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Check MongoDB URI
   - Verify network access
   - Check credentials

2. **Stripe webhook failures:**
   - Verify webhook endpoint URL
   - Check webhook secret
   - Monitor webhook logs

3. **Authentication issues:**
   - Verify JWT secrets
   - Check token expiration
   - Validate user permissions

### Debug Commands

```bash
# Check application status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart backend

# Check database connection
docker-compose exec backend npm run test:db
```

## Performance Optimization

### Backend Optimization

1. **Enable compression**
2. **Implement caching**
3. **Optimize database queries**
4. **Use connection pooling**

### Frontend Optimization

1. **Enable code splitting**
2. **Optimize bundle size**
3. **Implement lazy loading**
4. **Use CDN for static assets**

## Scaling

### Horizontal Scaling

1. **Load balancer setup**
2. **Database replication**
3. **Session management**
4. **Cache distribution**

### Vertical Scaling

1. **Increase server resources**
2. **Optimize application code**
3. **Database optimization**
4. **CDN implementation**
