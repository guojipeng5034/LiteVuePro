package com.litevuepro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sys_dept")
public class SysDept {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "parent_id", nullable = false)
  private Long parentId = 0L;

  @Column(nullable = false, length = 64)
  private String name;

  @Column(nullable = false)
  private Integer sort = 0;

  @Column(name = "leader_user_id")
  private Long leaderUserId;

  @Column(length = 32)
  private String phone;

  @Column(length = 128)
  private String email;

  @Column(nullable = false, columnDefinition = "TINYINT")
  private Integer status = 0;

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
  public Long getLeaderUserId() { return leaderUserId; }
  public void setLeaderUserId(Long leaderUserId) { this.leaderUserId = leaderUserId; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public Integer getStatus() { return status; }
  public void setStatus(Integer status) { this.status = status; }
  public LocalDateTime getCreateTime() { return createTime; }
  public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
  public LocalDateTime getUpdateTime() { return updateTime; }
  public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
