package com.ecommerce.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.ecommerce.backend.model.CartItem;

import lombok.Data;

@Data
public class OrderResponse {
    private String id;
    private List<CartItem> items;
    private double totalAmount;
    private String status;
    private LocalDateTime orderDate;
}
