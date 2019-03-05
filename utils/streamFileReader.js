const fs = require('fs');


//Execução concorrente
//Não tem callback igual o fs.readFile

//pipe apartir da função anterior, ira pegar o resultado
fs.createReadStream('texto.txt')
    .pipe(fs.createWriteStream('texto-stream.txt')) //entrada de dados
    .on('finish', function(){
        console.log('O arquivo escrito com stream está criado!')
    })

// Qual executa mais rapido? Fica variando entre o bufferMode e esse de Stream
// Escalona a execução de duas threads
// Stream é melhor porque o node lida bem com o IO, melhor que mexer com memoria