package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private String productId;
    private int rating; // 1-5
    private String comment;
}
