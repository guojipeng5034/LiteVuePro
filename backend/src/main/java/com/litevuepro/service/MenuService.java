package com.litevuepro.service;

import com.litevuepro.common.BusinessException;
import com.litevuepro.dto.MenuVO;
import com.litevuepro.entity.SysMenu;
import com.litevuepro.repository.SysMenuRepository;
import com.litevuepro.repository.SysRoleMenuRepository;
import com.litevuepro.repository.SysUserRoleRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MenuService {

  private final SysMenuRepository menuRepo;
  private final SysUserRoleRepository userRoleRepo;
  private final SysRoleMenuRepository roleMenuRepo;

  public MenuService(SysMenuRepository menuRepo, SysUserRoleRepository userRoleRepo,
      SysRoleMenuRepository roleMenuRepo) {
    this.menuRepo = menuRepo;
    this.userRoleRepo = userRoleRepo;
    this.roleMenuRepo = roleMenuRepo;
  }

  /** 当前用户有权的菜单树（type 1 目录 + 2 菜单，排除 3 按钮；status=0 visible=1） */
  @Cacheable(cacheNames = "menu", key = "'user:' + #userId")
  public List<MenuVO> getUserMenuTree(long userId) {
    Set<Long> menuIds = new LinkedHashSet<>();
    userRoleRepo.findAllByUserId(userId).forEach(ur ->
        roleMenuRepo.findByRoleId(ur.getRoleId()).forEach(rm -> menuIds.add(rm.getMenuId())));
    if (menuIds.isEmpty()) return List.of();
    List<SysMenu> menus = menuRepo.findAllById(menuIds).stream()
        .filter(m -> m.getStatus() != null && m.getStatus() == 0)
        .filter(m -> m.getVisible() == null || m.getVisible() == 1)
        .filter(m -> m.getType() != null && m.getType() != 3)
        .sorted((a, b) -> {
          int s = Integer.compare(a.getSort() != null ? a.getSort() : 0, b.getSort() != null ? b.getSort() : 0);
          return s != 0 ? s : Long.compare(a.getId(), b.getId());
        })
        .toList();
    return buildTree(menus, 0L, "");
  }

  public List<MenuVO> list(String name, Integer status) {
    List<SysMenu> list = menuRepo.findAllByOrderBySortAscIdAsc();
    if (name != null && !name.isBlank()) {
      String kw = name.trim().toLowerCase();
      list = list.stream().filter(m -> m.getName() != null && m.getName().toLowerCase().contains(kw)).toList();
    }
    if (status != null) {
      list = list.stream().filter(m -> status.equals(m.getStatus())).toList();
    }
    return list.stream().map(this::toVO).toList();
  }

  public MenuVO get(Long id) {
    SysMenu m = menuRepo.findById(id).orElseThrow(() -> new BusinessException(404, "菜单不存在"));
    return toVO(m);
  }

  @Cacheable(cacheNames = "menu", key = "'simple'")
  public List<MenuVO> simpleList() {
    return menuRepo.findAllByOrderBySortAscIdAsc().stream().map(this::toVO).toList();
  }

  @Transactional
  @CacheEvict(cacheNames = "menu", key = "'simple'")
  public Long create(MenuVO vo) {
    if (vo.name() == null || vo.name().isBlank()) throw new BusinessException(400, "菜单名称不能为空");
    if (vo.type() == null) throw new BusinessException(400, "菜单类型不能为空");
    SysMenu m = new SysMenu();
    mapToEntity(vo, m);
    if (m.getParentId() == null) m.setParentId(0L);
    if (m.getPath() == null) m.setPath("");
    if (m.getSort() == null) m.setSort(0);
    if (m.getStatus() == null) m.setStatus(0);
    m = menuRepo.save(m);
    return m.getId();
  }

  @Transactional
  @CacheEvict(cacheNames = "menu", key = "'simple'")
  public void update(MenuVO vo) {
    if (vo.id() == null) throw new BusinessException(400, "id不能为空");
    SysMenu m = menuRepo.findById(vo.id()).orElseThrow(() -> new BusinessException(404, "菜单不存在"));
    mapToEntity(vo, m);
    menuRepo.save(m);
  }

  @Transactional
  @CacheEvict(cacheNames = "menu", key = "'simple'")
  public void delete(Long id) {
    if (!menuRepo.existsById(id)) throw new BusinessException(404, "菜单不存在");
    menuRepo.deleteById(id);
  }

  private MenuVO toVO(SysMenu m) {
    return toVO(m, null);
  }

  private List<MenuVO> buildTree(List<SysMenu> menus, Long parentId, String parentPath) {
    return menus.stream()
        .filter(m -> {
          Long pid = m.getParentId();
          return (pid == null && parentId == 0L) || (pid != null && pid.equals(parentId));
        })
        .map(m -> {
          String fullPath = resolvePath(parentPath, m.getPath());
          List<MenuVO> children = buildTree(menus, m.getId(), fullPath);
          return toVOWithPath(m, fullPath, children.isEmpty() ? null : children);
        })
        .toList();
  }

  private String resolvePath(String parentPath, String segment) {
    if (segment == null || segment.isBlank()) return parentPath != null ? parentPath : "";
    if (segment.startsWith("http")) return segment;
    String base = parentPath != null ? parentPath : "";
    if (segment.startsWith("/")) return segment;
    return (base.isEmpty() ? "" : base.replaceAll("/+$", "") + "/") + segment;
  }

  private MenuVO toVOWithPath(SysMenu m, String fullPath, List<MenuVO> children) {
    return MenuVO.from(
        m.getId(),
        m.getName(),
        m.getPermission(),
        m.getType(),
        m.getSort(),
        m.getParentId(),
        fullPath != null ? fullPath : m.getPath(),
        m.getIcon(),
        m.getComponent(),
        m.getComponentName(),
        m.getStatus(),
        m.getVisible() != null && m.getVisible() == 1,
        m.getKeepAlive() != null && m.getKeepAlive() == 1,
        m.getAlwaysShow() != null && m.getAlwaysShow() == 1,
        children);
  }

  private MenuVO toVO(SysMenu m, List<MenuVO> children) {
    return MenuVO.from(
        m.getId(),
        m.getName(),
        m.getPermission(),
        m.getType(),
        m.getSort(),
        m.getParentId(),
        m.getPath(),
        m.getIcon(),
        m.getComponent(),
        m.getComponentName(),
        m.getStatus(),
        m.getVisible() != null && m.getVisible() == 1,
        m.getKeepAlive() != null && m.getKeepAlive() == 1,
        m.getAlwaysShow() != null && m.getAlwaysShow() == 1,
        children);
  }

  private void mapToEntity(MenuVO vo, SysMenu m) {
    if (vo.name() != null) m.setName(vo.name());
    if (vo.permission() != null) m.setPermission(vo.permission());
    if (vo.type() != null) m.setType(vo.type());
    if (vo.sort() != null) m.setSort(vo.sort());
    if (vo.parentId() != null) m.setParentId(vo.parentId());
    if (vo.path() != null) m.setPath(vo.path());
    if (vo.icon() != null) m.setIcon(vo.icon());
    if (vo.component() != null) m.setComponent(vo.component());
    if (vo.componentName() != null) m.setComponentName(vo.componentName());
    if (vo.status() != null) m.setStatus(vo.status());
    if (vo.visible() != null) m.setVisible(vo.visible() ? 1 : 0);
    if (vo.keepAlive() != null) m.setKeepAlive(vo.keepAlive() ? 1 : 0);
    if (vo.alwaysShow() != null) m.setAlwaysShow(vo.alwaysShow() ? 1 : 0);
  }
}
