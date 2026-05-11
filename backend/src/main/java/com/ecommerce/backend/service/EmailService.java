package com.ecommerce.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:vishalir4321@gmail.com}")
    private String senderEmail;

    @Value("${brevo.sender.name:ShopHub}")
    private String senderName;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    public void sendOtpEmail(String to, String otp) {
        System.out.println("🔄 EmailService.sendOtpEmail called for: " + to);

        if (brevoApiKey == null || brevoApiKey.isEmpty()) {
            System.out.println("⚠️ Brevo API key not configured!");
            System.out.println("📧 OTP for " + to + ": " + otp);
            return;
        }

        try {
            String htmlBody = buildOtpEmailBody(otp);
            sendEmail(to, "Your OTP Verification Code - ShopHub", htmlBody);
            System.out.println("✅ OTP email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email to " + to + ": " + e.getMessage());
            System.out.println("📧 OTP for " + to + ": " + otp);
        }
    }

    public void sendOrderConfirmation(String to, String orderId) {
        if (brevoApiKey == null || brevoApiKey.isEmpty()) {
            System.out.println("Email not configured. Order confirmation for " + to + " - Order ID: " + orderId);
            return;
        }

        try {
            String body = "<h3>Thank you for your order!</h3>"
                    + "<p>Your order ID is <b>" + orderId + "</b>.</p>"
                    + "<p>We'll notify you when it's shipped.</p>";
            sendEmail(to, "🛒 Order Confirmation - ShopHub", body);
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation to " + to + ": " + e.getMessage());
        }
    }

    private void sendEmail(String to, String subject, String htmlContent) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        Map<String, Object> payload = Map.of(
            "sender",  Map.of("name", senderName, "email", senderEmail),
            "to",      List.of(Map.of("email", to)),
            "subject", subject,
            "htmlContent", htmlContent
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(BREVO_API_URL, request, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Brevo API error: " + response.getBody());
        }
    }

    private String buildOtpEmailBody(String otp) {
        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
               "<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>" +
               "<h1 style='color: white; margin: 0; font-size: 28px;'>🔐 OTP Verification</h1>" +
               "</div>" +
               "<div style='background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;'>" +
               "<h2 style='color: #333; text-align: center; margin-bottom: 20px;'>Your Verification Code</h2>" +
               "<div style='background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #667eea;'>" +
               "<span style='font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px;'>" + otp + "</span>" +
               "</div>" +
               "<p style='color: #666; text-align: center; margin: 20px 0;'>This code will expire in <strong>5 minutes</strong></p>" +
               "<p style='color: #666; text-align: center; font-size: 14px;'>If you didn't request this code, please ignore this email.</p>" +
               "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>" +
               "<p style='color: #999; text-align: center; font-size: 12px;'>This is an automated message from ShopHub</p>" +
               "</div>" +
               "</div>";
    }
}
