package com.ecommerce.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeAdmin();
        if (productRepository.count() == 0) {
            initializeProducts();
        }
    }

    private void initializeAdmin() {
        String adminEmail = "vishalir4321@gmail.com";
        User admin = userRepository.findByEmail(adminEmail).orElse(new User());
        admin.setName("admin");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole("ADMIN");
        userRepository.save(admin);
        System.out.println("✅ Admin account ready — email: vishalir4321@gmail.com, password: admin123");
    }

    private void initializeProducts() {
        java.util.List<Product> products = new java.util.ArrayList<>();

        // ── Smartphones ──────────────────────────────────────────────────────────
        products.add(buildProduct("iPhone 15 Pro", "Latest iPhone with advanced camera system and A17 Pro chip", 999.99, "Apple", "Smartphones", 50, "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500"));
        products.add(buildProduct("Samsung Galaxy S24 Ultra", "Flagship Android with built-in S Pen and 200MP camera", 1199.99, "Samsung", "Smartphones", 30, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500"));
        products.add(buildProduct("Google Pixel 8 Pro", "Pure Android experience with Google AI features", 899.99, "Google", "Smartphones", 25, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500"));
        products.add(buildProduct("OnePlus 12", "Flagship killer with Snapdragon 8 Gen 3 and 100W charging", 699.99, "OnePlus", "Smartphones", 40, "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500"));
        products.add(buildProduct("Xiaomi 14 Pro", "Leica-tuned cameras with HyperOS and 120W charging", 749.99, "Xiaomi", "Smartphones", 35, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"));

        // ── Laptops ───────────────────────────────────────────────────────────────
        products.add(buildProduct("MacBook Air M3", "Ultra-thin laptop with M3 chip and all-day battery life", 1299.99, "Apple", "Laptops", 25, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500"));
        products.add(buildProduct("MacBook Pro 16 M3", "Professional laptop with M3 Pro chip and Liquid Retina XDR", 2499.99, "Apple", "Laptops", 15, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"));
        products.add(buildProduct("Dell XPS 13", "Premium ultrabook with InfinityEdge display", 1099.99, "Dell", "Laptops", 20, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"));
        products.add(buildProduct("HP Spectre x360", "Convertible laptop with OLED display and Intel Core Ultra", 1399.99, "HP", "Laptops", 18, "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500"));
        products.add(buildProduct("Lenovo ThinkPad X1 Carbon", "Business ultrabook with military-grade durability", 1599.99, "Lenovo", "Laptops", 12, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"));
        products.add(buildProduct("ASUS ROG Zephyrus G14", "Gaming laptop with AMD Ryzen 9 and RTX 4060", 1499.99, "ASUS", "Laptops", 10, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"));

        // ── Tablets ───────────────────────────────────────────────────────────────
        products.add(buildProduct("iPad Pro 12.9\"", "Most advanced iPad with M2 chip and Liquid Retina XDR display", 1099.99, "Apple", "Tablets", 35, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500"));
        products.add(buildProduct("iPad Air M1", "Powerful and versatile iPad with M1 chip", 749.99, "Apple", "Tablets", 40, "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500"));
        products.add(buildProduct("Samsung Galaxy Tab S9 Ultra", "Large AMOLED tablet with S Pen included", 1099.99, "Samsung", "Tablets", 20, "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=500"));
        products.add(buildProduct("Microsoft Surface Pro 9", "2-in-1 tablet with Intel Core i7 and detachable keyboard", 1299.99, "Microsoft", "Tablets", 15, "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500"));

        // ── Audio ─────────────────────────────────────────────────────────────────
        products.add(buildProduct("Sony WH-1000XM5", "Industry-leading noise canceling wireless headphones", 399.99, "Sony", "Audio", 40, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"));
        products.add(buildProduct("AirPods Pro 2nd Gen", "Wireless earbuds with active noise cancellation", 249.99, "Apple", "Audio", 80, "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500"));
        products.add(buildProduct("Bose QuietComfort 45", "Premium noise cancelling headphones with 24hr battery", 329.99, "Bose", "Audio", 35, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500"));
        products.add(buildProduct("Samsung Galaxy Buds2 Pro", "Hi-Fi sound with intelligent ANC earbuds", 199.99, "Samsung", "Audio", 55, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500"));
        products.add(buildProduct("JBL Charge 5", "Portable waterproof Bluetooth speaker with power bank", 179.99, "JBL", "Audio", 60, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"));
        products.add(buildProduct("Sony WF-1000XM5", "Premium true wireless earbuds with best-in-class ANC", 299.99, "Sony", "Audio", 45, "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500"));

        // ── Gaming ────────────────────────────────────────────────────────────────
        products.add(buildProduct("Nintendo Switch OLED", "Gaming console with vibrant OLED screen", 349.99, "Nintendo", "Gaming", 60, "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500"));
        products.add(buildProduct("PlayStation 5", "Next-gen gaming console with ultra-high speed SSD", 499.99, "Sony", "Gaming", 20, "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500"));
        products.add(buildProduct("Xbox Series X", "Most powerful Xbox ever with 4K gaming", 499.99, "Microsoft", "Gaming", 18, "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500"));
        products.add(buildProduct("Razer DeathAdder V3", "Ergonomic gaming mouse with 30K DPI optical sensor", 99.99, "Razer", "Gaming", 75, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"));
        products.add(buildProduct("Logitech G Pro X Keyboard", "Tenkeyless mechanical gaming keyboard with GX switches", 149.99, "Logitech", "Gaming", 50, "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500"));

        // ── Cameras ───────────────────────────────────────────────────────────────
        products.add(buildProduct("Sony Alpha A7 IV", "Full-frame mirrorless camera with 33MP sensor", 2499.99, "Sony", "Cameras", 10, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500"));
        products.add(buildProduct("Canon EOS R6 Mark II", "Full-frame mirrorless with 40fps burst shooting", 2499.99, "Canon", "Cameras", 8, "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500"));
        products.add(buildProduct("GoPro Hero 12 Black", "Action camera with HyperSmooth 6.0 stabilization", 399.99, "GoPro", "Cameras", 45, "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500"));
        products.add(buildProduct("DJI Mini 4 Pro", "Lightweight drone with 4K/60fps and obstacle sensing", 759.99, "DJI", "Cameras", 15, "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500"));

        // ── Wearables ─────────────────────────────────────────────────────────────
        products.add(buildProduct("Apple Watch Series 9", "Advanced health features with Double Tap gesture", 399.99, "Apple", "Wearables", 55, "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500"));
        products.add(buildProduct("Samsung Galaxy Watch 6", "Health-focused smartwatch with BioActive sensor", 299.99, "Samsung", "Wearables", 45, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"));
        products.add(buildProduct("Fitbit Charge 6", "Advanced fitness tracker with Google apps built-in", 159.99, "Fitbit", "Wearables", 70, "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500"));
        products.add(buildProduct("Garmin Fenix 7", "Premium multisport GPS smartwatch for athletes", 699.99, "Garmin", "Wearables", 20, "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500"));

        // ── Smart Home ────────────────────────────────────────────────────────────
        products.add(buildProduct("Amazon Echo Dot 5th Gen", "Smart speaker with Alexa and improved sound", 49.99, "Amazon", "Smart Home", 100, "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500"));
        products.add(buildProduct("Google Nest Hub 2nd Gen", "Smart display with Sleep Sensing and Google Assistant", 99.99, "Google", "Smart Home", 60, "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"));
        products.add(buildProduct("Philips Hue Starter Kit", "Smart LED bulbs with color control and app support", 199.99, "Philips", "Smart Home", 80, "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500"));
        products.add(buildProduct("Ring Video Doorbell 4", "Smart doorbell with color pre-roll video and two-way talk", 219.99, "Ring", "Smart Home", 50, "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"));

        // ── Accessories ───────────────────────────────────────────────────────────
        products.add(buildProduct("Anker 65W GaN Charger", "Compact 3-port fast charger for all devices", 45.99, "Anker", "Accessories", 150, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"));
        products.add(buildProduct("Samsung 1TB SSD T7", "Portable SSD with USB 3.2 and 1050MB/s speed", 109.99, "Samsung", "Accessories", 90, "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500"));
        products.add(buildProduct("Logitech MX Master 3S", "Advanced wireless mouse with 8K DPI and quiet clicks", 99.99, "Logitech", "Accessories", 65, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"));
        products.add(buildProduct("Apple MagSafe Charger", "15W wireless charger for iPhone 12 and later", 39.99, "Apple", "Accessories", 120, "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500"));

        // ── More Smartphones ──────────────────────────────────────────────────────
        products.add(buildProduct("iPhone 14", "A15 Bionic chip with improved battery life and cameras", 799.99, "Apple", "Smartphones", 45, "https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=500"));
        products.add(buildProduct("Samsung Galaxy A54", "Mid-range phone with 50MP camera and 5000mAh battery", 449.99, "Samsung", "Smartphones", 60, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500"));
        products.add(buildProduct("Motorola Edge 40 Pro", "Curved OLED display with 125W TurboPower charging", 599.99, "Motorola", "Smartphones", 30, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"));
        products.add(buildProduct("Nokia G60 5G", "Durable 5G phone with 3-year OS guarantee", 299.99, "Nokia", "Smartphones", 40, "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500"));
        products.add(buildProduct("Realme GT 5 Pro", "Snapdragon 8 Gen 3 with 240W ultra-fast charging", 649.99, "Realme", "Smartphones", 25, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500"));

        // ── More Laptops ──────────────────────────────────────────────────────────
        products.add(buildProduct("Acer Swift 5", "Ultra-light laptop under 1kg with Intel Core i7", 999.99, "Acer", "Laptops", 15, "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500"));
        products.add(buildProduct("MSI Raider GE78 HX", "High-performance gaming laptop with RTX 4090", 3499.99, "MSI", "Laptops", 8, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"));
        products.add(buildProduct("Razer Blade 15", "Premium gaming laptop with 240Hz QHD display", 2499.99, "Razer", "Laptops", 10, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500"));
        products.add(buildProduct("Dell Inspiron 15", "Everyday laptop with Intel Core i5 and 512GB SSD", 649.99, "Dell", "Laptops", 30, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"));
        products.add(buildProduct("HP Pavilion 15", "Versatile laptop with AMD Ryzen 7 and FHD display", 699.99, "HP", "Laptops", 25, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500"));

        // ── More Audio ────────────────────────────────────────────────────────────
        products.add(buildProduct("Sennheiser Momentum 4", "Wireless headphones with 60hr battery and ANC", 349.99, "Sennheiser", "Audio", 30, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"));
        products.add(buildProduct("Marshall Emberton II", "Compact portable speaker with 30hr playtime", 149.99, "Marshall", "Audio", 55, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"));
        products.add(buildProduct("Jabra Evolve2 85", "Professional wireless headset with ANC for calls", 449.99, "Jabra", "Audio", 20, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500"));
        products.add(buildProduct("Beats Studio Pro", "Premium wireless headphones with personalized spatial audio", 349.99, "Beats", "Audio", 35, "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500"));
        products.add(buildProduct("Anker Soundcore Liberty 4", "True wireless earbuds with LDAC and heart rate monitor", 99.99, "Anker", "Audio", 70, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500"));

        // ── More Gaming ───────────────────────────────────────────────────────────
        products.add(buildProduct("SteelSeries Arctis Nova Pro", "Premium gaming headset with active noise cancellation", 249.99, "SteelSeries", "Gaming", 30, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"));
        products.add(buildProduct("ASUS ROG Swift 27\" Monitor", "27-inch 4K gaming monitor with 144Hz and G-Sync", 799.99, "ASUS", "Gaming", 15, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"));
        products.add(buildProduct("Corsair K100 RGB Keyboard", "Optical-mechanical gaming keyboard with per-key RGB", 229.99, "Corsair", "Gaming", 25, "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500"));
        products.add(buildProduct("Xbox Wireless Controller", "Official Xbox controller with textured grip and USB-C", 59.99, "Microsoft", "Gaming", 100, "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500"));
        products.add(buildProduct("PlayStation DualSense", "PS5 wireless controller with haptic feedback and adaptive triggers", 69.99, "Sony", "Gaming", 90, "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500"));

        // ── More Cameras ──────────────────────────────────────────────────────────
        products.add(buildProduct("Nikon Z6 III", "Full-frame mirrorless with 8K video and IBIS", 1999.99, "Nikon", "Cameras", 10, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500"));
        products.add(buildProduct("Fujifilm X-T5", "40MP APS-C mirrorless with film simulation modes", 1699.99, "Fujifilm", "Cameras", 12, "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500"));
        products.add(buildProduct("DJI Osmo Pocket 3", "Compact 3-axis gimbal camera with 4K/120fps", 519.99, "DJI", "Cameras", 20, "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500"));
        products.add(buildProduct("Insta360 X4", "360-degree action camera with 8K video recording", 499.99, "Insta360", "Cameras", 18, "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500"));

        // ── More Wearables ────────────────────────────────────────────────────────
        products.add(buildProduct("Apple Watch Ultra 2", "Rugged smartwatch for extreme sports with 60hr battery", 799.99, "Apple", "Wearables", 20, "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500"));
        products.add(buildProduct("Garmin Venu 3", "Health and fitness smartwatch with sleep coaching", 449.99, "Garmin", "Wearables", 30, "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500"));
        products.add(buildProduct("Xiaomi Smart Band 8", "Affordable fitness band with 16-day battery life", 49.99, "Xiaomi", "Wearables", 120, "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500"));
        products.add(buildProduct("Polar Vantage V3", "Elite multisport watch with ECG and optical HR", 599.99, "Polar", "Wearables", 15, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"));

        // ── More Smart Home ───────────────────────────────────────────────────────
        products.add(buildProduct("Amazon Echo Show 10", "Smart display with motion tracking and 13MP camera", 249.99, "Amazon", "Smart Home", 40, "https://images.unsplash.com/photo-1543512214-318c7553f230?w=500"));
        products.add(buildProduct("Google Nest Thermostat", "Smart thermostat with energy-saving schedule learning", 129.99, "Google", "Smart Home", 55, "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"));
        products.add(buildProduct("TP-Link Tapo C200", "Pan/tilt home security camera with night vision", 39.99, "TP-Link", "Smart Home", 90, "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500"));
        products.add(buildProduct("Arlo Pro 4", "Wireless outdoor security camera with 2K HDR video", 199.99, "Arlo", "Smart Home", 35, "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"));

        // ── More Accessories ──────────────────────────────────────────────────────
        products.add(buildProduct("Belkin 3-in-1 MagSafe Charger", "Charge iPhone, Apple Watch and AirPods simultaneously", 149.99, "Belkin", "Accessories", 60, "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500"));
        products.add(buildProduct("WD 2TB My Passport", "Portable hard drive with password protection", 79.99, "WD", "Accessories", 80, "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500"));
        products.add(buildProduct("Keychron K2 Keyboard", "Compact wireless mechanical keyboard for Mac and Windows", 89.99, "Keychron", "Accessories", 50, "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500"));
        products.add(buildProduct("Anker USB-C Hub 7-in-1", "Multiport hub with 4K HDMI, USB 3.0 and SD card reader", 35.99, "Anker", "Accessories", 110, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500"));
        products.add(buildProduct("Spigen Tough Armor Case", "Military-grade protection case for iPhone 15 Pro", 19.99, "Spigen", "Accessories", 200, "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500"));
        products.add(buildProduct("Razer Kraken V3 HyperSense", "USB gaming headset with haptic feedback technology", 129.99, "Razer", "Accessories", 40, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500"));

        // ── Monitors ──────────────────────────────────────────────────────────────
        products.add(buildProduct("LG UltraWide 34\" Monitor", "34-inch curved ultrawide monitor with IPS panel", 699.99, "LG", "Monitors", 20, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"));
        products.add(buildProduct("Samsung Odyssey G7 32\"", "32-inch curved gaming monitor with 240Hz and 1ms", 599.99, "Samsung", "Monitors", 15, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"));
        products.add(buildProduct("Dell UltraSharp 27\" 4K", "Professional 4K monitor with factory-calibrated colors", 649.99, "Dell", "Monitors", 18, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"));
        products.add(buildProduct("BenQ PD3220U", "32-inch 4K Thunderbolt 3 monitor for designers", 999.99, "BenQ", "Monitors", 10, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"));

        productRepository.saveAll(products);
        System.out.println("✅ " + products.size() + " products initialized successfully!");
    }

    private Product buildProduct(String name, String description, double price,
                                  String brand, String category, int quantity, String imageUrl) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(price);
        p.setBrand(brand);
        p.setCategory(category);
        p.setQuantity(quantity);
        p.setImageUrl(imageUrl);
        return p;
    }
}