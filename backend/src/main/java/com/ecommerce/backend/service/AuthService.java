package com.ecommerce.backend.service;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.AuthRequest;
import com.ecommerce.backend.dto.AuthResponse;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public ResponseEntity<?> register(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    public ResponseEntity<?> login(AuthRequest authRequest) {
        Optional<User> userOpt = userRepository.findByEmail(authRequest.getEmail());
        if (userOpt.isEmpty() || !passwordEncoder.matches(authRequest.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        User user = userOpt.get();
        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthResponse(token, user.getRole()));
    }

    public boolean authenticateUser(String email, String rawPassword) {
        try {
            if (email == null || rawPassword == null) return false;
            User user = userRepository.findByEmail(email).orElse(null);
            return user != null && user.getPassword() != null
                    && passwordEncoder.matches(rawPassword, user.getPassword());
        } catch (RuntimeException e) {
            System.err.println("Error during authentication for email: " + email + " - " + e.getMessage());
            return false;
        }
    }

    public String generateToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
        if (user.getRole() == null) user.setRole("USER");
        return jwtService.generateToken(user.getEmail(), user.getRole());
    }

    /** Reset password after OTP verification */
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /** Update user profile (name) */
    public User updateProfile(String email, String name) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (name != null && !name.isBlank()) user.setName(name);
        return userRepository.save(user);
    }
}
