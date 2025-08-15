# Learnly API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "subscription": {
        "status": "active",
        "currentPeriodEnd": "2024-01-01T00:00:00.000Z"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Logout
```http
POST /auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Profile
```http
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <access_token>
```

### Lessons

#### Get All Lessons
```http
GET /lessons?page=1&limit=10&category=programming&isPremium=false
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `category` (optional): Filter by category
- `isPremium` (optional): Filter by premium status

**Response:**
```json
{
  "success": true,
  "message": "Lessons retrieved successfully",
  "data": {
    "items": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "title": "Introduction to JavaScript",
        "description": "Learn the basics of JavaScript programming",
        "content": "JavaScript is a programming language...",
        "duration": 45,
        "category": "programming",
        "tags": ["javascript", "beginner"],
        "isPremium": false,
        "author": "John Doe",
        "order": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Get Lesson by ID
```http
GET /lessons/64f1a2b3c4d5e6f7g8h9i0j1
```

#### Search Lessons
```http
GET /lessons/search?search=javascript&page=1&limit=10
```

#### Get Lessons by Category
```http
GET /lessons/category/programming?page=1&limit=10
```

#### Create Lesson (Admin Only)
```http
POST /lessons
```

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "title": "Advanced React Patterns",
  "description": "Learn advanced React patterns and best practices",
  "content": "In this lesson, we'll explore...",
  "duration": 60,
  "category": "programming",
  "tags": ["react", "advanced"],
  "isPremium": true,
  "author": "Jane Smith",
  "order": 5,
  "videoUrl": "https://example.com/video.mp4",
  "thumbnailUrl": "https://example.com/thumbnail.jpg"
}
```

#### Update Lesson (Admin Only)
```http
PUT /lessons/64f1a2b3c4d5e6f7g8h9i0j1
```

#### Delete Lesson (Admin Only)
```http
DELETE /lessons/64f1a2b3c4d5e6f7g8h9i0j1
```

### Subscriptions

#### Create Checkout Session
```http
POST /subscriptions/create-checkout-session
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "priceId": "price_1234567890",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Checkout session created successfully",
  "data": {
    "sessionId": "cs_test_1234567890",
    "url": "https://checkout.stripe.com/pay/cs_test_1234567890"
  }
}
```

#### Create Billing Portal Session
```http
POST /subscriptions/create-billing-portal-session
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "returnUrl": "https://example.com/account"
}
```

#### Get Subscription Status
```http
GET /subscriptions/status
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription status retrieved successfully",
  "data": {
    "hasSubscription": true,
    "subscription": {
      "id": "sub_1234567890",
      "status": "active",
      "currentPeriodStart": "2024-01-01T00:00:00.000Z",
      "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
      "cancelAtPeriodEnd": false,
      "localStatus": "active",
      "isActive": true
    }
  }
}
```

#### Cancel Subscription
```http
POST /subscriptions/cancel
```

**Headers:**
```
Authorization: Bearer <access_token>
```

### Users

#### Update Profile
```http
PUT /users/profile
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com"
}
```

#### Get All Users (Admin Only)
```http
GET /users?page=1&limit=10
```

#### Get User by ID (Admin Only)
```http
GET /users/64f1a2b3c4d5e6f7g8h9i0j1
```

#### Delete User (Admin Only)
```http
DELETE /users/64f1a2b3c4d5e6f7g8h9i0j1
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Webhooks

### Stripe Webhook
```http
POST /subscriptions/webhook
```

This endpoint handles Stripe webhook events for subscription management. The webhook signature is verified using the `Stripe-Signature` header.

## Health Check

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```
