import { Controller, Get, Query } from '@nestjs/common';
import { AutocompleteService } from './autocomplete.service';
import { AutocompleteQueryDto } from './dto/autocomplete-query.dto';
import { AutocompleteResult } from './dto/autocomplete-result.dto';

@Controller('api/autocomplete')
export class AutocompleteController {
  constructor(private readonly autocompleteService: AutocompleteService) {}

  @Get()
  search(@Query() queryDto: AutocompleteQueryDto): AutocompleteResult[] {
    return this.autocompleteService.search(queryDto.query ?? '');
  }
}
