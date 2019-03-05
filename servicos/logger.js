const winston = require('winston');
const fs = require('fs');

//a aplicacao nao cria os logs nessa pasta, e para isso verificamos se a pasta existe

if (!fs.existsSync('logs')){
    fs.mkdirSync('logs');
}
module.exports = winston.createLogger({
    
    transports: [
        new winston.transports.File({
            level: "info",
            filename: "logs/payfast.log",
            maxsize: 1048576,
            maxFiles: 10,
            colorize: false,
            timestamp: true 
           
            
        })
    ],
    
});
