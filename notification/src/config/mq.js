import amqlib from 'amqplib'

const QUEUE = 'auth_notification_queue'

const connection = await amqlib.connect(process.env.RABBITMQ_URL);

const channel = await connection.createChannel();

channel.assertQueue(QUEUE,{durable:true})

export default channel;