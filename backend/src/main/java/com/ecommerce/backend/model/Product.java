package com.ecommerce.backend.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "products")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private double price;
    private String brand;
    private String category;
    private int quantity;
    private String imageUrl;                          // primary image (kept for backward compat)
    @Builder.Default
    private List<String> images = new ArrayList<>();  // multiple images
    private double averageRating;
    private int reviewCount;
}
