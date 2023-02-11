import { IsString, MinLength } from 'class-validator';

export class AuthCredentialDto {
  @IsString()
  @MinLength(3)
  username: string;

  @MinLength(6)
  // @Matches('....')
  password: string;
}
