package com.litevuepro.controller;

import com.litevuepro.common.ApiResponse;
import com.litevuepro.dto.MenuVO;
import com.litevuepro.service.MenuService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system/menu")
public class MenuController {

  private final MenuService menuService;

  public MenuController(MenuService menuService) {
    this.menuService = menuService;
  }

  @GetMapping("/list")
  public ApiResponse<List<MenuVO>> list(
      @RequestParam(required = false) String name,
      @RequestParam(required = false) Integer status) {
    return ApiResponse.success(menuService.list(name, status));
  }

  @GetMapping("/get")
  public ApiResponse<MenuVO> get(@RequestParam Long id) {
    return ApiResponse.success(menuService.get(id));
  }

  @GetMapping("/simple-list")
  public ApiResponse<List<MenuVO>> simpleList() {
    return ApiResponse.success(menuService.simpleList());
  }

  @PostMapping("/create")
  public ApiResponse<Long> create(@RequestBody MenuVO vo) {
    return ApiResponse.success(menuService.create(vo));
  }

  @PutMapping("/update")
  public ApiResponse<Void> update(@RequestBody MenuVO vo) {
    menuService.update(vo);
    return ApiResponse.success();
  }

  @DeleteMapping("/delete")
  public ApiResponse<Void> delete(@RequestParam Long id) {
    menuService.delete(id);
    return ApiResponse.success();
  }
}
