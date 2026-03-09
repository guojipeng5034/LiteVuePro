package com.litevuepro.common;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 统一 API 响应格式，与前端约定：code 0/200 为成功，data 为业务数据
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(int code, T data, String message) {

  public static <T> ApiResponse<T> success(T data) {
    return new ApiResponse<>(0, data, null);
  }

  public static <T> ApiResponse<T> error(int code, String message) {
    return new ApiResponse<>(code, null, message);
  }

  public static ApiResponse<Void> success() {
    return success(null);
  }
}
