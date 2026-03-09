# LiteVuePro 后端文档

## 文档结构

| 文档 | 说明 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 技术架构：选型、分层、认证、部署、1 万并发 |
| [DEVELOPMENT-STANDARDS.md](./DEVELOPMENT-STANDARDS.md) | 开发规范：JPA/TINYINT、Maven、Flyway、分页等 |
| [ADR/](./ADR/) | 架构决策记录 |

## 技术栈摘要

- Java 21+ + Spring Boot 3 + JPA + MySQL
- Virtual Threads + 多实例 + Redis → 1 万并发目标
- Bearer Token / `{ code, data, message }` / `pageNo`+`pageSize`
