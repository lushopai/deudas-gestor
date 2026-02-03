import { Injectable } from '@angular/core';
import Tesseract from 'tesseract.js';
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
  motor?: 'gemini' | 'tesseract';
}

interface ImagenProcesada {
  canvas: HTMLCanvasElement;
  tipo: 'original' | 'mejorada';
}

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  constructor(private geminiOcrService: GeminiOcrService) { }

  /**
   * Procesa un recibo usando Gemini (principal) o Tesseract (fallback)
   */
  async procesarRecibo(imagenFile: File): Promise<OcrResult> {
    console.log('🔍 [OCR] Iniciando procesamiento de recibo...');

    // Intentar primero con Gemini Vision (más preciso)
    if (this.geminiOcrService.isAvailable()) {
      try {
        console.log('🤖 [OCR] Usando Gemini Vision AI...');
        const resultadoGemini = await this.geminiOcrService.procesarRecibo(imagenFile);

        return {
          texto: resultadoGemini.texto,
          confianza: resultadoGemini.confianza,
          datos: resultadoGemini.datos,
          motor: 'gemini'
        };
      } catch (geminiError) {
        console.warn('⚠️ [OCR] Gemini falló, usando Tesseract como fallback:', geminiError);
        // Continuar con Tesseract como fallback
      }
    } else {
      console.log('⚠️ [OCR] Gemini no disponible, usando Tesseract...');
    }

    // Fallback a Tesseract
    return this.procesarConTesseract(imagenFile);
  }

  /**
   * Procesa con Tesseract (fallback)
   */
  private async procesarConTesseract(imagenFile: File): Promise<OcrResult> {
    try {
      console.log('🔧 [OCR] Procesando con Tesseract...');

      // 1. Pre-procesar la imagen para mejorar OCR
      const imagenMejorada = await this.preprocesarImagen(imagenFile);

      // 2. Ejecutar OCR con configuración optimizada
      const resultado = await this.ejecutarOCR(imagenMejorada);

      // 3. Post-procesar y extraer datos estructurados
      const datos = this.extraerDatosAvanzado(resultado.texto);

      console.log('✅ [OCR] Procesamiento Tesseract completado:', datos);

      return {
        texto: resultado.texto,
        confianza: resultado.confianza,
        datos,
        motor: 'tesseract'
      };
    } catch (error) {
      console.error('❌ [OCR] Error en Tesseract:', error);
      throw error;
    }
  }

  /**
   * Pre-procesa la imagen para mejorar la calidad del OCR
   */
  private async preprocesarImagen(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          try {
            // Crear canvas para procesamiento
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            // Redimensionar si es muy grande (optimización)
            const maxWidth = 1920;
            const maxHeight = 1920;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;

            // Dibujar imagen original
            ctx.drawImage(img, 0, 0, width, height);

            // Obtener datos de píxeles
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            // Aplicar mejoras
            this.aplicarMejoras(data);

            // Actualizar canvas
            ctx.putImageData(imageData, 0, 0);

            console.log('✨ [OCR] Imagen pre-procesada:', { width, height });
            resolve(canvas);
          } catch (error) {
            reject(error);
          }
        };
        img.src = e.target?.result as string;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Aplica mejoras a los píxeles de la imagen
   */
  private aplicarMejoras(data: Uint8ClampedArray): void {
    // 1. Convertir a escala de grises
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }

    // 2. Aumentar contraste
    const factor = 1.5; // Factor de contraste
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
    }

    // 3. Binarización (Umbral adaptativo simplificado)
    const threshold = this.calcularUmbral(data);
    for (let i = 0; i < data.length; i += 4) {
      const value = data[i] > threshold ? 255 : 0;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }
  }

  /**
   * Calcula el umbral óptimo usando el método de Otsu simplificado
   */
  private calcularUmbral(data: Uint8ClampedArray): number {
    const histogram = new Array(256).fill(0);

    // Construir histograma
    for (let i = 0; i < data.length; i += 4) {
      histogram[data[i]]++;
    }

    // Calcular umbral promedio ponderado
    let sum = 0;
    let total = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * histogram[i];
      total += histogram[i];
    }

    return sum / total;
  }

  /**
   * Ejecuta OCR con configuración optimizada
   */
  private async ejecutarOCR(canvas: HTMLCanvasElement): Promise<{ texto: string; confianza: number }> {
    console.log('🤖 [OCR] Ejecutando Tesseract...');

    const worker = await Tesseract.createWorker('spa+eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`📊 [Tesseract] Progreso: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    // Configuración optimizada para recibos
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáéíóúñÁÉÍÓÚÑ$.,:/- ()[]',
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      preserve_interword_spaces: '1',
    });

    const result = await worker.recognize(canvas);
    await worker.terminate();

    console.log('📄 [OCR] Texto extraído:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(result.data.text);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 [OCR] Confianza:', Math.round(result.data.confidence) + '%');

    return {
      texto: result.data.text,
      confianza: Math.round(result.data.confidence)
    };
  }

  /**
   * Extrae datos estructurados del texto con patrones avanzados
   */
  private extraerDatosAvanzado(texto: string): any {
    const datos: any = {};

    // Detectar tipo de documento
    datos.tipoDocumento = this.detectarTipoDocumento(texto);
    console.log('📋 [OCR] Tipo de documento:', datos.tipoDocumento);

    // Extraer monto con patrones específicos por tipo
    datos.cantidad = this.extraerMonto(texto, datos.tipoDocumento);

    // Extraer fecha
    datos.fecha = this.extraerFecha(texto);

    // Extraer descripción
    datos.descripcion = this.extraerDescripcion(texto, datos.tipoDocumento);

    return datos;
  }

  /**
   * Detecta el tipo de documento basado en palabras clave
   */
  private detectarTipoDocumento(texto: string): string {
    const textoLower = texto.toLowerCase();

    const patrones = {
      'Boleta de Supermercado': ['supermercado', 'jumbo', 'lider', 'santa isabel', 'unimarc', 'tottus', 'walmart'],
      'Atención Médica': ['clínica', 'hospital', 'médico', 'consulta', 'atención', 'salud', 'isapre', 'fonasa'],
      'Voucher': ['voucher', 'comprobante', 'transacción', 'tarjeta', 'débito', 'crédito'],
      'Factura': ['factura', 'rut', 'giro', 'razón social'],
      'Boleta': ['boleta', 'ticket', 'vale']
    };

    for (const [tipo, palabras] of Object.entries(patrones)) {
      if (palabras.some(palabra => textoLower.includes(palabra))) {
        return tipo;
      }
    }

    return 'Documento Genérico';
  }

  /**
   * Extrae el monto con patrones específicos
   */
  private extraerMonto(texto: string, tipoDocumento: string): number | undefined {
    console.log('💰 [OCR] Extrayendo monto...');

    // Palabras clave según tipo de documento
    const palabrasClave = {
      'Boleta de Supermercado': ['total', 'total a pagar', 'total general'],
      'Atención Médica': ['total', 'copago', 'valor consulta', 'monto'],
      'Voucher': ['monto', 'total', 'importe'],
      'default': ['total', 'monto', 'precio', 'valor', 'importe', 'pagar']
    };

    const palabras = palabrasClave[tipoDocumento as keyof typeof palabrasClave] || palabrasClave.default;

    // Patrones de búsqueda
    const patrones = [
      // Con palabras clave
      ...palabras.map(p => new RegExp(`${p}[\\s:]*\\$?\\s*(\\d{1,3}(?:[.,]\\d{3})*(?:[.,]\\d{2})?)`, 'gi')),
      // Formato moneda chilena: $5.000 o $5.000,50
      /\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g,
      // Solo números grandes (probablemente totales)
      /(\d{1,3}(?:[.,]\d{3})+)/g
    ];

    const montosEncontrados: number[] = [];

    for (const patron of patrones) {
      const matches = Array.from(texto.matchAll(patron));

      for (const match of matches) {
        const monto = this.normalizarMonto(match[1] || match[0]);
        if (monto && monto > 0 && monto < 10000000) { // Filtrar montos razonables
          montosEncontrados.push(monto);
        }
      }
    }

    if (montosEncontrados.length > 0) {
      // Retornar el monto más grande (generalmente es el total)
      const montoMax = Math.max(...montosEncontrados);
      console.log('✅ [OCR] Monto detectado:', montoMax);
      return montoMax;
    }

    console.warn('⚠️ [OCR] No se pudo detectar monto');
    return undefined;
  }

  /**
   * Normaliza un string de monto a número
   */
  private normalizarMonto(montoStr: string): number | null {
    // Limpiar
    let limpio = montoStr.replace(/[$\s]/g, '');

    // Determinar formato
    if (limpio.match(/,\d{2}$/)) {
      // Formato: 5.000,50 (europeo/latinoamericano)
      limpio = limpio.replace(/\./g, '').replace(',', '.');
    } else if (limpio.match(/\.\d{2}$/)) {
      // Formato: 5,000.50 (anglosajón)
      limpio = limpio.replace(/,/g, '');
    } else {
      // Sin decimales claros
      limpio = limpio.replace(/[.,]/g, '');
    }

    const numero = parseFloat(limpio);
    return isNaN(numero) ? null : numero;
  }

  /**
   * Extrae fecha del texto
   */
  private extraerFecha(texto: string): string | undefined {
    const patronesFecha = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,  // DD-MM-YYYY
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,  // YYYY-MM-DD
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2})/   // DD-MM-YY
    ];

    for (const patron of patronesFecha) {
      const match = texto.match(patron);
      if (match) {
        console.log('📅 [OCR] Fecha detectada:', match[1]);
        return match[1];
      }
    }

    return undefined;
  }

  /**
   * Extrae descripción del texto
   */
  private extraerDescripcion(texto: string, tipoDocumento: string): string {
    const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 3);

    // Palabras clave según tipo
    const palabrasClave: Record<string, string[]> = {
      'Boleta de Supermercado': ['supermercado', 'compra'],
      'Atención Médica': ['consulta', 'atención', 'médico'],
      'Voucher': ['compra', 'transacción'],
      'default': ['compra', 'gasto']
    };

    const palabras = palabrasClave[tipoDocumento] || palabrasClave['default'];

    // Buscar línea con palabra clave
    for (const linea of lineas) {
      const lineaLower = linea.toLowerCase();
      if (palabras.some(p => lineaLower.includes(p))) {
        return linea.substring(0, 100);
      }
    }

    // Si no se encuentra, usar primera línea significativa
    for (const linea of lineas) {
      if (linea.match(/[a-zA-Z]/) && linea.length > 5 && !linea.match(/^\d+$/)) {
        return linea.substring(0, 100);
      }
    }

    return `${tipoDocumento} - ${new Date().toLocaleDateString()}`;
  }
}
