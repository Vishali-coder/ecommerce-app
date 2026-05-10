package com.ecommerce.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.backend.model.WishlistItem;

public interface WishlistRepository extends MongoRepository<WishlistItem, String> {
    List<WishlistItem> findByUserEmail(String email);
    
    @Transactional
    void deleteByUserEmailAndProductId(String email, String productId);
    
    boolean existsByUserEmailAndProductId(String email, String productId);
}


