export const environment = {
  production: false,
  get apiUrl() {
    const hostname = window.location.hostname;

    // Si estamos en localhost, usar localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://192.168.1.18:9150/api';
    }

    // Si estamos en la red local (ej: 192.168.1.3), usar la misma IP
    return `http://${hostname}:9150/api`;
  },
  google: {
    // Cambié el clientId al que está configurado en Google Cloud Console
    clientId: '412131551809-ipbsdonp0927n7dgq6vnut05d67posda.apps.googleusercontent.com'
  },
  cloudflare: {
    accountId: '131cc534dd5d92500b782f12da009861',
    apiToken: '3nrr8Wr8nB17DSRV41sddPLk1uMyd7DEDL0Ezxra',
    model: '@cf/meta/llama-3.2-11b-vision-instruct'
  }
};
