package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.AbonoDeuda;
import com.gastos.gastos_compartidos.entity.MetodoPago;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AbonoDeudaResponseDTO {

    private Long id;
    private Long deudaId;
    private String deudaAcreedor; // Para mostrar a qué deuda pertenece
    private BigDecimal monto;
    private LocalDate fechaPago;
    private MetodoPago metodoPago;
    private String comprobante;
    private String notas;
    private LocalDateTime fechaCreacion;

    public static AbonoDeudaResponseDTO fromEntity(AbonoDeuda abono) {
        return AbonoDeudaResponseDTO.builder()
                .id(abono.getId())
                .deudaId(abono.getDeuda().getId())
                .deudaAcreedor(abono.getDeuda().getAcreedor())
                .monto(abono.getMonto())
                .fechaPago(abono.getFechaPago())
                .metodoPago(abono.getMetodoPago())
                .comprobante(abono.getComprobante())
                .notas(abono.getNotas())
                .fechaCreacion(abono.getFechaCreacion())
                .build();
    }
}
