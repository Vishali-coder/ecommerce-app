package com.ecommerce.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.AuthRequest;
import com.ecommerce.backend.dto.OtpRequest;
import com.ecommerce.backend.dto.PasswordResetRequest;
import com.ecommerce.backend.model.Address;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.service.AuthService;
import com.ecommerce.backend.service.OtpService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final OtpService otpService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered. Please login.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "USER";
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully. Please login to continue.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty())
                return ResponseEntity.badRequest().body("Email is required");
            if (request.getPassword() == null || request.getPassword().trim().isEmpty())
                return ResponseEntity.badRequest().body("Password is required");

            boolean isAuthenticated = authService.authenticateUser(request.getEmail(), request.getPassword());
            if (!isAuthenticated)
                return ResponseEntity.status(401).body("Invalid credentials");

            otpService.generateOtp(request.getEmail());
            return ResponseEntity.ok("OTP sent to email. Please verify to continue.");
        } catch (Exception e) {
            logger.error("Error during login for email: {}", request.getEmail(), e);
            return ResponseEntity.status(500).body("Internal server error occurred during login");
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty())
                return ResponseEntity.badRequest().body("Email is required");
            if (request.getOtp() == null || request.getOtp().trim().isEmpty())
                return ResponseEntity.badRequest().body("OTP is required");

            boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
            if (!isValid)
                return ResponseEntity.status(403).body("Invalid or expired OTP");

            User user = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (user == null)
                return ResponseEntity.status(404).body("User not found");

            String jwt = authService.generateToken(request.getEmail());
            otpService.clearOtp(request.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "role", user.getRole()
            ));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in verify-otp for email: {}", request.getEmail(), e);
            return ResponseEntity.status(500).body("Internal server error occurred");
        }
    }

    // ── Password Reset ──────────────────────────────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.trim().isEmpty())
            return ResponseEntity.badRequest().body("Email is required");

        if (userRepository.findByEmail(email).isEmpty())
            return ResponseEntity.badRequest().body("No account found with this email");

        otpService.generateOtp(email);
        return ResponseEntity.ok("OTP sent to email for password reset");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetRequest request) {
        try {
            boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
            if (!isValid)
                return ResponseEntity.status(403).body("Invalid or expired OTP");

            if (request.getNewPassword() == null || request.getNewPassword().length() < 6)
                return ResponseEntity.badRequest().body("Password must be at least 6 characters");

            authService.resetPassword(request.getEmail(), request.getNewPassword());
            otpService.clearOtp(request.getEmail());
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to reset password: " + e.getMessage());
        }
    }

    // ── Profile & Addresses ─────────────────────────────────────────────────────

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .<ResponseEntity<?>>map(user -> {
                    Map<String, Object> profile = new HashMap<>();
                    profile.put("id", user.getId());
                    profile.put("name", user.getName());
                    profile.put("email", user.getEmail());
                    profile.put("role", user.getRole());
                    profile.put("addresses", user.getAddresses());
                    return ResponseEntity.ok(profile);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, Authentication authentication) {
        User user = authService.updateProfile(authentication.getName(), body.get("name"));
        return ResponseEntity.ok(Map.of("name", user.getName(), "email", user.getEmail()));
    }

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(@RequestBody Address address, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.getAddresses().add(address);
        userRepository.save(user);
        return ResponseEntity.ok(user.getAddresses());
    }

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @GetMapping("/addresses")
    public ResponseEntity<?> getAddresses(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user.getAddresses());
    }

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> body, Authentication authentication) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (newPassword == null || newPassword.length() < 6)
            return ResponseEntity.badRequest().body("New password must be at least 6 characters");

        boolean valid = authService.authenticateUser(authentication.getName(), currentPassword);
        if (!valid)
            return ResponseEntity.status(401).body("Current password is incorrect");

        authService.resetPassword(authentication.getName(), newPassword);
        return ResponseEntity.ok("Password changed successfully");
    }

    @GetMapping("/otp-status")
    public ResponseEntity<?> getOtpStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "OTP Service");
        status.put("storage", "In-Memory Cache");
        status.put("activeOtps", otpService.getCacheSize());
        status.put("expiryMinutes", 5);
        status.put("status", "Active");
        return ResponseEntity.ok(status);
    }

    // Resend OTP
    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.trim().isEmpty())
            return ResponseEntity.badRequest().body("Email is required");
        if (userRepository.findByEmail(email).isEmpty())
            return ResponseEntity.badRequest().body("No account found with this email");
        otpService.generateOtp(email);
        return ResponseEntity.ok("OTP resent successfully");
    }

    @GetMapping("/all-users")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/wallet")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<?> getWalletBalance(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of("balance", user.getWalletBalance()));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable String id, Authentication authentication) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Prevent admin from deleting themselves
        if (target.getEmail().equals(authentication.getName())) {
            return ResponseEntity.badRequest().body("You cannot delete your own account");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
