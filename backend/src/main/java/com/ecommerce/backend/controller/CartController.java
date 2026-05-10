package com.ecommerce.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.CartItemRequest;
import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.service.CartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody CartItemRequest request, Authentication authentication) {
        System.out.println("=== ADD TO CART DEBUG ===");
        System.out.println("User email: " + authentication.getName());
        System.out.println("User authorities: " + authentication.getAuthorities());
        System.out.println("Product ID: " + request.getProductId());
        System.out.println("Quantity: " + request.getQuantity());
        
        try {
            cartService.addToCart(authentication.getName(), request);
            System.out.println("Successfully added to cart");
            return ResponseEntity.ok("Item added to cart successfully");
        } catch (Exception e) {
            System.err.println("Error adding to cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to add item to cart: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @GetMapping
    public List<CartItem> getCart(Authentication authentication) {
        return cartService.getCart(authentication.getName());
    }

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @DeleteMapping("/remove/{productId}")
    public String removeFromCart(@PathVariable String productId, Authentication authentication) {
        cartService.removeFromCart(authentication.getName(), productId);
        return "Item removed from cart";
    }

    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    @DeleteMapping("/clear")
    public String clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return "Cart cleared";
    }
}

