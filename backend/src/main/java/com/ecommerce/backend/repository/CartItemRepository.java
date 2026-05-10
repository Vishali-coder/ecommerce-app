package com.ecommerce.backend.repository;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.ecommerce.backend.model.CartItem;

public interface CartItemRepository extends MongoRepository<CartItem, String> {
    
    List<CartItem> findByEmail(String email);

    void deleteByEmail(String email);

    void deleteByEmailAndProductId(String email, String productId);

    boolean existsByEmailAndProductId(String email, String productId);
}

