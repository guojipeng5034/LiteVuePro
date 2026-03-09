package com.litevuepro.entity;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "sys_role_menu")
@IdClass(SysRoleMenu.RoleMenuId.class)
public class SysRoleMenu {

  @Id
  @Column(name = "role_id", nullable = false)
  private Long roleId;

  @Id
  @Column(name = "menu_id", nullable = false)
  private Long menuId;

  public Long getRoleId() { return roleId; }
  public void setRoleId(Long roleId) { this.roleId = roleId; }
  public Long getMenuId() { return menuId; }
  public void setMenuId(Long menuId) { this.menuId = menuId; }

  public static class RoleMenuId implements java.io.Serializable {
    private Long roleId;
    private Long menuId;

    public RoleMenuId() {}
    public RoleMenuId(Long roleId, Long menuId) { this.roleId = roleId; this.menuId = menuId; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public Long getMenuId() { return menuId; }
    public void setMenuId(Long menuId) { this.menuId = menuId; }

    @Override
    public boolean equals(Object o) {
      if (this == o) return true;
      if (o == null || getClass() != o.getClass()) return false;
      RoleMenuId that = (RoleMenuId) o;
      return Objects.equals(roleId, that.roleId) && Objects.equals(menuId, that.menuId);
    }

    @Override
    public int hashCode() {
      return Objects.hash(roleId, menuId);
    }
  }
}
