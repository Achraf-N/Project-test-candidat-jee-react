package com.tsix.apirest.security;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.enterprise.context.ApplicationScoped;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

@ApplicationScoped
public class JwtUtils {
    private  static final String SECRET = System.getenv("SECRET");
    private static final long EXPIRATION_TIME = 864_000_000;
    private final static Key key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    public static String generateToken(Long id , UUID idEnterprise) {
        return Jwts.builder()
                .subject(id.toString())
                .claim("enterprise" , idEnterprise != null ? idEnterprise.toString() : "null")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact() ;
    }

    public boolean isValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith((SecretKey) key)
                    .build()
                    .parseSignedClaims(token) ;

            return true ;
        } catch (JwtException e) {
            return false ;
        }
    }

    /**
     * Extract user data (subject and claims) from JWT token
     * @param token JWT token string
     * @return UserPrincipal containing userId and enterpriseId, or null if token is invalid
     */
    public UserPrincipal extractUserData(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith((SecretKey) key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Long userId = Long.parseLong(claims.getSubject());

            String enterpriseIdStr = claims.get("enterprise", String.class);
            UUID enterpriseId = null;

            if (enterpriseIdStr != null && !"null".equals(enterpriseIdStr)) {
                try {
                    enterpriseId = UUID.fromString(enterpriseIdStr);
                } catch (NumberFormatException e) {}
            }

            return new UserPrincipal(userId, enterpriseId);
        } catch (JwtException | NumberFormatException e) {
            return null;
        }
    }

    public Long getUserId(String token) {
        UserPrincipal principal = extractUserData(token);
        return principal != null ? principal.getUserId() : null;
    }

    public UUID getEnterpriseId(String token) {
        UserPrincipal principal = extractUserData(token);
        return principal != null ? principal.getEnterpriseId() : null;
    }
}


