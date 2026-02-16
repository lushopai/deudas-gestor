package com.gastos.gastos_compartidos.service;

import com.gastos.gastos_compartidos.dto.PresupuestoCreateDTO;
import com.gastos.gastos_compartidos.dto.PresupuestoResponseDTO;
import com.gastos.gastos_compartidos.entity.*;
import com.gastos.gastos_compartidos.repository.CategoriaRepository;
import com.gastos.gastos_compartidos.repository.GastoRepository;
import com.gastos.gastos_compartidos.repository.PresupuestoRepository;
import com.gastos.gastos_compartidos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PresupuestoService {

    private final PresupuestoRepository presupuestoRepository;
    private final GastoRepository gastoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;

    @Transactional
    public PresupuestoResponseDTO crear(Long usuarioId, PresupuestoCreateDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Categoria categoria = null;
        if (dto.getCategoriaId() != null) {
            categoria = categoriaRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

            presupuestoRepository.findByUsuarioIdAndCategoriaIdAndPeriodo(
                    usuarioId, dto.getCategoriaId(), dto.getPeriodo()).ifPresent(p -> {
                        throw new RuntimeException("Ya existe un presupuesto para esta categoría y período");
                    });
        } else {

            presupuestoRepository.findByUsuarioIdAndCategoriaIsNullAndPeriodo(
                    usuarioId, dto.getPeriodo()).ifPresent(p -> {
                        throw new RuntimeException("Ya existe un presupuesto global para este período");
                    });
        }

        Presupuesto presupuesto = Presupuesto.builder()
                .usuario(usuario)
                .categoria(categoria)
                .limite(dto.getLimite())
                .periodo(dto.getPeriodo())
                .notas(dto.getNotas())
                .activo(true)
                .build();

        presupuestoRepository.save(presupuesto);
        return mapToDTO(presupuesto, usuarioId);
    }

    @Transactional
    public PresupuestoResponseDTO actualizar(Long id, Long usuarioId, PresupuestoCreateDTO dto) {
        Presupuesto presupuesto = getPresupuestoDelUsuario(id, usuarioId);

        presupuesto.setLimite(dto.getLimite());
        if (dto.getNotas() != null)
            presupuesto.setNotas(dto.getNotas());

        presupuestoRepository.save(presupuesto);
        return mapToDTO(presupuesto, usuarioId);
    }

    @Transactional
    public void eliminar(Long id, Long usuarioId) {
        Presupuesto presupuesto = getPresupuestoDelUsuario(id, usuarioId);
        presupuestoRepository.delete(presupuesto);
    }

    @Transactional
    public PresupuestoResponseDTO toggleActivo(Long id, Long usuarioId) {
        Presupuesto presupuesto = getPresupuestoDelUsuario(id, usuarioId);
        presupuesto.setActivo(!presupuesto.getActivo());
        presupuestoRepository.save(presupuesto);
        return mapToDTO(presupuesto, usuarioId);
    }

    @Transactional(readOnly = true)
    public List<PresupuestoResponseDTO> obtenerPorUsuario(Long usuarioId) {
        return presupuestoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(p -> mapToDTO(p, usuarioId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PresupuestoResponseDTO> obtenerActivosPorUsuario(Long usuarioId) {
        return presupuestoRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .stream()
                .map(p -> mapToDTO(p, usuarioId))
                .collect(Collectors.toList());
    }

    private Presupuesto getPresupuestoDelUsuario(Long id, Long usuarioId) {
        Presupuesto presupuesto = presupuestoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Presupuesto no encontrado"));

        if (!presupuesto.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para modificar este presupuesto");
        }
        return presupuesto;
    }

    private PresupuestoResponseDTO mapToDTO(Presupuesto p, Long usuarioId) {
        LocalDateTime[] rango = calcularRango(p.getPeriodo());

        BigDecimal gastado;
        if (p.getCategoria() != null) {
            gastado = gastoRepository.sumarGastosPorCategoriaYRango(
                    usuarioId, p.getCategoria().getId(), rango[0], rango[1]);
        } else {
            gastado = gastoRepository.sumarGastosTotalPorRango(usuarioId, rango[0], rango[1]);
        }

        if (gastado == null)
            gastado = BigDecimal.ZERO;
        BigDecimal disponible = p.getLimite().subtract(gastado);
        double porcentaje = p.getLimite().compareTo(BigDecimal.ZERO) > 0
                ? gastado.multiply(BigDecimal.valueOf(100)).divide(p.getLimite(), 1, RoundingMode.HALF_UP).doubleValue()
                : 0;

        String estado;
        if (porcentaje >= 100)
            estado = "EXCEDIDO";
        else if (porcentaje >= 80)
            estado = "ALERTA";
        else
            estado = "OK";

        return PresupuestoResponseDTO.builder()
                .id(p.getId())
                .categoriaId(p.getCategoria() != null ? p.getCategoria().getId() : null)
                .categoriaNombre(p.getCategoria() != null ? p.getCategoria().getNombre() : "Total General")
                .categoriaIcono(p.getCategoria() != null ? p.getCategoria().getIcono() : "account_balance_wallet")
                .limite(p.getLimite())
                .gastado(gastado)
                .disponible(disponible)
                .porcentajeUsado(porcentaje)
                .periodo(p.getPeriodo())
                .activo(p.getActivo())
                .notas(p.getNotas())
                .estado(estado)
                .build();
    }

    private LocalDateTime[] calcularRango(PeriodoPresupuesto periodo) {
        LocalDate hoy = LocalDate.now();
        LocalDateTime desde;
        LocalDateTime hasta;

        switch (periodo) {
            case SEMANAL -> {
                LocalDate inicioSemana = hoy.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                desde = inicioSemana.atStartOfDay();
                hasta = inicioSemana.plusWeeks(1).atStartOfDay();
            }
            case MENSUAL -> {
                desde = hoy.withDayOfMonth(1).atStartOfDay();
                hasta = hoy.withDayOfMonth(1).plusMonths(1).atStartOfDay();
            }
            case ANUAL -> {
                desde = hoy.withDayOfYear(1).atStartOfDay();
                hasta = hoy.withDayOfYear(1).plusYears(1).atStartOfDay();
            }
            default -> {
                desde = hoy.withDayOfMonth(1).atStartOfDay();
                hasta = hoy.withDayOfMonth(1).plusMonths(1).atStartOfDay();
            }
        }

        return new LocalDateTime[] { desde, hasta };
    }
}
