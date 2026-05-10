package com.ecommerce.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.backend.dto.OrderRequest;
import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<String> placeOrder(@RequestBody OrderRequest request, Authentication authentication) {
        request.setEmail(authentication.getName());
        orderService.placeOrder(request);
        return ResponseEntity.ok("Order placed successfully!");
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getUserOrders(authentication.getName()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/user/{email}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable String email) {
        return ResponseEntity.ok(orderService.getUserOrders(email));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> updateStatus(@PathVariable String id, @RequestParam String status) {
        orderService.updateStatus(id, status);
        return ResponseEntity.ok("Order status updated");
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<String> cancelOrder(@PathVariable String id, Authentication authentication) {
        orderService.cancelOrder(id, authentication.getName());
        return ResponseEntity.ok("Order cancelled successfully");
    }

    @PutMapping("/{id}/payment-status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> updatePaymentStatus(@PathVariable String id, @RequestParam String status) {
        orderService.updatePaymentStatus(id, status);
        return ResponseEntity.ok("Payment status updated to " + status);
    }

    @PutMapping("/{id}/refund-request")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<String> requestRefund(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> body,
            Authentication authentication) {
        orderService.requestRefund(id, authentication.getName(), body.get("reason"));
        return ResponseEntity.ok("Refund requested successfully");
    }

    @PutMapping("/{id}/refund-process")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> processRefund(
            @PathVariable String id,
            @RequestParam String action) { // APPROVED or REJECTED
        orderService.processRefund(id, action);
        return ResponseEntity.ok("Refund " + action.toLowerCase());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> deleteOrder(@PathVariable String id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok("Order deleted successfully");
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getAnalytics() {
        return ResponseEntity.ok(orderService.getAnalytics());
    }
}
