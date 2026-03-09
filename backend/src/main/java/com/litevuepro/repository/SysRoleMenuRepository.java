package com.litevuepro.repository;

import com.litevuepro.entity.SysRoleMenu;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface SysRoleMenuRepository extends JpaRepository<SysRoleMenu, SysRoleMenu.RoleMenuId> {

  List<SysRoleMenu> findByRoleId(Long roleId);

  @Modifying
  @Query("DELETE FROM SysRoleMenu rm WHERE rm.roleId = :roleId")
  void deleteByRoleId(Long roleId);
}
