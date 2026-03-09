package com.litevuepro.controller;

import com.litevuepro.common.ApiResponse;
import com.litevuepro.dto.DictDataVO;
import com.litevuepro.dto.PageResult;
import com.litevuepro.service.DictDataService;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system/dict-data")
public class DictDataController {

  private final DictDataService dictDataService;

  public DictDataController(DictDataService dictDataService) {
    this.dictDataService = dictDataService;
  }

  @GetMapping("/list-by-types")
  public ApiResponse<List<DictDataVO>> listByTypes(@RequestParam(required = false) String types) {
    List<String> typeList = types == null || types.isBlank()
        ? List.of()
        : java.util.Arrays.stream(types.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    return ApiResponse.success(dictDataService.listByTypes(typeList));
  }

  @GetMapping("/page")
  public ApiResponse<PageResult<DictDataVO>> page(
      @RequestParam(defaultValue = "1") int pageNo,
      @RequestParam(defaultValue = "10") int pageSize,
      @RequestParam(required = false) String dictType,
      @RequestParam(required = false) String label,
      @RequestParam(required = false) Integer status) {
    return ApiResponse.success(dictDataService.page(pageNo, pageSize, dictType, label, status));
  }

  @GetMapping("/get")
  public ApiResponse<DictDataVO> get(@RequestParam Long id) {
    return ApiResponse.success(dictDataService.get(id));
  }

  @PostMapping("/create")
  public ApiResponse<Long> create(@RequestBody DictDataVO vo) {
    return ApiResponse.success(dictDataService.create(vo));
  }

  @PutMapping("/update")
  public ApiResponse<Void> update(@RequestBody DictDataVO vo) {
    dictDataService.update(vo);
    return ApiResponse.success();
  }

  @DeleteMapping("/delete")
  public ApiResponse<Void> delete(@RequestParam Long id) {
    dictDataService.delete(id);
    return ApiResponse.success();
  }

  @DeleteMapping("/delete-list")
  public ApiResponse<Void> deleteList(@RequestParam String ids) {
    List<Long> idList = java.util.Arrays.stream(ids.split(","))
        .map(String::trim).filter(s -> !s.isEmpty()).map(Long::parseLong).toList();
    dictDataService.deleteList(idList);
    return ApiResponse.success();
  }

  @GetMapping(value = "/export", produces = "text/csv")
  public void export(
      @RequestParam(defaultValue = "1") int pageNo,
      @RequestParam(defaultValue = "10000") int pageSize,
      @RequestParam(required = false) String dictType,
      @RequestParam(required = false) String label,
      @RequestParam(required = false) Integer status,
      HttpServletResponse response) throws Exception {
    byte[] data = dictDataService.exportCsv(pageNo, pageSize, dictType, label, status);
    response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
    response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=dict-data.csv");
    response.setContentLength(data.length);
    response.getOutputStream().write(data);
    response.getOutputStream().flush();
  }
}
