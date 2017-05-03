requirejs.config({
  baseURL: 'js/lib',
  paths: {
    app: './app',
    'matter': './lib/matter'
  },
  packages: [
  ]
});

requirejs(['app/main']);
