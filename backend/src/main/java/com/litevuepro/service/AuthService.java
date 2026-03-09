package com.litevuepro.service;

import com.litevuepro.common.BusinessException;
import com.litevuepro.dto.LoginRequest;
import com.litevuepro.dto.LoginResponse;
import com.litevuepro.dto.UserInfoVO;
import com.litevuepro.entity.SysMenu;
import com.litevuepro.entity.SysRole;
import com.litevuepro.entity.SysUser;
import com.litevuepro.repository.SysMenuRepository;
import com.litevuepro.repository.SysRoleMenuRepository;
import com.litevuepro.repository.SysRoleRepository;
import com.litevuepro.repository.SysUserRepository;
import com.litevuepro.repository.SysUserRoleRepository;
import com.litevuepro.security.JwtService;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

  private final SysUserRepository userRepo;
  private final SysUserRoleRepository userRoleRepo;
  private final SysRoleRepository roleRepo;
  private final SysRoleMenuRepository roleMenuRepo;
  private final SysMenuRepository menuRepo;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(SysUserRepository userRepo, SysUserRoleRepository userRoleRepo,
      SysRoleRepository roleRepo, SysRoleMenuRepository roleMenuRepo, SysMenuRepository menuRepo,
      PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepo = userRepo;
    this.userRoleRepo = userRoleRepo;
    this.roleRepo = roleRepo;
    this.roleMenuRepo = roleMenuRepo;
    this.menuRepo = menuRepo;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public LoginResponse login(LoginRequest req) {
    SysUser user = userRepo.findByUsernameAndStatus(req.username(), 1)
        .orElseThrow(() -> new BusinessException(401, "用户名或密码错误"));

    if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
      throw new BusinessException(401, "用户名或密码错误");
    }

    String token = jwtService.generateToken(user.getId(), user.getUsername());
    String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getUsername());
    UserInfoVO userInfo = toUserInfo(user);
    return new LoginResponse(token, refreshToken, userInfo);
  }

  public LoginResponse refreshToken(String refreshToken) {
    if (refreshToken == null || refreshToken.isBlank()) {
      throw new BusinessException(401, "refreshToken 不能为空");
    }
    JwtService.JwtClaims claims = jwtService.parseToken(refreshToken, "refresh");
    if (claims == null) {
      throw new BusinessException(401, "refreshToken 无效或已过期");
    }
    SysUser user = userRepo.findById(claims.userId())
        .orElseThrow(() -> new BusinessException(401, "用户不存在"));
    if (user.getStatus() != 1) {
      throw new BusinessException(401, "用户已禁用");
    }
    String newToken = jwtService.generateToken(user.getId(), user.getUsername());
    String newRefreshToken = jwtService.generateRefreshToken(user.getId(), user.getUsername());
    UserInfoVO userInfo = toUserInfo(user);
    return new LoginResponse(newToken, newRefreshToken, userInfo);
  }

  public UserInfoVO getUserInfo(long userId) {
    SysUser user = userRepo.findById(userId)
        .orElseThrow(() -> new BusinessException(401, "用户不存在"));
    return toUserInfo(user);
  }

  private UserInfoVO toUserInfo(SysUser u) {
    List<String> roles = resolveUserRoles(u.getId());
    List<String> permissions = resolveUserPermissions(u.getId());
    return UserInfoVO.from(
        u.getId(),
        u.getUsername(),
        u.getNickname(),
        u.getEmail(),
        u.getAvatar(),
        roles,
        permissions);
  }

  /** 用户角色 code 列表：sys_user_role → sys_role.code */
  private List<String> resolveUserRoles(Long userId) {
    List<Long> roleIds = userRoleRepo.findAllByUserId(userId).stream()
        .map(ur -> ur.getRoleId()).toList();
    if (roleIds.isEmpty()) return List.of();
    List<SysRole> roles = roleRepo.findAllById(roleIds);
    return roles.stream()
        .filter(r -> r.getStatus() != null && r.getStatus() == 0)
        .map(SysRole::getCode)
        .filter(c -> c != null && !c.isBlank())
        .toList();
  }

  /** 用户权限列表：用户角色 → sys_role_menu → sys_menu.permission 去重（非空） */
  private List<String> resolveUserPermissions(Long userId) {
    List<Long> roleIds = userRoleRepo.findAllByUserId(userId).stream()
        .map(ur -> ur.getRoleId()).toList();
    if (roleIds.isEmpty()) return List.of();
    Set<Long> menuIds = new LinkedHashSet<>();
    for (Long roleId : roleIds) {
      roleMenuRepo.findByRoleId(roleId).stream()
          .map(rm -> rm.getMenuId())
          .forEach(menuIds::add);
    }
    if (menuIds.isEmpty()) return List.of();
    List<SysMenu> menus = menuRepo.findAllById(menuIds);
    return menus.stream()
        .map(SysMenu::getPermission)
        .filter(p -> p != null && !p.isBlank())
        .distinct()
        .toList();
  }
}
