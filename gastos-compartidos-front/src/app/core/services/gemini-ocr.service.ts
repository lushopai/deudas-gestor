import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface OcrResult {
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
    usedGemini: boolean;
    motor?: string;
}

interface BackendOcrResponse {
    texto: string;
    confianza: number;
    datos: {
        cantidad: number;
        descripcion: string;
        fecha: string;
        tipoDocumento: string;
        comercio: string;
        items: Array<{ nombre: string; precio: number }>;
    };
    motor: string;
}

@Injectable({
    providedIn: 'root'
})
export class GeminiOcrService {

    constructor(private http: HttpClient) { }

    /**
     * Procesa un recibo llamando al backend (que usa Claude Vision de Anthropic)
     */
    async procesarRecibo(imagenFile: File): Promise<OcrResult> {
        try {
            const formData = new FormData();
            formData.append('file', imagenFile);

            // Usar la URL base del environment
            const url = `${environment.apiUrl}/ocr/scan`;

            return new Promise((resolve, reject) => {
                this.http.post<BackendOcrResponse>(url, formData).subscribe({
                    next: (response) => {
                        resolve({
                            texto: response.texto,
                            confianza: response.confianza,
                            datos: response.datos,
                            usedGemini: true,
                            motor: response.motor || 'claude-vision'
                        });
                    },
                    error: (error) => {
                        console.error('OCR Backend Error:', error);
                        reject(error);
                    }
                });
            });

        } catch (error) {
            console.error('OCR Error inesperado:', error);
            throw error;
        }
    }

    /**
     * Verifica si el servicio está disponible
     */
    isAvailable(): boolean {
        return true; // Siempre disponible ya que reside en el backend
    }
}
