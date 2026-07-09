import { Module, Global } from '@nestjs/common';
import { DataLoaderService } from './data-loader.service';

/**
 * Global module so DataLoaderService is available everywhere
 * without needing to import DataModule in every consumer module.
 */
@Global()
@Module({
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataModule {}
