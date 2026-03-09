package com.litevuepro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record LoginResponse(
    String token,
    String refreshToken,
    UserInfoVO user) {}
