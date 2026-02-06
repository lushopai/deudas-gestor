package com.gastos.gastos_compartidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CambiarPasswordDTO {

    @NotBlank(message = "La contraseña actual es requerida")
    private String passwordActual;

    @NotBlank(message = "La nueva contraseña es requerida")
    @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
        message = "La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)"
    )
    private String passwordNueva;
}
