package com.ecommerce.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "coupons")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Coupon {
    @Id
    private String id;
    private String code;         // e.g. SAVE10
    private String type;         // PERCENT or FLAT
    private double value;        // 10 = 10% or $10 off
    private double minOrderAmount; // minimum order to apply
    private boolean active;
}
