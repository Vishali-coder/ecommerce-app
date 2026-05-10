package com.ecommerce.backend.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
    private UserDto user;

    public AuthResponse(String token, String role) {
        this.token = token;
        this.role = role;
        this.user = null;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private String email;
        private String name;
        private String role;
    }
}
