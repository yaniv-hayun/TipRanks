import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { AutocompleteModule } from './autocomplete/autocomplete.module';

@Module({
  imports: [DataModule, AutocompleteModule],
})
export class AppModule {}
