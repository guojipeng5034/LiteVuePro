package com.litevuepro.security;

import com.litevuepro.config.JwtProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private static final Logger log = LoggerFactory.getLogger(JwtService.class);
  private static final String SUBJECT_USER_ID = "userId";
  private static final String SUBJECT_USERNAME = "username";

  private final JwtProperties props;
  private SecretKey signingKey;

  public JwtService(JwtProperties props) {
    this.props = props;
  }

  @PostConstruct
  void init() {
    byte[] keyBytes = props.secret().getBytes(StandardCharsets.UTF_8);
    if (keyBytes.length < 32) {
      keyBytes = java.util.Arrays.copyOf(keyBytes, 32);
    }
    this.signingKey = Keys.hmacShaKeyFor(keyBytes);
  }

  public String generateToken(long userId, String username) {
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim(SUBJECT_USERNAME, username)
        .claim("type", "access")
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + props.expirationMs()))
        .signWith(signingKey)
        .compact();
  }

  public String generateRefreshToken(long userId, String username) {
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim(SUBJECT_USERNAME, username)
        .claim("type", "refresh")
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + props.refreshExpirationMs()))
        .signWith(signingKey)
        .compact();
  }

  public JwtClaims parseToken(String token) {
    return parseToken(token, null);
  }

  public JwtClaims parseToken(String token, String expectedType) {
    try {
      Claims claims = Jwts.parser()
          .verifyWith(signingKey)
          .build()
          .parseSignedClaims(token)
          .getPayload();
      if (expectedType != null) {
        String type = claims.get("type", String.class);
        if (!expectedType.equals(type)) return null;
      }
      long userId = Long.parseLong(claims.getSubject());
      String username = claims.get(SUBJECT_USERNAME, String.class);
      return new JwtClaims(userId, username);
    } catch (JwtException e) {
      log.debug("JWT parse failed: {}", e.getMessage());
      return null;
    }
  }

  public record JwtClaims(long userId, String username) {}
}
