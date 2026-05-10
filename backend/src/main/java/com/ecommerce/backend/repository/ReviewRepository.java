package com.ecommerce.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.ecommerce.backend.model.Review;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductId(String productId);
    Optional<Review> findByProductIdAndUserEmail(String productId, String userEmail);
    void deleteByProductId(String productId);
}
