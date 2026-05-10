package com.ecommerce.backend.dto;

import com.ecommerce.backend.model.Address;

import lombok.Data;

@Data
public class OrderRequest {
    private String email;
    private String couponCode;
    private Address shippingAddress;
    private String paymentMethod; // COD or ONLINE
    private double walletCreditsUsed; // credits to redeem at checkout
}
