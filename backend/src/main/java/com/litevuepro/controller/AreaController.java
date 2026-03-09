package com.litevuepro.controller;

import com.litevuepro.common.ApiResponse;
import com.litevuepro.dto.AreaVO;
import com.litevuepro.service.AreaService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system/area")
public class AreaController {

  private final AreaService areaService;

  public AreaController(AreaService areaService) {
    this.areaService = areaService;
  }

  @GetMapping("/tree")
  public ApiResponse<List<AreaVO>> tree() {
    return ApiResponse.success(areaService.tree());
  }

  @GetMapping("/get-by-ip")
  public ApiResponse<String> getByIp(@RequestParam(required = false) String ip) {
    return ApiResponse.success(areaService.getByIp(ip));
  }
}
