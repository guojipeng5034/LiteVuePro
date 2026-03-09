package com.litevuepro.repository;

import com.litevuepro.entity.SysUser;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SysUserRepository extends JpaRepository<SysUser, Long>, JpaSpecificationExecutor<SysUser> {

  Optional<SysUser> findByUsername(String username);

  Optional<SysUser> findByUsernameAndStatus(String username, int status);
}
