package com.litevuepro.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.litevuepro.common.BusinessException;
import com.litevuepro.entity.SysRole;
import com.litevuepro.entity.SysRoleMenu;
import com.litevuepro.repository.SysRoleMenuRepository;
import com.litevuepro.repository.SysRoleRepository;
import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PermissionService {

  private final SysRoleMenuRepository roleMenuRepo;
  private final SysRoleRepository roleRepo;
  private final ObjectMapper objectMapper;

  public PermissionService(SysRoleMenuRepository roleMenuRepo, SysRoleRepository roleRepo, ObjectMapper objectMapper) {
    this.roleMenuRepo = roleMenuRepo;
    this.roleRepo = roleRepo;
    this.objectMapper = objectMapper;
  }

  @Cacheable(cacheNames = "roleMenu", key = "#roleId")
  public List<Long> getRoleMenuIds(Long roleId) {
    return roleMenuRepo.findByRoleId(roleId).stream().map(SysRoleMenu::getMenuId).toList();
  }

  @Transactional
  @CacheEvict(cacheNames = {"roleMenu", "menu"}, allEntries = true)
  public void assignRoleMenu(Long roleId, List<Long> menuIds) {
    if (roleId == null) throw new BusinessException(400, "roleId不能为空");
    if (!roleRepo.existsById(roleId)) throw new BusinessException(404, "角色不存在");
    roleMenuRepo.deleteByRoleId(roleId);
    if (menuIds != null && !menuIds.isEmpty()) {
      for (Long menuId : menuIds) {
        SysRoleMenu rm = new SysRoleMenu();
        rm.setRoleId(roleId);
        rm.setMenuId(menuId);
        roleMenuRepo.save(rm);
      }
    }
  }

  @Transactional
  public void assignRoleDataScope(Long roleId, Integer dataScope, List<Long> dataScopeDeptIds) {
    if (roleId == null) throw new BusinessException(400, "roleId不能为空");
    SysRole r = roleRepo.findById(roleId).orElseThrow(() -> new BusinessException(404, "角色不存在"));
    if (dataScope != null) r.setDataScope(dataScope);
    if (dataScopeDeptIds != null) {
      try {
        r.setDataScopeDeptIds(objectMapper.writeValueAsString(dataScopeDeptIds));
      } catch (Exception e) {
        throw new BusinessException(400, "dataScopeDeptIds 格式错误");
      }
    }
    roleRepo.save(r);
  }
}
