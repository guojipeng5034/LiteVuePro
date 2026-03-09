package com.litevuepro.config;

import com.litevuepro.entity.SysUser;
import com.litevuepro.repository.SysUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 开发环境：确保 admin/123456 可登录（若 Flyway 初始 hash 与本地 BCrypt 版本不兼容）
 */
@Component
@Profile({"dev", "dev-no-redis"})
public class DataInitRunner implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(DataInitRunner.class);

  private final SysUserRepository userRepo;
  private final PasswordEncoder encoder;

  public DataInitRunner(SysUserRepository userRepo, PasswordEncoder encoder) {
    this.userRepo = userRepo;
    this.encoder = encoder;
  }

  @Override
  public void run(String... args) {
    userRepo.findByUsernameAndStatus("admin", 1).ifPresent(user -> {
      String correctHash = encoder.encode("123456");
      user.setPasswordHash(correctHash);
      userRepo.save(user);
      log.info("Dev: ensured admin/123456 login");
    });
  }
}
