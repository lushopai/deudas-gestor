export const environment = {
  production: true,
  get apiUrl() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    // En producción (Docker), el backend estará en el puerto 9150 del mismo host
    // Usa el mismo protocolo que la aplicación (HTTP o HTTPS)
    return `${protocol}//${hostname}:9150/api`;
  },
  google: {
    clientId: '412131551809-ipbsdonp0927n7dgq6vnut05d67posda.apps.googleusercontent.com'
  },

};
