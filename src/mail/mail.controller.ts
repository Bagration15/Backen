
import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

class SendTestEmailDto {
  email: string;
}

class SendWelcomeEmailDto {
  email: string;
  nombre: string;
}

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // Endpoint para enviar correo de prueba
  @Post('test')
  async sendTestEmail(@Body() sendTestEmailDto: SendTestEmailDto) {
    return await this.mailService.sendTestEmail(sendTestEmailDto.email);
  }

  // Endpoint para probar correo de bienvenida
  @Post('welcome')
  async sendWelcomeEmail(@Body() body: SendWelcomeEmailDto) {
    return await this.mailService.sendWelcomeEmail(body.email, body.nombre);
  }
}