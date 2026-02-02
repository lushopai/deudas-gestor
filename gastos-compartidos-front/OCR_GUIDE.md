# 📸 Guía para Mejorar el Escaneo de Recibos

## 🎯 Sistema OCR Mejorado

El sistema ahora incluye:

### ✨ Mejoras Implementadas

1. **Pre-procesamiento Automático de Imagen**
   - Conversión a escala de grises
   - Aumento de contraste (1.5x)
   - Binarización con umbral adaptativo (Método de Otsu)
   - Redimensionamiento inteligente (máx 1920x1920)

2. **Detección Inteligente de Tipo de Documento**
   - Boletas de Supermercado
   - Atenciones Médicas
   - Vouchers de Pago
   - Facturas
   - Boletas Genéricas

3. **Extracción Específica por Tipo**
   - Patrones de búsqueda adaptados al tipo de documento
   - Palabras clave específicas (ej: "total a pagar" para supermercados)
   - Validación de montos razonables (< $10.000.000)

4. **Normalización de Formatos**
   - Soporta formato chileno: $5.000 o $5.000,50
   - Soporta formato anglosajón: $5,000.50
   - Corrección automática de separadores

## 📋 Tipos de Documentos Soportados

### 🛒 Boletas de Supermercado
**Detecta:**
- Jumbo, Líder, Santa Isabel, Unimarc, Tottus, Walmart
- Busca: "total", "total a pagar", "total general"

### 🏥 Atenciones Médicas
**Detecta:**
- Clínicas, hospitales, consultas médicas
- Busca: "total", "copago", "valor consulta"

### 💳 Vouchers
**Detecta:**
- Comprobantes de tarjeta, transacciones
- Busca: "monto", "total", "importe"

### 📄 Facturas y Boletas
**Detecta:**
- Documentos tributarios
- Busca: RUT, razón social, totales

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

4. **Contraste**
   - Usa un fondo oscuro para recibos blancos
   - Usa un fondo claro para recibos oscuros

5. **Resolución**
   - Acércate lo suficiente para que el texto sea legible
   - No uses zoom digital (acércate físicamente)

### ❌ EVITAR:

1. **Mala Iluminación**
   - ❌ Fotos con flash directo (crea reflejos)
   - ❌ Luz amarilla o tenue
   - ❌ Contraluz

2. **Mala Posición**
   - ❌ Fotos en ángulo o inclinadas
   - ❌ Recibo arrugado o doblado
   - ❌ Recibo parcialmente visible

3. **Calidad**
   - ❌ Fotos borrosas o movidas
   - ❌ Texto muy pequeño
   - ❌ Recibos muy desgastados

## 🔧 Cómo Funciona el Pre-procesamiento

```
Imagen Original
    ↓
1. Redimensionar (si es muy grande)
    ↓
2. Convertir a Escala de Grises
    ↓
3. Aumentar Contraste (1.5x)
    ↓
4. Binarización (Blanco/Negro)
    ↓
5. OCR con Tesseract
    ↓
6. Extracción de Datos
    ↓
Resultado Estructurado
```

## 📊 Patrones de Detección

### Montos
```
✅ $5.000
✅ $5.000,50
✅ 5000
✅ Total: $5.000
✅ TOTAL A PAGAR $5.000
```

### Fechas
```
✅ 02/02/2026
✅ 2026-02-02
✅ 02-02-26
```

### Descripciones
- Primera línea con texto significativo
- Líneas con palabras clave del tipo de documento
- Máximo 100 caracteres

## 🎓 Ejemplos de Uso

### Ejemplo 1: Boleta de Supermercado
```
Entrada: Foto de boleta de Jumbo
Detecta: "Boleta de Supermercado"
Busca: "TOTAL A PAGAR"
Resultado: $15.450
```

### Ejemplo 2: Atención Médica
```
Entrada: Foto de boleta de clínica
Detecta: "Atención Médica"
Busca: "COPAGO" o "TOTAL"
Resultado: $8.500
```

### Ejemplo 3: Voucher
```
Entrada: Foto de comprobante de tarjeta
Detecta: "Voucher"
Busca: "MONTO" o "TOTAL"
Resultado: $12.990
```

## 🚀 Mejoras Futuras Posibles

1. **Corrección de Perspectiva**
   - Detectar y corregir fotos en ángulo

2. **Reducción de Ruido**
   - Filtros gaussianos para eliminar ruido

3. **Detección de Bordes**
   - Recorte automático del documento

4. **Aprendizaje de Patrones**
   - Guardar patrones exitosos localmente
   - Mejorar con el uso

5. **Múltiples Intentos**
   - Probar diferentes configuraciones de pre-procesamiento
   - Seleccionar el mejor resultado

## 📝 Notas Técnicas

- **Motor OCR**: Tesseract.js (español + inglés)
- **Precisión esperada**: 70-95% según calidad de imagen
- **Tiempo de procesamiento**: 3-10 segundos
- **Tamaño máximo**: 1920x1920 px (redimensionado automático)
- **Formatos soportados**: JPG, PNG, WebP

## 🐛 Solución de Problemas

### "No se detectó ningún monto"
- Verifica que el total esté visible
- Asegúrate de que el texto sea legible
- Prueba con mejor iluminación

### "Monto incorrecto"
- El sistema toma el monto más grande detectado
- Verifica que no haya otros números grandes en el recibo
- Puedes corregir manualmente el monto

### "Confianza baja (<70%)"
- Retoma la foto con mejor iluminación
- Asegúrate de que el recibo esté plano
- Limpia la lente de la cámara
