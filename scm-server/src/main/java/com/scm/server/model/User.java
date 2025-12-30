package com.scm.server.model;

import jakarta.persistence.*; //JPA annotations
import lombok.AllArgsConstructor; //Lombok annotations
import lombok.Builder; //Lombok annotations
import lombok.Data; //Lombok annotations
import lombok.NoArgsConstructor; //Lombok annotations
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Data // Lombok annotations
@Builder // Lombok annotations
@NoArgsConstructor // Lombok annotations
@AllArgsConstructor // Lombok annotations
@Entity // JPA annotations
@Table(name = "users") // 'user' is a reserved keyword in Postgres
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // JPA annotations
    private UUID id;

    @Column(unique = true, nullable = false) // JPA annotations
    private String username;

    @Column(nullable = false)
    private String password; // Hashed

    @Enumerated(EnumType.STRING) // JPA annotations
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean active = true; // JPA annotations

    // UserDetails methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name())); // Spring Security
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
