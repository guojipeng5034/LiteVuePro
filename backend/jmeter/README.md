# LiteVuePro 压测指南（1 万并发）

## 前置

- 安装 [JMeter](https://jmeter.apache.org/download_jmeter.cgi) 5.6+
- 后端已启动：`mvn spring-boot:run "-Dspring-boot.run.profiles=dev,dev-no-redis"`

## 快速压测（命令行）

```bash
# 进入 jmeter 目录
cd backend/jmeter

# 健康检查压测：1000 线程，每线程 10 次请求
jmeter -n -t litevuepro-10k.jmx -Jthreads=1000 -Jloops=10 -Jrampup=60 -l result.jtl

# 查看汇总
jmeter -g result.jtl -o report/
```

## 场景说明

| 变量 | 默认 | 说明 |
|------|------|------|
| `HOST` | localhost | 后端地址 |
| `PORT` | 3001 | 后端端口 |
| `threads` | 1000 | 并发线程数 |
| `rampup` | 60 |  ramp-up 秒数 |
| `loops` | 10 | 每线程循环次数 |

**1 万并发**：`-Jthreads=10000 -Jloops=1 -Jrampup=120`

## 目标（ADR-005）

- P99 延迟 < 500ms
- 错误率 < 0.1%
- 总请求 ≈ threads × loops

## 调优建议

- 压测前：限流可临时调高 `resilience4j.ratelimiter.instances.api.limitForPeriod`
- 多实例：`docker compose up -d --scale backend=4` 后压测 Nginx/负载均衡入口
