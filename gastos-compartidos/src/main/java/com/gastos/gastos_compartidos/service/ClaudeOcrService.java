package com.gastos.gastos_compartidos.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.gastos.gastos_compartidos.dto.OcrResponseDTO;
import com.gastos.gastos_compartidos.exception.BadRequestException;

import lombok.extern.slf4j.Slf4j;

/**
 * Servicio OCR usando Claude Vision API de Anthropic
 * Para obtener la API key, visita: https://console.anthropic.com/keys
 */
@Service
@Slf4j
public class ClaudeOcrService {

    @Value("${claude.api.key}")
    private String apiKey;

    @Value("${claude.model:claude-3-5-sonnet-20241022}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_API_VERSION = "2024-06-01";

    public OcrResponseDTO procesarRecibo(MultipartFile file) {
        try {
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new BadRequestException(
                    "Claude API key no configurada. Configura 'claude.api.key' en application.properties"
                );
            }

            log.info("Procesando recibo con Claude Vision...");

            // 1. Convertir imagen a base64
            String imageBase64 = convertFileToBase64(file);
            String mediaType = getMediaType(file.getOriginalFilename());

            // 2. Crear request para Claude
            ObjectNode requestBody = createClaudeRequest(imageBase64, mediaType);

            // 3. Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", CLAUDE_API_VERSION);

            HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);

            // 4. Llamar a Claude API
            log.info("Llamando a Claude Vision API...");
            ResponseEntity<String> response = restTemplate.postForEntity(CLAUDE_API_URL, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("Claude API respondió con error: {}", response.getStatusCode());
                throw new BadRequestException("Error al llamar a Claude API: " + response.getStatusCode());
            }

            // 5. Parsear respuesta
            return parsearRespuesta(response.getBody());

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error procesando OCR con Claude", e);
            throw new BadRequestException("Error al procesar el recibo: " + e.getMessage());
        }
    }

    /**
     * Crea el JSON request para la API de Claude
     */
    private ObjectNode createClaudeRequest(String imageBase64, String mediaType) {
        ObjectNode request = objectMapper.createObjectNode();

        // Modelo y configuración
        request.put("model", model);
        request.put("max_tokens", 1024);

        // Array de mensajes
        ArrayNode messages = request.putArray("messages");
        ObjectNode message = messages.addObject();
        message.put("role", "user");

        // Contenido con imagen y prompt
        ArrayNode content = message.putArray("content");

        // 1. Imagen
        ObjectNode imageContent = content.addObject();
        imageContent.put("type", "image");
        ObjectNode source = imageContent.putObject("source");
        source.put("type", "base64");
        source.put("media_type", mediaType);
        source.put("data", imageBase64);

        // 2. Prompt de texto
        ObjectNode textContent = content.addObject();
        textContent.put("type", "text");
        textContent.put("text", 
            "Analiza esta imagen de recibo/factura y extrae la información en formato JSON valido. " +
            "Estructura esperada: {\"montoTotal\": number, \"comercio\": \"string\", \"fecha\": \"DD/MM/YYYY\", " +
            "\"descripcion\": \"string\", \"tipoDocumento\": \"Boleta|Factura|Voucher\", " +
            "\"items\": [{\"nombre\": \"string\", \"precio\": number}]}. " +
            "Extrae todos los items individuales con sus precios. " +
            "Devuelve SOLO el JSON, sin markdown ni explicaciones adicionales."
        );

        return request;
    }

    /**
     * Convierte el archivo a base64
     */
    private String convertFileToBase64(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        if (bytes.length > 20 * 1024 * 1024) {
            throw new BadRequestException("La imagen es demasiado grande. Máximo 20MB.");
        }
        return Base64.getEncoder().encodeToString(bytes);
    }

    /**
     * Obtiene el MIME type basado en la extensión del archivo
     */
    private String getMediaType(String filename) {
        if (filename == null) {
            return "image/jpeg";
        }

        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) {
            return "image/png";
        } else if (lower.endsWith(".gif")) {
            return "image/gif";
        } else if (lower.endsWith(".webp")) {
            return "image/webp";
        }
        return "image/jpeg";
    }

    /**
     * Parsea la respuesta de Claude
     */
    private OcrResponseDTO parsearRespuesta(String responseBody) {
        String textoGenerado = "";
        try {
            JsonNode rootResponse = objectMapper.readTree(responseBody);

            // Verificar si hay error
            if (rootResponse.has("error")) {
                String errorMsg = rootResponse.path("error").path("message").asText("Error desconocido");
                log.error("Claude API error: {}", errorMsg);
                throw new BadRequestException("Claude API error: " + errorMsg);
            }

            // Extraer el contenido de la respuesta
            JsonNode content = rootResponse.path("content");
            if (!content.isArray() || content.size() == 0) {
                throw new BadRequestException("Respuesta vacía de Claude API");
            }

            textoGenerado = content.get(0).path("text").asText();
            log.info("Respuesta de Claude: {}", textoGenerado);

            // Intentar extraer JSON del texto
            String jsonLimpio = extraerJsonDelTexto(textoGenerado);
            JsonNode datosIa = objectMapper.readTree(jsonLimpio);

            // Extraer datos
            BigDecimal monto = parseMonto(datosIa.path("montoTotal").asText(null));
            String fecha = datosIa.path("fecha").asText(null);
            String comercio = datosIa.path("comercio").asText("Comercio Detectado");

            // Parsear items
            List<OcrResponseDTO.Item> listaItems = new ArrayList<>();
            JsonNode itemsNode = datosIa.path("items");
            if (itemsNode.isArray()) {
                for (JsonNode itemNode : itemsNode) {
                    String nombre = itemNode.path("nombre").asText("Item");
                    String precioStr = itemNode.path("precio").asText("0");
                    BigDecimal precio = parseMonto(precioStr);
                    if (precio != null) {
                        listaItems.add(
                            OcrResponseDTO.Item.builder()
                                .nombre(nombre)
                                .precio(precio)
                                .build()
                        );
                    }
                }
            }

            // Confianza alta con Claude Vision
            int confianza = monto != null ? 95 : 70;

            return OcrResponseDTO.builder()
                    .texto(textoGenerado)
                    .confianza(confianza)
                    .motor("claude-vision")
                    .datos(OcrResponseDTO.OcrData.builder()
                            .cantidad(monto)
                            .comercio(comercio)
                            .descripcion(datosIa.path("descripcion").asText("Gasto escaneado"))
                            .fecha(fecha)
                            .tipoDocumento(datosIa.path("tipoDocumento").asText("Boleta"))
                            .items(listaItems)
                            .build())
                    .build();

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error parseando respuesta de Claude", e);
            return OcrResponseDTO.builder()
                    .texto("Error: " + e.getMessage())
                    .confianza(0)
                    .motor("error")
                    .datos(new OcrResponseDTO.OcrData())
                    .build();
        }
    }

    /**
     * Extrae JSON válido del texto
     */
    private String extraerJsonDelTexto(String texto) {
        if (texto == null) {
            return "{}";
        }

        int firstBrace = texto.indexOf('{');
        int lastBrace = texto.lastIndexOf('}');

        if (firstBrace >= 0 && lastBrace > firstBrace) {
            return texto.substring(firstBrace, lastBrace + 1);
        }

        return texto;
    }

    /**
     * Parsea un monto (string) a BigDecimal
     */
    private BigDecimal parseMonto(String montoStr) {
        if (montoStr == null || montoStr.equals("null") || montoStr.trim().isEmpty()) {
            return null;
        }

        try {
            String limpio = montoStr.replaceAll("[^0-9,.]", "");
            if (limpio.isEmpty()) {
                return null;
            }

            int lastDot = limpio.lastIndexOf('.');
            int lastComma = limpio.lastIndexOf(',');

            if (lastDot > -1 && lastComma > -1) {
                if (lastDot > lastComma) {
                    limpio = limpio.replace(",", "");
                } else {
                    limpio = limpio.replace(".", "").replace(",", ".");
                }
            } else if (lastComma > -1) {
                int digitosDesp = limpio.length() - lastComma - 1;
                if (digitosDesp == 2) {
                    limpio = limpio.replace(",", ".");
                } else {
                    limpio = limpio.replace(",", "");
                }
            } else if (lastDot > -1) {
                int digitosDesp = limpio.length() - lastDot - 1;
                if (digitosDesp >= 3) {
                    limpio = limpio.replace(".", "");
                }
            }

            return new BigDecimal(limpio);
        } catch (Exception e) {
            log.warn("Error parseando monto: {}", montoStr, e);
            return null;
        }
    }
}
