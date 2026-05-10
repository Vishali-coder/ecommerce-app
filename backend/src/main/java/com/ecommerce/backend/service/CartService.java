package com.ecommerce.backend.service;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.CartItemRequest;
import com.ecommerce.backend.model.CartItem;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartItemRepository cartRepo;
    private final ProductRepository productRepo;

    public void addToCart(String email, CartItemRequest request) {
        // Validate input
        if (request == null) {
            throw new IllegalArgumentException("Cart item request cannot be null");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        if (request.getProductId() == null || request.getProductId().trim().isEmpty()) {
            throw new IllegalArgumentException("Product ID cannot be null or empty");
        }
        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        log.info("Adding product {} to cart for user {} with quantity {}", 
                request.getProductId(), email, request.getQuantity());
        
        // Find product
        Product product = productRepo.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));

        log.info("Found product: {} with price: {}", product.getName(), product.getPrice());

        // Check stock availability
        if (product.getQuantity() <= 0) {
            throw new RuntimeException("Sorry, \"" + product.getName() + "\" is out of stock.");
        }

        // Check if product already exists in cart
        if (cartRepo.existsByEmailAndProductId(email, request.getProductId())) {
            log.info("Product already in cart, updating quantity");
            
            List<CartItem> userCartItems = cartRepo.findByEmail(email);
            CartItem existingItem = userCartItems.stream()
                    .filter(i -> i.getProductId().equals(request.getProductId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Cart item not found despite existence check"));

            int newQuantity = existingItem.getQuantity() + request.getQuantity();

            // Enforce stock limit
            if (newQuantity > product.getQuantity()) {
                throw new RuntimeException(
                    "Only " + product.getQuantity() + " unit(s) available for \"" + product.getName() + "\". " +
                    "You already have " + existingItem.getQuantity() + " in your cart."
                );
            }

            existingItem.setQuantity(newQuantity);
            CartItem updated = cartRepo.save(existingItem);
            log.info("Updated cart item quantity to: {} for product: {}", updated.getQuantity(), product.getName());
        } else {
            // Enforce stock limit for new item
            if (request.getQuantity() > product.getQuantity()) {
                throw new RuntimeException(
                    "Only " + product.getQuantity() + " unit(s) available for \"" + product.getName() + "\"."
                );
            }

            log.info("Adding new item to cart");
            CartItem newItem = new CartItem(
                null, 
                email, 
                product.getId(), 
                product.getName(), 
                request.getQuantity(), 
                product.getPrice(), 
                product.getBrand(), 
                product.getImageUrl()
            );
            
            CartItem saved = cartRepo.save(newItem);
            log.info("Saved new cart item with ID: {} for product: {}", saved.getId(), product.getName());
        }
    }

    public List<CartItem> getCart(String email) {
        log.info("Fetching cart for user: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        
        List<CartItem> cartItems = cartRepo.findByEmail(email);
        log.info("Found {} items in cart for user: {}", cartItems.size(), email);
        
        return cartItems;
    }

    public void removeFromCart(String email, String productId) {
        log.info("Removing product {} from cart for user {}", productId, email);
        
        // Validate input
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        if (productId == null || productId.trim().isEmpty()) {
            throw new IllegalArgumentException("Product ID cannot be null or empty");
        }
        
        // Check if item exists in cart
        if (!cartRepo.existsByEmailAndProductId(email, productId)) {
            log.warn("Product {} not found in cart for user {}", productId, email);
            throw new RuntimeException("Product not found in cart");
        }
        
        cartRepo.deleteByEmailAndProductId(email, productId);
        log.info("Successfully removed product {} from cart for user {}", productId, email);
    }

    public void clearCart(String email) {
        log.info("Clearing cart for user: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("User email cannot be null or empty");
        }
        
        List<CartItem> existingItems = cartRepo.findByEmail(email);
        if (existingItems.isEmpty()) {
            log.info("Cart is already empty for user: {}", email);
            return;
        }
        
        cartRepo.deleteByEmail(email);
        log.info("Successfully cleared {} items from cart for user: {}", existingItems.size(), email);
    }
}
