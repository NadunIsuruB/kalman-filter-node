import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChartController } from './chart/controllers/chart.controller';
import { ChartModule } from './chart/chart.module';

@Module({
  imports: [ChartModule],
  controllers: [
    AppController,
    ChartController
  ],
  providers: [AppService],
})
export class AppModule {}
