const express = require('express');
const consign = require('consign');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const logger = require('../servicos/logger.js');
const morgan = require('morgan');

module.exports = function(){
  let app = express();

  //criação de middlewares
  //common é um formato padrão do morgan que irá logar a requisicao de uma forma padrão
  app.use(morgan('common', {
    //executa concorrentemente com stream
    stream: {
      write: function(message){
        logger.info(message)
      }
    }
  }))

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(expressValidator());

  consign()
   .include('controllers')
   .then('persistencia')
   .then('servicos')
   .into(app);

  return app;
}
