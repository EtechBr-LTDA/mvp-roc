import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService, Address, UpdateUserInput } from "../users/users.service";

interface RegisterInput {
  name: string;
  cpf: string;
  email: string;
  password: string;
  address?: Address;
}

interface LoginInput {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string; // profile id
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async register(input: RegisterInput) {
    const profile = await this.usersService.createUser(input);

    const payload: JwtPayload = {
      sub: profile.id,
      email: profile.email || "",
      name: profile.full_name || "",
    };

    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: profile.id,
        name: profile.full_name,
        cpf: profile.cpf,
        email: profile.email,
      },
      token,
    };
  }

  async login(input: LoginInput) {
    const profile = await this.usersService.findByEmail(input.email);

    if (!profile || !profile.password_hash) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const isPasswordValid = await this.usersService.validatePassword(
      input.password,
      profile.password_hash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const payload: JwtPayload = {
      sub: profile.id,
      email: profile.email || "",
      name: profile.full_name || "",
    };

    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: profile.id,
        name: profile.full_name,
        cpf: profile.cpf,
        email: profile.email,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const profile = await this.usersService.findById(userId);
    return this.usersService.profileToResponse(profile);
  }

  async updateProfile(userId: string, input: UpdateUserInput) {
    const profile = await this.usersService.updateUser(userId, input);
    return this.usersService.profileToResponse(profile);
  }

  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      return null;
    }
  }
}
