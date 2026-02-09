import { Injectable } from '@angular/core';
import { GeminiOcrService, OcrResult as GeminiOcrResult } from './gemini-ocr.service';

interface OcrResult {
  texto: string;
  confianza: number;
  datos?: {
    cantidad?: number;
    descripcion?: string;
    fecha?: string;
    tipoDocumento?: string;
    comercio?: string;
    items?: Array<{ nombre: string; precio: number }>;
  };
  motor?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  constructor(private claudeOcrService: GeminiOcrService) { }

  /**
   * Procesa un recibo usando Claude Vision API (backend)
   */
  async procesarRecibo(imagenFile: File): Promise<OcrResult> {
    console.log('ðŸ” [OCR] Iniciando procesamiento de recibo con Claude Vision...');

    try {
      const resultado = await this.claudeOcrService.procesarRecibo(imagenFile);

      return {
        texto: resultado.texto,
        confianza: resultado.confianza,
        datos: resultado.datos,
        motor: resultado.motor
      };
    } catch (error) {
      console.error('âŒ [OCR] Error procesando con Claude Vision:', error);
      throw error;
    }
  }
}
