package com.ecommerce.backend.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String password;
    private String role; // USER, ADMIN
    private double walletBalance = 0.0;
    private List<CartItem> cart = new ArrayList<>();
    private List<Address> addresses = new ArrayList<>();
}
