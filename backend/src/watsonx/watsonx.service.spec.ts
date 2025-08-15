import { Test, TestingModule } from '@nestjs/testing';
import { WatsonxService } from './watsonx.service';

describe('WatsonxService', () => {
  let service: WatsonxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WatsonxService],
    }).compile();

    service = module.get<WatsonxService>(WatsonxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
