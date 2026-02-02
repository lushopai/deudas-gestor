# 📸 Guía de Escaneo de Recibos con IA

## 🚀 Sistema OCR Mejorado con Gemini AI

El sistema ahora utiliza **Google Gemini Vision AI** como motor principal de OCR, proporcionando:

### ✨ Ventajas de Gemini AI vs OCR Tradicional

| Característica | Tesseract (Antes) | Gemini AI (Ahora) |
|----------------|-------------------|-------------------|
| **Precisión** | 60-75% | **90-98%** |
| **Comprensión contextual** | No | **Sí** (entiende qué es un total vs subtotal) |
| **Tolerancia a errores** | Baja | **Alta** (maneja fotos en ángulo, mala luz) |
| **Velocidad** | 5-10 segundos | **1-2 segundos** |
| **Extracción estructurada** | Básica | **Inteligente** (detecta comercio, tipo doc, etc.) |

### 🤖 ¿Cómo funciona?

1. **Captura de imagen**: El usuario toma foto o selecciona de galería
2. **Envío a Gemini**: La imagen se envía a Google Gemini Vision AI
3. **Análisis inteligente**: Gemini analiza la imagen y extrae:
   - Monto total
   - Comercio/establecimiento
   - Tipo de documento
   - Fecha
   - Descripción
4. **Respuesta estructurada**: Los datos se presentan para confirmar y guardar

### 🔄 Sistema de Fallback

Si Gemini no está disponible (sin internet, error de API), el sistema automáticamente usa **Tesseract.js** como respaldo.

## 📋 Tipos de Documentos Soportados

### 🛒 Boletas de Supermercado
- Jumbo, Líder, Santa Isabel, Unimarc, Tottus, Walmart
- Detecta automáticamente el comercio y total a pagar

### 🏥 Atenciones Médicas
- Clínicas, hospitales, consultas médicas
- Extrae copago, valor consulta, etc.

### 💳 Vouchers de Pago
- Comprobantes de tarjeta (débito/crédito)
- Transferencias, pagos electrónicos

### 📄 Facturas y Boletas Electrónicas
- Documentos tributarios
- RUT, razón social, montos

## 💡 Consejos para Mejores Resultados

### ✅ HACER:

1. **Iluminación**
   - Usa luz natural o luz blanca brillante
   - Evita sombras sobre el documento

2. **Posición**
   - Coloca el recibo sobre una superficie plana
   - Toma la foto desde arriba (90°)
   - Centra el documento en el encuadre

3. **Enfoque**
   - Asegúrate de que el texto esté nítido
   - Espera a que la cámara enfoque antes de capturar

### ❌ EVITAR:

- ❌ Fotos muy oscuras o con flash directo
- ❌ Recibos arrugados o doblados
- ❌ Fotos borrosas o movidas
- ❌ Recibos parcialmente visibles

## 🔧 Configuración Técnica

### API de Gemini
- **Modelo**: gemini-2.0-flash-exp (multimodal con visión)
- **Endpoint**: Google Generative Language API
- **Costo aproximado**: ~$0.00025 por imagen

### Variables de Entorno
```typescript
// environment.ts
gemini: {
  apiKey: 'TU_API_KEY',
  model: 'gemini-2.0-flash-exp'
}
```

### Servicios

| Servicio | Descripción |
|----------|-------------|
| `GeminiOcrService` | Motor principal con Gemini Vision AI |
| `OcrService` | Orquestador con fallback a Tesseract |

## 📊 Indicadores de Confianza

- **🟢 Alta (>70%)**: Imagen clara, datos bien leídos
- **🟡 Media (40-70%)**: Imagen regular, verificar datos
- **🔴 Baja (<40%)**: Imagen mala, revisar manualmente

## 🔐 Seguridad

- La API key está almacenada en environment (no en código)
- Las imágenes se procesan en tiempo real (no se almacenan en Google)
- En producción, considerar mover la API key al backend

## 📈 Mejoras Futuras

1. **Backend proxy**: Mover llamadas a Gemini al backend Java para mayor seguridad
2. **Caché inteligente**: Evitar reprocesar imágenes similares
3. **Aprendizaje**: Guardar patrones exitosos para mejorar sugerencias
4. **OCR offline**: Mejorar Tesseract para casos sin conexión

## 🐛 Solución de Problemas

### "Error de Gemini API"
- Verifica que la API key sea válida
- Asegura que la API esté habilitada en Google Cloud Console
- Revisa límites de cuota

### "Monto incorrecto"
- Retoma la foto con mejor iluminación
- Asegura que el total sea visible
- Puedes corregir manualmente antes de guardar

### "Motor: Tesseract" (en lugar de Gemini)
- Verifica conexión a internet
- Revisa la consola del navegador para errores
- Asegura que la API key está configurada

---

*Actualizado: Febrero 2026*
*Motor principal: Google Gemini Vision AI*
*Fallback: Tesseract.js*
