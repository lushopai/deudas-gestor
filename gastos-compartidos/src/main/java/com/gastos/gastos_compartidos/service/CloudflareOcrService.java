package com.gastos.gastos_compartidos.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
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
import com.gastos.gastos_compartidos.dto.OcrResponseDTO;
import com.gastos.gastos_compartidos.exception.BadRequestException;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CloudflareOcrService {

    @Value("${cloudflare.account.id}")
    private String accountId;

    @Value("${cloudflare.api.token}")
    private String apiToken;

    @Value("${cloudflare.model:@cf/meta/llama-3.2-11b-vision-instruct}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OcrResponseDTO procesarRecibo(MultipartFile file) {
        try {
            log.info("Procesando recibo con Cloudflare Llama Vision...");

            // 1. Convertir imagen a array de enteros para Cloudflare
            List<Integer> imageIntArray = convertFileToIntArray(file);

            // 2. Construir cuerpo de la petición
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("image", imageIntArray);
            requestBody.put("prompt",
                    "Analiza esta imagen de un recibo o boleta. Responde SOLAMENTE con un JSON válido con esta estructura: {\"montoTotal\": numero, \"comercio\": \"nombre\", \"fecha\": \"DD/MM/YYYY\", \"descripcion\": \"breve descripcion\", \"tipoDocumento\": \"Boleta|Factura|Voucher\"}. No incluyas markdown.");
            requestBody.put("max_tokens", 512);

            // 3. Configurar headers
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // 4. Llamar a la API
            String url = String.format("https://api.cloudflare.com/client/v4/accounts/%s/ai/run/%s", accountId, model);

            log.info("Llamando a Cloudflare API: {}", url);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new BadRequestException("Error al llamar a Cloudflare API: " + response.getStatusCode());
            }

            // 5. Parsear respuesta
            return parsearRespuesta(response.getBody());

        } catch (Exception e) {
            log.error("Error procesando OCR", e);
            throw new BadRequestException("Error al procesar el recibo: " + e.getMessage());
        }
    }

    private List<Integer> convertFileToIntArray(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        List<Integer> integers = new ArrayList<>(bytes.length);
        for (byte b : bytes) {
            integers.add(b & 0xFF); // Convertir byte signado a entero no signado (0-255)
        }
        return integers;
    }

    private OcrResponseDTO parsearRespuesta(String responseBody) {
        try {
            JsonNode rootResponse = objectMapper.readTree(responseBody);

            // Cloudflare devuelve { "result": { "response": "texto..." }, "success": true }
            if (!rootResponse.path("success").asBoolean(true)) {
                throw new BadRequestException("La API de Cloudflare indicó error");
            }

            String textoGenerado = rootResponse.path("result").path("response").asText();
            log.info("Texto generado por Llama: {}", textoGenerado);

            // Limpiar JSON (quitar markdown ```json ... ```)
            String jsonLimpio = limpiarJson(textoGenerado);

            // Parsear el JSON interno generado por la IA
            JsonNode datosIa = objectMapper.readTree(jsonLimpio);

            return OcrResponseDTO.builder()
                    .texto(textoGenerado)
                    .confianza(90)
                    .motor("llama-vision-backend")
                    .datos(OcrResponseDTO.OcrData.builder()
                            .cantidad(parseMonto(datosIa.path("montoTotal").asText(null)))
                            .comercio(datosIa.path("comercio").asText("Desconocido"))
                            .descripcion(datosIa.path("descripcion").asText("Gasto escaneado"))
                            .fecha(datosIa.path("fecha").asText(null))
                            .tipoDocumento(datosIa.path("tipoDocumento").asText("Boleta"))
                            .build())
                    .build();

        } catch (Exception e) {
            log.warn("No se pudo parsear el JSON de la IA, devolviendo texto plano", e);
            // Fallback si la IA no devuelve JSON válido
            return OcrResponseDTO.builder()
                    .texto("Error parseando: " + e.getMessage())
                    .confianza(0)
                    .motor("llama-vision-error")
                    .build();
        }
    }

    private String limpiarJson(String texto) {
        if (texto == null)
            return "{}";
        String limpio = texto.trim();

        // Quitar bloques de código
        if (limpio.contains("```json")) {
            limpio = limpio.substring(limpio.indexOf("```json") + 7);
            if (limpio.contains("```")) {
                limpio = limpio.substring(0, limpio.indexOf("```"));
            }
        } else if (limpio.contains("```")) {
            limpio = limpio.substring(limpio.indexOf("```") + 3);
            if (limpio.contains("```")) {
                limpio = limpio.substring(0, limpio.indexOf("```"));
            }
        }

        return limpio.trim();
    }

    private BigDecimal parseMonto(String montoStr) {
        if (montoStr == null || montoStr.equals("null") || montoStr.isEmpty())
            return null;
        try {
            // Limpiar string de símbolos ($ , .)
            String limpio = montoStr.replaceAll("[^0-9,.]", "");

            // Normalizar decimales (asumiendo formato 1.000,00 o 1,000.00)
            // Si tiene coma y punto, asumimos que el último es el decimal
            if (limpio.contains(",") && limpio.contains(".")) {
                if (limpio.lastIndexOf(",") > limpio.lastIndexOf(".")) {
                    limpio = limpio.replace(".", "").replace(",", ".");
                } else {
                    limpio = limpio.replace(",", "");
                }
            } else if (limpio.contains(",")) {
                // Solo comas -> probable decimal si son 2 digitos al final, o miles si son 3
                if (limpio.matches(".*,\\d{2}")) {
                    limpio = limpio.replace(",", ".");
                } else {
                    limpio = limpio.replace(",", "");
                }
            }

            return new BigDecimal(limpio);
        } catch (Exception e) {
            return null;
        }
    }
}
