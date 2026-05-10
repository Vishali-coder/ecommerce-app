package com.ecommerce.backend.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String userEmail;
    private List<CartItem> items;
    private double totalAmount;
    private double discountAmount;
    private String couponCode;
    private String status; // PLACED, SHIPPED, DELIVERED, CANCELLED
    private String paymentMethod; // COD, ONLINE
    private String paymentStatus; // PENDING, PAID
    private LocalDateTime orderDate;
    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;
    private LocalDateTime cancelledDate;
    private Address shippingAddress;

    // Refund
    private String refundStatus;  // null, REQUESTED, APPROVED, REJECTED
    private String refundReason;
    private LocalDateTime refundRequestedDate;
    private LocalDateTime refundProcessedDate;

    // Wallet
    private double walletCreditsUsed = 0.0;
    private double creditsEarned = 0.0;
}
