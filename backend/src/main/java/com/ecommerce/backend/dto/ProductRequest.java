package com.ecommerce.backend.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private double price;
    private String brand;
    private String category;
    private int quantity;
    private String imageUrl;
    private List<String> images = new ArrayList<>();
}
