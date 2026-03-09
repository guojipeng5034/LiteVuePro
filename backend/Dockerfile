# LiteVuePro Backend - Java 21
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# 非 root 用户
RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app
USER app

# 构建：mvn package -DskipTests
COPY target/backend-*.jar app.jar

ENV JAVA_OPTS="-Xms256m -Xmx512m"
EXPOSE 3001

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
