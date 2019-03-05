console.log('ae')


const obj = {
    name: "fabricio",
    idade: 20,
    pai: "Oripinho"
}


var desestFunction = ({name, idade, pai}) => {
    console.log(`Olá ${name}, você possui ${idade} anos e seu pai se chama ${pai}`)
}

desestFunction(obj);