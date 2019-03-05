
// o proprio express que está invocando ira conseguir a propria referencia dele que é a variavel app
const fs = require('fs');

module.exports = function(app){

    app.post('/upload/imagem', (req,res) => {
        console.log('Recebendo imagem!');
        // var body = req.body;
        let filename = req.headers.filename;

        req.pipe(fs.createWriteStream('files/' + filename))
           .on('finish', () => {
               console.log('imagem recebida e colocada na pasta files!')
               res.status(201).send('ok');
           })
    })

}   