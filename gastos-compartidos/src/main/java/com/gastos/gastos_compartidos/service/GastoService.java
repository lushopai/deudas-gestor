package com.gastos.gastos_compartidos.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gastos.gastos_compartidos.dto.GastoCreateDTO;
import com.gastos.gastos_compartidos.dto.GastoResponseDTO;
import com.gastos.gastos_compartidos.entity.Categoria;
import com.gastos.gastos_compartidos.entity.Gasto;
import com.gastos.gastos_compartidos.entity.GastoSplit;
import com.gastos.gastos_compartidos.entity.Pareja;
import com.gastos.gastos_compartidos.entity.Usuario;
import com.gastos.gastos_compartidos.exception.BadRequestException;
import com.gastos.gastos_compartidos.exception.ResourceNotFoundException;
import com.gastos.gastos_compartidos.repository.CategoriaRepository;
import com.gastos.gastos_compartidos.repository.GastoRepository;
import com.gastos.gastos_compartidos.repository.GastoSplitRepository;
import com.gastos.gastos_compartidos.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class GastoService {

        private final GastoRepository gastoRepository;
        private final GastoSplitRepository gastoSplitRepository;
        private final UsuarioRepository usuarioRepository;
        private final CategoriaRepository categoriaRepository;

        public GastoResponseDTO crearGasto(Long usuarioId, GastoCreateDTO request) {
                // Validar usuario
                Usuario usuario = usuarioRepository.findById(usuarioId)
                                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

                Pareja pareja = usuario.getPareja();

                // Validar categoría
                Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

                // Determinar si es gasto individual o compartido
                boolean esGastoIndividual = (request.getSplit() == null || request.getSplit().isEmpty());

                if (!esGastoIndividual) {
                        // GASTO COMPARTIDO - Requiere pareja y validación de split
                        if (pareja == null) {
                                throw new BadRequestException(
                                                "Necesitas estar en una pareja para crear gastos compartidos");
                        }

                        // Calcular total del split
                        BigDecimal totalSplit = request.getSplit().values()
                                        .stream()
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        if (totalSplit.compareTo(request.getMonto()) != 0) {
                                throw new BadRequestException(
                                                String.format("El total del split ($%.2f) debe coincidir con el monto ($%.2f)",
                                                                totalSplit, request.getMonto()));
                        }
                }

                // Crear gasto (pareja puede ser null para gastos individuales)
                Gasto gasto = Gasto.builder()
                                .descripcion(request.getDescripcion())
                                .monto(request.getMonto())
                                .montoOriginal(request.getMonto())
                                .notas(request.getNotas())
                                .rutaFoto(request.getRutaFoto())
                                .usuario(usuario)
                                .pareja(pareja) // Null para gastos individuales
                                .categoria(categoria)
                                .fechaGasto(request.getFechaGasto())
                                .build();

                gasto = gastoRepository.save(gasto);

                // Crear splits solo si es gasto compartido
                if (!esGastoIndividual) {
                        for (Map.Entry<Long, BigDecimal> entry : request.getSplit().entrySet()) {
                                Long usuarioSplitId = entry.getKey();
                                BigDecimal monto = entry.getValue();

                                // Validar que el usuario del split exista
                                Usuario usuarioSplit = usuarioRepository.findById(usuarioSplitId)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Usuario no encontrado en split"));

                                // Validar que el usuario del split pertenezca a la misma pareja
                                if (usuarioSplit.getPareja() == null
                                                || !usuarioSplit.getPareja().getId().equals(pareja.getId())) {
                                        throw new BadRequestException("El usuario del split no pertenece a la pareja");
                                }

                                // Determinar el tipo de split
                                GastoSplit.TipoSplit tipo = usuarioSplitId.equals(usuarioId)
                                                ? GastoSplit.TipoSplit.PAGO
                                                : GastoSplit.TipoSplit.DEBE;

                                GastoSplit split = GastoSplit.builder()
                                                .gasto(gasto)
                                                .usuario(usuarioSplit)
                                                .monto(monto)
                                                .tipo(tipo)
                                                .build();

                                gastoSplitRepository.save(split);
                                gasto.getSplits().add(split);
                        }
                }

                return GastoResponseDTO.fromEntity(gasto);
        }

        public GastoResponseDTO actualizarGasto(Long gastoId, Long usuarioId, GastoCreateDTO request) {
                // Buscar el gasto existente
                Gasto gasto = gastoRepository.findById(gastoId)
                                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado"));

                // Validar que el usuario que actualiza sea el que creó el gasto
                if (!gasto.getUsuario().getId().equals(usuarioId)) {
                        throw new BadRequestException("Solo el usuario que registró el gasto puede actualizarlo");
                }

                // Validar categoría
                Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));

                // Actualizar campos básicos
                gasto.setDescripcion(request.getDescripcion());
                gasto.setMonto(request.getMonto());
                gasto.setCategoria(categoria);
                gasto.setNotas(request.getNotas());
                gasto.setRutaFoto(request.getRutaFoto());
                gasto.setFechaGasto(request.getFechaGasto());

                // Si hay splits, actualizarlos
                if (request.getSplit() != null && !request.getSplit().isEmpty()) {
                        // Eliminar splits antiguos
                        gastoSplitRepository.deleteAll(gasto.getSplits());
                        gasto.getSplits().clear();

                        // Validar total del split
                        BigDecimal totalSplit = request.getSplit().values()
                                        .stream()
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        if (totalSplit.compareTo(request.getMonto()) != 0) {
                                throw new BadRequestException(
                                                String.format("El total del split ($%.2f) debe coincidir con el monto ($%.2f)",
                                                                totalSplit, request.getMonto()));
                        }

                        // Crear nuevos splits
                        for (Map.Entry<Long, BigDecimal> entry : request.getSplit().entrySet()) {
                                Long usuarioSplitId = entry.getKey();
                                BigDecimal monto = entry.getValue();

                                Usuario usuarioSplit = usuarioRepository.findById(usuarioSplitId)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "Usuario no encontrado en split"));

                                GastoSplit.TipoSplit tipo = usuarioSplitId.equals(usuarioId)
                                                ? GastoSplit.TipoSplit.PAGO
                                                : GastoSplit.TipoSplit.DEBE;

                                GastoSplit split = GastoSplit.builder()
                                                .gasto(gasto)
                                                .usuario(usuarioSplit)
                                                .monto(monto)
                                                .tipo(tipo)
                                                .build();

                                gastoSplitRepository.save(split);
                                gasto.getSplits().add(split);
                        }
                }

                gasto = gastoRepository.save(gasto);
                return GastoResponseDTO.fromEntity(gasto);
        }

        public GastoResponseDTO obtenerGasto(Long gastoId) {
                Gasto gasto = gastoRepository.findById(gastoId)
                                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado"));
                return GastoResponseDTO.fromEntity(gasto);
        }

        public List<GastoResponseDTO> obtenerGastosPorPareja(Long parejaId) {
                return gastoRepository.findByParejaidOrderByFechaGastoDesc(parejaId)
                                .stream()
                                .map(GastoResponseDTO::fromEntity)
                                .collect(Collectors.toList());
        }

        public List<GastoResponseDTO> obtenerGastosPorParejaYMes(Long parejaId, int ano, int mes) {
                YearMonth ym = YearMonth.of(ano, mes);
                LocalDateTime inicio = ym.atDay(1).atStartOfDay();
                LocalDateTime fin = ym.atEndOfMonth().atTime(23, 59, 59);

                return gastoRepository.findByParejaidAndFechaRango(parejaId, inicio, fin)
                                .stream()
                                .map(GastoResponseDTO::fromEntity)
                                .collect(Collectors.toList());
        }

        public void eliminarGasto(Long gastoId, Long usuarioId) {
                Gasto gasto = gastoRepository.findById(gastoId)
                                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado"));

                // Solo el usuario que registró el gasto puede eliminarlo
                if (!gasto.getUsuario().getId().equals(usuarioId)) {
                        throw new BadRequestException("Solo el usuario que registró el gasto puede eliminarlo");
                }

                gastoRepository.deleteById(gastoId);
        }

        public List<GastoResponseDTO> obtenerGastosPorUsuario(Long usuarioId) {
                Usuario usuario = usuarioRepository.findById(usuarioId)
                                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

                List<Gasto> gastos = new java.util.ArrayList<>();

                // Obtener gastos individuales del usuario (sin pareja)
                gastos.addAll(gastoRepository.findByUsuarioIdAndParejaIsNullOrderByFechaGastoDesc(usuarioId));

                // Si tiene pareja, también obtener gastos compartidos
                if (usuario.getPareja() != null) {
                        gastos.addAll(gastoRepository.findByParejaidOrderByFechaGastoDesc(usuario.getPareja().getId()));
                }

                return gastos.stream()
                                .map(GastoResponseDTO::fromEntity)
                                .collect(Collectors.toList());
        }

        public List<GastoResponseDTO> obtenerGastosRecientes(Long usuarioId, int cantidad) {
                Usuario usuario = usuarioRepository.findById(usuarioId)
                                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

                List<Gasto> gastos = new java.util.ArrayList<>();

                // Obtener gastos individuales
                gastos.addAll(gastoRepository.findByUsuarioIdAndParejaIsNullOrderByFechaGastoDesc(usuarioId));

                // Si tiene pareja, también obtener gastos compartidos
                if (usuario.getPareja() != null) {
                        gastos.addAll(gastoRepository.findByParejaidOrderByFechaGastoDesc(usuario.getPareja().getId()));
                }

                return gastos.stream()
                                .limit(cantidad)
                                .map(GastoResponseDTO::fromEntity)
                                .collect(Collectors.toList());
        }

        public Map<String, Object> obtenerResumenGastos(Long usuarioId) {
                Usuario usuario = usuarioRepository.findById(usuarioId)
                                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

                List<Gasto> gastos = new java.util.ArrayList<>();

                // Obtener gastos individuales
                gastos.addAll(gastoRepository.findByUsuarioIdAndParejaIsNullOrderByFechaGastoDesc(usuarioId));

                // Si tiene pareja, también obtener gastos compartidos
                if (usuario.getPareja() != null) {
                        gastos.addAll(gastoRepository.findByParejaidOrderByFechaGastoDesc(usuario.getPareja().getId()));
                }

                BigDecimal total = gastos.stream()
                                .map(Gasto::getMonto)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal promedio = gastos.isEmpty() ? BigDecimal.ZERO
                                : total.divide(new BigDecimal(gastos.size()), 2, java.math.RoundingMode.HALF_UP);

                Map<String, BigDecimal> gastosPorCategoria = gastos.stream()
                                .filter(g -> g.getCategoria() != null)
                                .collect(Collectors.groupingBy(
                                                g -> g.getCategoria().getNombre(),
                                                Collectors.reducing(
                                                                BigDecimal.ZERO,
                                                                Gasto::getMonto,
                                                                BigDecimal::add)));

                return Map.of(
                                "totalGastos", total,
                                "cantidadGastos", gastos.size(),
                                "promedioPorGasto", promedio,
                                "gastosPorCategoria", gastosPorCategoria);
        }
}
