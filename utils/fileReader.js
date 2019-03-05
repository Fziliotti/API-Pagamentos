const fs = require('fs');


fs.readFile('texto.txt', function(err, buffer){
    if (err) console.log(err)
    console.log('Lendo arquivo para cópia.')
    fs.writeFile('texto2.txt', buffer, function(){
        console.log('Arquivo criado com sucesso!')
    })
})