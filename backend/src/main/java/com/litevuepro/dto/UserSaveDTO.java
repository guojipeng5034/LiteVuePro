package com.litevuepro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/** 用户新增/修改请求体 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserSaveDTO(
    Long id,
    String username,
    String password,
    String nickname,
    Long deptId,
    String mobile,
    Integer status,
    List<Long> roleIds) {}
