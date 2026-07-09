import { Module } from '@nestjs/common';
import { SearchEngineService } from './search-engine.service';

@Module({
  providers: [SearchEngineService],
  exports: [SearchEngineService],
})
export class SearchModule {}
