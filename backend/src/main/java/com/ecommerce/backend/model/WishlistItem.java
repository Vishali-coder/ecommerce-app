package com.ecommerce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "wishlist")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItem {
    @Id
    private String id;
    private String userEmail;
    private String productId;
}

