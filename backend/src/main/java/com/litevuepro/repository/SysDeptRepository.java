package com.litevuepro.repository;

import com.litevuepro.entity.SysDept;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SysDeptRepository extends JpaRepository<SysDept, Long> {

  List<SysDept> findAllByOrderBySortAscIdAsc();

  boolean existsByParentId(Long parentId);

  @Modifying
  @Query("DELETE FROM SysDept d WHERE d.id = :id")
  int deleteByIdDirect(@Param("id") Long id);
}
