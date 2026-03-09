package com.litevuepro.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import com.litevuepro.dto.LoginRequest;
import com.litevuepro.dto.LoginResponse;
import com.litevuepro.dto.UserInfoVO;
import com.litevuepro.security.JwtService;
import com.litevuepro.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = AuthController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@ActiveProfiles("test")
class AuthControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @MockBean
  AuthService authService;

  @MockBean
  JwtService jwtService;

  @Test
  void login_success_returnsToken() throws Exception {
    UserInfoVO user = UserInfoVO.from(1L, "admin", "管理员", null, null, List.of("admin"), List.of("read"));
    LoginResponse resp = new LoginResponse("jwt-token", null, user);
    when(authService.login(any(LoginRequest.class))).thenReturn(resp);

    mockMvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"username\":\"admin\",\"password\":\"123456\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(0))
        .andExpect(jsonPath("$.data.token").value("jwt-token"))
        .andExpect(jsonPath("$.data.user.username").value("admin"));
  }

  @Test
  void login_blankUsername_returns400() throws Exception {
    mockMvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"username\":\"\",\"password\":\"123456\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value(400));
  }
}
