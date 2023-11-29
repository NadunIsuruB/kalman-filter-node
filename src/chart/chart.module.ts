import { Module } from '@nestjs/common';
import { ChartService } from './chart.service';
import { ChartController } from './controllers/chart.controller';

@Module({
  controllers: [ChartController],
  providers: [ChartService],
  exports: [ChartService], // Export the service if needed by other modules
})
export class ChartModule {}