package com.litevuepro.controller;

import com.litevuepro.common.ApiResponse;
import com.litevuepro.dto.DictTypeVO;
import com.litevuepro.dto.PageResult;
import com.litevuepro.service.DictTypeService;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system/dict-type")
public class DictTypeController {

  private final DictTypeService dictTypeService;

  public DictTypeController(DictTypeService dictTypeService) {
    this.dictTypeService = dictTypeService;
  }

  @GetMapping("/page")
  public ApiResponse<PageResult<DictTypeVO>> page(
      @RequestParam(defaultValue = "1") int pageNo,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(required = false) String name,
      @RequestParam(required = false) String type,
      @RequestParam(required = false) Integer status) {
    return ApiResponse.success(dictTypeService.page(pageNo, pageSize, name, type, status));
  }

  @GetMapping("/get")
  public ApiResponse<DictTypeVO> get(@RequestParam Long id) {
    return ApiResponse.success(dictTypeService.get(id));
  }

  @GetMapping("/simple-list")
  public ApiResponse<List<DictTypeVO>> simpleList() {
    return ApiResponse.success(dictTypeService.simpleList());
  }

  @PostMapping("/create")
  public ApiResponse<Long> create(@RequestBody DictTypeVO vo) {
    return ApiResponse.success(dictTypeService.create(vo));
  }

  @PutMapping("/update")
  public ApiResponse<Void> update(@RequestBody DictTypeVO vo) {
    dictTypeService.update(vo);
    return ApiResponse.success();
  }

  @DeleteMapping("/delete")
  public ApiResponse<Void> delete(@RequestParam Long id) {
    dictTypeService.delete(id);
    return ApiResponse.success();
  }

  @DeleteMapping("/delete-list")
  public ApiResponse<Void> deleteList(@RequestParam String ids) {
    List<Long> idList = java.util.Arrays.stream(ids.split(","))
        .map(String::trim).filter(s -> !s.isEmpty()).map(Long::parseLong).toList();
    dictTypeService.deleteList(idList);
    return ApiResponse.success();
  }

  @GetMapping(value = "/export", produces = "text/csv")
  public void export(
      @RequestParam(defaultValue = "1") int pageNo,
      @RequestParam(defaultValue = "10000") int pageSize,
      @RequestParam(required = false) String name,
      @RequestParam(required = false) String type,
      @RequestParam(required = false) Integer status,
      HttpServletResponse response) throws Exception {
    byte[] data = dictTypeService.exportCsv(pageNo, pageSize, name, type, status);
    response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
    response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=dict-type.csv");
    response.setContentLength(data.length);
    response.getOutputStream().write(data);
    response.getOutputStream().flush();
  }
}
