package com.litevuepro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sys_area")
public class SysArea {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "parent_id", nullable = false)
  private Long parentId = 0L;

  @Column(nullable = false, length = 64)
  private String name;

  @Column(nullable = false)
  private Integer sort = 0;

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

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public Long getParentId() { return parentId; }
  public void setParentId(Long parentId) { this.parentId = parentId; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public Integer getSort() { return sort; }
  public void setSort(Integer sort) { this.sort = sort; }
  public LocalDateTime getCreateTime() { return createTime; }
  public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
  public LocalDateTime getUpdateTime() { return updateTime; }
  public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
