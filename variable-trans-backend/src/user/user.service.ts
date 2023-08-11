import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserRepository } from './repository/user.repository';
import { User } from './entity/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { SessionService } from './session/session.service';
import * as bcrypt from 'bcrypt';
import { SetSessionDto } from './session/dto/set-session.dto';
import { ValidatedUserDto } from './dto/validated-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('SessionService') private readonly sessionService: SessionService,
  ) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    await registerUserDto.encodePassword();
    const user: User = registerUserDto.toEntity();
    this.userRepository.save(user);
  }

  public async isEmailAlreadyRegistered(userEmail: string): Promise<boolean> {
    const existingUser: User = await this.userRepository.findUserByEmail(
      userEmail,
    );
    if (existingUser) {
      return true;
    }
    return false;
  }

  public async validateUserCredentials(
    loginUserDto: LoginUserDto,
  ): Promise<ValidatedUserDto> {
    const user: User = await this.userRepository.findUserByEmail(
      loginUserDto.getUserEmail(),
    );
    if (
      !user ||
      !(await this.validatePassword(loginUserDto.getPassword(), user.password))
    ) {
      throw new UnauthorizedException('잘못된 Email 혹은 비밀번호 입니다.');
    }
    return new ValidatedUserDto(user);
  }

  public async setSession(setSessionDto: SetSessionDto): Promise<string> {
    await this.sessionService.setSessionData(setSessionDto);
    return setSessionDto.getSessionId();
  }

  private validatePassword(
    loginPassword: string,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(loginPassword, password);
  }
}