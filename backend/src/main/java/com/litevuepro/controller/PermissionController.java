package com.litevuepro.controller;

import com.litevuepro.common.ApiResponse;
import com.litevuepro.service.PermissionService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system/permission")
public class PermissionController {

  private final PermissionService permissionService;

  public PermissionController(PermissionService permissionService) {
    this.permissionService = permissionService;
  }

  @GetMapping("/role-menu-ids")
  public ApiResponse<List<Long>> getRoleMenuIds(@RequestParam Long roleId) {
    return ApiResponse.success(permissionService.getRoleMenuIds(roleId));
  }

  @PutMapping("/assign-role-menu")
  public ApiResponse<Void> assignRoleMenu(@RequestBody AssignRoleMenuRequest req) {
    permissionService.assignRoleMenu(req.roleId(), req.menuIds());
    return ApiResponse.success();
  }

  @PutMapping("/assign-role-data-scope")
  public ApiResponse<Void> assignRoleDataScope(@RequestBody AssignRoleDataScopeRequest req) {
    permissionService.assignRoleDataScope(req.roleId(), req.dataScope(), req.dataScopeDeptIds());
    return ApiResponse.success();
  }

  public record AssignRoleMenuRequest(Long roleId, List<Long> menuIds) {}
  public record AssignRoleDataScopeRequest(Long roleId, Integer dataScope, List<Long> dataScopeDeptIds) {}
}
