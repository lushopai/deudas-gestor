import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Mock service para Google OAuth durante desarrollo local
 * Genera tokens JWT falsos para testing
 */
@Injectable({
  providedIn: 'root'
})
export class GoogleMockService {
  private mockUsers = [
    {
      id: '1',
      email: 'test.usuario@example.com',
      nombre: 'Usuario Test',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test1'
    },
    {
      id: '2',
      email: 'pareja.test@example.com',
      nombre: 'Pareja Test',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test2'
    }
  ];

  /**
   * Genera un token JWT falso para testing
   */
  generateMockToken(userEmail: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        iss: 'https://accounts.google.com',
        aud: 'mock-client-id',
        sub: Math.random().toString(36).substr(2, 9),
        email: userEmail,
        email_verified: true,
        name: this.mockUsers.find(u => u.email === userEmail)?.nombre || 'Mock User',
        picture: this.mockUsers.find(u => u.email === userEmail)?.foto || '',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      })
    );
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Simula el flujo de login de Google
   */
  simulateGoogleLogin(): Observable<string> {
    // Usa el primer usuario por defecto en testing
    const token = this.generateMockToken(this.mockUsers[0].email);
    console.log('🧪 Mock Google Login - Token generado:', token);
    return of(token);
  }

  /**
   * Obtiene los usuarios disponibles para testing
   */
  getMockUsers() {
    return this.mockUsers;
  }
}
