package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.Deuda;
import com.gastos.gastos_compartidos.entity.EstadoDeuda;
import com.gastos.gastos_compartidos.entity.TipoDeuda;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DeudaResponseDTO {

    private Long id;
    private String acreedor;
    private String descripcion;
    private TipoDeuda tipo;
    private BigDecimal montoOriginal;
    private BigDecimal saldoPendiente;
    private BigDecimal montoPagado;
    private EstadoDeuda estado;
    private LocalDate fechaInicio;
    private LocalDate fechaVencimiento;
    private Integer diaCorte;
    private Integer diaLimitePago;
    private BigDecimal tasaInteres;
    private int progreso; // 0-100
    private int totalAbonos;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private List<AbonoDeudaResponseDTO> ultimosAbonos; // Últimos 5 abonos

    public static DeudaResponseDTO fromEntity(Deuda deuda) {
        return DeudaResponseDTO.builder()
                .id(deuda.getId())
                .acreedor(deuda.getAcreedor())
                .descripcion(deuda.getDescripcion())
                .tipo(deuda.getTipo())
                .montoOriginal(deuda.getMontoOriginal())
                .saldoPendiente(deuda.getSaldoPendiente())
                .montoPagado(deuda.getMontoOriginal().subtract(deuda.getSaldoPendiente()))
                .estado(deuda.getEstado())
                .fechaInicio(deuda.getFechaInicio())
                .fechaVencimiento(deuda.getFechaVencimiento())
                .diaCorte(deuda.getDiaCorte())
                .diaLimitePago(deuda.getDiaLimitePago())
                .tasaInteres(deuda.getTasaInteres())
                .progreso(deuda.calcularProgreso())
                .totalAbonos(deuda.getAbonos() != null ? deuda.getAbonos().size() : 0)
                .fechaCreacion(deuda.getFechaCreacion())
                .fechaActualizacion(deuda.getFechaActualizacion())
                .build();
    }

    public static DeudaResponseDTO fromEntityWithAbonos(Deuda deuda, List<AbonoDeudaResponseDTO> abonos) {
        DeudaResponseDTO dto = fromEntity(deuda);
        dto.setUltimosAbonos(abonos);
        return dto;
    }
}
