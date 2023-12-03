const express = require('express')
const app = express()
const PORT = 8003
const mongoose = require('mongoose')
const orderSchema = require('./db/orderSchema')
const amqp = require('amqplib')
let connection,channel;


mongoose.connect('mongodb://mongodb/order-service')
.then(()=>{
    console.log('order service db connected')
})

async function createOrder(products,email){
    products = products || []
    let total = products.reduce((acc,total)=>{
        total +=acc+total
    },0)
    let newOrder = new orderSchema({
        products:products,
        total:total,
        userEmail:email
    })

    await newOrder.save()
    console.log(newOrder,'created')
    return newOrder
}


async function connectWithRetry() {
    const maxRetries = 10;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const amqpServer = 'amqp://rabbitmq:5672'
            connection = await amqp.connect(amqpServer)
            channel = await connection.createChannel()
            await channel.assertQueue('ORDER')

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

connectWithRetry().then(()=>{
    channel.consume('ORDER',async(data)=>{
        const {products,userEmail} =JSON.parse( data.content)
        const newOrder = await createOrder(products,userEmail)
        console.log(newOrder,'okokok')
        console.log('consuming order')
        channel.ack(data)
        channel.sendToQueue(
            'PRODUCT',
            Buffer.from(JSON.stringify({newOrder}))
        )

    })


}).catch(console.error);




app.listen(PORT,()=>{
    console.log('order service running at 8003')
})