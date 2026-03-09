package com.litevuepro.controller;

import com.litevuepro.common.ApiResponse;
import com.litevuepro.dto.LoginRequest;
import com.litevuepro.dto.LoginResponse;
import com.litevuepro.dto.MenuVO;
import com.litevuepro.dto.RefreshTokenRequest;
import com.litevuepro.dto.UserInfoVO;
import com.litevuepro.security.JwtPrincipal;
import com.litevuepro.service.AuthService;
import com.litevuepro.service.MenuService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;
  private final MenuService menuService;

  public AuthController(AuthService authService, MenuService menuService) {
    this.authService = authService;
    this.menuService = menuService;
  }

  @PostMapping("/login")
  public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    LoginResponse resp = authService.login(request);
    return ApiResponse.success(resp);
  }

  @GetMapping("/user")
  public ApiResponse<UserInfoVO> getUserInfo() {
    JwtPrincipal principal = JwtPrincipal.current();
    if (principal == null) {
      return ApiResponse.error(401, "未登录");
    }
    UserInfoVO user = authService.getUserInfo(principal.userId());
    return ApiResponse.success(user);
  }

  @GetMapping("/menus")
  public ApiResponse<List<MenuVO>> getUserMenus() {
    JwtPrincipal principal = JwtPrincipal.current();
    if (principal == null) {
      return ApiResponse.error(401, "未登录");
    }
    return ApiResponse.success(menuService.getUserMenuTree(principal.userId()));
  }

  @PostMapping("/refresh")
  public ApiResponse<LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
    LoginResponse resp = authService.refreshToken(request.refreshToken());
    return ApiResponse.success(resp);
  }

  @PostMapping("/logout")
  public ApiResponse<Void> logout() {
    // 可选：将 token 加入 Redis 黑名单，当前仅前端清除
    return ApiResponse.success();
  }
}
