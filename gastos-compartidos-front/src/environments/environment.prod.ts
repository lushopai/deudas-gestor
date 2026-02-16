export const environment = {
  production: true,
  // En producción: ruta relativa (funciona en ngrok y cualquier dominio)
  apiUrl: '/api',
  google: {
    clientId: '412131551809-ipbsdonp0927n7dgq6vnut05d67posda.apps.googleusercontent.com'
  },
  
  // Configuración de logging y monitoring
  logging: {
    enabled: true,
    level: 'error', // Solo errors en prod
    reportEndpoint: '/api/logs' // Backend recibe logs de cliente si es necesario
  },
  
  // Configuración de comportamiento en producción
  app: {
    enableDevTools: false,
    enableConsoleLogging: false,
    enableErrorTracking: true
  }
};

