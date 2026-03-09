package com.litevuepro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserVO(
    Long id,
    String nickname,
    String username,
    String deptName,
    Long deptId,
    String mobile,
    Integer status,
    String createTime,
    List<Long> roleIds) {

  public static UserVO from(Long id, String nickname, String username, String deptName, Long deptId,
      String mobile, Integer status, LocalDateTime createTime, List<Long> roleIds) {
    String ct = createTime != null ? createTime.toString().replace("T", " ").substring(0, 19) : null;
    return new UserVO(id, nickname, username, deptName, deptId, mobile, status, ct, roleIds);
  }
}
