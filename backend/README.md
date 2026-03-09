# LiteVuePro 后端

Java 21 + Spring Boot 3 + MySQL + Virtual Threads（见 `docs/` 架构与开发规范）

**前置**：JDK 21、Maven 3.9+、本地 MySQL 8

## 快速开始

### 1. 创建数据库

在 Cursor 终端执行（密码 123456 可替换为你的 root 密码）：

```powershell
cd backend/db; $env:MYSQL_PASS='123456'; .\init-db.ps1
```

或直接：`echo "CREATE DATABASE IF NOT EXISTS litevuepro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" | mysql -u root -p`

### 2. 配置

编辑 `application.yml` 或设置环境变量：

- `MYSQL_PASS`：MySQL 密码（默认 123456）
- `JWT_SECRET`：JWT 密钥，至少 32 字符

### 3. 运行

```bash
cd backend
mvn spring-boot:run
```

开发环境建议加 profile `dev`，确保 admin/123456 可用（兼容不同 BCrypt 实现）：
```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```
无 Redis 时使用 `dev,dev-no-redis`，将 fallback 到内存缓存。

服务端口 `3001`。Flyway 自动执行迁移，初始化 `sys_user` 及管理员账号 `admin/123456`。

### 4. 接口一览

**认证**：`/api/auth/login`、`/api/auth/user`、`/api/auth/logout`  
**系统管理**：菜单、部门、用户、角色、字典类型、字典数据、地区、权限  
**API 文档**：`/swagger-ui.html`  
**限流**：100 req/s（可配置 `resilience4j.ratelimiter.instances.api`）  
**文档**：`docs/ARCHITECTURE.md`、`docs/DEVELOPMENT-STANDARDS.md`

### 5. 前端对接

1. 在项目根目录创建 `.env.development`（或 `.env.local`），写入：
   ```
   VITE_API_BASE_URL=http://localhost:3001
   ```
2. 启动后端：`cd backend && mvn spring-boot:run "-Dspring-boot.run.profiles=dev"`
3. 启动前端：`pnpm dev`
4. 登录：`admin` / `123456`

CORS 已允许 `localhost:3000`、`localhost:5173` 及 127.0.0.1 对应端口。

### 6. Docker 部署

```powershell
cd backend
mvn package -DskipTests
docker compose up -d
```

多实例：`docker compose up -d --scale backend=2`
