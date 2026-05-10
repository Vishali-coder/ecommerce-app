package com.ecommerce.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.service.WishlistService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable String productId, Authentication authentication) {
        try {
            String email = authentication.getName();
            String result = wishlistService.addToWishlist(email, productId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to add item to wishlist: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @GetMapping("/view")
    public ResponseEntity<?> viewWishlist(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Product> products = wishlistService.viewWishlist(email);
            
            // Create response structure that matches frontend expectations
            Map<String, Object> response = new HashMap<>();
            response.put("items", products);
            response.put("count", products.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch wishlist: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable String productId, Authentication authentication) {
        try {
            String email = authentication.getName();
            String result = wishlistService.removeFromWishlist(email, productId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to remove item from wishlist: " + e.getMessage());
        }
    }
}
