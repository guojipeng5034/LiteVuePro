package com.litevuepro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * 与前端 UserInfo 一致
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserInfoVO(
    Object id,           // Long -> 前端可能为 string|number
    String username,
    String nickname,
    String email,
    String avatar,
    List<String> roles,
    List<String> permissions) {

  public static UserInfoVO from(Long id, String username, String nickname, String email, String avatar,
                                List<String> roles, List<String> permissions) {
    return new UserInfoVO(
        id,
        username,
        nickname != null ? nickname : username,
        email,
        avatar != null ? avatar : "",
        roles != null ? roles : List.of(),
        permissions != null ? permissions : List.of());
  }
}
