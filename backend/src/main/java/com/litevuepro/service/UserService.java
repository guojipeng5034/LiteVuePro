package com.litevuepro.service;

import com.litevuepro.common.BusinessException;
import com.litevuepro.dto.PageResult;
import com.litevuepro.dto.UserSaveDTO;
import com.litevuepro.dto.UserVO;
import com.litevuepro.entity.SysDept;
import com.litevuepro.entity.SysUser;
import com.litevuepro.entity.SysUserRole;
import com.litevuepro.repository.SysDeptRepository;
import com.litevuepro.repository.SysUserRepository;
import com.litevuepro.repository.SysUserRoleRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final SysUserRepository userRepo;
  private final SysDeptRepository deptRepo;
  private final SysUserRoleRepository userRoleRepo;
  private final PasswordEncoder passwordEncoder;

  public UserService(SysUserRepository userRepo, SysDeptRepository deptRepo,
      SysUserRoleRepository userRoleRepo, PasswordEncoder passwordEncoder) {
    this.userRepo = userRepo;
    this.deptRepo = deptRepo;
    this.userRoleRepo = userRoleRepo;
    this.passwordEncoder = passwordEncoder;
  }

  public PageResult<UserVO> page(int pageNo, int pageSize, String username, String nickname, Integer status) {
    Specification<SysUser> spec = (root, q, cb) -> {
      var preds = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
      if (username != null && !username.isBlank()) {
        preds.add(cb.like(cb.lower(root.get("username")), "%" + username.trim().toLowerCase() + "%"));
      }
      if (nickname != null && !nickname.isBlank()) {
        preds.add(cb.like(cb.lower(root.get("nickname")), "%" + nickname.trim().toLowerCase() + "%"));
      }
      if (status != null) {
        preds.add(cb.equal(root.get("status"), status));
      }
      return preds.isEmpty() ? null : cb.and(preds.toArray(new jakarta.persistence.criteria.Predicate[0]));
    };
    Pageable pageable = PageRequest.of(Math.max(0, pageNo - 1), Math.min(100, Math.max(1, pageSize)));
    Page<SysUser> page = userRepo.findAll(spec, pageable);
    List<SysUser> users = page.getContent();
    Map<Long, String> deptNames = resolveDeptNames(users);
    List<UserVO> list = users.stream()
        .map(u -> toVO(u, u.getDeptId() == null ? null : deptNames.getOrDefault(u.getDeptId(), null), null))
        .toList();
    return new PageResult<>(list, page.getTotalElements());
  }

  public List<UserVO> simpleList() {
    List<SysUser> users = userRepo.findAll();
    Map<Long, String> deptNames = resolveDeptNames(users);
    return users.stream()
        .map(u -> toVO(u, u.getDeptId() == null ? null : deptNames.getOrDefault(u.getDeptId(), null), null))
        .toList();
  }

  public UserVO get(Long id) {
    SysUser u = userRepo.findById(id).orElseThrow(() -> new BusinessException(404, "用户不存在"));
    String deptName = u.getDeptId() != null ? deptRepo.findById(u.getDeptId())
        .map(SysDept::getName).orElse(null) : null;
    List<Long> roleIds = userRoleRepo.findAllByUserId(id).stream()
        .map(SysUserRole::getRoleId).toList();
    return toVO(u, deptName, roleIds);
  }

  @Transactional
  public Long create(UserSaveDTO dto) {
    if (dto.username() == null || dto.username().isBlank()) {
      throw new BusinessException(400, "用户名不能为空");
    }
    if (dto.password() == null || dto.password().isBlank()) {
      throw new BusinessException(400, "密码不能为空");
    }
    if (userRepo.findByUsername(dto.username()).isPresent()) {
      throw new BusinessException(400, "用户名已存在");
    }
    SysUser u = new SysUser();
    u.setUsername(dto.username().trim().toLowerCase());
    u.setPasswordHash(passwordEncoder.encode(dto.password()));
    u.setNickname(dto.nickname() != null ? dto.nickname().trim() : dto.username());
    u.setDeptId(dto.deptId());
    u.setMobile(dto.mobile());
    u.setStatus(dto.status() != null ? dto.status() : 1);
    u = userRepo.save(u);
    saveUserRoles(u.getId(), dto.roleIds());
    return u.getId();
  }

  @Transactional
  public void update(UserSaveDTO dto) {
    if (dto.id() == null) throw new BusinessException(400, "id不能为空");
    SysUser u = userRepo.findById(dto.id()).orElseThrow(() -> new BusinessException(404, "用户不存在"));
    if (dto.nickname() != null) u.setNickname(dto.nickname().trim());
    if (dto.deptId() != null) u.setDeptId(dto.deptId());
    if (dto.mobile() != null) u.setMobile(dto.mobile());
    if (dto.status() != null) u.setStatus(dto.status());
    if (dto.password() != null && !dto.password().isBlank()) {
      u.setPasswordHash(passwordEncoder.encode(dto.password()));
    }
    userRepo.save(u);
    saveUserRoles(u.getId(), dto.roleIds());
  }

  private void saveUserRoles(Long userId, List<Long> roleIds) {
    userRoleRepo.deleteAllByUserId(userId);
    if (roleIds != null && !roleIds.isEmpty()) {
      for (Long roleId : roleIds) {
        if (roleId == null) continue;
        SysUserRole ur = new SysUserRole();
        ur.setUserId(userId);
        ur.setRoleId(roleId);
        userRoleRepo.save(ur);
      }
    }
  }

  @Transactional
  public void delete(Long id) {
    if (!userRepo.existsById(id)) {
      throw new BusinessException(404, "用户不存在");
    }
    userRoleRepo.deleteAllByUserId(id);
    userRepo.deleteById(id);
  }

  private Map<Long, String> resolveDeptNames(List<SysUser> users) {
    List<Long> deptIds = users.stream()
        .map(SysUser::getDeptId)
        .filter(d -> d != null && d > 0)
        .distinct()
        .toList();
    if (deptIds.isEmpty()) {
      return Map.of();
    }
    return deptRepo.findAllById(deptIds).stream()
        .collect(Collectors.toMap(SysDept::getId, d -> d.getName() != null ? d.getName() : ""));
  }

  private UserVO toVO(SysUser u, String deptName, List<Long> roleIds) {
    return UserVO.from(u.getId(), u.getNickname(), u.getUsername(), deptName, u.getDeptId(),
        u.getMobile(), u.getStatus(), u.getCreateTime(), roleIds);
  }
}
