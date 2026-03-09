package com.litevuepro.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.litevuepro.common.ApiResponse;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * API 限流：对 /api/** 请求应用 Resilience4j RateLimiter，
 * 超限返回 429。
 */
@Component
@Order(-100)
@ConditionalOnBean(io.github.resilience4j.ratelimiter.RateLimiterRegistry.class)
public class RateLimitFilter extends OncePerRequestFilter {

  private final RateLimiterRegistry registry;
  private final ObjectMapper objectMapper;

  public RateLimitFilter(RateLimiterRegistry registry, ObjectMapper objectMapper) {
    this.registry = registry;
    this.objectMapper = objectMapper;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    String path = request.getRequestURI();
    if (!path.startsWith("/api/")) {
      chain.doFilter(request, response);
      return;
    }
    RateLimiter limiter = registry.rateLimiter("api");
    try {
      limiter.acquirePermission();
      chain.doFilter(request, response);
    } catch (RequestNotPermitted e) {
      response.setStatus(429);
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.setCharacterEncoding("UTF-8");
      objectMapper.writeValue(response.getWriter(), ApiResponse.error(429, "请求过于频繁，请稍后再试"));
    }
  }
}
