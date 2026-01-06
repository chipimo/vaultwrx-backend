import { JsonController, Get } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController('/test')
export class TestController {
  @Get('/')
  public async test(): Promise<{ message: string }> {
    return { message: 'Test controller is working!' };
  }
}

