package com.litevuepro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AreaVO(
    Long id,
    String name,
    List<AreaVO> children) {

  public static AreaVO from(Long id, String name, List<AreaVO> children) {
    return new AreaVO(id, name, children);
  }
}
