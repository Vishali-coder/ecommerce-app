# 🛒 E-Commerce Frontend — React + Tailwind CSS

Modern, fully-featured React frontend for a full-stack e-commerce platform. Includes JWT auth, OTP verification, role-based access, shopping features, admin dashboard, wallet system, and more.

---

## 🔧 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Heroicons | SVG icon library |
| Context API | Global state (auth, cart) |

---

## 🏁 Getting Started

```cmd
cd frontend
npm install
npm start
```

Opens at **http://localhost:3000**

Backend must be running at **http://localhost:9092**

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx              # Responsive nav with avatar, cart badge, search
│   ├── ProductCard.jsx         # Card with Add/Go to Cart, wishlist, stock alert
│   ├── ProtectedRoute.jsx      # Route guard (auth + admin)
│   ├── Toast.jsx               # Global toast notification system
│   └── Footer.jsx
├── context/
│   ├── AuthContext.js          # User auth state, login/logout
│   └── CartContext.js          # Cart item count
├── hooks/
│   └── useRecentlyViewed.js    # localStorage-based recently viewed tracker
├── pages/
│   ├── HomePage.jsx            # Paginated product grid with filters
│   ├── RegisterPage.jsx        # User registration
│   ├── LoginPage.jsx           # Email/password login
│   ├── OTPVerifyPage.jsx       # 6-digit OTP verification
│   ├── ForgotPasswordPage.jsx  # Password reset via OTP
│   ├── ProductDetail.jsx       # Product page with reviews, Buy Now, Add to Cart
│   ├── CartPage.jsx            # Cart with COD, wallet credits, coupon, address
│   ├── WishlistPage.jsx        # Wishlist / Saved for Later
│   ├── OrdersPage.jsx          # Order history with timeline + invoice download
│   ├── ProfilePage.jsx         # Profile, avatar upload, addresses, wallet balance
│   ├── AdminDashboard.jsx      # Full admin panel
│   └── NotFoundPage.jsx
├── services/
│   └── api.js                  # All Axios API calls
└── utils/
    └── generateInvoice.js      # Browser-based PDF invoice generator
```

---

## 🌟 Features

### 🔐 Authentication
- Register with name, email, password
- Login → OTP sent to email → verify → JWT issued
- Auto-logout on token expiry (401 interceptor)
- Forgot password via OTP
- Role-based route protection (USER / ADMIN)

### 🛍️ Shopping
- **Paginated product grid** — 12 per page, server-side
- **Search & Filter** — by name, brand, category, price range
- **Sort** — price, rating, name
- **Product Stock Alert** — "⚠ Only X left!" for low stock
- **Buy Now** — adds to cart and goes directly to checkout
- **Add to Cart** → button turns green → "Go to Cart"
- **Quantity limit** — can't add more than available stock
- **Recently Viewed** — last 5 products shown on homepage
- **Save for Later** — move cart items to wishlist and back
- **Product Reviews** — star ratings and comments

### 🛒 Cart & Checkout
- Quantity controls with stock enforcement
- Coupon code redemption
- **Wallet credits** — toggle to use earned credits, slider to choose amount
- Shipping address selection (saved addresses)
- Add new address inline
- **Payment method** — Cash on Delivery (Online coming soon)
- Order placed → navigates to Orders page

### 📦 Orders
- Visual **order timeline** — Placed → Shipped → Delivered with timestamps
- Cancelled orders show red timeline
- Collapsible order cards with item thumbnails
- **Download Invoice** — browser-print PDF with full order details
- **Request Refund** — on delivered orders with reason
- Refund status badges (Requested / Approved / Rejected)
- Cancel order (PLACED status only)

### 👤 Profile
- **Profile picture upload** — stored in localStorage, shown in navbar
- **Wallet balance** — purple gradient card showing credits
- **Saved addresses** — add, edit, delete multiple addresses
- Account details display
- Quick links to Orders, Cart, Wishlist, Admin

### 👨‍💼 Admin Dashboard
- **Overview** — total products, orders, revenue, active coupons
- **Low stock alerts** — products with ≤ 5 units
- **Analytics** — 7-day revenue bar chart, order status donut chart, top products
- **Products** — add, edit, delete, bulk delete with checkboxes
- **Orders** — search, filter by status, update status, mark as paid, approve/reject refunds, export CSV
- **Coupons** — create PERCENT or FLAT coupons with min order amount
- **Users** — view all users, see order history per user, delete users
- **Notifications** — bell icon polls every 30s for new orders, unread badge

---

## 🌐 API Endpoints Used

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login (triggers OTP) |
| POST | `/api/auth/verify-otp` | Verify OTP → JWT |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/forgot-password` | Forgot password OTP |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/profile` | Get profile |
| PUT | `/api/auth/profile` | Update name |
| GET | `/api/auth/addresses` | Get addresses |
| POST | `/api/auth/addresses` | Add address |
| GET | `/api/auth/wallet` | Get wallet balance |
| GET | `/api/auth/all-users` | All users (Admin) |
| DELETE | `/api/auth/users/{id}` | Delete user (Admin) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | All products |
| GET | `/api/products/paged` | Paginated + filtered |
| GET | `/api/products/{id}` | Product detail |
| GET | `/api/products/categories` | All categories |
| POST | `/api/products` | Create (Admin) |
| PUT | `/api/products/{id}` | Update (Admin) |
| DELETE | `/api/products/{id}` | Delete (Admin) |
| DELETE | `/api/products/bulk` | Bulk delete (Admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cart/add` | Add to cart |
| GET | `/api/cart` | View cart |
| DELETE | `/api/cart/remove/{productId}` | Remove item |
| DELETE | `/api/cart/clear` | Clear cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/place` | Place order |
| GET | `/api/orders` | My orders |
| GET | `/api/orders/all` | All orders (Admin) |
| GET | `/api/orders/user/{email}` | User orders (Admin) |
| GET | `/api/orders/analytics` | Analytics (Admin) |
| PUT | `/api/orders/{id}/status` | Update status (Admin) |
| PUT | `/api/orders/{id}/cancel` | Cancel order |
| PUT | `/api/orders/{id}/payment-status` | Mark paid (Admin) |
| PUT | `/api/orders/{id}/refund-request` | Request refund |
| PUT | `/api/orders/{id}/refund-process` | Process refund (Admin) |
| DELETE | `/api/orders/{id}` | Delete order (Admin) |

### Wishlist / Reviews / Coupons
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/wishlist/add/{productId}` | Add to wishlist |
| GET | `/api/wishlist/view` | View wishlist |
| DELETE | `/api/wishlist/remove/{productId}` | Remove from wishlist |
| GET | `/api/reviews/product/{productId}` | Get reviews |
| POST | `/api/reviews` | Add review |
| DELETE | `/api/reviews/{reviewId}` | Delete review |
| POST | `/api/coupons/validate` | Validate coupon |
| POST | `/api/coupons` | Create coupon (Admin) |
| GET | `/api/coupons` | All coupons (Admin) |
| DELETE | `/api/coupons/{id}` | Delete coupon (Admin) |

---

## 🔐 Auth Flow

```
Register → Login → OTP email → Verify OTP → JWT stored in localStorage
All protected API calls include: Authorization: Bearer <token>
On 401 response → auto logout → redirect to /login
```

---

## 📱 Responsive Breakpoints

| Size | Range |
|------|-------|
| Mobile | < 640px |
| Tablet | 640px – 1024px |
| Desktop | > 1024px |

---

## 🚦 Available Scripts

```cmd
npm start       # Start dev server (localhost:3000)
npm run build   # Production build
npm test        # Run tests
```

---

## 🔑 Default Admin

| Field | Value |
|-------|-------|
| Email | vishalir4321@gmail.com |
| Password | admin123 |
| Dashboard | http://localhost:3000/admin |

> OTP will be sent to the admin email on login.
