package com.gastos.gastos_compartidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumenDeudaDTO {

    private Long parejaId;
    private UsuarioResponseDTO usuario1;  // Primer miembro de la pareja
    private UsuarioResponseDTO usuario2;  // Segundo miembro de la pareja

    // Totales de gastos
    private BigDecimal totalGastosUsuario1;  // Cuánto ha gastado (DEBE) el usuario1
    private BigDecimal totalGastosUsuario2;  // Cuánto ha gastado (DEBE) el usuario2

    // Totales de pagos realizados
    private BigDecimal totalPagosUsuario1;  // Cuánto ha pagado realmente el usuario1
    private BigDecimal totalPagosUsuario2;  // Cuánto ha pagado realmente el usuario2

    // Abonos realizados entre ellos
    private BigDecimal totalAbonosUsuario1AUsuario2;  // Pagos de usuario1 a usuario2
    private BigDecimal totalAbonosUsuario2AUsuario1;  // Pagos de usuario2 a usuario1

    // Balance final
    private UsuarioResponseDTO deudor;     // Quien debe
    private UsuarioResponseDTO acreedor;   // A quien se le debe
    private BigDecimal saldoPendiente;     // Monto que se debe

    // Información adicional
    private LocalDateTime ultimoPago;
    private List<PagoResponseDTO> historialReciente;  // Últimos 5 pagos
    private String mensajeBalance;  // Ej: "Juan debe $150.00 a María"
}
