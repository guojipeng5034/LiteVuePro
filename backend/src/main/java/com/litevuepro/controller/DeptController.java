package com.litevuepro.controller;

import com.litevuepro.common.ApiResponse;
import com.litevuepro.dto.DeptVO;
import com.litevuepro.service.DeptService;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system/dept")
public class DeptController {

  private final DeptService deptService;

  public DeptController(DeptService deptService) {
    this.deptService = deptService;
  }

  @GetMapping("/list")
  public ApiResponse<List<DeptVO>> list(
      @RequestParam(required = false) String name,
      @RequestParam(required = false) Integer status) {
    return ApiResponse.success(deptService.list(name, status));
  }

  @GetMapping("/get")
  public ApiResponse<DeptVO> get(@RequestParam Long id) {
    return ApiResponse.success(deptService.get(id));
  }

  @GetMapping("/simple-list")
  public ApiResponse<List<DeptVO>> simpleList() {
    return ApiResponse.success(deptService.simpleList());
  }

  @PostMapping("/create")
  public ApiResponse<Long> create(@RequestBody DeptVO vo) {
    return ApiResponse.success(deptService.create(vo));
  }

  @PutMapping("/update")
  public ApiResponse<Void> update(@RequestBody DeptVO vo) {
    deptService.update(vo);
    return ApiResponse.success();
  }

  @DeleteMapping("/delete")
  public ApiResponse<Void> delete(@RequestParam Long id) {
    deptService.delete(id);
    return ApiResponse.success();
  }

  @DeleteMapping("/delete-list")
  public ApiResponse<Void> deleteList(@RequestParam String ids) {
    List<Long> idList = Arrays.stream(ids.split(","))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .map(Long::parseLong)
        .toList();
    deptService.deleteList(idList);
    return ApiResponse.success();
  }
}
