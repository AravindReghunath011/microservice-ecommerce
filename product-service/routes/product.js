const express = require('express')
const router = express.Router()
const productSchema = require('../db/productSchema')
const amqp = require('amqplib')
let channel,connection;
const auth = require('../isAuth')


router.post('/create',(req,res)=>{
    console.log(req.body);
    const {name,description,price} = req.body
    let newProduct = new productSchema({
        name:name,
        description:description,
        price:price
    })

    newProduct.save()
    console.log(newProduct,'newwww');
    return res.json({newproduct:newProduct})

})

async function connectWithRetry() {
    const maxRetries = 10;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const amqpServer = 'amqp://rabbitmq:5672'
            connection = await amqp.connect(amqpServer)
            channel = await connection.createChannel()
            await channel.assertQueue('PRODUCT')

            console.log('channel created !!!!!!!')
            
            break; // Break out of the loop if successful
        } catch (error) {
            console.error(`Error connecting to RabbitMQ: ${error.message}`);
            retryCount++;
            console.log(`Retrying in 5 seconds (Retry ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

connectWithRetry().catch(console.error);






router.post('/buy',auth,async(req,res)=>{
    var newOrder;
    const {ids} = req.body
    let products = await productSchema.find({_id:{$in:ids}})
    channel.sendToQueue(
        'ORDER',
        Buffer.from(
            JSON.stringify({
                products,
                userEmail:req.user.email
            })
        )
    )

    await channel.consume('PRODUCT',(data)=>{
        newOrder =  JSON.parse(data.content)
        
        console.log(newOrder,'from product service')
    })
    console.log(newOrder,'hehehe');

    return res.json(newOrder)
   
})

module.exports = router