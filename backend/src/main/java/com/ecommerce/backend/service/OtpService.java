package com.ecommerce.backend.service;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final EmailService emailService;
    
    // In-memory storage for OTP entries
    private final ConcurrentHashMap<String, InMemoryOtpEntry> otpCache = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    private static final SecureRandom random = new SecureRandom();
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_OTP_ATTEMPTS = 3;
    
    // Track failed attempts per email
    private final ConcurrentHashMap<String, Integer> failedAttempts = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        // Schedule cleanup task to run every minute
        scheduler.scheduleAtFixedRate(this::cleanupExpiredOtps, 1, 1, TimeUnit.MINUTES);
        log.info("OTP Service initialized with in-memory storage and cleanup scheduler");
    }

    @PreDestroy
    public void destroy() {
        scheduler.shutdown();
        log.info("OTP Service cleanup scheduler stopped");
    }

    public void generateOtp(String email) {
        System.out.println("🔄 OtpService.generateOtp called for email: " + email);
        try {
            if (email == null || email.trim().isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty");
            }
            
            // Clear any previous failed attempts when generating new OTP
            failedAttempts.remove(email);
            
            // Generate 6-digit OTP
            String otp = String.format("%06d", random.nextInt(1000000));
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

            // Store in memory (not in database)
            InMemoryOtpEntry entry = new InMemoryOtpEntry(otp, expiry);
            otpCache.put(email, entry);
            
            log.info("Generated OTP for email: {} (expires at: {})", email, expiry);
            
            // Send OTP directly to email (EmailService handles its own exceptions)
            emailService.sendOtpEmail(email, otp);
            
            log.info("OTP generation process completed for email: {}", email);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid email provided for OTP generation: {}", email, e);
            // No need to remove from cache as it wasn't added yet
            throw new IllegalArgumentException("Invalid email format: " + e.getMessage());
        } catch (SecurityException e) {
            log.error("Security error during OTP generation for email: {}", email, e);
            // Remove the OTP entry if it was created but generation failed
            otpCache.remove(email);
            throw new RuntimeException("Security error during OTP generation: " + e.getMessage());
        } catch (RuntimeException e) {
            log.error("Runtime error generating OTP for email: {}", email, e);
            // Remove the OTP entry if it was created but email failed
            otpCache.remove(email);
            throw new RuntimeException("Failed to generate OTP: " + e.getMessage());
        }
    }

    public boolean verifyOtp(String email, String otp) {
        // Check if user has exceeded maximum attempts
        int attempts = failedAttempts.getOrDefault(email, 0);
        if (attempts >= MAX_OTP_ATTEMPTS) {
            log.warn("Maximum OTP attempts exceeded for email: {}", email);
            otpCache.remove(email); // Remove OTP after max attempts
            failedAttempts.remove(email);
            return false;
        }
        
        InMemoryOtpEntry entry = otpCache.get(email);
        
        if (entry == null) {
            log.warn("No OTP found for email: {}", email);
            return false;
        }

        // Check if OTP is expired
        if (entry.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Expired OTP verification attempt for email: {}", email);
            otpCache.remove(email); // Remove expired OTP
            failedAttempts.remove(email);
            return false;
        }

        // Verify OTP
        boolean isValid = entry.getOtp().equals(otp);
        
        if (isValid) {
            log.info("OTP verified successfully for email: {}", email);
            // Remove OTP after successful verification (one-time use)
            otpCache.remove(email);
            failedAttempts.remove(email);
        } else {
            log.warn("Invalid OTP verification attempt for email: {} (attempt {}/{})", email, attempts + 1, MAX_OTP_ATTEMPTS);
            failedAttempts.put(email, attempts + 1);
        }
        
        return isValid;
    }

    public void clearOtp(String email) {
        InMemoryOtpEntry removed = otpCache.remove(email);
        failedAttempts.remove(email);
        if (removed != null) {
            log.info("OTP cleared for email: {}", email);
        }
    }

    /**
     * Cleanup expired OTPs from memory
     */
    private void cleanupExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        
        // Collect expired entries first
        java.util.List<String> expiredEmails = new java.util.ArrayList<>();
        
        otpCache.entrySet().removeIf(entry -> {
            if (entry.getValue().getExpiresAt().isBefore(now)) {
                String email = entry.getKey();
                expiredEmails.add(email);
                return true;
            }
            return false;
        });
        
        // Remove failed attempts for expired emails
        for (String email : expiredEmails) {
            failedAttempts.remove(email);
        }
        
        if (!expiredEmails.isEmpty()) {
            log.info("Cleaned up {} expired OTP entries and their failed attempts", expiredEmails.size());
        }
    }

    /**
     * Get current cache size (for monitoring purposes)
     */
    public int getCacheSize() {
        return otpCache.size();
    }

    /**
     * Inner class for OTP entry (no longer using MongoDB model)
     */
    private static class InMemoryOtpEntry {
        private final String otp;
        private final LocalDateTime expiresAt;

        public InMemoryOtpEntry(String otp, LocalDateTime expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        public String getOtp() { return otp; }
        public LocalDateTime getExpiresAt() { return expiresAt; }
    }
}


