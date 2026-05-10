package com.ecommerce.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.ReviewRequest;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.Review;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.ReviewRepository;
import com.ecommerce.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Review addReview(String email, ReviewRequest request) {
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // One review per user per product — update if exists
        Review review = reviewRepository
                .findByProductIdAndUserEmail(request.getProductId(), email)
                .orElse(new Review());

        String userName = userRepository.findByEmail(email)
                .map(u -> u.getName())
                .orElse(email);

        review.setProductId(request.getProductId());
        review.setUserEmail(email);
        review.setUserName(userName);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);

        // Recalculate average rating on product
        updateProductRating(product);

        return saved;
    }

    public List<Review> getProductReviews(String productId) {
        return reviewRepository.findByProductId(productId);
    }

    public void deleteReview(String reviewId, String email) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUserEmail().equals(email)) {
            throw new RuntimeException("Not authorized to delete this review");
        }

        reviewRepository.deleteById(reviewId);

        productRepository.findById(review.getProductId())
                .ifPresent(this::updateProductRating);
    }

    private void updateProductRating(Product product) {
        List<Review> reviews = reviewRepository.findByProductId(product.getId());
        if (reviews.isEmpty()) {
            product.setAverageRating(0);
            product.setReviewCount(0);
        } else {
            double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
            product.setAverageRating(Math.round(avg * 10.0) / 10.0);
            product.setReviewCount(reviews.size());
        }
        productRepository.save(product);
    }
}
