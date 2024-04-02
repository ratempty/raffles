import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요.' })
  email: string;

  @IsOptional()
  @IsString({ message: '유효한 이름을 입력해주세요.' })
  name: string;

  @IsOptional()
  @IsString({ message: '유효한 닉네임을 입력해주세요.' })
  nickName: string;
}
