package com.gastos.gastos_compartidos.service;

import com.gastos.gastos_compartidos.dto.CategoriaDTO;
import com.gastos.gastos_compartidos.entity.Categoria;
import com.gastos.gastos_compartidos.exception.ResourceNotFoundException;
import com.gastos.gastos_compartidos.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public Categoria obtenerPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
    }

    @Cacheable(value = "categorias")
    @Transactional(readOnly = true)
    public List<CategoriaDTO> obtenerTodas() {
        return categoriaRepository.findAll().stream()
                .filter(Categoria::isActivo)
                .map(CategoriaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "categorias", allEntries = true)
    public Categoria crearCategoria(String nombre, String icono) {
        Categoria categoria = new Categoria(nombre, icono);
        return categoriaRepository.save(categoria);
    }

    public void inicializarCategoriasPredeterminadas() {
        // Si no existen, crear categorías por defecto
        if (categoriaRepository.count() == 0) {
            categoriaRepository.save(new Categoria("Supermercado", "🛒"));
            categoriaRepository.save(new Categoria("Transporte", "🚗"));
            categoriaRepository.save(new Categoria("Restaurante", "🍽️"));
            categoriaRepository.save(new Categoria("Entrenimiento", "🎬"));
            categoriaRepository.save(new Categoria("Hogar", "🏠"));
            categoriaRepository.save(new Categoria("Salud", "💊"));
            categoriaRepository.save(new Categoria("Otros", "📌"));
        }
    }
}
