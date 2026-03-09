package com.litevuepro.service;

import com.litevuepro.common.BusinessException;
import com.litevuepro.dto.DictDataVO;
import com.litevuepro.dto.PageResult;
import com.litevuepro.entity.SysDictData;
import com.litevuepro.repository.SysDictDataRepository;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DictDataService {

  private final SysDictDataRepository repo;

  public DictDataService(SysDictDataRepository repo) {
    this.repo = repo;
  }

  public PageResult<DictDataVO> page(int pageNo, int pageSize, String dictType, String label, Integer status) {
    Specification<SysDictData> spec = (root, q, cb) -> {
      var preds = new ArrayList<jakarta.persistence.criteria.Predicate>();
      if (dictType != null && !dictType.isBlank()) {
        preds.add(cb.equal(root.get("dictType"), dictType.trim()));
      }
      if (label != null && !label.isBlank()) {
        preds.add(cb.like(cb.lower(root.get("label")), "%" + label.trim().toLowerCase() + "%"));
      }
      if (status != null) preds.add(cb.equal(root.get("status"), status));
      return preds.isEmpty() ? null : cb.and(preds.toArray(new jakarta.persistence.criteria.Predicate[0]));
    };
    Pageable pageable = PageRequest.of(Math.max(0, pageNo - 1), Math.min(100, Math.max(1, pageSize)));
    Page<SysDictData> page = repo.findAll(spec, pageable);
    List<DictDataVO> list = page.getContent().stream().map(this::toVO).toList();
    return new PageResult<>(list, page.getTotalElements());
  }

  /** 按字典类型批量查询（status=0 启用），用于登录后初始化 */
  public List<DictDataVO> listByTypes(List<String> dictTypes) {
    if (dictTypes == null || dictTypes.isEmpty()) return List.of();
    List<String> distinct = dictTypes.stream().filter(t -> t != null && !t.isBlank()).distinct().toList();
    if (distinct.isEmpty()) return List.of();
    return repo.findByDictTypeInAndStatusOrderBySortAscIdAsc(distinct, 0).stream().map(this::toVO).toList();
  }

  public DictDataVO get(Long id) {
    SysDictData e = repo.findById(id).orElseThrow(() -> new BusinessException(404, "字典数据不存在"));
    return toVO(e);
  }

  @Transactional
  public Long create(DictDataVO vo) {
    if (vo.dictType() == null || vo.dictType().isBlank()) throw new BusinessException(400, "字典类型不能为空");
    if (vo.label() == null || vo.label().isBlank()) throw new BusinessException(400, "字典标签不能为空");
    if (vo.value() == null || vo.value().isBlank()) throw new BusinessException(400, "字典值不能为空");
    SysDictData e = new SysDictData();
    mapToEntity(vo, e);
    e = repo.save(e);
    return e.getId();
  }

  @Transactional
  public void update(DictDataVO vo) {
    if (vo.id() == null) throw new BusinessException(400, "id不能为空");
    SysDictData e = repo.findById(vo.id()).orElseThrow(() -> new BusinessException(404, "字典数据不存在"));
    mapToEntity(vo, e);
    repo.save(e);
  }

  @Transactional
  public void delete(Long id) {
    if (!repo.existsById(id)) throw new BusinessException(404, "字典数据不存在");
    repo.deleteById(id);
  }

  @Transactional
  public void deleteList(List<Long> ids) {
    ids.forEach(id -> { if (repo.existsById(id)) repo.deleteById(id); });
  }

  public byte[] exportCsv(int pageNo, int pageSize, String dictType, String label, Integer status) {
    PageResult<DictDataVO> pr = page(pageNo, pageSize, dictType, label, status);
    try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
         OutputStreamWriter w = new OutputStreamWriter(baos, StandardCharsets.UTF_8)) {
      w.write('\uFEFF');
      w.write("id,dictType,label,value,sort,status,colorType,cssClass,remark,createTime\n");
      for (DictDataVO v : pr.list()) {
        w.write(String.format("%d,%s,%s,%s,%d,%d,%s,%s,%s,%s\n", v.id() != null ? v.id() : 0,
            escapeCsv(v.dictType()), escapeCsv(v.label()), escapeCsv(v.value()),
            v.sort() != null ? v.sort() : 0, v.status() != null ? v.status() : 0,
            escapeCsv(v.colorType()), escapeCsv(v.cssClass()), escapeCsv(v.remark()), escapeCsv(v.createTime())));
      }
      w.flush();
      return baos.toByteArray();
    } catch (Exception e) {
      throw new BusinessException(500, "导出失败: " + e.getMessage());
    }
  }

  private DictDataVO toVO(SysDictData e) {
    String ct = e.getCreateTime() != null ? e.getCreateTime().toString().replace("T", " ").substring(0, 19) : null;
    return DictDataVO.from(e.getId(), e.getDictType(), e.getLabel(), e.getValue(), e.getSort(), e.getStatus(),
        e.getColorType(), e.getCssClass(), e.getRemark(), ct);
  }

  private void mapToEntity(DictDataVO vo, SysDictData e) {
    if (vo.dictType() != null) e.setDictType(vo.dictType());
    if (vo.label() != null) e.setLabel(vo.label());
    if (vo.value() != null) e.setValue(vo.value());
    if (vo.sort() != null) e.setSort(vo.sort());
    if (vo.status() != null) e.setStatus(vo.status());
    if (vo.colorType() != null) e.setColorType(vo.colorType());
    if (vo.cssClass() != null) e.setCssClass(vo.cssClass());
    if (vo.remark() != null) e.setRemark(vo.remark());
  }

  private String escapeCsv(String s) {
    if (s == null || s.isEmpty()) return "";
    if (s.contains(",") || s.contains("\"") || s.contains("\n")) return "\"" + s.replace("\"", "\"\"") + "\"";
    return s;
  }
}
