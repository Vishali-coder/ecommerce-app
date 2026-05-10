package com.ecommerce.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.ProductRequest;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.addProduct(request));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/paged")
    public ResponseEntity<Map<String, Object>> getProductsPaged(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "")   String search,
            @RequestParam(defaultValue = "")   String brand,
            @RequestParam(defaultValue = "")   String category,
            @RequestParam(defaultValue = "0")  double minPrice,
            @RequestParam(defaultValue = "999999") double maxPrice,
            @RequestParam(defaultValue = "default") String sortBy) {

        Sort sort = switch (sortBy) {
            case "price-asc"   -> Sort.by("price").ascending();
            case "price-desc"  -> Sort.by("price").descending();
            case "rating-desc" -> Sort.by("averageRating").descending();
            case "name-asc"    -> Sort.by("name").ascending();
            default            -> Sort.by("id").descending();
        };

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> result = productService.getProductsPaged(
                search, brand, category, minPrice, maxPrice, pageable);

        return ResponseEntity.ok(Map.of(
                "products",    result.getContent(),
                "totalPages",  result.getTotalPages(),
                "totalItems",  result.getTotalElements(),
                "currentPage", result.getNumber(),
                "pageSize",    result.getSize()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/brand/{brand}")
    public ResponseEntity<List<Product>> getByBrand(@PathVariable String brand) {
        return ResponseEntity.ok(productService.getProductsByBrand(brand));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(productService.searchProductsByName(name));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Product>> filterByPrice(
            @RequestParam(defaultValue = "0") double minPrice,
            @RequestParam(defaultValue = "999999") double maxPrice) {
        return ResponseEntity.ok(productService.getProductsByPriceRange(minPrice, maxPrice));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<Product>> getRelatedProducts(@PathVariable String id) {
        return ResponseEntity.ok(productService.getRelatedProducts(id));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/bulk")
    public ResponseEntity<String> bulkDeleteProducts(@RequestBody java.util.List<String> ids) {
        productService.bulkDeleteProducts(ids);
        return ResponseEntity.ok("Deleted " + ids.size() + " products");
    }
}
