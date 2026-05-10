package com.ecommerce.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.dto.ProductRequest;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product addProduct(ProductRequest request) {
        List<String> images = request.getImages() != null ? request.getImages() : new ArrayList<>();
        // If imageUrl provided but not in images list, add it as first image
        if (request.getImageUrl() != null && !request.getImageUrl().isEmpty() && !images.contains(request.getImageUrl())) {
            images.add(0, request.getImageUrl());
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .brand(request.getBrand())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .imageUrl(request.getImageUrl())
                .images(images)
                .averageRating(0)
                .reviewCount(0)
                .build();
        return productRepository.save(product);
    }

    public Product updateProduct(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() > 0) product.setPrice(request.getPrice());
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getQuantity() >= 0) product.setQuantity(request.getQuantity());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getImages() != null) product.setImages(request.getImages());

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Page<Product> getProductsPaged(
            String search, String brand, String category,
            double minPrice, double maxPrice, Pageable pageable) {

        boolean hasSearch   = search   != null && !search.isBlank();
        boolean hasBrand    = brand    != null && !brand.isBlank();
        boolean hasCategory = category != null && !category.isBlank();
        boolean hasPrice    = minPrice > 0 || maxPrice < 999999;

        // Simple cases — delegate to repository
        if (hasSearch)   return productRepository.findByNameContainingIgnoreCase(search, pageable);
        if (hasBrand)    return productRepository.findByBrand(brand, pageable);
        if (hasCategory) return productRepository.findByCategory(category, pageable);
        if (hasPrice)    return productRepository.findByPriceBetween(minPrice, maxPrice, pageable);

        return productRepository.findAll(pageable);
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByBrand(String brand) {
        return productRepository.findByBrand(brand);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public List<Product> searchProductsByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> getProductsByPriceRange(double minPrice, double maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }

    public List<String> getAllCategories() {
        return productRepository.findAll().stream()
                .map(Product::getCategory)
                .filter(c -> c != null && !c.isEmpty())
                .distinct()
                .sorted()
                .toList();
    }

    /**
     * Returns up to 4 related products — same category first, then same brand,
     * excluding the current product.
     */
    public List<Product> getRelatedProducts(String productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return List.of();

        java.util.Set<String> seen = new java.util.LinkedHashSet<>();
        java.util.List<Product> related = new java.util.ArrayList<>();

        // Same category
        if (product.getCategory() != null && !product.getCategory().isEmpty()) {
            productRepository.findByCategory(product.getCategory()).stream()
                    .filter(p -> !p.getId().equals(productId))
                    .forEach(p -> { if (seen.add(p.getId())) related.add(p); });
        }

        // Same brand (fill up to 4)
        if (related.size() < 4 && product.getBrand() != null) {
            productRepository.findByBrand(product.getBrand()).stream()
                    .filter(p -> !p.getId().equals(productId))
                    .forEach(p -> { if (seen.add(p.getId())) related.add(p); });
        }

        return related.stream().limit(4).toList();
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    public void bulkDeleteProducts(java.util.List<String> ids) {
        productRepository.deleteAllById(ids);
    }

    /** Deduct stock when order is placed */
    public void deductStock(String productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        int newQty = product.getQuantity() - quantity;
        if (newQty < 0) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }
        product.setQuantity(newQty);
        productRepository.save(product);
    }

    /** Restore stock when order is cancelled */
    public void restoreStock(String productId, int quantity) {
        productRepository.findById(productId).ifPresent(product -> {
            product.setQuantity(product.getQuantity() + quantity);
            productRepository.save(product);
        });
    }
}
