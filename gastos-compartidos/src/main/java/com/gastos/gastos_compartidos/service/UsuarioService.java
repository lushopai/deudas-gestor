package com.gastos.gastos_compartidos.service;

import java.util.Optional;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gastos.gastos_compartidos.dto.ActualizarPerfilDTO;
import com.gastos.gastos_compartidos.dto.CambiarPasswordDTO;
import com.gastos.gastos_compartidos.dto.RegistroRequestDTO;
import com.gastos.gastos_compartidos.dto.UsuarioResponseDTO;
import com.gastos.gastos_compartidos.entity.Pareja;
import com.gastos.gastos_compartidos.entity.Usuario;
import com.gastos.gastos_compartidos.exception.BadRequestException;
import com.gastos.gastos_compartidos.exception.ResourceNotFoundException;
import com.gastos.gastos_compartidos.repository.ParejaRepository;
import com.gastos.gastos_compartidos.repository.UsuarioRepository;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ParejaRepository parejaRepository;
    private final ObjectProvider<PasswordEncoder> passwordEncoderProvider;

    public UsuarioService(UsuarioRepository usuarioRepository, ParejaRepository parejaRepository,
            ObjectProvider<PasswordEncoder> passwordEncoderProvider) {
        this.usuarioRepository = usuarioRepository;
        this.parejaRepository = parejaRepository;
        this.passwordEncoderProvider = passwordEncoderProvider;
    }

    private PasswordEncoder getPasswordEncoder() {
        return passwordEncoderProvider.getIfAvailable(() -> {
            throw new IllegalStateException("PasswordEncoder not available");
        });
    }

    public Usuario registrarUsuario(RegistroRequestDTO request) {
        // Verificar que el email no exista
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("El email ya está registrado");
        }

        // Crear pareja (grupo)
        Pareja pareja = Pareja.builder()
                .nombrePareja(request.getNombrePareja() != null ? request.getNombrePareja()
                        : "Pareja de " + request.getNombre())
                .build();
        pareja = parejaRepository.save(pareja);

        // Crear usuario
        Usuario usuario = Usuario.builder()
                .email(request.getEmail())
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .password(getPasswordEncoder().encode(request.getPassword()))
                .pareja(pareja)
                .provider(Usuario.AuthProvider.LOCAL)
                .build();

        return usuarioRepository.save(usuario);
    }

    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + email));
    }

    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    public Usuario obtenerOCrearPorGoogleId(String googleId, String email, String nombre, String apellido,
            String fotoPerfil) {
        // Buscar por googleId
        Optional<Usuario> usuarioExistente = usuarioRepository.findByGoogleId(googleId);
        if (usuarioExistente.isPresent()) {
            return usuarioExistente.get();
        }

        // Si no existe, buscar por email
        Optional<Usuario> usuarioPorEmail = usuarioRepository.findByEmail(email);
        if (usuarioPorEmail.isPresent()) {
            return usuarioPorEmail.get();
        }

        // Crear nuevo usuario con Google
        Pareja pareja = Pareja.builder()
                .nombrePareja("Pareja de " + nombre)
                .build();
        pareja = parejaRepository.save(pareja);

        Usuario nuevoUsuario = Usuario.builder()
                .email(email)
                .nombre(nombre)
                .apellido(apellido)
                .googleId(googleId)
                .fotoPerfil(fotoPerfil)
                .provider(Usuario.AuthProvider.GOOGLE)
                .pareja(pareja)
                .build();

        return usuarioRepository.save(nuevoUsuario);
    }

    @Cacheable(value = "usuario-perfil", key = "#usuarioId")
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPerfil(Long usuarioId) {
        Usuario usuario = obtenerPorId(usuarioId);
        return UsuarioResponseDTO.fromEntity(usuario);
    }

    @CacheEvict(value = "usuario-perfil", key = "#usuarioId")
    public void cambiarPassword(Long usuarioId, CambiarPasswordDTO dto) {
        Usuario usuario = obtenerPorId(usuarioId);

        if (usuario.getProvider() != Usuario.AuthProvider.LOCAL) {
            throw new BadRequestException("No se puede cambiar la contraseña de una cuenta gestionada por Google");
        }

        if (!getPasswordEncoder().matches(dto.getPasswordActual(), usuario.getPassword())) {
            throw new BadRequestException("La contraseña actual es incorrecta");
        }

        usuario.setPassword(getPasswordEncoder().encode(dto.getPasswordNueva()));
        usuarioRepository.save(usuario);
    }

    @CacheEvict(value = "usuario-perfil", key = "#usuarioId")
    public UsuarioResponseDTO actualizarPerfil(Long usuarioId, ActualizarPerfilDTO dto) {
        Usuario usuario = obtenerPorId(usuarioId);

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            usuario.setNombre(dto.getNombre());
        }
        if (dto.getApellido() != null) {
            usuario.setApellido(dto.getApellido());
        }
        if (dto.getTelefono() != null) {
            usuario.setTelefono(dto.getTelefono());
        }
        if (dto.getBio() != null) {
            usuario.setBio(dto.getBio());
        }
        if (dto.getFotoPerfil() != null) {
            usuario.setFotoPerfil(dto.getFotoPerfil());
        }

        usuarioRepository.save(usuario);
        return UsuarioResponseDTO.fromEntity(usuario);
    }
}
