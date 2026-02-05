package com.gastos.gastos_compartidos.service;

import com.gastos.gastos_compartidos.dto.ReporteDTO;
import com.gastos.gastos_compartidos.entity.Gasto;
import com.gastos.gastos_compartidos.entity.GastoSplit;
import com.gastos.gastos_compartidos.entity.Pareja;
import com.gastos.gastos_compartidos.entity.Usuario;
import com.gastos.gastos_compartidos.exception.BadRequestException;
import com.gastos.gastos_compartidos.exception.ResourceNotFoundException;
import com.gastos.gastos_compartidos.repository.GastoRepository;
import com.gastos.gastos_compartidos.repository.ParejaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReporteService {

    private final GastoRepository gastoRepository;
    private final ParejaRepository parejaRepository;

    public ReporteDTO generarReporteMensual(Long parejaId, int ano, int mes) {
        Pareja pareja = parejaRepository.findById(parejaId)
            .orElseThrow(() -> new ResourceNotFoundException("Pareja no encontrada"));

        if (pareja.getUsuarios().size() < 2) {
            throw new BadRequestException("La pareja debe tener al menos 2 usuarios para generar reportes");
        }

        YearMonth ym = YearMonth.of(ano, mes);
        LocalDateTime inicio = ym.atDay(1).atStartOfDay();
        LocalDateTime fin = ym.atEndOfMonth().atTime(23, 59, 59);

        List<Gasto> gastos = gastoRepository.findByParejaidAndFechaRango(parejaId, inicio, fin);

        Usuario usuario1 = pareja.getUsuarios().get(0);
        Usuario usuario2 = pareja.getUsuarios().get(1);

        BigDecimal gastoTotal = BigDecimal.ZERO;
        BigDecimal gastosUsuario1 = BigDecimal.ZERO;
        BigDecimal gastosUsuario2 = BigDecimal.ZERO;
        BigDecimal pagadoUsuario1 = BigDecimal.ZERO;
        BigDecimal pagadoUsuario2 = BigDecimal.ZERO;

        // Acumular por categoría
        Map<String, BigDecimal> montosPorCategoria = new LinkedHashMap<>();
        Map<String, Integer> cantidadPorCategoria = new LinkedHashMap<>();
        Map<String, String> iconosPorCategoria = new LinkedHashMap<>();
        Map<String, String> coloresPorCategoria = new LinkedHashMap<>();

        for (Gasto gasto : gastos) {
            gastoTotal = gastoTotal.add(gasto.getMonto());

            if (gasto.getUsuario().getId().equals(usuario1.getId())) {
                gastosUsuario1 = gastosUsuario1.add(gasto.getMonto());
            } else {
                gastosUsuario2 = gastosUsuario2.add(gasto.getMonto());
            }

            for (GastoSplit split : gasto.getSplits()) {
                if (split.getTipo() == GastoSplit.TipoSplit.PAGO) {
                    if (split.getUsuario().getId().equals(usuario1.getId())) {
                        pagadoUsuario1 = pagadoUsuario1.add(split.getMonto());
                    } else {
                        pagadoUsuario2 = pagadoUsuario2.add(split.getMonto());
                    }
                }
            }

            // Categoría
            String catNombre = gasto.getCategoria() != null ? gasto.getCategoria().getNombre() : "Sin categoría";
            String catIcono = gasto.getCategoria() != null ? gasto.getCategoria().getIcono() : "help_outline";
            String catColor = gasto.getCategoria() != null && gasto.getCategoria().getColor() != null
                ? gasto.getCategoria().getColor() : "#9e9e9e";

            montosPorCategoria.merge(catNombre, gasto.getMonto(), BigDecimal::add);
            cantidadPorCategoria.merge(catNombre, 1, Integer::sum);
            iconosPorCategoria.putIfAbsent(catNombre, catIcono);
            coloresPorCategoria.putIfAbsent(catNombre, catColor);
        }

        // Calcular deuda
        BigDecimal debeUsuario1 = gastosUsuario1.divide(new BigDecimal(2), 2, RoundingMode.HALF_UP);
        BigDecimal debeUsuario2 = gastosUsuario2.divide(new BigDecimal(2), 2, RoundingMode.HALF_UP);
        BigDecimal saldoUsuario1 = pagadoUsuario1.subtract(debeUsuario1);
        BigDecimal saldoUsuario2 = pagadoUsuario2.subtract(debeUsuario2);
        BigDecimal saldoFinal = saldoUsuario2.subtract(saldoUsuario1);

        String detalleDeuda;
        if (saldoFinal.compareTo(BigDecimal.ZERO) > 0) {
            detalleDeuda = String.format("%s debe $%.2f a %s", usuario1.getNombre(), saldoFinal, usuario2.getNombre());
        } else if (saldoFinal.compareTo(BigDecimal.ZERO) < 0) {
            detalleDeuda = String.format("%s debe $%.2f a %s", usuario2.getNombre(), saldoFinal.abs(), usuario1.getNombre());
        } else {
            detalleDeuda = "Están al día";
        }

        // Construir lista de categorías ordenada por monto descendente
        final BigDecimal total = gastoTotal;
        List<ReporteDTO.CategoriaReporte> categorias = montosPorCategoria.entrySet().stream()
            .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
            .map(entry -> {
                double porcentaje = total.compareTo(BigDecimal.ZERO) > 0
                    ? entry.getValue().divide(total, 4, RoundingMode.HALF_UP).doubleValue() * 100
                    : 0;
                return ReporteDTO.CategoriaReporte.builder()
                    .nombre(entry.getKey())
                    .icono(iconosPorCategoria.get(entry.getKey()))
                    .color(coloresPorCategoria.get(entry.getKey()))
                    .monto(entry.getValue())
                    .cantidad(cantidadPorCategoria.get(entry.getKey()))
                    .porcentaje(Math.round(porcentaje * 10.0) / 10.0)
                    .build();
            })
            .collect(Collectors.toList());

        return ReporteDTO.builder()
            .parejaId(parejaId)
            .nombrePareja(pareja.getNombrePareja())
            .nombreUsuario1(usuario1.getNombre())
            .nombreUsuario2(usuario2.getNombre())
            .gastoTotalMes(gastoTotal)
            .gastoUsuario1(gastosUsuario1)
            .gastoUsuario2(gastosUsuario2)
            .pagadoUsuario1(pagadoUsuario1)
            .pagadoUsuario2(pagadoUsuario2)
            .saldoQuienDebe(saldoFinal)
            .detalleDeuda(detalleDeuda)
            .cantidadGastos(gastos.size())
            .gastosPorCategoria(categorias)
            .build();
    }
}
