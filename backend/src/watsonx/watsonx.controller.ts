import { Body, Controller, Post } from '@nestjs/common';
import { WatsonxService } from './watsonx.service';

@Controller('watsonx')
export class WatsonxController {
  constructor(private readonly watsonxService: WatsonxService) {}

  @Post('query')
  async sendQuery(@Body('prompt') prompt: string){
    return this.watsonxService.sendPrompt(prompt);
  }
}
