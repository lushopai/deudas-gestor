package com.gastos.gastos_compartidos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteDTO {

    private Long parejaId;
    private String nombrePareja;
    private BigDecimal gastoTotalMes;
    private BigDecimal gastoUsuario1;
    private BigDecimal gastoUsuario2;
    private BigDecimal pagadoUsuario1;
    private BigDecimal pagadoUsuario2;
    private BigDecimal saldoQuienDebe; // Positivo = usuario 1 debe a usuario 2, negativo = usuario 2 debe a usuario 1
    private String detalleDeuda; // "Usuario2 debe $X a Usuario1"
}
