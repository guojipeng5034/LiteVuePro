package com.litevuepro.repository;

import com.litevuepro.entity.SysUserRole;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface SysUserRoleRepository extends JpaRepository<SysUserRole, SysUserRole.UserRoleId> {

  List<SysUserRole> findAllByUserId(Long userId);

  @Modifying
  @Transactional
  void deleteAllByUserId(Long userId);
}
