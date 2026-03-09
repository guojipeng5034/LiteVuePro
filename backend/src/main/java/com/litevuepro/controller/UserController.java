package com.litevuepro.controller;

import com.litevuepro.common.ApiResponse;
import com.litevuepro.dto.PageResult;
import com.litevuepro.dto.UserSaveDTO;
import com.litevuepro.dto.UserVO;
import com.litevuepro.service.UserService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system/user")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/get")
  public ApiResponse<UserVO> get(@RequestParam Long id) {
    return ApiResponse.success(userService.get(id));
  }

  @PostMapping("/create")
  public ApiResponse<Long> create(@RequestBody UserSaveDTO dto) {
    return ApiResponse.success(userService.create(dto));
  }

  @PutMapping("/update")
  public ApiResponse<Void> update(@RequestBody UserSaveDTO dto) {
    userService.update(dto);
    return ApiResponse.success();
  }

  @GetMapping("/page")
  public ApiResponse<PageResult<UserVO>> page(
      @RequestParam(defaultValue = "1") int pageNo,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(required = false) String username,
      @RequestParam(required = false) String nickname,
      @RequestParam(required = false) Integer status) {
    return ApiResponse.success(userService.page(pageNo, pageSize, username, nickname, status));
  }

  @GetMapping("/simple-list")
  public ApiResponse<List<UserVO>> simpleList() {
    return ApiResponse.success(userService.simpleList());
  }

  @DeleteMapping("/delete")
  public ApiResponse<Void> delete(@RequestParam Long id) {
    userService.delete(id);
    return ApiResponse.success();
  }
}
