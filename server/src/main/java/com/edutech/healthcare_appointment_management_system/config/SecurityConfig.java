package com.edutech.healthcare_appointment_management_system.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.edutech.healthcare_appointment_management_system.jwt.JwtRequestFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors().and()
                .csrf().disable()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests(auth -> auth

                        // ✅ PREFLIGHT — must be first
                        .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ DELETE — FULLY OPEN
                        .antMatchers(HttpMethod.DELETE, "/**").permitAll()

                        // ✅ PUT — FULLY OPEN
                        .antMatchers(HttpMethod.PUT, "/**").permitAll()

                        // ================= OPEN =================
                        .antMatchers(
                                "/api/patient/register",
                                "/api/doctors/register",
                                "/api/receptionist/register",
                                "/api/user/login",
                                "/api/delete/**"       // ✅ POST delete workaround
                        ).permitAll()

                        // ================= PATIENT =================
                        .antMatchers(
                                "/api/patient/doctors",
                                "/api/patient/appointment",
                                "/api/patient/appointments",
                                "/api/patient/medicalrecords"
                        ).hasAuthority("PATIENT")

                        // ================= DOCTOR =================
                        .antMatchers(
                                "/api/doctor/appointments",
                                "/api/doctor/availability"
                        ).hasAuthority("DOCTOR")

                        // ================= RECEPTIONIST =================
                        .antMatchers(
                                "/api/receptionist/appointments",
                                "/api/receptionist/appointment",
                                "/api/receptionist/appointment-reschedule/**"
                        ).hasAuthority("RECEPTIONIST")

                        // ================= DEFAULT =================
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}