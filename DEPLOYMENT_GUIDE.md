# 🚀 E-Commerce Platform Deployment Guide

This guide covers the complete deployment of both the Spring Boot backend and React frontend.

## 📋 Prerequisites

- **Java 17+** installed
- **Node.js 16+** and npm installed
- **MongoDB** running on localhost:27017
- **Gmail account** with App Password for OTP emails

## 🔧 Backend Setup (Spring Boot)

### 1. Configure Application Properties

Create `backend/src/main/resources/application.properties`:

```properties
# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/ecommerce

# Email Configuration (Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# JWT Configuration
jwt.secret=your_jwt_secret_key_here_make_it_long_and_secure
jwt.expiration=3600000

# Server Configuration
server.port=9092

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

### 2. Start Backend Server

```bash
cd backend
mvn spring-boot:run
```

The backend will be available at: `http://localhost:9092`

## 🎨 Frontend Setup (React)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Update `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:9092
REACT_APP_NAME=ShopHub E-Commerce
REACT_APP_VERSION=1.0.0
```

### 3. Start Frontend Server

```bash
npm start
```

The frontend will be available at: `http://localhost:3000`

## 🧪 Testing the Application

### 1. User Registration & Authentication Flow

1. **Register:** Go to `/register` and create a new account
2. **Login:** Go to `/login` and enter credentials
3. **OTP Verification:** Check email for OTP and verify at `/verify-otp`
4. **Access Protected Routes:** Now you can access cart, wishlist, orders

### 2. Admin Access

1. **Create Admin User:** Register normally, then manually update user role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "ADMIN" } }
   )
   ```
2. **Access Admin Dashboard:** Login and navigate to `/admin`

### 3. Test API Endpoints

Use Postman or curl to test backend endpoints:

```bash
# Register User
curl -X POST http://localhost:9092/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login User
curl -X POST http://localhost:9092/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Products
curl -X GET http://localhost:9092/api/products
```

## 📱 Features Checklist

### ✅ Completed Features

#### Authentication
- [x] User registration with validation
- [x] Email/password login
- [x] OTP verification via email
- [x] JWT token management
- [x] Role-based access control

#### User Features
- [x] Browse products with search/filter
- [x] View product details
- [x] Add to cart functionality
- [x] Wishlist management
- [x] Place orders
- [x] View order history
- [x] Responsive mobile design

#### Admin Features
- [x] Admin dashboard
- [x] Product management (CRUD)
- [x] Order management
- [x] Order status updates
- [x] Analytics overview

#### UI/UX
- [x] Modern Tailwind CSS design
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Mobile responsive
- [x] Form validation

## 🔒 Security Features

- **JWT Authentication:** Secure token-based auth
- **OTP Verification:** Email-based two-factor authentication
- **Role-based Access:** Admin/User role separation
- **Input Validation:** Frontend and backend validation
- **CORS Configuration:** Proper cross-origin setup
- **Error Handling:** Graceful error boundaries

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (sends OTP)
- `POST /api/auth/verify-otp` - Verify OTP and get JWT

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/brand/{brand}` - Get products by brand
- `POST /api/products` - Create product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)

### Cart Endpoints
- `POST /api/cart/add` - Add product to cart
- `GET /api/cart` - Get user's cart
- `DELETE /api/cart/remove/{productId}` - Remove from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Order Endpoints
- `POST /api/orders/place` - Place order from cart
- `GET /api/orders` - Get user's orders
- `GET /api/orders/all` - Get all orders (Admin only)
- `PUT /api/orders/{id}/status` - Update order status (Admin only)
- `DELETE /api/orders/{id}` - Delete order

### Wishlist Endpoints
- `POST /api/wishlist/add/{productId}` - Add to wishlist
- `GET /api/wishlist/view` - Get user's wishlist
- `DELETE /api/wishlist/remove/{productId}` - Remove from wishlist

## 🚀 Production Deployment

### Backend (Spring Boot)
1. **Build JAR:** `mvn clean package`
2. **Deploy:** Upload JAR to server
3. **Run:** `java -jar backend-0.0.1-SNAPSHOT.jar`
4. **Environment:** Set production database and email configs

### Frontend (React)
1. **Build:** `npm run build`
2. **Deploy:** Upload build folder to web server
3. **Configure:** Update API base URL for production
4. **Serve:** Use nginx or Apache to serve static files

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure backend CORS is configured for frontend URL
   - Check that both servers are running

2. **Email OTP Not Received:**
   - Verify Gmail App Password is correct
   - Check spam folder
   - Ensure SMTP settings are correct

3. **JWT Token Issues:**
   - Check token expiration time
   - Verify JWT secret is consistent
   - Clear localStorage if needed

4. **MongoDB Connection:**
   - Ensure MongoDB is running
   - Check connection string
   - Verify database permissions

## 📈 Performance Optimization

- **Frontend:** Code splitting, lazy loading, image optimization
- **Backend:** Database indexing, caching, connection pooling
- **Network:** CDN for static assets, gzip compression

## 🔮 Future Enhancements

- Payment gateway integration
- Real-time notifications
- Advanced search and filtering
- Product reviews and ratings
- Order tracking with maps
- Social media integration
- PWA capabilities
- Multi-language support

---

**🎉 Congratulations! Your e-commerce platform is now ready for use!**

For support, create an issue in the repository or contact the development team.