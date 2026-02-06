package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.EstadoPago;
import com.gastos.gastos_compartidos.entity.MetodoPago;
import com.gastos.gastos_compartidos.entity.Pago;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoResponseDTO {

    private Long id;
    private UsuarioResponseDTO pagador;
    private UsuarioResponseDTO receptor;
    private BigDecimal monto;
    private String concepto;
    private MetodoPago metodoPago;
    private EstadoPago estado;
    private LocalDateTime fechaPago;
    private LocalDateTime fechaCreacion;
    private Integer mesPago;
    private Integer anoPago;

    public static PagoResponseDTO fromEntity(Pago pago) {
        return PagoResponseDTO.builder()
            .id(pago.getId())
            .pagador(UsuarioResponseDTO.fromEntity(pago.getPagador()))
            .receptor(UsuarioResponseDTO.fromEntity(pago.getReceptor()))
            .monto(pago.getMonto())
            .concepto(pago.getConcepto())
            .metodoPago(pago.getMetodoPago())
            .estado(pago.getEstado())
            .fechaPago(pago.getFechaPago())
            .fechaCreacion(pago.getFechaCreacion())
            .mesPago(pago.getMesPago())
            .anoPago(pago.getAnoPago())
            .build();
    }
}
