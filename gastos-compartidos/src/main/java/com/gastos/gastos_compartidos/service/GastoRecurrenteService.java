package com.gastos.gastos_compartidos.service;

import com.gastos.gastos_compartidos.dto.GastoRecurrenteCreateDTO;
import com.gastos.gastos_compartidos.dto.GastoRecurrenteResponseDTO;
import com.gastos.gastos_compartidos.entity.*;
import com.gastos.gastos_compartidos.repository.CategoriaRepository;
import com.gastos.gastos_compartidos.repository.GastoRecurrenteRepository;
import com.gastos.gastos_compartidos.repository.GastoRepository;
import com.gastos.gastos_compartidos.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GastoRecurrenteService {

    private final GastoRecurrenteRepository gastoRecurrenteRepository;
    private final GastoRepository gastoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final WebPushService webPushService;

    @Transactional
    public GastoRecurrenteResponseDTO crear(Long usuarioId, GastoRecurrenteCreateDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        GastoRecurrente gr = new GastoRecurrente();
        gr.setUsuario(usuario);
        gr.setDescripcion(dto.getDescripcion());
        gr.setMonto(dto.getMonto());
        gr.setCategoria(categoria);
        gr.setFrecuencia(dto.getFrecuencia());
        gr.setDiaEjecucion(dto.getDiaEjecucion());
        gr.setFechaInicio(dto.getFechaInicio() != null ? dto.getFechaInicio() : LocalDate.now());
        gr.setFechaFin(dto.getFechaFin());
        gr.setActivo(true);
        gr.setEsCompartido(dto.getEsCompartido() != null ? dto.getEsCompartido() : false);
        gr.setNotas(dto.getNotas());
        gr.setTotalEjecutado(0);

        // La próxima ejecución se calcula en @PrePersist de la entidad

        GastoRecurrente saved = gastoRecurrenteRepository.save(gr);
        return mapToDTO(saved);
    }

    public List<GastoRecurrenteResponseDTO> obtenerPorUsuario(Long usuarioId) {
        return gastoRecurrenteRepository.findByUsuarioIdOrderByProximaEjecucionAsc(usuarioId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<GastoRecurrenteResponseDTO> obtenerActivosPorUsuario(Long usuarioId) {
        return gastoRecurrenteRepository.findByUsuarioIdAndActivoTrueOrderByProximaEjecucionAsc(usuarioId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<GastoRecurrenteResponseDTO> obtenerProximos(Long usuarioId, int dias) {
        LocalDate desde = LocalDate.now();
        LocalDate hasta = desde.plusDays(dias);
        return gastoRecurrenteRepository.findProximosAEjecutar(usuarioId, desde, hasta)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public GastoRecurrenteResponseDTO obtenerPorId(Long id, Long usuarioId) {
        GastoRecurrente gr = gastoRecurrenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto recurrente no encontrado"));

        if (!gr.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para ver este gasto recurrente");
        }

        return mapToDTO(gr);
    }

    @Transactional
    public GastoRecurrenteResponseDTO actualizar(Long id, Long usuarioId, GastoRecurrenteCreateDTO dto) {
        GastoRecurrente gr = gastoRecurrenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto recurrente no encontrado"));

        if (!gr.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para modificar este gasto recurrente");
        }

        if (dto.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            gr.setCategoria(categoria);
        }

        if (dto.getDescripcion() != null)
            gr.setDescripcion(dto.getDescripcion());
        if (dto.getMonto() != null)
            gr.setMonto(dto.getMonto());
        if (dto.getFrecuencia() != null)
            gr.setFrecuencia(dto.getFrecuencia());
        if (dto.getDiaEjecucion() != null)
            gr.setDiaEjecucion(dto.getDiaEjecucion());
        if (dto.getFechaInicio() != null)
            gr.setFechaInicio(dto.getFechaInicio());
        gr.setFechaFin(dto.getFechaFin());
        if (dto.getEsCompartido() != null)
            gr.setEsCompartido(dto.getEsCompartido());
        if (dto.getNotas() != null)
            gr.setNotas(dto.getNotas());

        // Recalcular próxima ejecución
        gr.setProximaEjecucion(gr.calcularProximaEjecucion(LocalDate.now()));

        GastoRecurrente saved = gastoRecurrenteRepository.save(gr);
        return mapToDTO(saved);
    }

    @Transactional
    public GastoRecurrenteResponseDTO toggleActivo(Long id, Long usuarioId) {
        GastoRecurrente gr = gastoRecurrenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto recurrente no encontrado"));

        if (!gr.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para modificar este gasto recurrente");
        }

        gr.setActivo(!gr.getActivo());
        GastoRecurrente saved = gastoRecurrenteRepository.save(gr);
        return mapToDTO(saved);
    }

    @Transactional
    public void eliminar(Long id, Long usuarioId) {
        GastoRecurrente gr = gastoRecurrenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto recurrente no encontrado"));

        if (!gr.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para eliminar este gasto recurrente");
        }

        gastoRecurrenteRepository.delete(gr);
    }

    public long contarActivos(Long usuarioId) {
        return gastoRecurrenteRepository.countByUsuarioIdAndActivoTrue(usuarioId);
    }

    @Transactional
    public void ejecutarManualmente(Long id, Long usuarioId) {
        GastoRecurrente gr = gastoRecurrenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto recurrente no encontrado"));

        if (!gr.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para ejecutar este gasto recurrente");
        }

        ejecutarGastoRecurrente(gr);
    }

    /**
     * Tarea programada: ejecutar gastos recurrentes pendientes cada día a las 6:00
     * AM
     */
    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void ejecutarGastosPendientes() {
        LocalDate hoy = LocalDate.now();
        List<GastoRecurrente> pendientes = gastoRecurrenteRepository.findPendientesDeEjecutar(hoy);

        int ejecutados = 0;
        java.math.BigDecimal totalMonto = java.math.BigDecimal.ZERO;
        java.util.Map<Long, Integer> ejecutadosPorUsuario = new java.util.HashMap<>();

        for (GastoRecurrente gr : pendientes) {
            try {
                ejecutarGastoRecurrente(gr);
                ejecutados++;
                totalMonto = totalMonto.add(gr.getMonto());
                ejecutadosPorUsuario.merge(gr.getUsuario().getId(), 1, Integer::sum);
            } catch (Exception e) {
                log.error("Error ejecutando gasto recurrente ID {}: {}", gr.getId(), e.getMessage());
            }
        }

        if (ejecutados > 0) {
            log.info("✅ Ejecutados {} gastos recurrentes por un total de ${}", ejecutados, totalMonto);

            // Enviar push notification a cada usuario afectado
            for (var entry : ejecutadosPorUsuario.entrySet()) {
                webPushService.notifyUser(
                        entry.getKey(),
                        "Gastos recurrentes registrados 📋",
                        "Se registraron " + entry.getValue() + " gasto(s) recurrente(s) automáticamente",
                        "/gastos-recurrentes");
            }
        }
    }

    private void ejecutarGastoRecurrente(GastoRecurrente gr) {
        if (gr.getFechaFin() != null && LocalDate.now().isAfter(gr.getFechaFin())) {
            gr.setActivo(false);
            gastoRecurrenteRepository.save(gr);
            return;
        }

        Gasto gasto = new Gasto();
        gasto.setUsuario(gr.getUsuario());
        gasto.setDescripcion(gr.getDescripcion() + " (Recurrente)");
        gasto.setMonto(gr.getMonto());
        gasto.setMontoOriginal(gr.getMonto());
        gasto.setCategoria(gr.getCategoria());
        gasto.setFechaGasto(LocalDateTime.now());
        gasto.setNotas(gr.getNotas());

        if (gr.getEsCompartido() && gr.getUsuario().getPareja() != null) {
            gasto.setPareja(gr.getUsuario().getPareja());
        }

        gastoRepository.save(gasto);

        gr.setUltimaEjecucion(LocalDate.now());
        gr.setTotalEjecutado(gr.getTotalEjecutado() + 1);
        gr.marcarEjecutado();

        gastoRecurrenteRepository.save(gr);
    }

    private GastoRecurrenteResponseDTO mapToDTO(GastoRecurrente entity) {
        Integer diasHasta = null;
        if (entity.getProximaEjecucion() != null) {
            diasHasta = (int) ChronoUnit.DAYS.between(LocalDate.now(), entity.getProximaEjecucion());
        }

        return GastoRecurrenteResponseDTO.builder()
                .id(entity.getId())
                .descripcion(entity.getDescripcion())
                .monto(entity.getMonto())
                .categoriaId(entity.getCategoria().getId())
                .categoriaNombre(entity.getCategoria().getNombre())
                .categoriaIcono(entity.getCategoria().getIcono())
                .frecuencia(entity.getFrecuencia())
                .frecuenciaDescripcion(obtenerDescripcionFrecuencia(entity.getFrecuencia()))
                .diaEjecucion(entity.getDiaEjecucion())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .proximaEjecucion(entity.getProximaEjecucion())
                .ultimaEjecucion(entity.getUltimaEjecucion())
                .activo(entity.getActivo())
                .esCompartido(entity.getEsCompartido())
                .notas(entity.getNotas())
                .totalEjecutado(entity.getTotalEjecutado())
                .diasHastaProxima(diasHasta)
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }

    private String obtenerDescripcionFrecuencia(Frecuencia frecuencia) {
        return switch (frecuencia) {
            case DIARIA -> "Todos los días";
            case SEMANAL -> "Cada semana";
            case QUINCENAL -> "Cada 15 días";
            case MENSUAL -> "Cada mes";
            case BIMESTRAL -> "Cada 2 meses";
            case TRIMESTRAL -> "Cada 3 meses";
            case SEMESTRAL -> "Cada 6 meses";
            case ANUAL -> "Cada año";
        };
    }
}
