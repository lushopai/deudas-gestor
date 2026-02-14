export const environment = {
  production: false,
  get apiUrl() {
    // NGROK: Descomenta y reemplaza con tu URL de ngrok
    // return 'https://tu-dominio.ngrok-free.app/api';

    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Si estamos en localhost (desarrollo con ng serve), apuntar al nginx proxy
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'https://0027-2803-c600-7115-c592-ddd0-8191-263f-46ea.ngrok-free.app/api';  // Nginx en puerto 80
    }

    // Si estamos en la red local o ngrok, usar ruta relativa
    return '/api';
  },
  google: {
    clientId: '412131551809-ipbsdonp0927n7dgq6vnut05d67posda.apps.googleusercontent.com'
  },

};
