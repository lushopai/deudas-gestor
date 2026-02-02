package com.gastos.gastos_compartidos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroRequestDTO {

    @Email(message = "El email debe ser válido (ej: usuario@ejemplo.com)")
    @NotBlank(message = "El email es requerido")
    private String email;

    @NotBlank(message = "El nombre es requerido")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúñÁÉÍÓÚÑ\\s]+$", message = "El nombre solo puede contener letras y espacios")
    private String nombre;

    @Size(max = 50, message = "El apellido no debe exceder 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúñÁÉÍÓÚÑ\\s]*$", message = "El apellido solo puede contener letras y espacios")
    private String apellido;

    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
        message = "La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)"
    )
    private String password;

    @Size(max = 100, message = "El nombre de la pareja no debe exceder 100 caracteres")
    private String nombrePareja;
}
