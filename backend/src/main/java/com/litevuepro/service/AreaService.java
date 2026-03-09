package com.litevuepro.service;

import com.litevuepro.dto.AreaVO;
import com.litevuepro.entity.SysArea;
import com.litevuepro.repository.SysAreaRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class AreaService {

  private final SysAreaRepository repo;

  public AreaService(SysAreaRepository repo) {
    this.repo = repo;
  }

  public List<AreaVO> tree() {
    List<SysArea> all = repo.findAll();
    Map<Long, List<SysArea>> byParent = all.stream().collect(Collectors.groupingBy(SysArea::getParentId));
    return buildTree(0L, byParent);
  }

  /** 根据 IP 查询地区，简化实现返回默认值（真实场景需接入 IP 库） */
  public String getByIp(String ip) {
    if (ip == null || ip.isBlank()) return "未知";
    if (ip.startsWith("127.") || "localhost".equalsIgnoreCase(ip)) return "本地";
    // 可接入 ip2region、GeoIP2 等
    return "中国";
  }

  private List<AreaVO> buildTree(Long parentId, Map<Long, List<SysArea>> byParent) {
    List<SysArea> children = byParent.getOrDefault(parentId, List.of());
    if (children.isEmpty()) return List.of();
    List<AreaVO> result = new ArrayList<>();
    for (SysArea a : children) {
      List<AreaVO> sub = buildTree(a.getId(), byParent);
      result.add(AreaVO.from(a.getId(), a.getName(), sub.isEmpty() ? null : sub));
    }
    return result;
  }
}
