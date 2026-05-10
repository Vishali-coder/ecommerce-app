package com.ecommerce.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// @Document(collection = "otp") // Commented out - using in-memory storage now
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OtpEntry {
    @Id
    private String email;
    private String otp;
    private LocalDateTime expiresAt;
}

