package com.ecommerce.backend.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public void sendOtpEmail(String to, String otp) {
        System.out.println("🔄 EmailService.sendOtpEmail called for: " + to);
        System.out.println("📧 From email configured as: " + (from != null && !from.isEmpty() ? from : "NOT SET"));

        if (from == null || from.isEmpty()) {
            System.out.println("⚠️  spring.mail.username is not configured!");
            System.out.println("📧 OTP for " + to + ": " + otp);
            return;
        }

        if (mailPassword == null || mailPassword.isEmpty()) {
            System.out.println("⚠️  spring.mail.password is not configured!");
            System.out.println("📧 OTP for " + to + ": " + otp);
            return;
        }
        
        try {
            // Create HTML email for better presentation
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(from, "ShopHub Security");
            helper.setTo(to);
            helper.setSubject("Your OTP Verification Code - ShopHub");
            
            String htmlBody = buildOtpEmailBody(otp);
            helper.setText(htmlBody, true); // Enable HTML
            
            mailSender.send(message);
            System.out.println("✅ OTP email sent successfully to: " + to);
            
        } catch (jakarta.mail.MessagingException e) {
            System.err.println("❌ Failed to send OTP email to " + to + " (Messaging error): " + e.getMessage());
            System.out.println("📧 OTP for " + to + ": " + otp);
        } catch (org.springframework.mail.MailException e) {
            System.err.println("❌ Failed to send OTP email to " + to + " (Mail service error): " + e.getMessage());
            System.out.println("📧 OTP for " + to + ": " + otp);
            // Don't throw exception - allow the process to continue
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email to " + to + " (Unexpected error): " + e.getMessage());
            System.out.println("📧 OTP for " + to + ": " + otp);
            // Don't throw exception - allow the process to continue
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
    public void sendOrderConfirmation(String to, String orderId) {
        if (from == null || from.isEmpty()) {
            System.out.println("Email not configured. Order confirmation for " + to + " - Order ID: " + orderId);
            return;
        }
        
        String subject = "🛒 Order Confirmation - Your order is placed!";
        String body = "<h3>Thank you for your order!</h3>"
                    + "<p>Your order ID is <b>" + orderId + "</b>.</p>"
                    + "<p>We'll notify you when it's shipped.</p>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // enable HTML
            mailSender.send(message);
        } catch (jakarta.mail.MessagingException e) {
            System.err.println("Failed to send order confirmation email to " + to + " (Messaging error): " + e.getMessage());
            System.out.println("Order confirmation for " + to + " - Order ID: " + orderId);
            // Don't throw exception - allow the order to be placed successfully even if email fails
        } catch (org.springframework.mail.MailException e) {
            System.err.println("Failed to send order confirmation email to " + to + " (Mail service error): " + e.getMessage());
            System.out.println("Order confirmation for " + to + " - Order ID: " + orderId);
            // Don't throw exception - allow the order to be placed successfully even if email fails
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation email to " + to + " (Unexpected error): " + e.getMessage());
            System.out.println("Order confirmation for " + to + " - Order ID: " + orderId);
            // Don't throw exception - allow the order to be placed successfully even if email fails
        }
    }
}


