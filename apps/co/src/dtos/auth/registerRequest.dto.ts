import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @IsNotEmpty()
  @MinLength(3)
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must have at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character',
    }
  )
  password: string;

  confirmPassword: string;
}
