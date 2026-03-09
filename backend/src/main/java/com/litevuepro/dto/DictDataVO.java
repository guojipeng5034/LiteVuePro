package com.litevuepro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record DictDataVO(
    Long id,
    String dictType,
    String label,
    String value,
    Integer sort,
    Integer status,
    String colorType,
    String cssClass,
    String remark,
    String createTime) {

  public static DictDataVO from(Long id, String dictType, String label, String value, Integer sort, Integer status,
      String colorType, String cssClass, String remark, String createTime) {
    return new DictDataVO(id, dictType, label, value, sort, status, colorType, cssClass, remark, createTime);
  }
}
