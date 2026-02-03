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

            // 2. Prompt Optimizado: Pedir explícitamente la lista de items
            String prompt = "You are a receipt scanner API. Output ONLY a valid JSON object matching this structure: {\"montoTotal\": number, \"comercio\": \"string\", \"fecha\": \"DD/MM/YYYY\", \"descripcion\": \"string\", \"tipoDocumento\": \"Boleta|Factura|Voucher\", \"items\": [{\"nombre\": \"string\", \"precio\": number}]}. Extract all purchase items with their individual prices if visible. Identify the total amount to pay. Do not add markdown formatting. Do not add explanations.";

            // 3. Request Body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("image", imageIntArray);
            requestBody.put("prompt", prompt);
            requestBody.put("max_tokens", 2500);
            requestBody.put("temperature", 0.1);

            // 4. Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // 5. Call API
            String url = String.format("https://api.cloudflare.com/client/v4/accounts/%s/ai/run/%s", accountId, model);

            log.info("Llamando a Cloudflare API: {}", url);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new BadRequestException("Error al llamar a Cloudflare API: " + response.getStatusCode());
            }

            // 6. Parse response
            return parsearRespuesta(response.getBody());

        } catch (Exception e) {
            log.error("Error procesando OCR", e);
            throw new BadRequestException("Error al procesar el recibo: " + e.getMessage());
        }
    }

    private List<Integer> convertFileToIntArray(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        if (bytes.length > 5 * 1024 * 1024) {
            log.warn("Imagen muy grande ({} bytes), podría fallar en Cloudflare.", bytes.length);
        }
        List<Integer> integers = new ArrayList<>(bytes.length);
        for (byte b : bytes) {
            integers.add(b & 0xFF);
        }
        return integers;
    }

    private OcrResponseDTO parsearRespuesta(String responseBody) {
        String textoGenerado = "";
        try {
            JsonNode rootResponse = objectMapper.readTree(responseBody);

            if (!rootResponse.path("success").asBoolean(true)) {
                log.error("Cloudflare respondió success:false. Errores: {}", rootResponse.path("errors"));
                throw new BadRequestException("La API de Cloudflare indicó error");
            }

            textoGenerado = rootResponse.path("result").path("response").asText();
            log.info("Texto generado por Llama RAW: {}", textoGenerado);

            // Intentar extraer JSON del texto
            String jsonLimpio = extraerJsonDelTexto(textoGenerado);

            JsonNode datosIa = null;
            try {
                datosIa = objectMapper.readTree(jsonLimpio);
            } catch (Exception e) {
                log.warn("No se pudo parsear el JSON limpio. Intentando extracción manual con Regex.");
            }

            if (datosIa == null) {
                datosIa = objectMapper.createObjectNode();
            }

            // Datos básicos
            BigDecimal monto = parseMonto(datosIa.path("montoTotal").asText(null));
            if (monto == null)
                monto = extraerMontoRegex(textoGenerado);

            String fecha = datosIa.path("fecha").asText(null);
            if (fecha == null || fecha.equals("null"))
                fecha = extraerFechaRegex(textoGenerado);

            String comercio = datosIa.path("comercio").asText(null);
            if (comercio == null || comercio.equals("null"))
                comercio = "Comercio Detectado";

            // Parsear ITEMS
            List<OcrResponseDTO.Item> listaItems = new ArrayList<>();
            if (datosIa.has("items") && datosIa.get("items").isArray()) {
                for (JsonNode itemNode : datosIa.get("items")) {
                    String nombre = itemNode.path("nombre").asText("Item");
                    // Intentar extraer precio como number o string
                    String precioStr = itemNode.path("precio").asText("0");
                    BigDecimal precio = parseMonto(precioStr);
                    if (precio != null) {
                        listaItems.add(OcrResponseDTO.Item.builder().nombre(nombre).precio(precio).build());
                    }
                }
            }

            return OcrResponseDTO.builder()
                    .texto(textoGenerado)
                    .confianza(monto != null ? 85 : 40)
                    .motor("llama-vision-backend")
                    .datos(OcrResponseDTO.OcrData.builder()
                            .cantidad(monto)
                            .comercio(comercio)
                            .descripcion(datosIa.path("descripcion").asText("Gasto escaneado"))
                            .fecha(fecha)
                            .tipoDocumento(datosIa.path("tipoDocumento").asText("Boleta"))
                            .items(listaItems)
                            .build())
                    .build();

        } catch (Exception e) {
            log.error("Error fatal parseando respuesta de Cloudflare", e);
            return OcrResponseDTO.builder()
                    .texto("Error: " + e.getMessage() + " | Raw: " + textoGenerado)
                    .confianza(0)
                    .motor("error")
                    .datos(new OcrResponseDTO.OcrData())
                    .build();
        }
    }

    private String extraerJsonDelTexto(String texto) {
        if (texto == null)
            return "{}";
        int firstBrace = texto.indexOf('{');
        int lastBrace = texto.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            return texto.substring(firstBrace, lastBrace + 1);
        }
        return texto;
    }

    private BigDecimal extraerMontoRegex(String texto) {
        try {
            Pattern pTotal = Pattern.compile("(?:total|monto|pagar|suma)[:\\s]*\\$?([\\d.,]+)",
                    Pattern.CASE_INSENSITIVE);
            Matcher mTotal = pTotal.matcher(texto);
            if (mTotal.find())
                return parseMonto(mTotal.group(1));

            Pattern pMoneda = Pattern.compile("\\$\\s*([\\d.,]+)");
            Matcher mMoneda = pMoneda.matcher(texto);
            if (mMoneda.find())
                return parseMonto(mMoneda.group(1));
        } catch (Exception e) {
        }
        return null;
    }

    private String extraerFechaRegex(String texto) {
        try {
            Pattern pFecha = Pattern.compile("(\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4})");
            Matcher mFecha = pFecha.matcher(texto);
            if (mFecha.find())
                return mFecha.group(1);
        } catch (Exception e) {
        }
        return null;
    }

    private BigDecimal parseMonto(String montoStr) {
        if (montoStr == null || montoStr.equals("null") || montoStr.trim().isEmpty())
            return null;
        try {
            String limpio = montoStr.replaceAll("[^0-9,.]", "");
            if (limpio.isEmpty())
                return null;

            int lastDot = limpio.lastIndexOf('.');
            int lastComma = limpio.lastIndexOf(',');

            if (lastDot > -1 && lastComma > -1) {
                if (lastDot > lastComma)
                    limpio = limpio.replace(",", "");
                else
                    limpio = limpio.replace(".", "").replace(",", ".");
            } else if (lastComma > -1) {
                if (limpio.length() - lastComma == 3)
                    limpio = limpio.replace(",", ".");
                else
                    limpio = limpio.replace(",", "");
            }
            return new BigDecimal(limpio);
        } catch (Exception e) {
            return null;
        }
    }
}
