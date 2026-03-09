package com.litevuepro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sys_menu")
public class SysMenu {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 64)
  private String name;

  @Column(length = 128)
  private String permission;

  @Column(nullable = false, columnDefinition = "TINYINT")
  private Integer type = 1;

  @Column(nullable = false)
  private Integer sort = 0;

  @Column(name = "parent_id", nullable = false)
  private Long parentId = 0L;

  @Column(nullable = false, length = 256)
  private String path = "";

  @Column(length = 64)
  private String icon;

  @Column(length = 256)
  private String component;

  @Column(name = "component_name", length = 64)
  private String componentName;

  @Column(nullable = false, columnDefinition = "TINYINT")
  private Integer status = 0;

  @Column(nullable = false, columnDefinition = "TINYINT")
  private Integer visible = 1;

  @Column(name = "keep_alive", nullable = false, columnDefinition = "TINYINT")
  private Integer keepAlive = 1;

  @Column(name = "always_show", nullable = false, columnDefinition = "TINYINT")
  private Integer alwaysShow = 0;

  @Column(name = "create_time", nullable = false, updatable = false)
  private LocalDateTime createTime;

  @Column(name = "update_time", nullable = false)
  private LocalDateTime updateTime;

  @PrePersist
  void onCreate() {
    createTime = LocalDateTime.now();
    updateTime = createTime;
  }

  @PreUpdate
  void onUpdate() {
    updateTime = LocalDateTime.now();
  }

  // getters / setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getPermission() { return permission; }
  public void setPermission(String permission) { this.permission = permission; }
  public Integer getType() { return type; }
  public void setType(Integer type) { this.type = type; }
  public Integer getSort() { return sort; }
  public void setSort(Integer sort) { this.sort = sort; }
  public Long getParentId() { return parentId; }
  public void setParentId(Long parentId) { this.parentId = parentId; }
  public String getPath() { return path; }
  public void setPath(String path) { this.path = path; }
  public String getIcon() { return icon; }
  public void setIcon(String icon) { this.icon = icon; }
  public String getComponent() { return component; }
  public void setComponent(String component) { this.component = component; }
  public String getComponentName() { return componentName; }
  public void setComponentName(String componentName) { this.componentName = componentName; }
  public Integer getStatus() { return status; }
  public void setStatus(Integer status) { this.status = status; }
  public Integer getVisible() { return visible; }
  public void setVisible(Integer visible) { this.visible = visible; }
  public Integer getKeepAlive() { return keepAlive; }
  public void setKeepAlive(Integer keepAlive) { this.keepAlive = keepAlive; }
  public Integer getAlwaysShow() { return alwaysShow; }
  public void setAlwaysShow(Integer alwaysShow) { this.alwaysShow = alwaysShow; }
  public LocalDateTime getCreateTime() { return createTime; }
  public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
  public LocalDateTime getUpdateTime() { return updateTime; }
  public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
