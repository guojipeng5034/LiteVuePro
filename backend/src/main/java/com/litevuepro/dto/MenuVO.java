package com.litevuepro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/** 与前端 MenuVO 一致 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MenuVO(
    Long id,
    String name,
    String permission,
    Integer type,
    Integer sort,
    Long parentId,
    String path,
    String icon,
    String component,
    String componentName,
    Integer status,
    Boolean visible,
    Boolean keepAlive,
    Boolean alwaysShow,
    List<MenuVO> children) {

  public static MenuVO from(Long id, String name, String permission, Integer type, Integer sort,
      Long parentId, String path, String icon, String component, String componentName,
      Integer status, Boolean visible, Boolean keepAlive, Boolean alwaysShow, List<MenuVO> children) {
    return new MenuVO(id, name, permission, type, sort, parentId, path, icon, component, componentName,
        status, visible, keepAlive, alwaysShow, children);
  }
}
