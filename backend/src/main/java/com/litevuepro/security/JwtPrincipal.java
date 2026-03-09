package com.litevuepro.security;

public record JwtPrincipal(long userId, String username) {

  public static JwtPrincipal from(Object principal) {
    if (principal instanceof JwtPrincipal p) {
      return p;
    }
    return null;
  }

  public static long currentUserId() {
    JwtPrincipal p = current();
    return p != null ? p.userId() : 0L;
  }

  public static JwtPrincipal current() {
    var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
      return null;
    }
    return from(auth.getPrincipal());
  }
}
