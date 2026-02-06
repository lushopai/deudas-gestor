package com.gastos.gastos_compartidos.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ResumenDeudasDTO {

    private BigDecimal totalDeudaPendiente;
    private long cantidadDeudasActivas;
    private BigDecimal totalAbonadoEsteMes;
    private List<AbonoDeudaResponseDTO> ultimosAbonos;
}
