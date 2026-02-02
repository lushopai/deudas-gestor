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
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

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

        for (Gasto gasto : gastos) {
            gastoTotal = gastoTotal.add(gasto.getMonto());

            if (gasto.getUsuario().getId().equals(usuario1.getId())) {
                gastosUsuario1 = gastosUsuario1.add(gasto.getMonto());
            } else {
                gastosUsuario2 = gastosUsuario2.add(gasto.getMonto());
            }

            // Procesar splits para determinar quién pagó qué
            for (GastoSplit split : gasto.getSplits()) {
                if (split.getTipo() == GastoSplit.TipoSplit.PAGO) {
                    if (split.getUsuario().getId().equals(usuario1.getId())) {
                        pagadoUsuario1 = pagadoUsuario1.add(split.getMonto());
                    } else {
                        pagadoUsuario2 = pagadoUsuario2.add(split.getMonto());
                    }
                }
            }
        }

        // Calcular quién debe a quién
        // Usuario 1 debería pagar su parte de los gastos
        BigDecimal debeUsuario1 = gastosUsuario1.divide(new BigDecimal(2), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal debeUsuario2 = gastosUsuario2.divide(new BigDecimal(2), 2, java.math.RoundingMode.HALF_UP);

        // El saldo es lo que pagó menos lo que debería pagar
        BigDecimal saldoUsuario1 = pagadoUsuario1.subtract(debeUsuario1);
        BigDecimal saldoUsuario2 = pagadoUsuario2.subtract(debeUsuario2);

        // Saldo final: si es positivo, usuario1 debe a usuario2
        BigDecimal saldoFinal = saldoUsuario2.subtract(saldoUsuario1);

        String detalleDeuda;
        if (saldoFinal.compareTo(BigDecimal.ZERO) > 0) {
            detalleDeuda = String.format("%s debe $%.2f a %s", usuario1.getNombre(), saldoFinal, usuario2.getNombre());
        } else if (saldoFinal.compareTo(BigDecimal.ZERO) < 0) {
            detalleDeuda = String.format("%s debe $%.2f a %s", usuario2.getNombre(), saldoFinal.abs(), usuario1.getNombre());
        } else {
            detalleDeuda = "Están al día";
        }

        return ReporteDTO.builder()
            .parejaId(parejaId)
            .nombrePareja(pareja.getNombrePareja())
            .gastoTotalMes(gastoTotal)
            .gastoUsuario1(gastosUsuario1)
            .gastoUsuario2(gastosUsuario2)
            .pagadoUsuario1(pagadoUsuario1)
            .pagadoUsuario2(pagadoUsuario2)
            .saldoQuienDebe(saldoFinal)
            .detalleDeuda(detalleDeuda)
            .build();
    }
}
