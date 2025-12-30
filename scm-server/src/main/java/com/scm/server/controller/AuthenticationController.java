package com.scm.server.controller;

import com.scm.server.dto.AuthDto;
import com.scm.server.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthenticationResponse> register(
            @RequestBody AuthDto.RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthenticationResponse> authenticate(
            @RequestBody AuthDto.LoginRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}
