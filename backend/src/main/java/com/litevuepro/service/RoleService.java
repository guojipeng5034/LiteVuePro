package com.litevuepro.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.litevuepro.common.BusinessException;
import com.litevuepro.dto.PageResult;
import com.litevuepro.dto.RoleVO;
import com.litevuepro.entity.SysRole;
import com.litevuepro.repository.SysRoleRepository;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

@Service
public class RoleService {

  private final SysRoleRepository roleRepo;
  private final ObjectMapper objectMapper;

  public RoleService(SysRoleRepository roleRepo, ObjectMapper objectMapper) {
    this.roleRepo = roleRepo;
    this.objectMapper = objectMapper;
  }

  public PageResult<RoleVO> page(int pageNo, int pageSize, String name, String code, Integer status) {
    Specification<SysRole> spec = (root, q, cb) -> {
      var preds = new ArrayList<jakarta.persistence.criteria.Predicate>();
      if (name != null && !name.isBlank()) {
        preds.add(cb.like(cb.lower(root.get("name")), "%" + name.trim().toLowerCase() + "%"));
      }
      if (code != null && !code.isBlank()) {
        preds.add(cb.like(cb.lower(root.get("code")), "%" + code.trim().toLowerCase() + "%"));
      }
      if (status != null) {
        preds.add(cb.equal(root.get("status"), status));
      }
      return preds.isEmpty() ? null : cb.and(preds.toArray(new jakarta.persistence.criteria.Predicate[0]));
    };
    Pageable pageable = PageRequest.of(Math.max(0, pageNo - 1), Math.min(100, Math.max(1, pageSize)));
    Page<SysRole> page = roleRepo.findAll(spec, pageable);
    List<RoleVO> list = page.getContent().stream().map(this::toVO).toList();
    return new PageResult<>(list, page.getTotalElements());
  }

  public RoleVO get(Long id) {
    SysRole r = roleRepo.findById(id).orElseThrow(() -> new BusinessException(404, "角色不存在"));
    return toVO(r);
  }

  @Transactional
  public Long create(RoleVO vo) {
    if (vo.name() == null || vo.name().isBlank()) throw new BusinessException(400, "角色名称不能为空");
    if (vo.code() == null || vo.code().isBlank()) throw new BusinessException(400, "角色编码不能为空");
    if (roleRepo.existsByCode(vo.code())) throw new BusinessException(400, "角色编码已存在");
    SysRole r = new SysRole();
    mapToEntity(vo, r);
    r = roleRepo.save(r);
    return r.getId();
  }

  @Transactional
  public void update(RoleVO vo) {
    if (vo.id() == null) throw new BusinessException(400, "id不能为空");
    SysRole r = roleRepo.findById(vo.id()).orElseThrow(() -> new BusinessException(404, "角色不存在"));
    if (vo.code() != null && !vo.code().equals(r.getCode()) && roleRepo.existsByCode(vo.code())) {
      throw new BusinessException(400, "角色编码已存在");
    }
    mapToEntity(vo, r);
    roleRepo.save(r);
  }

  @Transactional
  public void delete(Long id) {
    if (!roleRepo.existsById(id)) throw new BusinessException(404, "角色不存在");
    roleRepo.deleteById(id);
  }

  @Transactional
  public void deleteList(List<Long> ids) {
    ids.forEach(id -> {
      if (roleRepo.existsById(id)) roleRepo.deleteById(id);
    });
  }

  public byte[] exportCsv(int pageNo, int pageSize, String name, String code, Integer status) {
    PageResult<RoleVO> pr = page(pageNo, pageSize, name, code, status);
    try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
         OutputStreamWriter w = new OutputStreamWriter(baos, StandardCharsets.UTF_8)) {
      w.write('\uFEFF'); // BOM for Excel UTF-8
      w.write("id,name,code,type,sort,status,remark,createTime\n");
      for (RoleVO v : pr.list()) {
        w.write(String.format("%d,%s,%s,%s,%d,%d,%s,%s\n",
            v.id() != null ? v.id() : 0,
            escapeCsv(v.name()),
            escapeCsv(v.code()),
            v.type() != null ? v.type() : "",
            v.sort() != null ? v.sort() : 0,
            v.status() != null ? v.status() : 0,
            escapeCsv(v.remark()),
            escapeCsv(v.createTime())));
      }
      w.flush();
      return baos.toByteArray();
    } catch (Exception e) {
      throw new BusinessException(500, "导出失败: " + e.getMessage());
    }
  }

  private String escapeCsv(String s) {
    if (s == null || s.isEmpty()) return "";
    if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
      return "\"" + s.replace("\"", "\"\"") + "\"";
    }
    return s;
  }

  private RoleVO toVO(SysRole r) {
    String ct = r.getCreateTime() != null ? r.getCreateTime().toString().replace("T", " ").substring(0, 19) : null;
    List<Long> deptIds = parseDeptIds(r.getDataScopeDeptIds());
    return RoleVO.from(r.getId(), r.getName(), r.getCode(), r.getType(), r.getSort(),
        r.getStatus(), r.getRemark(), ct, r.getDataScope(), deptIds);
  }

  private List<Long> parseDeptIds(String json) {
    if (json == null || json.isBlank()) return List.of();
    try {
      return objectMapper.readValue(json, new TypeReference<List<Long>>() {});
    } catch (Exception e) {
      return List.of();
    }
  }

  private void mapToEntity(RoleVO vo, SysRole r) {
    if (vo.name() != null) r.setName(vo.name());
    if (vo.code() != null) r.setCode(vo.code());
    if (vo.type() != null) r.setType(vo.type());
    if (vo.sort() != null) r.setSort(vo.sort());
    if (vo.status() != null) r.setStatus(vo.status());
    if (vo.remark() != null) r.setRemark(vo.remark());
    if (vo.dataScope() != null) r.setDataScope(vo.dataScope());
    if (vo.dataScopeDeptIds() != null) {
      try {
        r.setDataScopeDeptIds(objectMapper.writeValueAsString(vo.dataScopeDeptIds()));
      } catch (Exception ignored) {}
    }
  }
}
