package com.gastos.gastos_compartidos.service;

import com.gastos.gastos_compartidos.dto.PagoCreateDTO;
import com.gastos.gastos_compartidos.dto.PagoResponseDTO;
import com.gastos.gastos_compartidos.dto.ResumenDeudaDTO;
import com.gastos.gastos_compartidos.dto.UsuarioResponseDTO;
import com.gastos.gastos_compartidos.entity.*;
import com.gastos.gastos_compartidos.exception.BadRequestException;
import com.gastos.gastos_compartidos.exception.ResourceNotFoundException;
import com.gastos.gastos_compartidos.exception.UnauthorizedException;
import com.gastos.gastos_compartidos.repository.GastoRepository;
import com.gastos.gastos_compartidos.repository.PagoRepository;
import com.gastos.gastos_compartidos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PagoService {

    private final PagoRepository pagoRepository;
    private final UsuarioRepository usuarioRepository;
    private final GastoRepository gastoRepository;

    @Transactional
    public PagoResponseDTO registrarPago(Long usuarioId, PagoCreateDTO dto) {
        Usuario pagador = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Usuario receptor = usuarioRepository.findById(dto.getReceptorId())
            .orElseThrow(() -> new ResourceNotFoundException("Receptor no encontrado"));

        // Validar que ambos usuarios tengan pareja y sea la misma
        if (pagador.getPareja() == null) {
            throw new BadRequestException("El usuario no pertenece a ninguna pareja");
        }

        if (!pagador.getPareja().getId().equals(receptor.getPareja().getId())) {
            throw new BadRequestException("Los usuarios no pertenecen a la misma pareja");
        }

        // Validar que no se pague a sí mismo
        if (pagador.getId().equals(receptor.getId())) {
            throw new BadRequestException("No puedes realizar un pago a ti mismo");
        }

        Pago pago = Pago.builder()
            .pagador(pagador)
            .receptor(receptor)
            .pareja(pagador.getPareja())
            .monto(dto.getMonto())
            .concepto(dto.getConcepto())
            .metodoPago(dto.getMetodoPago())
            .fechaPago(dto.getFechaPago() != null ? dto.getFechaPago() : LocalDateTime.now())
            .build();

        pago = pagoRepository.save(pago);

        return PagoResponseDTO.fromEntity(pago);
    }

    public List<PagoResponseDTO> obtenerHistorialPagos(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (usuario.getPareja() == null) {
            throw new BadRequestException("El usuario no pertenece a ninguna pareja");
        }

        List<Pago> pagos = pagoRepository.findByParejaIdOrderByFechaPagoDesc(usuario.getPareja().getId());

        return pagos.stream()
            .map(PagoResponseDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public PagoResponseDTO obtenerPagoPorId(Long pagoId, Long usuarioId) {
        Pago pago = pagoRepository.findById(pagoId)
            .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Validar que el usuario pertenezca a la pareja del pago
        if (!pago.getPareja().getId().equals(usuario.getPareja().getId())) {
            throw new UnauthorizedException("No tienes permiso para ver este pago");
        }

        return PagoResponseDTO.fromEntity(pago);
    }

    @Transactional
    public void cancelarPago(Long pagoId, Long usuarioId) {
        Pago pago = pagoRepository.findById(pagoId)
            .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Validar que el usuario sea el pagador o receptor
        if (!pago.getPagador().getId().equals(usuarioId) && !pago.getReceptor().getId().equals(usuarioId)) {
            throw new UnauthorizedException("Solo el pagador o receptor pueden cancelar este pago");
        }

        // Validar que el pago no esté ya cancelado
        if (pago.getEstado() == EstadoPago.CANCELADO) {
            throw new BadRequestException("El pago ya está cancelado");
        }

        // Validar que el pago no tenga más de 7 días
        LocalDateTime hace7Dias = LocalDateTime.now().minusDays(7);
        if (pago.getFechaPago().isBefore(hace7Dias)) {
            throw new BadRequestException("No se puede cancelar un pago con más de 7 días de antigüedad");
        }

        pago.setEstado(EstadoPago.CANCELADO);
        pagoRepository.save(pago);
    }

    public ResumenDeudaDTO calcularResumenDeuda(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (usuario.getPareja() == null) {
            throw new BadRequestException("El usuario no pertenece a ninguna pareja");
        }

        Pareja pareja = usuario.getPareja();

        if (pareja.getUsuarios().size() < 2) {
            throw new BadRequestException("La pareja debe tener 2 usuarios para calcular deudas");
        }

        Usuario usuario1 = pareja.getUsuarios().get(0);
        Usuario usuario2 = pareja.getUsuarios().get(1);

        // Obtener todos los gastos de la pareja
        List<Gasto> gastos = gastoRepository.findByParejaidOrderByFechaGastoDesc(pareja.getId());

        // Calcular totales de gastos (DEBE)
        BigDecimal totalGastosUsuario1 = BigDecimal.ZERO;
        BigDecimal totalGastosUsuario2 = BigDecimal.ZERO;

        // Calcular totales pagados (PAGO)
        BigDecimal totalPagadoUsuario1 = BigDecimal.ZERO;
        BigDecimal totalPagadoUsuario2 = BigDecimal.ZERO;

        for (Gasto gasto : gastos) {
            for (GastoSplit split : gasto.getSplits()) {
                if (split.getTipo() == GastoSplit.TipoSplit.DEBE) {
                    if (split.getUsuario().getId().equals(usuario1.getId())) {
                        totalGastosUsuario1 = totalGastosUsuario1.add(split.getMonto());
                    } else {
                        totalGastosUsuario2 = totalGastosUsuario2.add(split.getMonto());
                    }
                } else if (split.getTipo() == GastoSplit.TipoSplit.PAGO) {
                    if (split.getUsuario().getId().equals(usuario1.getId())) {
                        totalPagadoUsuario1 = totalPagadoUsuario1.add(split.getMonto());
                    } else {
                        totalPagadoUsuario2 = totalPagadoUsuario2.add(split.getMonto());
                    }
                }
            }
        }

        // Obtener todos los abonos (pagos directos)
        List<Pago> pagos = pagoRepository.findByParejaIdOrderByFechaPagoDesc(pareja.getId());

        BigDecimal totalAbonosUsuario1AUsuario2 = BigDecimal.ZERO;
        BigDecimal totalAbonosUsuario2AUsuario1 = BigDecimal.ZERO;

        LocalDateTime ultimoPago = null;

        for (Pago pago : pagos) {
            if (ultimoPago == null) {
                ultimoPago = pago.getFechaPago();
            }

            if (pago.getPagador().getId().equals(usuario1.getId())) {
                totalAbonosUsuario1AUsuario2 = totalAbonosUsuario1AUsuario2.add(pago.getMonto());
            } else {
                totalAbonosUsuario2AUsuario1 = totalAbonosUsuario2AUsuario1.add(pago.getMonto());
            }
        }

        // Calcular balance
        // Balance = (Total Pagado - Total Gastado) + Abonos Recibidos - Abonos Realizados
        BigDecimal balanceUsuario1 = totalPagadoUsuario1
            .subtract(totalGastosUsuario1)
            .add(totalAbonosUsuario2AUsuario1)
            .subtract(totalAbonosUsuario1AUsuario2);

        BigDecimal balanceUsuario2 = totalPagadoUsuario2
            .subtract(totalGastosUsuario2)
            .add(totalAbonosUsuario1AUsuario2)
            .subtract(totalAbonosUsuario2AUsuario1);

        // Determinar deudor y acreedor
        UsuarioResponseDTO deudor;
        UsuarioResponseDTO acreedor;
        BigDecimal saldoPendiente;
        String mensajeBalance;

        if (balanceUsuario1.compareTo(BigDecimal.ZERO) > 0) {
            // Usuario1 es acreedor, Usuario2 es deudor
            acreedor = UsuarioResponseDTO.fromEntity(usuario1);
            deudor = UsuarioResponseDTO.fromEntity(usuario2);
            saldoPendiente = balanceUsuario1.abs().setScale(2, RoundingMode.HALF_UP);
            mensajeBalance = usuario2.getNombre() + " debe $" + saldoPendiente + " a " + usuario1.getNombre();
        } else if (balanceUsuario1.compareTo(BigDecimal.ZERO) < 0) {
            // Usuario1 es deudor, Usuario2 es acreedor
            deudor = UsuarioResponseDTO.fromEntity(usuario1);
            acreedor = UsuarioResponseDTO.fromEntity(usuario2);
            saldoPendiente = balanceUsuario1.abs().setScale(2, RoundingMode.HALF_UP);
            mensajeBalance = usuario1.getNombre() + " debe $" + saldoPendiente + " a " + usuario2.getNombre();
        } else {
            // Están a mano
            deudor = null;
            acreedor = null;
            saldoPendiente = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            mensajeBalance = "Están a mano, no hay deudas pendientes";
        }

        // Obtener últimos 5 pagos
        List<PagoResponseDTO> historialReciente = pagos.stream()
            .limit(5)
            .map(PagoResponseDTO::fromEntity)
            .collect(Collectors.toList());

        return ResumenDeudaDTO.builder()
            .parejaId(pareja.getId())
            .usuario1(UsuarioResponseDTO.fromEntity(usuario1))
            .usuario2(UsuarioResponseDTO.fromEntity(usuario2))
            .totalGastosUsuario1(totalGastosUsuario1.setScale(2, RoundingMode.HALF_UP))
            .totalGastosUsuario2(totalGastosUsuario2.setScale(2, RoundingMode.HALF_UP))
            .totalPagosUsuario1(totalPagadoUsuario1.setScale(2, RoundingMode.HALF_UP))
            .totalPagosUsuario2(totalPagadoUsuario2.setScale(2, RoundingMode.HALF_UP))
            .totalAbonosUsuario1AUsuario2(totalAbonosUsuario1AUsuario2.setScale(2, RoundingMode.HALF_UP))
            .totalAbonosUsuario2AUsuario1(totalAbonosUsuario2AUsuario1.setScale(2, RoundingMode.HALF_UP))
            .deudor(deudor)
            .acreedor(acreedor)
            .saldoPendiente(saldoPendiente)
            .ultimoPago(ultimoPago)
            .historialReciente(historialReciente)
            .mensajeBalance(mensajeBalance)
            .build();
    }
}
