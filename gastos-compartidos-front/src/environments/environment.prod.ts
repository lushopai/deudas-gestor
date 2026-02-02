export const environment = {
  production: true,
  get apiUrl() {
    const hostname = window.location.hostname;
    // En producción (Docker), el backend estará en el puerto 9150 del mismo host
    return `http://${hostname}:9150/api`;
  },
  google: {
    clientId: '412131551809-ipbsdonp0927n7dgq6vnut05d67posda.apps.googleusercontent.com'
  },
  cloudflare: {
    accountId: '131cc534dd5d92500b782f12da009861',
    apiToken: '3nrr8Wr8nB17DSRV41sddPLk1uMyd7DEDL0Ezxra',
    model: '@cf/meta/llama-3.2-11b-vision-instruct'
  }
};
