# 后端开发规范

基于 LiteVuePro 后端实现经验总结的约束与约定，供后续开发与 AI 协作参考。

---

## 1. JPA 实体与 MySQL 类型映射

### 1.1 TINYINT 必须显式声明

**问题**：MySQL 的 `TINYINT` 与 Hibernate 默认映射不一致。`Integer` 默认映射为 `INTEGER`，当数据库列为 `TINYINT` 时，`ddl-auto: validate` 会报错：

```
Schema-validation: wrong column type encountered in column [status]; 
found [tinyint (Types#TINYINT)], but expecting [integer (Types#INTEGER)]
```

**规范**：数据库使用 `TINYINT` 的列，JPA 实体须加 `columnDefinition`：

```java
@Column(nullable = false, columnDefinition = "TINYINT")
private Integer status = 0;
```

**适用字段**：`status`、`type`、`visible`、`keep_alive`、`always_show` 等取值范围小（0–255）的整数。

### 1.2 类型对应表

| MySQL 类型 | JPA 映射 | 说明 |
|------------|----------|------|
| TINYINT    | Integer + `columnDefinition = "TINYINT"` | 状态、类型等 |
| INT / BIGINT | Integer / Long | 默认映射即可 |
| VARCHAR   | String + `length` | 按需 |
| DATETIME  | LocalDateTime | 默认映射 |

---

## 2. Maven / PowerShell

PowerShell 中 `-D` 参数会被解析，需加引号：

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

---

## 3. 运行目录

`spring-boot:run` 须在 `backend/` 目录执行，根目录无 Spring Boot 插件：

```powershell
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

---

## 4. Flyway 与 MCP 建表

若通过 MCP 提前建表，须将 `spring.flyway.baseline-version` 设为已执行的最高迁移版本，否则 Flyway 会重复执行或报错。

---

## 5. 分页查询

- 统一使用 `PageResult<T>(List<T> list, long total)` 响应；参数 `pageNo`/`pageSize`。
- Repository 继承 `JpaSpecificationExecutor` 实现动态条件；`Specification` 无条件时返回 `null` 表示查全部。

---

## 6. 参考

- [ADR-001 技术栈](./ADR/001-technology-stack.md)
- [ADR-005 1 万并发](./ADR/005-concurrency-10k.md)
