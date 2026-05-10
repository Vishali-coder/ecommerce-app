package com.ecommerce.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.backend.model.Coupon;
import com.ecommerce.backend.repository.CouponRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public Coupon createCoupon(Coupon coupon) {
        coupon.setCode(coupon.getCode().toUpperCase());
        return couponRepository.save(coupon);
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public void deleteCoupon(String id) {
        couponRepository.deleteById(id);
    }

    /**
     * Validates coupon and returns discount amount.
     * Returns 0 if coupon is invalid or not applicable.
     */
    public double applyCoupon(String code, double orderTotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

        if (!coupon.isActive()) {
            throw new RuntimeException("Coupon is no longer active");
        }

        if (orderTotal < coupon.getMinOrderAmount()) {
            throw new RuntimeException(
                "Minimum order amount of $" + coupon.getMinOrderAmount() + " required for this coupon"
            );
        }

        if ("PERCENT".equalsIgnoreCase(coupon.getType())) {
            return Math.round((orderTotal * coupon.getValue() / 100) * 100.0) / 100.0;
        } else {
            return Math.min(coupon.getValue(), orderTotal);
        }
    }
}
