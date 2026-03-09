package com.litevuepro.service;

import com.litevuepro.common.BusinessException;
import com.litevuepro.dto.DeptVO;
import com.litevuepro.entity.SysDept;
import com.litevuepro.repository.SysDeptRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DeptService {

  private final SysDeptRepository deptRepo;

  public DeptService(SysDeptRepository deptRepo) {
    this.deptRepo = deptRepo;
  }

  public List<DeptVO> list(String name, Integer status) {
    List<SysDept> list = deptRepo.findAllByOrderBySortAscIdAsc();
    if (name != null && !name.isBlank()) {
      String kw = name.trim().toLowerCase();
      list = list.stream().filter(d -> d.getName() != null && d.getName().toLowerCase().contains(kw)).toList();
    }
    if (status != null) {
      list = list.stream().filter(d -> status.equals(d.getStatus())).toList();
    }
    return list.stream().map(this::toVO).toList();
  }

  public DeptVO get(Long id) {
    SysDept d = deptRepo.findById(id).orElseThrow(() -> new BusinessException(404, "部门不存在"));
    return toVO(d);
  }

  public List<DeptVO> simpleList() {
    return deptRepo.findAllByOrderBySortAscIdAsc().stream().map(this::toVO).toList();
  }

  @Transactional
  public Long create(DeptVO vo) {
    if (vo.name() == null || vo.name().isBlank()) throw new BusinessException(400, "部门名称不能为空");
    SysDept d = new SysDept();
    mapToEntity(vo, d);
    if (d.getParentId() == null) d.setParentId(0L);
    if (d.getSort() == null) d.setSort(0);
    if (d.getStatus() == null) d.setStatus(0);
    d = deptRepo.save(d);
    return d.getId();
  }

  @Transactional
  public void update(DeptVO vo) {
    if (vo.id() == null) throw new BusinessException(400, "id不能为空");
    SysDept d = deptRepo.findById(vo.id()).orElseThrow(() -> new BusinessException(404, "部门不存在"));
    mapToEntity(vo, d);
    deptRepo.save(d);
  }

  @Transactional
  public void delete(Long id) {
    if (!deptRepo.existsById(id)) return;
    if (deptRepo.existsByParentId(id)) {
      throw new BusinessException(400, "存在子部门，无法删除");
    }
    deptRepo.deleteByIdDirect(id);
  }

  @Transactional
  public void deleteList(List<Long> ids) {
    ids.stream().sorted(Comparator.reverseOrder()).forEach(id -> {
      if (deptRepo.existsById(id) && !deptRepo.existsByParentId(id)) {
        deptRepo.deleteById(id);
      }
    });
  }

  private DeptVO toVO(SysDept d) {
    return DeptVO.from(d.getId(), d.getParentId(), d.getName(), d.getSort(), d.getLeaderUserId(),
        d.getPhone(), d.getEmail(), d.getStatus(), d.getCreateTime(), null);
  }

  private void mapToEntity(DeptVO vo, SysDept d) {
    if (vo.name() != null) d.setName(vo.name());
    if (vo.parentId() != null) d.setParentId(vo.parentId());
    if (vo.sort() != null) d.setSort(vo.sort());
    if (vo.leaderUserId() != null) d.setLeaderUserId(vo.leaderUserId());
    if (vo.phone() != null) d.setPhone(vo.phone());
    if (vo.email() != null) d.setEmail(vo.email());
    if (vo.status() != null) d.setStatus(vo.status());
  }
}
