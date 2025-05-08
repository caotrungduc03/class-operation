import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Channel, connect, Connection } from 'amqplib';
import { EmailService } from '../email/email.service';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: Connection;
  private channel: Channel;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private readonly emailService: EmailService) {}

  async onModuleInit() {
    try {
      await this.connectToRabbitMQ();
      await this.consumeMessages();
    } catch (error) {
      this.logger.error('Failed to initialize RabbitMQ', error);
      throw error;
    }
  }

  private async connectToRabbitMQ() {
    const defaultUrl = process.env.RABBITMQ_URL;
    const http = process.env.RABBITMQ_HTTP;
    const user = process.env.RABBITMQ_USER;
    const password = process.env.RABBITMQ_PASSWORD;
    const host = process.env.RABBITMQ_HOST;
    const port = process.env.RABBITMQ_PORT;
    const url = defaultUrl ?? `${http}://${user}:${password}@${host}:${port}`;

    this.connection = await connect(url);
    this.channel = await this.connection.createChannel();

    const queue = process.env.RABBITMQ_QUEUE || 'notifications';
    await this.channel.assertQueue(queue, { durable: true });

    this.logger.log('Connected to RabbitMQ for consuming notifications');
  }

  private async consumeMessages() {
    const queue = process.env.RABBITMQ_QUEUE || 'notifications';

    this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          this.logger.log(`Received message of type: ${content.type}`);

          switch (content.type) {
            case 'email-notification':
              await this.emailService.sendEmail(
                content.data.email,
                content.data.subject,
                content.data.content,
              );
              break;
            case 'web-notification':
            default:
              this.logger.warn(`Unknown message type: ${content.type}`);
          }

          this.channel.ack(msg);
        } catch (error) {
          this.logger.error('Error processing message', error);
          this.channel.nack(msg);
        }
      }
    });

    this.logger.log(`Started consuming messages from queue: ${queue}`);
  }
}
