package com.litevuepro.service;

import com.litevuepro.common.BusinessException;
import com.litevuepro.dto.DictTypeVO;
import com.litevuepro.dto.PageResult;
import com.litevuepro.entity.SysDictType;
import com.litevuepro.repository.SysDictTypeRepository;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DictTypeService {

  private final SysDictTypeRepository repo;

  public DictTypeService(SysDictTypeRepository repo) {
    this.repo = repo;
  }

  public PageResult<DictTypeVO> page(int pageNo, int pageSize, String name, String type, Integer status) {
    Specification<SysDictType> spec = buildSpec(name, type, status);
    Pageable pageable = PageRequest.of(Math.max(0, pageNo - 1), Math.min(100, Math.max(1, pageSize)));
    Page<SysDictType> page = repo.findAll(spec, pageable);
    List<DictTypeVO> list = page.getContent().stream().map(this::toVO).toList();
    return new PageResult<>(list, page.getTotalElements());
  }

  public DictTypeVO get(Long id) {
    SysDictType e = repo.findById(id).orElseThrow(() -> new BusinessException(404, "字典类型不存在"));
    return toVO(e);
  }

  @Cacheable(cacheNames = "dictType", key = "'simple'")
  public List<DictTypeVO> simpleList() {
    return repo.findAll().stream().map(this::toVO).toList();
  }

  @Transactional
  @CacheEvict(cacheNames = "dictType", key = "'simple'")
  public Long create(DictTypeVO vo) {
    if (vo.name() == null || vo.name().isBlank()) throw new BusinessException(400, "字典名称不能为空");
    if (vo.type() == null || vo.type().isBlank()) throw new BusinessException(400, "字典类型不能为空");
    if (repo.existsByType(vo.type())) throw new BusinessException(400, "字典类型已存在");
    SysDictType e = new SysDictType();
    mapToEntity(vo, e);
    e = repo.save(e);
    return e.getId();
  }

  @Transactional
  @CacheEvict(cacheNames = "dictType", key = "'simple'")
  public void update(DictTypeVO vo) {
    if (vo.id() == null) throw new BusinessException(400, "id不能为空");
    SysDictType e = repo.findById(vo.id()).orElseThrow(() -> new BusinessException(404, "字典类型不存在"));
    if (vo.type() != null && !vo.type().equals(e.getType()) && repo.existsByType(vo.type())) {
      throw new BusinessException(400, "字典类型已存在");
    }
    mapToEntity(vo, e);
    repo.save(e);
  }

  @Transactional
  @CacheEvict(cacheNames = "dictType", key = "'simple'")
  public void delete(Long id) {
    if (!repo.existsById(id)) throw new BusinessException(404, "字典类型不存在");
    repo.deleteById(id);
  }

  @Transactional
  @CacheEvict(cacheNames = "dictType", key = "'simple'")
  public void deleteList(List<Long> ids) {
    ids.forEach(id -> { if (repo.existsById(id)) repo.deleteById(id); });
  }

  public byte[] exportCsv(int pageNo, int pageSize, String name, String type, Integer status) {
    PageResult<DictTypeVO> pr = page(pageNo, pageSize, name, type, status);
    try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
         OutputStreamWriter w = new OutputStreamWriter(baos, StandardCharsets.UTF_8)) {
      w.write('\uFEFF');
      w.write("id,name,type,status,remark,createTime\n");
      for (DictTypeVO v : pr.list()) {
        w.write(String.format("%d,%s,%s,%d,%s,%s\n", v.id() != null ? v.id() : 0,
            escapeCsv(v.name()), escapeCsv(v.type()), v.status() != null ? v.status() : 0,
            escapeCsv(v.remark()), escapeCsv(v.createTime())));
      }
      w.flush();
      return baos.toByteArray();
    } catch (Exception e) {
      throw new BusinessException(500, "导出失败: " + e.getMessage());
    }
  }

  private Specification<SysDictType> buildSpec(String name, String type, Integer status) {
    return (root, q, cb) -> {
      var preds = new ArrayList<jakarta.persistence.criteria.Predicate>();
      if (name != null && !name.isBlank()) {
        preds.add(cb.like(cb.lower(root.get("name")), "%" + name.trim().toLowerCase() + "%"));
      }
      if (type != null && !type.isBlank()) {
        preds.add(cb.like(cb.lower(root.get("type")), "%" + type.trim().toLowerCase() + "%"));
      }
      if (status != null) preds.add(cb.equal(root.get("status"), status));
      return preds.isEmpty() ? null : cb.and(preds.toArray(new jakarta.persistence.criteria.Predicate[0]));
    };
  }

  private DictTypeVO toVO(SysDictType e) {
    String ct = e.getCreateTime() != null ? e.getCreateTime().toString().replace("T", " ").substring(0, 19) : null;
    return DictTypeVO.from(e.getId(), e.getName(), e.getType(), e.getStatus(), e.getRemark(), ct);
  }

  private void mapToEntity(DictTypeVO vo, SysDictType e) {
    if (vo.name() != null) e.setName(vo.name());
    if (vo.type() != null) e.setType(vo.type());
    if (vo.status() != null) e.setStatus(vo.status());
    if (vo.remark() != null) e.setRemark(vo.remark());
  }

  private String escapeCsv(String s) {
    if (s == null || s.isEmpty()) return "";
    if (s.contains(",") || s.contains("\"") || s.contains("\n")) return "\"" + s.replace("\"", "\"\"") + "\"";
    return s;
  }
}
