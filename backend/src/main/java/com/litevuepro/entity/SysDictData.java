package com.litevuepro.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sys_dict_data")
public class SysDictData {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "dict_type", nullable = false, length = 64)
  private String dictType;

  @Column(nullable = false, length = 64)
  private String label;

  @Column(nullable = false, length = 64)
  private String value;

  @Column(nullable = false)
  private Integer sort = 0;

  @Column(nullable = false, columnDefinition = "TINYINT")
  private Integer status = 0;

  @Column(name = "color_type", length = 32)
  private String colorType;

  @Column(name = "css_class", length = 64)
  private String cssClass;

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
  public String getDictType() { return dictType; }
  public void setDictType(String dictType) { this.dictType = dictType; }
  public String getLabel() { return label; }
  public void setLabel(String label) { this.label = label; }
  public String getValue() { return value; }
  public void setValue(String value) { this.value = value; }
  public Integer getSort() { return sort; }
  public void setSort(Integer sort) { this.sort = sort; }
  public Integer getStatus() { return status; }
  public void setStatus(Integer status) { this.status = status; }
  public String getColorType() { return colorType; }
  public void setColorType(String colorType) { this.colorType = colorType; }
  public String getCssClass() { return cssClass; }
  public void setCssClass(String cssClass) { this.cssClass = cssClass; }
  public String getRemark() { return remark; }
  public void setRemark(String remark) { this.remark = remark; }
  public LocalDateTime getCreateTime() { return createTime; }
  public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
  public LocalDateTime getUpdateTime() { return updateTime; }
  public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
