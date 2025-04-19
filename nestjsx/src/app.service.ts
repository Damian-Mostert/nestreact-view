import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcomeProps(): any {
    return {
        title:"Welcome | @damian88/nestjsx"
    }
  }
}
