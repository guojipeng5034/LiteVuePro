package com.litevuepro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record DictTypeVO(
    Long id,
    String name,
    String type,
    Integer status,
    String remark,
    String createTime) {

  public static DictTypeVO from(Long id, String name, String type, Integer status, String remark, String createTime) {
    return new DictTypeVO(id, name, type, status, remark, createTime);
  }
}
