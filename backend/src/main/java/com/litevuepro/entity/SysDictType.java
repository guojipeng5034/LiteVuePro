package com.litevuepro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sys_dict_type")
public class SysDictType {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 64)
  private String name;

  @Column(nullable = false, unique = true, length = 64)
  private String type;

  @Column(nullable = false, columnDefinition = "TINYINT")
  private Integer status = 0;

  @Column(length = 256)
  private String remark;

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
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getType() { return type; }
  public void setType(String type) { this.type = type; }
  public Integer getStatus() { return status; }
  public void setStatus(Integer status) { this.status = status; }
  public String getRemark() { return remark; }
  public void setRemark(String remark) { this.remark = remark; }
  public LocalDateTime getCreateTime() { return createTime; }
  public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
  public LocalDateTime getUpdateTime() { return updateTime; }
  public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
