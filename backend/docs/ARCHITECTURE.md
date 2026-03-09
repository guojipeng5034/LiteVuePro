# 架构设计

## 1. 前端约束回顾

基于 LiteVuePro 分析：

| 项目 | 约定 |
|------|------|
| HTTP 客户端 | Alova (fetch 适配器) |
| 认证 | `Authorization: Bearer {token}`，Token 存 localStorage |
| baseURL | 环境变量 `VITE_API_BASE_URL` 或 `app.config.api_url` |
| 响应格式 | `{ code: 0|200, data?, message? }`，拦截器已解析为 `data` |
| 业务错误 | HTTP 200 + `code !== 0`，或 HTTP 4xx |
| 分页 | 请求 `pageNo`, `pageSize`；响应 `{ list, total }` |
| CORS | 需支持前端域名 |

## 2. 技术选型

### 2.1 推荐方案：Java + Spring Boot 3（满足 1 万并发）

| 维度 | 选型 | 理由 |
|------|------|------|
| 运行时 | Java 21+ | Virtual Threads（虚拟线程）原生支持高并发 |
| 框架 | Spring Boot 3.x | 生态成熟、企业级、易扩展 |
| Web 层 | Spring MVC（或 WebFlux） | MVC 配合 Virtual Threads 即可支撑 1 万并发 |
| ORM | Spring Data JPA / MyBatis-Plus | JPA 省心，MyBatis-Plus 灵活、SQL 可控 |
| 数据库 | MySQL 8 / PostgreSQL | 关系型 SQL，主从读写分离可扩展 |
| 连接池 | HikariCP | 高性能、默认内置 |
| 认证 | Spring Security + JWT | 与前端 Bearer 约定一致 |
| 缓存 | Redis | Session/Token 黑名单、热点数据、限流 |
| 校验 | Jakarta Validation (Bean Validation) | 声明式校验 |

### 2.2 1 万并发的关键设计

| 维度 | 策略 | 说明 |
|------|------|------|
| **线程模型** | Java 21 Virtual Threads | 轻量级线程，万级并发无压力，替代传统线程池 |
| **连接池** | HikariCP 按实例调优 | 单实例建议 50–100，多实例分摊；总连接数 &lt; DB max_connections |
| **水平扩展** | 多实例 + Nginx/负载均衡 | 如 4 实例 × 2500 并发 ≈ 1 万 |
| **缓存** | Redis 热点数据、权限、字典 | 降低 DB 压力，登录态可选 Redis Session |
| **异步 I/O** | 非 DB 阻塞操作考虑 CompletableFuture | 导出、外部调用等可异步 |
| **限流** | 网关/应用层限流 | 防止雪崩，保护下游 |
| **数据库** | 读写分离、索引优化 | 读多写少场景可主从分离 |
| **压测** | JMeter / Gatling | 须在接近生产环境压测验证 |

### 2.3 备选方案

| 场景 | 备选 | 适用条件 |
|------|------|----------|
| 更强响应式 | Spring WebFlux | 全链路非阻塞，复杂度较高 |
| 数据库 | SQL Server | 企业已有 MS 生态 |
| 简化栈 | Node.js + Fastify | 团队以 JS 为主，万级并发需多实例+调优 |

## 3. 分层架构

```
┌─────────────────────────────────────────────────────────┐
│  routes/          HTTP 层：路由、参数解析、调用 service  │
├─────────────────────────────────────────────────────────┤
│  services/        业务层：业务流程、事务边界             │
├─────────────────────────────────────────────────────────┤
│  repositories/   数据层：Prisma/DB 操作                 │
├─────────────────────────────────────────────────────────┤
│  middleware/      认证、日志、错误处理、CORS             │
└─────────────────────────────────────────────────────────┘
```

### 3.1 目录结构（Spring Boot 推荐）

```
backend/
├── src/main/java/com/xxx/
│   ├── XxxApplication.java
│   ├── config/           # 配置类、Security、Redis 等
│   ├── controller/       # REST 接口
│   │   ├── AuthController.java
│   │   └── system/
│   │       ├── MenuController.java
│   │       ├── DeptController.java
│   │       ├── UserController.java
│   │       ├── RoleController.java
│   │       ├── DictController.java
│   │       ├── AreaController.java
│   │       └── PermissionController.java
│   ├── service/          # 业务逻辑
│   ├── repository/       # JPA Repository 或 Mapper
│   ├── entity/           # JPA 实体
│   ├── dto/              # 请求/响应 DTO
│   ├── common/           # 统一响应、异常处理、工具
│   └── security/         # JWT 解析、权限
├── src/main/resources/
│   ├── application.yml
│   ├── application-*.yml
│   └── db/migration/     # Flyway 迁移脚本
├── pom.xml
└── Dockerfile
```

## 4. 认证与权限

### 4.1 JWT 流程

1. 登录：`POST /api/auth/login` → 校验账号密码 → 签发 JWT → 返回 `{ token, refreshToken?, user }`
2. 鉴权：`Authorization: Bearer <token>` → 解析 JWT → 注入 `req.user`
3. 登出：`POST /api/auth/logout` → 可选加入黑名单（Redis）或仅前端清除

### 4.2 权限模型

- **RBAC**：用户 → 角色 → 菜单/权限
- **数据权限**：角色 `dataScope`（1=全部 2=本部门 3=本部门及子 4=自定义 5=本人）
- 权限标识与前端 `meta.permissions` 对应，如 `system:menu:create`

## 5. 数据库设计要点

- **用户**：username（唯一）、password_hash、dept_id、status
- **角色**：name、code、data_scope、data_scope_dept_ids(JSON)
- **菜单**：树形 parent_id，type(1目录2菜单3按钮)，path、component、permission
- **部门**：树形 parent_id
- **字典**：dict_type ↔ dict_data 一对多
- **权限关联**：user_role、role_menu、role_dept（数据权限）

## 6. 部署架构（1 万并发）

```
                         ┌─────────────┐
                         │  Nginx/LB   │  负载均衡、限流
                         └──────┬──────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
  ┌─────▼─────┐           ┌─────▼─────┐           ┌─────▼─────┐
  │  Backend  │           │  Backend  │           │  Backend  │  多实例水平扩展
  │ Instance1 │           │ Instance2 │           │ InstanceN │  (Virtual Threads)
  └─────┬─────┘           └─────┬─────┘           └─────┬─────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
        ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
        │  MySQL/   │      │   Redis   │      │   MySQL   │
        │ Postgres  │      │ (缓存/限流)│      │  从库可选  │
        │  (主库)   │      └───────────┘      └───────────┘
        └───────────┘
```

- **开发**：单实例 + 本地 MySQL/PostgreSQL + Redis（可选）
- **生产**：多实例（建议 4+）+ HikariCP 连接池调优 + Redis + 读写分离（按需）
- **压测**：JMeter 模拟 1 万并发，验证 P99 延迟与错误率

## 7. ADR 摘要

| 决策 | 结论 |
|------|------|
| ADR-001 技术栈 | Java 21+ + Spring Boot 3 + JPA/MyBatis + MySQL/PostgreSQL |
| ADR-002 认证 | JWT Bearer，与前端约定一致 |
| ADR-003 响应格式 | `{ code, data, message }`，与前端拦截器兼容 |
| ADR-004 分页 | `pageNo`/`pageSize`，`{ list, total }` |
| ADR-005 并发 | Virtual Threads + 多实例 + Redis + 连接池调优，目标 1 万并发 |
