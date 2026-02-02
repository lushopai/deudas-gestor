package com.gastos.gastos_compartidos.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrResponseDTO {
    private String texto;
    private int confianza;
    private OcrData datos;
    private String motor;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OcrData {
        private BigDecimal cantidad;
        private String descripcion;
        private String fecha;
        private String tipoDocumento;
        private String comercio;
        private List<Item> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private String nombre;
        private BigDecimal precio;
    }
}
