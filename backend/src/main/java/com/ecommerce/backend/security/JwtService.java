package com.ecommerce.backend.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collections;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import com.ecommerce.backend.config.JwtProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class JwtService {

    @Autowired
    private JwtProperties jwtProperties;

    private Key getSigningKey() {
          return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getExpiration()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Extract username (email)
    public String extractUsername(String token) {
        return parseToken(token).getSubject();
    }

    // ✅ Extract role
    public String extractRole(String token) {
        return parseToken(token).get("role", String.class);
    }

     private Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ VERY IMPORTANT: Create Authentication with role (used in JwtFilter)
    public Authentication getAuthentication(String token) {
        Claims claims = parseToken(token);
        String email = claims.getSubject();
        String role = claims.get("role", String.class);

        // 🔐 Inject role into authorities
        return new UsernamePasswordAuthenticationToken(
                email,
                null,
                Collections.singletonList(new SimpleGrantedAuthority(role))
        );
    }

    public String extractUserIdFromRequest(HttpServletRequest request) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
