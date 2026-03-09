package com.litevuepro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record DeptVO(
    Long id,
    Long parentId,
    String name,
    Integer sort,
    Long leaderUserId,
    String phone,
    String email,
    Integer status,
    String createTime,
    List<DeptVO> children) {

  public static DeptVO from(Long id, Long parentId, String name, Integer sort, Long leaderUserId,
      String phone, String email, Integer status, LocalDateTime createTime, List<DeptVO> children) {
    String ct = createTime != null ? createTime.toString().replace("T", " ").substring(0, 19) : null;
    return new DeptVO(id, parentId, name, sort, leaderUserId, phone, email, status, ct, children);
  }
}
