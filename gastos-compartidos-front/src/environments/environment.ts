export const environment = {
  production: false,
  // IMPORTANTE: Usar ruta relativa /api para que funcione en:
  // - localhost con ng serve
  // - Docker con nginx
  // - ngrok (cualquier dominio)
  apiUrl: '/api',
  google: {
    clientId: '412131551809-ipbsdonp0927n7dgq6vnut05d67posda.apps.googleusercontent.com'
  },

};
