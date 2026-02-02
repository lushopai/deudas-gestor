export const environment = {
  production: false,
  get apiUrl() {
    const hostname = window.location.hostname;

    // Si estamos en localhost, usar localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }

    // Si estamos en la red local (ej: 192.168.1.3), usar la misma IP
    return `http://${hostname}:8080/api`;
  },
  google: {
    // Cambié el clientId al que está configurado en Google Cloud Console
    clientId: '412131551809-ipbsdonp0927n7dgq6vnut05d67posda.apps.googleusercontent.com'
  }
};
