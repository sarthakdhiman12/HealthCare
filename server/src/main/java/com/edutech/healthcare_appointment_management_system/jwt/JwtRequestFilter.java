package com.edutech.healthcare_appointment_management_system.jwt;

import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    @Lazy
    private UserDetailsService userDetailsService;

    // ✅ SKIP FILTER FOR OPTIONS (preflight) REQUESTS
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        final String header = request.getHeader("Authorization");

        String username = null;
        String token = null;
        String role = null;

        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);

            try {
                Claims claims = jwtUtil.extractAllClaims(token);

                username = claims.getSubject();
                role = claims.get("role", String.class);

                System.out.println("JWT USERNAME: " + username);
                System.out.println("JWT ROLE: " + role);

            } catch (Exception e) {
                System.out.println("Invalid JWT Token: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.validateToken(token, userDetails.getUsername())) {

                    // ✅ MAKE SURE ROLE IS UPPERCASE
                    String authority = (role != null) ? role.toUpperCase() : "USER";

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    Collections.singletonList(
                                            new SimpleGrantedAuthority(authority)
                                    )
                            );

                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    System.out.println("AUTH SET FOR: " + username);
                    System.out.println("AUTH AUTHORITY: " + authority);
                    System.out.println("AUTH AUTHORITIES: " + authToken.getAuthorities());

                } else {
                    System.out.println("JWT validation failed");
                }

            } catch (Exception e) {
                System.out.println("JWT auth error: " + e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }
}