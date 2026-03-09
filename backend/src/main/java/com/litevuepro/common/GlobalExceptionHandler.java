package com.litevuepro.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.UnexpectedRollbackException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ApiResponse<Void>> handleBadCredentials(
      BadCredentialsException e, HttpServletRequest req) {
    log.warn("Login failed: {}", e.getMessage());
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.error(401, "用户名或密码错误"));
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ApiResponse<Void>> handleAuth(AuthenticationException e, HttpServletRequest req) {
    log.warn("Auth error: {}", e.getMessage());
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.error(401, e.getMessage()));
  }

  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException e, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.error(e.getCode(), e.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e, HttpServletRequest req) {
    String msg = e.getBindingResult().getFieldErrors().stream()
        .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
        .collect(Collectors.joining("; "));
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.error(400, msg));
  }

  @ExceptionHandler(BindException.class)
  public ResponseEntity<ApiResponse<Void>> handleBind(BindException e, HttpServletRequest req) {
    String msg = e.getBindingResult().getFieldErrors().stream()
        .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
        .collect(Collectors.joining("; "));
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.error(400, msg));
  }

  /** 唯一约束冲突（含重复提交导致的 duplicate key），返回友好提示 */
  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException e, HttpServletRequest req) {
    String msg = e.getMessage();
    if (msg != null && (msg.contains("Duplicate entry") || msg.contains("duplicate key") || msg.contains("uk_"))) {
      log.warn("Duplicate key (possible double submit): {}", msg);
      return ResponseEntity.status(HttpStatus.OK)
          .body(ApiResponse.error(409, "数据已存在，请刷新后重试"));
    }
    log.warn("Data integrity violation: {}", msg);
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.error(409, "数据约束冲突，请检查后重试"));
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ApiResponse<Void>> handleConstraint(ConstraintViolationException e, HttpServletRequest req) {
    String msg = e.getConstraintViolations().stream()
        .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
        .collect(Collectors.joining("; "));
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.error(400, msg));
  }

  /**
   * DELETE 请求的乐观锁异常（并发删除或已删除）视为幂等成功，避免前端报错。
   */
  @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
  public ResponseEntity<ApiResponse<Void>> handleOptimisticLock(
      ObjectOptimisticLockingFailureException e, HttpServletRequest req) {
    if ("DELETE".equalsIgnoreCase(req.getMethod())) {
      log.debug("Optimistic lock on DELETE (idempotent ok): {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.OK)
          .body(ApiResponse.success());
    }
    log.warn("Optimistic lock failure: {}", e.getMessage());
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.error(409, "数据已被其他操作修改，请刷新后重试"));
  }

  /** UnexpectedRollbackException 若由乐观锁引起，且为 DELETE，则视为幂等成功。 */
  @ExceptionHandler(UnexpectedRollbackException.class)
  public ResponseEntity<ApiResponse<Void>> handleUnexpectedRollback(
      UnexpectedRollbackException e, HttpServletRequest req) {
    Throwable cause = e.getCause();
    if ("DELETE".equalsIgnoreCase(req.getMethod())
        && cause instanceof ObjectOptimisticLockingFailureException) {
      log.debug("Rollback from optimistic lock on DELETE (idempotent ok): {}", cause.getMessage());
      return ResponseEntity.status(HttpStatus.OK)
          .body(ApiResponse.success());
    }
    log.warn("Unexpected rollback: {}", e.getMessage());
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.error(500, "事务回滚，请稍后重试"));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleOther(Exception e, HttpServletRequest req) {
    log.error("Unhandled error", e);
    return ResponseEntity.status(HttpStatus.OK)
        .body(ApiResponse.error(500, "服务器内部错误"));
  }
}
