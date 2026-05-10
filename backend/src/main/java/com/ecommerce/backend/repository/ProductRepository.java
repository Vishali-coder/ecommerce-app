package com.ecommerce.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.ecommerce.backend.model.Product;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByBrand(String brand);
    List<Product> findByCategory(String category);
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByPriceBetween(double minPrice, double maxPrice);
    List<Product> findByBrandAndPriceBetween(String brand, double minPrice, double maxPrice);
    List<Product> findByCategoryAndPriceBetween(String category, double minPrice, double maxPrice);

    // Paginated
    Page<Product> findAll(Pageable pageable);
    Page<Product> findByBrand(String brand, Pageable pageable);
    Page<Product> findByCategory(String category, Pageable pageable);
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Product> findByPriceBetween(double min, double max, Pageable pageable);
}
