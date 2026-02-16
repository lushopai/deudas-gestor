package com.gastos.gastos_compartidos.service;

import com.gastos.gastos_compartidos.dto.*;
import com.gastos.gastos_compartidos.entity.*;
import com.gastos.gastos_compartidos.exception.BadRequestException;
import com.gastos.gastos_compartidos.exception.ResourceNotFoundException;
import com.gastos.gastos_compartidos.repository.AbonoDeudaRepository;
import com.gastos.gastos_compartidos.repository.DeudaRepository;
import com.gastos.gastos_compartidos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeudaService {

    private final DeudaRepository deudaRepository;
    private final AbonoDeudaRepository abonoDeudaRepository;
    private final UsuarioRepository usuarioRepository;
    private final WebPushService webPushService;

    @Transactional
    public DeudaResponseDTO crearDeuda(Long usuarioId, DeudaCreateDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Deuda deuda = Deuda.builder()
                .usuario(usuario)
                .acreedor(dto.getAcreedor())
                .descripcion(dto.getDescripcion())
                .tipo(dto.getTipo())
                .montoOriginal(dto.getMontoOriginal())
                .saldoPendiente(dto.getMontoOriginal())
                .estado(EstadoDeuda.ACTIVA)
                .fechaInicio(dto.getFechaInicio() != null ? dto.getFechaInicio() : LocalDate.now())
                .fechaVencimiento(dto.getFechaVencimiento())
                .diaCorte(dto.getDiaCorte())
                .diaLimitePago(dto.getDiaLimitePago())
                .tasaInteres(dto.getTasaInteres())
                .build();

        deuda = deudaRepository.save(deuda);
        return DeudaResponseDTO.fromEntity(deuda);
    }

    public List<DeudaResponseDTO> obtenerDeudasUsuario(Long usuarioId) {
        return deudaRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
                .stream()
                .map(DeudaResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<DeudaResponseDTO> obtenerDeudasActivas(Long usuarioId) {
        return deudaRepository.findByUsuarioIdAndEstadoOrderByFechaCreacionDesc(usuarioId, EstadoDeuda.ACTIVA)
                .stream()
                .map(DeudaResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<DeudaResponseDTO> obtenerDeudasUsuarioPaginado(Long usuarioId, boolean soloActivas, Pageable pageable) {
        if (soloActivas) {
            return deudaRepository
                    .findByUsuarioIdAndEstadoOrderByFechaCreacionDesc(usuarioId, EstadoDeuda.ACTIVA, pageable)
                    .map(DeudaResponseDTO::fromEntity);
        }
        return deudaRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId, pageable)
                .map(DeudaResponseDTO::fromEntity);
    }

    public DeudaResponseDTO obtenerDeuda(Long usuarioId, Long deudaId) {
        Deuda deuda = obtenerDeudaYValidar(usuarioId, deudaId);

        List<AbonoDeudaResponseDTO> abonos = abonoDeudaRepository
                .findByDeudaIdOrderByFechaPagoDesc(deudaId, PageRequest.of(0, 5))
                .stream()
                .map(AbonoDeudaResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return DeudaResponseDTO.fromEntityWithAbonos(deuda, abonos);
    }

    @Transactional
    public DeudaResponseDTO actualizarDeuda(Long usuarioId, Long deudaId, DeudaCreateDTO dto) {
        Deuda deuda = obtenerDeudaYValidar(usuarioId, deudaId);

        deuda.setAcreedor(dto.getAcreedor());
        deuda.setDescripcion(dto.getDescripcion());
        deuda.setTipo(dto.getTipo());
        deuda.setFechaVencimiento(dto.getFechaVencimiento());
        deuda.setDiaCorte(dto.getDiaCorte());
        deuda.setDiaLimitePago(dto.getDiaLimitePago());
        deuda.setTasaInteres(dto.getTasaInteres());

        if (!deuda.getAbonos().isEmpty() && !deuda.getMontoOriginal().equals(dto.getMontoOriginal())) {
            throw new BadRequestException("No se puede modificar el monto original de una deuda que ya tiene abonos");
        }

        if (deuda.getAbonos().isEmpty()) {
            deuda.setMontoOriginal(dto.getMontoOriginal());
            deuda.setSaldoPendiente(dto.getMontoOriginal());
        }

        deuda = deudaRepository.save(deuda);
        return DeudaResponseDTO.fromEntity(deuda);
    }

    @Transactional
    public void eliminarDeuda(Long usuarioId, Long deudaId) {
        Deuda deuda = obtenerDeudaYValidar(usuarioId, deudaId);
        deudaRepository.delete(deuda);
    }

    @Transactional
    public DeudaResponseDTO cancelarDeuda(Long usuarioId, Long deudaId) {
        Deuda deuda = obtenerDeudaYValidar(usuarioId, deudaId);
        deuda.setEstado(EstadoDeuda.CANCELADA);
        deuda = deudaRepository.save(deuda);
        return DeudaResponseDTO.fromEntity(deuda);
    }

    @Transactional
    public AbonoDeudaResponseDTO registrarAbono(Long usuarioId, Long deudaId, AbonoDeudaCreateDTO dto) {
        Deuda deuda = obtenerDeudaYValidar(usuarioId, deudaId);

        if (deuda.getEstado() != EstadoDeuda.ACTIVA) {
            throw new BadRequestException("No se puede abonar a una deuda que no está activa");
        }

        if (dto.getMonto().compareTo(deuda.getSaldoPendiente()) > 0) {
            throw new BadRequestException(
                    "El monto del abono no puede ser mayor al saldo pendiente ($" + deuda.getSaldoPendiente() + ")");
        }

        AbonoDeuda abono = AbonoDeuda.builder()
                .deuda(deuda)
                .monto(dto.getMonto())
                .fechaPago(dto.getFechaPago() != null ? dto.getFechaPago() : LocalDate.now())
                .metodoPago(dto.getMetodoPago() != null ? dto.getMetodoPago() : MetodoPago.TRANSFERENCIA)
                .comprobante(dto.getComprobante())
                .notas(dto.getNotas())
                .build();

        abono = abonoDeudaRepository.save(abono);

        deuda.registrarAbono(dto.getMonto());
        deudaRepository.save(deuda);

        return AbonoDeudaResponseDTO.fromEntity(abono);
    }

    public List<AbonoDeudaResponseDTO> obtenerAbonosDeuda(Long usuarioId, Long deudaId) {
        obtenerDeudaYValidar(usuarioId, deudaId);

        return abonoDeudaRepository.findByDeudaIdOrderByFechaPagoDesc(deudaId)
                .stream()
                .map(AbonoDeudaResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void eliminarAbono(Long usuarioId, Long deudaId, Long abonoId) {
        Deuda deuda = obtenerDeudaYValidar(usuarioId, deudaId);

        AbonoDeuda abono = abonoDeudaRepository.findById(abonoId)
                .orElseThrow(() -> new ResourceNotFoundException("Abono no encontrado"));

        if (!abono.getDeuda().getId().equals(deudaId)) {
            throw new BadRequestException("El abono no pertenece a esta deuda");
        }

        deuda.setSaldoPendiente(deuda.getSaldoPendiente().add(abono.getMonto()));
        if (deuda.getEstado() == EstadoDeuda.PAGADA) {
            deuda.setEstado(EstadoDeuda.ACTIVA);
        }

        abonoDeudaRepository.delete(abono);
        deudaRepository.save(deuda);
    }

    public ResumenDeudasDTO obtenerResumen(Long usuarioId) {
        BigDecimal totalPendiente = deudaRepository.calcularTotalDeudaPendiente(usuarioId);
        long cantidadActivas = deudaRepository.countByUsuarioIdAndEstado(usuarioId, EstadoDeuda.ACTIVA);

        LocalDate now = LocalDate.now();
        BigDecimal abonadoEsteMes = abonoDeudaRepository.calcularTotalAbonadoMes(usuarioId, now.getMonthValue(),
                now.getYear());

        List<AbonoDeudaResponseDTO> ultimosAbonos = abonoDeudaRepository
                .findUltimosAbonosUsuario(usuarioId, PageRequest.of(0, 5))
                .stream()
                .map(AbonoDeudaResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return ResumenDeudasDTO.builder()
                .totalDeudaPendiente(totalPendiente)
                .cantidadDeudasActivas(cantidadActivas)
                .totalAbonadoEsteMes(abonadoEsteMes)
                .ultimosAbonos(ultimosAbonos)
                .build();
    }

    private Deuda obtenerDeudaYValidar(Long usuarioId, Long deudaId) {
        Deuda deuda = deudaRepository.findById(deudaId)
                .orElseThrow(() -> new ResourceNotFoundException("Deuda no encontrada"));

        if (!deuda.getUsuario().getId().equals(usuarioId)) {
            throw new BadRequestException("No tienes permiso para acceder a esta deuda");
        }

        return deuda;
    }

    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 9 * * *")
    public void recordarDeudasProximasAVencer() {
        try {
            LocalDate hoy = LocalDate.now();
            LocalDate fechaLimite = hoy.plusDays(3);

            List<Deuda> deudasProximas = deudaRepository.findAll().stream()
                    .filter(d -> d.getEstado() == EstadoDeuda.ACTIVA)
                    .filter(d -> d.getFechaVencimiento() != null)
                    .filter(d -> d.getFechaVencimiento().equals(fechaLimite))
                    .collect(Collectors.toList());

            int notificacionesEnviadas = 0;
            for (Deuda deuda : deudasProximas) {
                String titulo = "⏰ Deuda próxima a vencer";
                String mensaje = String.format("Tu deuda \"%s\" vence en 3 días. Saldo: $%,d",
                        deuda.getDescripcion(),
                        deuda.getSaldoPendiente().intValue());

                webPushService.notifyUser(deuda.getUsuario().getId(), titulo, mensaje, "/deudas-externas");
                notificacionesEnviadas++;
            }

            if (notificacionesEnviadas > 0) {
                System.out.println("Enviados " + notificacionesEnviadas + " recordatorios de deudas próximas a vencer");
            }
        } catch (Exception e) {
            System.err.println("Error en recordatorio de deudas: " + e.getMessage());
        }
    }
}
