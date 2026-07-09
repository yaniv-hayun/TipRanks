import { Module } from '@nestjs/common';
import { AutocompleteController } from './autocomplete.controller';
import { AutocompleteService } from './autocomplete.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  controllers: [AutocompleteController],
  providers: [AutocompleteService],
})
export class AutocompleteModule {}
