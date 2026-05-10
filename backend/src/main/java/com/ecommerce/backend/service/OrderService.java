package com.ecommerce.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.OrderRequest;
import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final UserRepository userRepo;
    private final OrderRepository orderRepo;
    private final CartItemRepository cartRepo;
    private final EmailService emailService;
    private final ProductService productService;
    private final CouponService couponService;

    public void placeOrder(OrderRequest request) {
        String email = request.getEmail();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        List<CartItem> cartItems = cartRepo.findByEmail(email);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Calculate subtotal
        double subtotal = cartItems.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        // Apply coupon if provided
        double discount = 0;
        String couponCode = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discount = couponService.applyCoupon(request.getCouponCode(), subtotal);
            couponCode = request.getCouponCode().toUpperCase();
        }

        double total = Math.max(0, subtotal - discount);

        // Apply wallet credits if requested
        double walletUsed = 0;

        if (request.getWalletCreditsUsed() > 0) {
            double available = user.getWalletBalance();
            walletUsed = Math.min(request.getWalletCreditsUsed(), Math.min(available, total));
            total = Math.max(0, total - walletUsed);
            user.setWalletBalance(Math.round((available - walletUsed) * 100.0) / 100.0);
        }

        // Earn 5% credits on final total paid
        double creditsEarned = Math.round(total * 0.05 * 100.0) / 100.0;
        user.setWalletBalance(Math.round((user.getWalletBalance() + creditsEarned) * 100.0) / 100.0);
        userRepo.save(user);

        // Deduct stock for each item
        for (CartItem item : cartItems) {
            productService.deductStock(item.getProductId(), item.getQuantity());
        }

        Order order = new Order();
        order.setUserEmail(email);
        order.setItems(cartItems);
        order.setTotalAmount(Math.round(total * 100.0) / 100.0);
        order.setDiscountAmount(Math.round(discount * 100.0) / 100.0);
        order.setCouponCode(couponCode);
        order.setStatus("PLACED");
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD");
        order.setPaymentStatus("PENDING");
        order.setWalletCreditsUsed(Math.round(walletUsed * 100.0) / 100.0);
        order.setCreditsEarned(creditsEarned);
        order.setOrderDate(LocalDateTime.now());
        order.setShippingAddress(request.getShippingAddress());

        orderRepo.save(order);
        cartRepo.deleteByEmail(email);

        emailService.sendOrderConfirmation(email, order.getId());
    }

    public List<Order> getUserOrders(String email) {
        return orderRepo.findByUserEmail(email);
    }

    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    public void updateStatus(String orderId, String status) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(status);
        // Record timestamp for each status change
        switch (status.toUpperCase()) {
            case "SHIPPED"   -> order.setShippedDate(LocalDateTime.now());
            case "DELIVERED" -> order.setDeliveredDate(LocalDateTime.now());
            case "CANCELLED" -> order.setCancelledDate(LocalDateTime.now());
        }
        orderRepo.save(order);
    }

    public void updatePaymentStatus(String orderId, String paymentStatus) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setPaymentStatus(paymentStatus.toUpperCase());
        orderRepo.save(order);
    }

    public void requestRefund(String orderId, String email, String reason) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        if (!order.getUserEmail().equals(email))
            throw new RuntimeException("Not authorized");
        if (!"DELIVERED".equalsIgnoreCase(order.getStatus()))
            throw new RuntimeException("Refund can only be requested for delivered orders");
        if (order.getRefundStatus() != null)
            throw new RuntimeException("Refund already " + order.getRefundStatus().toLowerCase());
        order.setRefundStatus("REQUESTED");
        order.setRefundReason(reason);
        order.setRefundRequestedDate(LocalDateTime.now());
        orderRepo.save(order);
    }

    public void processRefund(String orderId, String action) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        if (!"REQUESTED".equalsIgnoreCase(order.getRefundStatus()))
            throw new RuntimeException("No pending refund request for this order");
        order.setRefundStatus(action.toUpperCase()); // APPROVED or REJECTED
        order.setRefundProcessedDate(LocalDateTime.now());
        if ("APPROVED".equalsIgnoreCase(action)) {
            order.setPaymentStatus("REFUNDED");
            // Restore stock
            for (CartItem item : order.getItems()) {
                productService.restoreStock(item.getProductId(), item.getQuantity());
            }
        }
        orderRepo.save(order);
    }

    /** User cancels their own order — only allowed if status is PLACED */
    public void cancelOrder(String orderId, String email) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserEmail().equals(email)) {
            throw new RuntimeException("Not authorized to cancel this order");
        }

        if (!"PLACED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Order can only be cancelled when status is PLACED");
        }

        order.setStatus("CANCELLED");
        order.setCancelledDate(LocalDateTime.now());
        orderRepo.save(order);

        // Restore stock
        for (CartItem item : order.getItems()) {
            productService.restoreStock(item.getProductId(), item.getQuantity());
        }
    }

    public void deleteOrder(String orderId) {
        orderRepo.deleteById(orderId);
    }

    public java.util.Map<String, Object> getAnalytics() {
        java.util.List<Order> allOrders = orderRepo.findAll();

        // Revenue by day (last 7 days)
        java.time.LocalDate today = java.time.LocalDate.now();
        java.util.Map<String, Double> revenueByDay = new java.util.LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate day = today.minusDays(i);
            revenueByDay.put(day.toString(), 0.0);
        }
        allOrders.stream()
            .filter(o -> o.getOrderDate() != null && !"CANCELLED".equals(o.getStatus()))
            .forEach(o -> {
                String day = o.getOrderDate().toLocalDate().toString();
                if (revenueByDay.containsKey(day)) {
                    revenueByDay.merge(day, o.getTotalAmount(), Double::sum);
                }
            });

        // Order status breakdown
        java.util.Map<String, Long> statusBreakdown = allOrders.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                o -> o.getStatus() != null ? o.getStatus() : "PLACED",
                java.util.stream.Collectors.counting()
            ));

        // Top 5 products by revenue
        java.util.Map<String, Double> productRevenue = new java.util.HashMap<>();
        java.util.Map<String, String> productNames = new java.util.HashMap<>();
        allOrders.stream()
            .filter(o -> !"CANCELLED".equals(o.getStatus()) && o.getItems() != null)
            .flatMap(o -> o.getItems().stream())
            .forEach(item -> {
                productRevenue.merge(item.getProductId(),
                    item.getPrice() * item.getQuantity(), Double::sum);
                productNames.put(item.getProductId(), item.getName());
            });

        java.util.List<java.util.Map<String, Object>> topProducts = productRevenue.entrySet().stream()
            .sorted(java.util.Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(5)
            .map(e -> {
                java.util.Map<String, Object> m = new java.util.HashMap<>();
                m.put("productId", e.getKey());
                m.put("name", productNames.getOrDefault(e.getKey(), "Unknown"));
                m.put("revenue", Math.round(e.getValue() * 100.0) / 100.0);
                return m;
            })
            .toList();

        // Summary
        double totalRevenue = allOrders.stream()
            .filter(o -> !"CANCELLED".equals(o.getStatus()))
            .mapToDouble(Order::getTotalAmount).sum();

        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("totalOrders", allOrders.size());
        result.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        result.put("revenueByDay", revenueByDay);
        result.put("statusBreakdown", statusBreakdown);
        result.put("topProducts", topProducts);
        return result;
    }
}
