# 🛡️ E-Commerce Backend — Spring Boot + MongoDB + JWT + OTP

Full-featured REST API backend for a modern e-commerce platform. Handles authentication, products, cart, orders, wishlist, reviews, coupons, wallet credits, and refund management.

---

## 🔧 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Java 17+ | Language |
| Spring Boot 3.5 | Framework |
| MongoDB Atlas | Database |
| Spring Security + JWT | Authentication & Authorization |
| JavaMailSender (Gmail SMTP) | OTP & order confirmation emails |
| Lombok | Boilerplate reduction |

---

## ⚙️ Configuration

`src/main/resources/application.properties`

```properties
# MongoDB Atlas
spring.data.mongodb.uri=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ecommerce_db

# JWT
jwt.secret=yourSuperSecretKey12345678901234567890123456789012
jwt.expiration=86400000

# Gmail SMTP
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Server
server.port=9092
```

> Use a Gmail **App Password** (not your regular password) if 2FA is enabled.

---

## 🏁 Running the App

```cmd
cd backend
mvnw.cmd spring-boot:run
```

App starts on **http://localhost:9092**

On first startup, the `DataInitializer` automatically:
- Creates a default admin account (`vishalir4321@gmail.com` / `admin123`)
- Seeds ~90 sample products across 9 categories (only if DB is empty)

---

## 📦 API Reference

### 🔐 Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login → sends OTP to email |
| POST | `/verify-otp` | Public | Verify OTP → returns JWT + user |
| POST | `/resend-otp` | Public | Resend OTP |
| POST | `/forgot-password` | Public | Send OTP for password reset |
| POST | `/reset-password` | Public | Reset password with OTP |
| GET | `/profile` | User/Admin | Get profile details |
| PUT | `/profile` | User/Admin | Update name |
| PUT | `/change-password` | User/Admin | Change password |
| GET | `/addresses` | User/Admin | Get saved addresses |
| POST | `/addresses` | User/Admin | Add new address |
| GET | `/wallet` | User/Admin | Get wallet balance |
| GET | `/all-users` | Admin | Get all users |
| DELETE | `/users/{id}` | Admin | Delete a user |

---

### 📦 Products — `/api/products`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | Get all products |
| GET | `/paged` | Public | Get paginated products (page, size, search, brand, category, minPrice, maxPrice, sortBy) |
| GET | `/{id}` | Public | Get product by ID |
| GET | `/brand/{brand}` | Public | Get products by brand |
| GET | `/category/{category}` | Public | Get products by category |
| GET | `/categories` | Public | Get all category names |
| GET | `/search?name=` | Public | Search products by name |
| GET | `/filter?minPrice=&maxPrice=` | Public | Filter by price range |
| GET | `/{id}/related` | Public | Get related products |
| POST | `/` | Admin | Create product |
| PUT | `/{id}` | Admin | Update product |
| DELETE | `/{id}` | Admin | Delete product |
| DELETE | `/bulk` | Admin | Bulk delete products (body: array of IDs) |

---

### 🛒 Cart — `/api/cart`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/add` | User/Admin | Add item to cart (enforces stock limit) |
| GET | `/` | User/Admin | View cart |
| DELETE | `/remove/{productId}` | User/Admin | Remove item |
| DELETE | `/clear` | User/Admin | Clear entire cart |

---

### 📋 Orders — `/api/orders`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/place` | User/Admin | Place order (supports COD, wallet credits, coupon) |
| GET | `/` | User/Admin | Get current user's orders |
| GET | `/all` | Admin | Get all orders |
| GET | `/user/{email}` | Admin | Get orders by user email |
| GET | `/analytics` | Admin | Revenue, status breakdown, top products |
| PUT | `/{id}/status` | Admin | Update order status (PLACED/SHIPPED/DELIVERED/CANCELLED) |
| PUT | `/{id}/cancel` | User/Admin | Cancel order (PLACED only) |
| PUT | `/{id}/payment-status` | Admin | Mark payment as PAID |
| PUT | `/{id}/refund-request` | User/Admin | Request refund (DELIVERED orders only) |
| PUT | `/{id}/refund-process` | Admin | Approve or reject refund |
| DELETE | `/{id}` | Admin | Delete order |

---

### ❤️ Wishlist — `/api/wishlist`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/add/{productId}` | User/Admin | Add to wishlist |
| GET | `/view` | User/Admin | View wishlist |
| DELETE | `/remove/{productId}` | User/Admin | Remove from wishlist |

---

### ⭐ Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/product/{productId}` | Public | Get reviews for a product |
| POST | `/` | User/Admin | Add review |
| DELETE | `/{reviewId}` | User/Admin | Delete review |

---

### 🏷️ Coupons — `/api/coupons`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/validate` | Public | Validate coupon code |
| POST | `/` | Admin | Create coupon |
| GET | `/` | Admin | Get all coupons |
| DELETE | `/{id}` | Admin | Delete coupon |

---

## 🗂️ Project Structure

```
src/main/java/com/ecommerce/backend/
├── config/
│   ├── CorsConfig.java          # CORS configuration
│   ├── DataInitializer.java     # Seed admin + products on startup
│   ├── EmailConfig.java         # Mail sender config
│   ├── GlobalExceptionHandler.java
│   └── JwtProperties.java
├── controller/
│   ├── AuthController.java
│   ├── CartController.java
│   ├── CouponController.java
│   ├── OrderController.java
│   ├── ProductController.java
│   ├── ReviewController.java
│   └── WishlistController.java
├── dto/
│   ├── AuthRequest.java
│   ├── AuthResponse.java
│   ├── CartItemRequest.java
│   ├── OrderRequest.java
│   ├── OrderResponse.java
│   ├── OtpRequest.java
│   ├── PasswordResetRequest.java
│   ├── ProductRequest.java
│   ├── ReviewRequest.java
│   └── WishlistRequest.java
├── model/
│   ├── Address.java
│   ├── CartItem.java
│   ├── Coupon.java
│   ├── Order.java               # Includes refund + wallet fields
│   ├── OtpEntry.java
│   ├── Product.java
│   ├── Review.java
│   ├── User.java                # Includes walletBalance
│   └── WishlistItem.java
├── repository/                  # Spring Data MongoDB repositories
├── security/
│   ├── JwtAuthenticationFilter.java
│   ├── JwtService.java
│   └── SecurityConfig.java
└── service/
    ├── AuthService.java
    ├── CartService.java         # Stock limit enforcement
    ├── CouponService.java
    ├── EmailService.java        # OTP + order confirmation emails
    ├── OrderService.java        # Wallet, refund, status timestamps
    ├── OtpService.java
    ├── ProductService.java      # Pagination, stock management
    └── ReviewService.java
```

---

## 🔐 Authentication Flow

```
Register → Login → OTP sent to email → Verify OTP → JWT returned
JWT must be included in all protected requests:
Authorization: Bearer <token>
```

---

## 🌟 Key Features

- **OTP-based login** — no password-only auth
- **Role-based access** — USER and ADMIN roles
- **Stock enforcement** — cart rejects over-stock quantities
- **Order tracking** — timestamps for PLACED, SHIPPED, DELIVERED, CANCELLED
- **Wallet system** — earn 5% credits per order, redeem at checkout
- **Refund management** — user requests, admin approves/rejects, stock restored
- **Coupon system** — PERCENT or FLAT discount with minimum order amount
- **Paginated products** — server-side pagination with filtering and sorting
- **Email notifications** — OTP and order confirmation via Gmail SMTP
- **Auto-seeding** — admin account and sample products created on first run
