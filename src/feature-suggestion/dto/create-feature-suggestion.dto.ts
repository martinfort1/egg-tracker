import { IsString, IsEmail, MinLength, MaxLength, IsEnum } from 'class-validator';

export class CreateFeatureSuggestionDto {
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title?: string;

  @IsEnum(['sales', 'employees', 'analytics', 'automation', 'ui', 'other'])
  category?: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description?: string;
}
