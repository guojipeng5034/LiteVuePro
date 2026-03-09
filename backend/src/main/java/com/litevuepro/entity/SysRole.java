package com.litevuepro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sys_role")
public class SysRole {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 64)
  private String name;

  @Column(nullable = false, unique = true, length = 64)
  private String code;

  @Column(columnDefinition = "TINYINT")
  private Integer type;

  @Column(nullable = false)
  private Integer sort = 0;

  @Column(nullable = false, columnDefinition = "TINYINT")
  private Integer status = 0;

  @Column(length = 256)
  private String remark;

  @Column(name = "data_scope", columnDefinition = "TINYINT")
  private Integer dataScope = 1;

  @Column(name = "data_scope_dept_ids", columnDefinition = "JSON")
  private String dataScopeDeptIds; // JSON array of Long

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
  public String getCode() { return code; }
  public void setCode(String code) { this.code = code; }
  public Integer getType() { return type; }
  public void setType(Integer type) { this.type = type; }
  public Integer getSort() { return sort; }
  public void setSort(Integer sort) { this.sort = sort; }
  public Integer getStatus() { return status; }
  public void setStatus(Integer status) { this.status = status; }
  public String getRemark() { return remark; }
  public void setRemark(String remark) { this.remark = remark; }
  public Integer getDataScope() { return dataScope; }
  public void setDataScope(Integer dataScope) { this.dataScope = dataScope; }
  public String getDataScopeDeptIds() { return dataScopeDeptIds; }
  public void setDataScopeDeptIds(String dataScopeDeptIds) { this.dataScopeDeptIds = dataScopeDeptIds; }
  public LocalDateTime getCreateTime() { return createTime; }
  public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
  public LocalDateTime getUpdateTime() { return updateTime; }
  public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
