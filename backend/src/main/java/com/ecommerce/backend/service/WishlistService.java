package com.ecommerce.backend.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.WishlistItem;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.WishlistRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Transactional
    public String addToWishlist(String email, String productId) {
        log.info("Adding product {} to wishlist for user {}", productId, email);
        
        // Validate input
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        if (productId == null || productId.trim().isEmpty()) {
            throw new IllegalArgumentException("Product ID cannot be null or empty");
        }
        
        // Check if product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productId));
        
        log.info("Found product: {}", product.getName());
        
        // Check if already in wishlist
        if (wishlistRepository.existsByUserEmailAndProductId(email, productId)) {
            log.info("Product {} already in wishlist for user {}", productId, email);
            return "Product already in wishlist";
        }

        // Add to wishlist
        WishlistItem item = WishlistItem.builder()
                .userEmail(email)
                .productId(productId)
                .build();

        WishlistItem saved = wishlistRepository.save(item);
        log.info("Successfully added product {} to wishlist with ID: {}", productId, saved.getId());
        return "Product added to wishlist";
    }

    public List<Product> viewWishlist(String email) {
        log.info("Fetching wishlist for user: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        
        List<WishlistItem> wishlistItems = wishlistRepository.findByUserEmail(email);
        log.info("Found {} wishlist items for user {}", wishlistItems.size(), email);
        
        List<Product> products = wishlistItems.stream()
                .map(item -> {
                    try {
                        return productRepository.findById(item.getProductId()).orElse(null);
                    } catch (Exception e) {
                        log.error("Error fetching product {}: {}", item.getProductId(), e.getMessage());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
                
        log.info("Returning {} valid products from wishlist for user {}", products.size(), email);
        return products;
    }

    @Transactional
    public String removeFromWishlist(String email, String productId) {
        log.info("Removing product {} from wishlist for user {}", productId, email);
        
        // Validate input
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        if (productId == null || productId.trim().isEmpty()) {
            throw new IllegalArgumentException("Product ID cannot be null or empty");
        }
        
        // Check if item exists in wishlist
        if (!wishlistRepository.existsByUserEmailAndProductId(email, productId)) {
            log.warn("Product {} not found in wishlist for user {}", productId, email);
            return "Product not found in wishlist";
        }
        
        wishlistRepository.deleteByUserEmailAndProductId(email, productId);
        log.info("Successfully removed product {} from wishlist for user {}", productId, email);
        return "Product removed from wishlist";
    }
}
