package com.litevuepro.controller;

import com.litevuepro.common.ApiResponse;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

  @GetMapping("/health")
  public ApiResponse<Map<String, Object>> health() {
    return ApiResponse.success(Map.of(
        "ok", true,
        "timestamp", System.currentTimeMillis()));
  }
}
