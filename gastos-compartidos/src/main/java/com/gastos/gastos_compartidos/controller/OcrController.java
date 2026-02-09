package com.gastos.gastos_compartidos.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.multipart.MultipartFile;

import com.gastos.gastos_compartidos.dto.OcrResponseDTO;
import com.gastos.gastos_compartidos.service.ClaudeOcrService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // Permitir CORS desde cualquier origen (ajustar en prod)
public class OcrController {

    private final ClaudeOcrService ocrService;

    @PostMapping("/scan")
    public ResponseEntity<OcrResponseDTO> escanearRecibo(@RequestParam("file") MultipartFile file) {
        log.info("Recibida solicitud de escaneo OCR: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        OcrResponseDTO response = ocrService.procesarRecibo(file);
        return ResponseEntity.ok(response);
    }
}
