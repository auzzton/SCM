package com.scm.server.service;

import com.scm.server.config.JwtService;
import com.scm.server.dto.AuthDto;
import com.scm.server.model.Role;
import com.scm.server.model.User;
import com.scm.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthDto.AuthenticationResponse register(AuthDto.RegisterRequest request) {
        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.VIEWER)
                .active(true)
                .build();
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return AuthDto.AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole())
                .build();
    }

    public AuthDto.AuthenticationResponse authenticate(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthDto.AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole())
                .build();
    }

    // Create initial admin if not exists
    public void createInitialAdmin() {
        if (repository.count() == 0) {
            register(AuthDto.RegisterRequest.builder()
                    .username("admin")
                    .password("admin123")
                    .role(Role.ADMIN)
                    .build());
            System.out.println("Initial Admin created: admin / admin123");
        }
    }
}
