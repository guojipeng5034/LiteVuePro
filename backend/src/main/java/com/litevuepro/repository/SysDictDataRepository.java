package com.litevuepro.repository;

import com.litevuepro.entity.SysDictData;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SysDictDataRepository extends JpaRepository<SysDictData, Long>, JpaSpecificationExecutor<SysDictData> {

  List<SysDictData> findByDictTypeInAndStatusOrderBySortAscIdAsc(List<String> dictTypes, int status);
}
