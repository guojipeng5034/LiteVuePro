package com.litevuepro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record RoleVO(
    Long id,
    String name,
    String code,
    Integer type,
    Integer sort,
    Integer status,
    String remark,
    String createTime,
    Integer dataScope,
    List<Long> dataScopeDeptIds) {

  public static RoleVO from(Long id, String name, String code, Integer type, Integer sort,
      Integer status, String remark, String createTime, Integer dataScope, List<Long> dataScopeDeptIds) {
    return new RoleVO(id, name, code, type, sort, status, remark, createTime, dataScope, dataScopeDeptIds);
  }
}
