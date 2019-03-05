const logger = require('../servicos/logger.js')

module.exports = function(app){

  
  app.get('/', (req, res) => res.send('Você está no sistema da Payfast!'))
  

  app.get('/pagamentos',(req, res) => {
    let connection = app.persistencia.connectionFactory(); //abre conexao
    let pagamentoDao = new app.persistencia.PagamentoDao(connection); //instancia o DAO passando a conexao
    
    pagamentoDao.lista((err, result) => {
      if (err) throw err;
      console.log('Pagamentos Listados!');
      res.send(result);
    });

  });

  app.get('/pagamentos/pagamento/:id', (req, res) =>{

    let id = req.params.id;
    console.log('consultando pagamento: ' + id);
    logger.info('Consultando pagamento: ' + id);

    let memcachedClient = app.servicos.memcachedClient();
    console.log(memcachedClient.get('pagamento-1'))
    
    memcachedClient.get('pagamento-' + id, (erro, retorno) =>{
      if (erro || !retorno){
        console.log('MISS - chave nao encontrada');

        let connection = app.persistencia.connectionFactory();
        let pagamentoDao = new app.persistencia.PagamentoDao(connection);

        pagamentoDao.buscaPorId(id, (erro, resultado) =>{
          if(erro){
            console.log('erro ao consultar no banco: ' + erro);
            res.status(500).send(erro);
            return;
          }
          console.log('pagamento encontrado: ' + JSON.stringify(resultado));
          res.json(resultado);
          return;
        });
        //HIT no cache
      } else {
        console.log('HIT - valor: ' + JSON.stringify(retorno));
        res.json(retorno);
        return;
      }
    });

  });

  app.delete('/pagamentos/pagamento/:id', (req, res) =>{
    let pagamento = {
      id: req.params.id,
      status: 'CANCELADO'
    };
    
    let connection = app.persistencia.connectionFactory();
    let pagamentoDao = new app.persistencia.PagamentoDao(connection);

    pagamentoDao.atualiza(pagamento, (erro) =>{
        if (erro){
          res.status(500).send(erro);
          return;
        }
        console.log('pagamento cancelado');
        res.status(204).send(pagamento);
    });
  });


  app.put('/pagamentos/pagamento/:id', (req, res) =>{

    let pagamento = {
      id: req.params.id,
      status: 'CONFIRMADO'
    };

    let connection = app.persistencia.connectionFactory();
    let pagamentoDao = new app.persistencia.PagamentoDao(connection);

    pagamentoDao.atualiza(pagamento, erro =>{
        if (erro){
          res.status(500).send(erro);
          return;
        }
        console.log('pagamento criado');
        res.send(pagamento);
    });

  });

  app.post('/pagamentos/pagamento', (req, res) =>{

    req.assert("pagamento.forma_de_pagamento",
        "Forma de pagamento eh obrigatorio").notEmpty();
    req.assert("pagamento.valor",
      "Valor eh obrigatorio e deve ser um decimal")
        .notEmpty().isFloat();

    let erros = req.validationErrors();

    if (erros){
      console.log('Erros de validacao encontrados');
      res.status(400).send(erros);
      return;
    }

    let pagamento = req.body["pagamento"];
    pagamento.status = 'CRIADO';
    pagamento.data = new Date;
    console.log('processando uma requisicao de um novo pagamento');
  

    let connection = app.persistencia.connectionFactory();
    let pagamentoDao = new app.persistencia.PagamentoDao(connection);

    pagamentoDao.salva(pagamento, function(erro, resultado){
      if(erro){
        console.log('Erro ao inserir no banco: ' + erro);
        res.status(500).send(erro);
      } else {
      pagamento.id = resultado.insertId;
      console.log('pagamento criado');

      let memcachedClient = app.servicos.memcachedClient();
      memcachedClient.set('pagamento-' + pagamento.id, pagamento,
                60000, function(erro){
                  console.log('nova chave adicionada ao cache: pagamento-' + pagamento.id);
      });

      if (pagamento.forma_de_pagamento == 'cartao'){
        let cartao = req.body["cartao"];
        console.log(cartao);

        let clienteCartoes = new app.servicos.clienteCartoes();

        clienteCartoes.autoriza(cartao,
            function(exception, request, response, retorno){
              if(exception){
                console.log(exception);
                res.status(400).send(exception);
                return;
              }
              console.log(retorno);

              res.location('/pagamentos/pagamento/' +
                    pagamento.id);

              let response = {
                dados_do_pagamanto: pagamento,
                cartao: retorno,
                links: [
                  {
                    href:"http://localhost:3000/pagamentos/pagamento/"
                            + pagamento.id,
                    rel:"confirmar",
                    method:"PUT"
                  },
                  {
                    href:"http://localhost:3000/pagamentos/pagamento/"
                            + pagamento.id,
                    rel:"cancelar",
                    method:"DELETE"
                  }
                ]
              }

              res.status(201).json(response);
              return;
        });


      } else {
        res.location('/pagamentos/pagamento/' +
              pagamento.id);

        let response = {
          dados_do_pagamanto: pagamento,
          links: [
            {
              href:"http://localhost:3000/pagamentos/pagamento/"
                      + pagamento.id,
              rel:"confirmar",
              method:"PUT"
            },
            {
              href:"http://localhost:3000/pagamentos/pagamento/"
                      + pagamento.id,
              rel:"cancelar",
              method:"DELETE"
            }
          ]
        }

        res.status(201).json(response);
      }
    }
    });

  });
}
