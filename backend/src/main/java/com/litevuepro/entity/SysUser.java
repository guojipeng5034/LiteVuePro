package com.litevuepro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sys_user")
public class SysUser {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 64)
  private String username;

  @Column(name = "password_hash", nullable = false, length = 128)
  private String passwordHash;

  @Column(length = 64)
  private String nickname;

  @Column(length = 128)
  private String email;

  @Column(length = 512)
  private String avatar;

  @Column(length = 20)
  private String mobile;

  @Column(name = "dept_id")
  private Long deptId;

  @Column(nullable = false, columnDefinition = "TINYINT")
  private Integer status = 1;

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
  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }
  public String getPasswordHash() { return passwordHash; }
  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
  public String getNickname() { return nickname; }
  public void setNickname(String nickname) { this.nickname = nickname; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getAvatar() { return avatar; }
  public void setAvatar(String avatar) { this.avatar = avatar; }
  public String getMobile() { return mobile; }
  public void setMobile(String mobile) { this.mobile = mobile; }
  public Long getDeptId() { return deptId; }
  public void setDeptId(Long deptId) { this.deptId = deptId; }
  public Integer getStatus() { return status; }
  public void setStatus(Integer status) { this.status = status; }
  public LocalDateTime getCreateTime() { return createTime; }
  public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
  public LocalDateTime getUpdateTime() { return updateTime; }
  public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
