import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WatsonxModule } from './watsonx/watsonx.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),  
    WatsonxModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
