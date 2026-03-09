package com.litevuepro.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "sys_user_role")
@IdClass(SysUserRole.UserRoleId.class)
public class SysUserRole {

  @Id
  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Id
  @Column(name = "role_id", nullable = false)
  private Long roleId;

  public Long getUserId() { return userId; }
  public void setUserId(Long userId) { this.userId = userId; }
  public Long getRoleId() { return roleId; }
  public void setRoleId(Long roleId) { this.roleId = roleId; }

  public static record UserRoleId(Long userId, Long roleId) implements Serializable {}
}
