import { Injectable, Inject, NotFoundException, ConflictException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../../config/supabase.config";
import * as bcrypt from "bcrypt";

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Profile {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  cpf: string | null;
  phone: string | null;
  city: string | null;
  address_cep: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  created_at: string;
  updated_at: string;
  password_hash?: string;
}

export interface CreateUserInput {
  name: string;
  cpf: string;
  email: string;
  password: string;
  address?: Address;
}

export interface UpdateUserInput {
  full_name?: string;
  phone?: string;
  address?: Address;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient
  ) {}

  async createUser(input: CreateUserInput): Promise<Profile> {
    // Normalizar email para minúsculas
    const normalizedEmail = input.email.toLowerCase().trim();

    // Validações de unicidade desabilitadas temporariamente
    // const { data: existingByEmail } = await this.supabase
    //   .from("profiles")
    //   .select("id")
    //   .eq("email", normalizedEmail)
    //   .single();
    // if (existingByEmail) {
    //   throw new ConflictException("Usuário com este e-mail já existe");
    // }

    // const { data: existingByCpf } = await this.supabase
    //   .from("profiles")
    //   .select("id")
    //   .eq("cpf", input.cpf)
    //   .single();
    // if (existingByCpf) {
    //   throw new ConflictException("Usuário com este CPF já existe");
    // }

    // Hash da senha com bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    // Preparar dados para inserção
    const insertData: Record<string, any> = {
      full_name: input.name,
      email: normalizedEmail,
      cpf: input.cpf,
      password_hash: passwordHash,
    };

    // Adicionar campos de endereço se fornecidos
    if (input.address) {
      insertData.address_cep = input.address.cep;
      insertData.address_street = input.address.street;
      insertData.address_number = input.address.number;
      insertData.address_complement = input.address.complement || null;
      insertData.address_neighborhood = input.address.neighborhood;
      insertData.address_city = input.address.city;
      insertData.address_state = input.address.state;
    }

    // Criar profile
    const { data: profile, error } = await this.supabase
      .from("profiles")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }

    return profile;
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<Profile> {
    const updateData: Record<string, any> = {};

    if (input.full_name) {
      updateData.full_name = input.full_name;
    }

    if (input.phone !== undefined) {
      updateData.phone = input.phone;
    }

    if (input.address) {
      updateData.address_cep = input.address.cep;
      updateData.address_street = input.address.street;
      updateData.address_number = input.address.number;
      updateData.address_complement = input.address.complement || null;
      updateData.address_neighborhood = input.address.neighborhood;
      updateData.address_city = input.address.city;
      updateData.address_state = input.address.state;
    }

    const { data: profile, error } = await this.supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }

    return profile;
  }

  async findByEmail(email: string): Promise<Profile | null> {
    // Normalizar email para minúsculas para busca case-insensitive
    const normalizedEmail = email.toLowerCase().trim();

    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .ilike("email", normalizedEmail)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async findByCpf(cpf: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("cpf", cpf)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async findById(id: string): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return data;
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Helper para converter Profile para formato de resposta com address objeto
  profileToResponse(profile: Profile) {
    const response: any = {
      id: profile.id,
      full_name: profile.full_name,
      cpf: profile.cpf,
      email: profile.email,
      phone: profile.phone,
      created_at: profile.created_at,
    };

    if (profile.address_cep) {
      response.address = {
        cep: profile.address_cep,
        street: profile.address_street,
        number: profile.address_number,
        complement: profile.address_complement,
        neighborhood: profile.address_neighborhood,
        city: profile.address_city,
        state: profile.address_state,
      };
    }

    return response;
  }

  // Atualizar senha do usuário
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const { error } = await this.supabase
      .from("profiles")
      .update({ password_hash: passwordHash })
      .eq("id", id);

    if (error) {
      throw new Error(`Erro ao atualizar senha: ${error.message}`);
    }
  }
}
