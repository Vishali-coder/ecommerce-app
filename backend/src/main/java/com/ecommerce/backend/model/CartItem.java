package com.ecommerce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "CartItem")
public class CartItem {

    @Id
    private String id;             // Optional, but useful for MongoDB _id
    private String email;          // Who owns the cart item
    private String productId;      // ID of the product
    private String name;           // Name of the product
    private int quantity;          // Quantity selected
    private double price;          // Price per unit or total, based on your logic
    private String brand;          // Brand of the product
    private String imageUrl;       // Image URL of the product
}
