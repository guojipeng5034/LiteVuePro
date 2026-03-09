package com.litevuepro.repository;

import com.litevuepro.entity.SysMenu;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SysMenuRepository extends JpaRepository<SysMenu, Long> {

  List<SysMenu> findAllByOrderBySortAscIdAsc();
}
