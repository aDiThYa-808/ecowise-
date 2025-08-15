import { Test, TestingModule } from '@nestjs/testing';
import { WatsonxController } from './watsonx.controller';
import { WatsonxService } from './watsonx.service';

describe('WatsonxController', () => {
  let controller: WatsonxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatsonxController],
      providers: [WatsonxService],
    }).compile();

    controller = module.get<WatsonxController>(WatsonxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
