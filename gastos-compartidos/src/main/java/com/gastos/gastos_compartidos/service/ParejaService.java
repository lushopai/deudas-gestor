package com.gastos.gastos_compartidos.service;

import com.gastos.gastos_compartidos.dto.ParejaResponseDTO;
import com.gastos.gastos_compartidos.entity.Pareja;
import com.gastos.gastos_compartidos.entity.Usuario;
import com.gastos.gastos_compartidos.exception.BadRequestException;
import com.gastos.gastos_compartidos.exception.ResourceNotFoundException;
import com.gastos.gastos_compartidos.repository.ParejaRepository;
import com.gastos.gastos_compartidos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ParejaService {

    private final ParejaRepository parejaRepository;
    private final UsuarioRepository usuarioRepository;

    public Pareja obtenerParejaDelUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        if (usuario.getPareja() == null) {
            throw new BadRequestException("El usuario no está asociado a una pareja");
        }

        return usuario.getPareja();
    }

    public Pareja unirParejaConCodigo(Long usuarioId, String codigoInvitacion) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Pareja pareja = parejaRepository.findByCodigoInvitacion(codigoInvitacion)
            .orElseThrow(() -> new ResourceNotFoundException("Código de invitación inválido"));

        // Verificar que la pareja destino tenga menos de 2 usuarios
        if (pareja.getUsuarios().size() >= 2) {
            throw new BadRequestException("La pareja ya tiene el máximo de miembros (2)");
        }

        // Verificar que no intente unirse a su propia pareja
        if (usuario.getPareja() != null && usuario.getPareja().getId().equals(pareja.getId())) {
            throw new BadRequestException("Ya perteneces a esta pareja");
        }

        // Si el usuario tiene una pareja previa con solo 1 miembro (él mismo),
        // eliminar esa pareja vacía antes de unirse a la nueva
        if (usuario.getPareja() != null) {
            Pareja parejaAnterior = usuario.getPareja();
            if (parejaAnterior.getUsuarios().size() <= 1) {
                usuario.setPareja(null);
                usuarioRepository.save(usuario);
                parejaRepository.delete(parejaAnterior);
            } else {
                throw new BadRequestException("Ya estás asociado a una pareja con otro miembro");
            }
        }

        // Asociar el usuario a la nueva pareja
        usuario.setPareja(pareja);
        usuarioRepository.save(usuario);

        return pareja;
    }

    public ParejaResponseDTO obtenerDetallePareja(Long parejaId) {
        Pareja pareja = parejaRepository.findById(parejaId)
            .orElseThrow(() -> new ResourceNotFoundException("Pareja no encontrada"));

        return ParejaResponseDTO.fromEntity(pareja);
    }

    public String generarCodigoInvitacion(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Si el usuario no tiene pareja, crear una nueva
        if (usuario.getPareja() == null) {
            Pareja nuevaPareja = Pareja.builder()
                .nombrePareja("Pareja de " + usuario.getNombre())
                .build();

            parejaRepository.save(nuevaPareja);

            // Asociar el usuario a la nueva pareja
            usuario.setPareja(nuevaPareja);
            usuarioRepository.save(usuario);

            return nuevaPareja.getCodigoInvitacion();
        }

        return usuario.getPareja().getCodigoInvitacion();
    }
}
