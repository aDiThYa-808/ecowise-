import { Module } from '@nestjs/common';
import { WatsonxService } from './watsonx.service';
import { WatsonxController } from './watsonx.controller';

@Module({
  controllers: [WatsonxController],
  providers: [WatsonxService],
})
export class WatsonxModule {}
