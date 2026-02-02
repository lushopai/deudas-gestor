import { Injectable } from '@angular/core';
import Tesseract from 'tesseract.js';

interface OcrResult {
  texto: string;
  confianza: number;
  datos?: {
    cantidad?: number;
    descripcion?: string;
    fecha?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  async procesarRecibo(imagenFile: File): Promise<OcrResult> {
    try {
      console.log('🔍 [OCR] Iniciando procesamiento de recibo...');

      // Crear worker con configuración mejorada para detectar números
      const worker = await Tesseract.createWorker('spa+eng', 1, {
        logger: m => console.log('📊 [Tesseract]', m)
      });

      // Configurar para mejorar detección de números
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáéíóúñÁÉÍÓÚÑ$.,:/- ',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      });

      const result = await worker.recognize(imagenFile);
      const texto = result.data.text;
      const confianza = result.data.confidence;

      console.log('📄 [OCR] Texto extraído (completo):');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(texto);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 [OCR] Confianza:', confianza + '%');
      console.log('📏 [OCR] Longitud del texto:', texto.length, 'caracteres');

      // Análisis básico del texto para extraer datos
      const datos = this.extraerDatos(texto);

      console.log('✅ [OCR] Datos extraídos:', datos);

      await worker.terminate();

      return {
        texto,
        confianza,
        datos
      };
    } catch (error) {
      console.error('❌ [OCR] Error en OCR:', error);
      throw error;
    }
  }

  private extraerDatos(texto: string): any {
    const datos: any = {};

    // Buscar montos con múltiples patrones
    // Patrones: $5.000, $5,000, 5.000, 5000, $5.000,50, etc.
    const patronesMontos = [
      /\$\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,  // $5.000 o $5.000,50
      /(?:total|monto|precio|valor|importe)[\s:]*\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi,  // Con palabras clave
      /\$\s*(\d+)/g,  // Cualquier número después de $
      /(\d{1,3}(?:[.,]\d{3})+)/g  // Números con separadores de miles
    ];

    let montoEncontrado = false;
    for (const patron of patronesMontos) {
      const matches = Array.from(texto.matchAll(patron));
      console.log(`🔎 [OCR] Probando patrón: ${patron}, matches encontrados:`, matches.length);

      if (matches.length > 0) {
        console.log('📝 [OCR] Matches:', matches.map(m => m[0]));

        // Tomar el monto más grande encontrado (probablemente el total)
        const montos = matches.map(m => {
          let numStr = m[1] || m[0];
          console.log('  🔢 [OCR] Procesando:', numStr);

          // Limpiar el string: remover $, espacios
          numStr = numStr.replace(/[$\s]/g, '');

          // Determinar si usa punto o coma como decimal
          // Si tiene punto seguido de 3 dígitos, es separador de miles
          // Si tiene coma seguida de 2 dígitos al final, es decimal
          if (numStr.match(/,\d{2}$/)) {
            // Formato: 5.000,50 (europeo/latinoamericano)
            numStr = numStr.replace(/\./g, '').replace(',', '.');
            console.log('    → Formato europeo/latinoamericano:', numStr);
          } else if (numStr.match(/\.\d{2}$/)) {
            // Formato: 5,000.50 (anglosajón)
            numStr = numStr.replace(/,/g, '');
            console.log('    → Formato anglosajón:', numStr);
          } else {
            // Sin decimales claros, asumir que punto/coma son separadores de miles
            numStr = numStr.replace(/[.,]/g, '');
            console.log('    → Sin decimales, removiendo separadores:', numStr);
          }

          const numero = parseFloat(numStr);
          console.log('    → Número final:', numero);
          return numero;
        }).filter(n => !isNaN(n) && n > 0);

        console.log('💰 [OCR] Montos válidos encontrados:', montos);

        if (montos.length > 0) {
          datos.cantidad = Math.max(...montos);
          console.log('✅ [OCR] Monto seleccionado (máximo):', datos.cantidad);
          montoEncontrado = true;
          break;
        }
      }
    }

    if (!montoEncontrado) {
      console.warn('⚠️ [OCR] No se pudo detectar ningún monto en el texto');
    }

    // Buscar fecha (DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, etc.)
    const patronesFecha = [
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,  // YYYY-MM-DD
      /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,  // DD-MM-YYYY o MM-DD-YYYY
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2})/   // DD-MM-YY
    ];

    for (const patron of patronesFecha) {
      const matchFecha = texto.match(patron);
      if (matchFecha) {
        datos.fecha = matchFecha[1];
        break;
      }
    }

    // Buscar descripción - intentar encontrar líneas significativas
    const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 2);

    // Buscar palabras clave que indiquen descripción
    const palabrasClave = ['folio', 'boleta', 'factura', 'ticket', 'compra', 'venta'];
    let descripcionEncontrada = false;

    for (const linea of lineas) {
      const lineaLower = linea.toLowerCase();
      for (const palabra of palabrasClave) {
        if (lineaLower.includes(palabra)) {
          datos.descripcion = linea.substring(0, 100);
          descripcionEncontrada = true;
          break;
        }
      }
      if (descripcionEncontrada) break;
    }

    // Si no se encontró descripción con palabras clave, usar la primera línea significativa
    if (!descripcionEncontrada && lineas.length > 0) {
      // Evitar líneas que solo tengan números o símbolos
      for (const linea of lineas) {
        if (linea.match(/[a-zA-Z]/) && linea.length > 3) {
          datos.descripcion = linea.substring(0, 100);
          break;
        }
      }
    }

    return datos;
  }
}
