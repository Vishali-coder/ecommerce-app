package com.ecommerce.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Address {
    private String fullName;
    private String phone;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
}
