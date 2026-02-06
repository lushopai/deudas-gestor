package com.gastos.gastos_compartidos;

import com.gastos.gastos_compartidos.service.CategoriaService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GastosCompartidosApplication {

	public static void main(String[] args) {
		SpringApplication.run(GastosCompartidosApplication.class, args);
	}

	@Bean
	public CommandLineRunner init(CategoriaService categoriaService) {
		return args -> {
			// Inicializar categorías por defecto
			categoriaService.inicializarCategoriasPredeterminadas();
		};
	}
}
