package com.gastos.gastos_compartidos.dto;

import com.gastos.gastos_compartidos.entity.Frecuencia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GastoRecurrenteResponseDTO {

    private Long id;
    private String descripcion;
    private BigDecimal monto;
    private Long categoriaId;
    private String categoriaNombre;
    private String categoriaIcono;
    private Frecuencia frecuencia;
    private String frecuenciaDescripcion;
    private Integer diaEjecucion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private LocalDate proximaEjecucion;
    private LocalDate ultimaEjecucion;
    private Boolean activo;
    private Boolean esCompartido;
    private String notas;
    private Integer totalEjecutado;
    private Integer diasHastaProxima;
    private LocalDateTime fechaCreacion;
}
