package com.litevuepro.controller;

import com.litevuepro.common.ApiResponse;
import com.litevuepro.dto.PageResult;
import com.litevuepro.dto.RoleVO;
import com.litevuepro.service.RoleService;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system/role")
public class RoleController {

  private final RoleService roleService;

  public RoleController(RoleService roleService) {
    this.roleService = roleService;
  }

  @GetMapping("/page")
  public ApiResponse<PageResult<RoleVO>> page(
      @RequestParam(defaultValue = "1") int pageNo,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(required = false) String name,
      @RequestParam(required = false) String code,
      @RequestParam(required = false) Integer status) {
    return ApiResponse.success(roleService.page(pageNo, pageSize, name, code, status));
  }

  @GetMapping("/get")
  public ApiResponse<RoleVO> get(@RequestParam Long id) {
    return ApiResponse.success(roleService.get(id));
  }

  @PostMapping("/create")
  public ApiResponse<Long> create(@RequestBody RoleVO vo) {
    return ApiResponse.success(roleService.create(vo));
  }

  @PutMapping("/update")
  public ApiResponse<Void> update(@RequestBody RoleVO vo) {
    roleService.update(vo);
    return ApiResponse.success();
  }

  @DeleteMapping("/delete")
  public ApiResponse<Void> delete(@RequestParam Long id) {
    roleService.delete(id);
    return ApiResponse.success();
  }

  @DeleteMapping("/delete-list")
  public ApiResponse<Void> deleteList(@RequestParam String ids) {
    List<Long> idList = java.util.Arrays.stream(ids.split(","))
        .map(String::trim).filter(s -> !s.isEmpty()).map(Long::parseLong).toList();
    roleService.deleteList(idList);
    return ApiResponse.success();
  }

  @GetMapping(value = "/export", produces = "text/csv")
  public void export(
      @RequestParam(defaultValue = "1") int pageNo,
      @RequestParam(defaultValue = "10000") int pageSize,
      @RequestParam(required = false) String name,
      @RequestParam(required = false) String code,
      @RequestParam(required = false) Integer status,
      HttpServletResponse response) throws Exception {
    byte[] data = roleService.exportCsv(pageNo, pageSize, name, code, status);
    response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
    response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=roles.csv");
    response.setContentLength(data.length);
    response.getOutputStream().write(data);
    response.getOutputStream().flush();
  }
}
