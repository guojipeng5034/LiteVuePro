package com.litevuepro.repository;

import com.litevuepro.entity.SysDictType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SysDictTypeRepository extends JpaRepository<SysDictType, Long>, JpaSpecificationExecutor<SysDictType> {

  boolean existsByType(String type);
}
