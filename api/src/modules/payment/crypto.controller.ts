import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CryptoService } from './crypto.service';

@Controller('/crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('/create_session')
  createSession(@Body('amount') amount: string, @Body('currency') currency?: string) {
    if (!amount) {
      throw new HttpException('Missing amount.', HttpStatus.BAD_REQUEST);
    }
    return this.cryptoService.createSession(amount, currency);
  }

  @Get('/status/:paymentId')
  getStatus(@Param('paymentId') paymentId: string) {
    return this.cryptoService.getStatus(paymentId);
  }
}
