import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../../config/supabase.config";
import * as bcrypt from "bcrypt";

@Injectable()
export class RbacService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  // ==================== ROLES ====================

  async listRoles() {
    const { data, error } = await this.supabase
      .from("admin_roles")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw new Error(`Erro ao listar cargos: ${error.message}`);

    // Contar admins por cargo
    const { data: counts } = await this.supabase
      .from("profiles")
      .select("role_id")
      .not("role_id", "is", null);

    const countMap: Record<number, number> = {};
    (counts || []).forEach((p: any) => {
      countMap[p.role_id] = (countMap[p.role_id] || 0) + 1;
    });

    return (data || []).map((role: any) => ({
      ...role,
      admins_count: countMap[role.id] || 0,
    }));
  }

  async getRoleWithPermissions(roleId: number) {
    const { data: role, error } = await this.supabase
      .from("admin_roles")
      .select("*")
      .eq("id", roleId)
      .single();

    if (error || !role) throw new NotFoundException("Cargo nao encontrado");

    const { data: rolePermissions } = await this.supabase
      .from("admin_role_permissions")
      .select("permission_id")
      .eq("role_id", roleId);

    const permissionIds = (rolePermissions || []).map((rp: any) => rp.permission_id);

    return { ...role, permission_ids: permissionIds };
  }

  async createRole(input: { name: string; display_name: string; description?: string }) {
    // Verificar nome unico
    const { data: existing } = await this.supabase
      .from("admin_roles")
      .select("id")
      .eq("name", input.name)
      .maybeSingle();

    if (existing) throw new ConflictException("Ja existe um cargo com este nome");

    const { data, error } = await this.supabase
      .from("admin_roles")
      .insert({
        name: input.name,
        display_name: input.display_name,
        description: input.description || null,
        is_system: false,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar cargo: ${error.message}`);
    return data;
  }

  async updateRole(roleId: number, input: { display_name?: string; description?: string }) {
    const { data: role } = await this.supabase
      .from("admin_roles")
      .select("is_system")
      .eq("id", roleId)
      .single();

    if (!role) throw new NotFoundException("Cargo nao encontrado");

    const updateData: Record<string, any> = {};
    if (input.display_name !== undefined) updateData.display_name = input.display_name;
    if (input.description !== undefined) updateData.description = input.description;

    const { data, error } = await this.supabase
      .from("admin_roles")
      .update(updateData)
      .eq("id", roleId)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar cargo: ${error.message}`);
    return data;
  }

  async deleteRole(roleId: number) {
    const { data: role } = await this.supabase
      .from("admin_roles")
      .select("is_system, name")
      .eq("id", roleId)
      .single();

    if (!role) throw new NotFoundException("Cargo nao encontrado");
    if (role.is_system) throw new BadRequestException("Nao e possivel deletar cargo do sistema");

    // Verificar se tem admins usando
    const { count } = await this.supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role_id", roleId);

    if (count && count > 0) {
      throw new BadRequestException(`Existem ${count} admin(s) usando este cargo. Reatribua antes de deletar.`);
    }

    const { error } = await this.supabase
      .from("admin_roles")
      .delete()
      .eq("id", roleId);

    if (error) throw new Error(`Erro ao deletar cargo: ${error.message}`);
    return { message: "Cargo deletado com sucesso" };
  }

  // ==================== PERMISSIONS ====================

  async listPermissions() {
    const { data, error } = await this.supabase
      .from("admin_permissions")
      .select("*")
      .order("module", { ascending: true })
      .order("action", { ascending: true });

    if (error) throw new Error(`Erro ao listar permissoes: ${error.message}`);

    // Agrupar por modulo
    const grouped: Record<string, any[]> = {};
    (data || []).forEach((p: any) => {
      if (!grouped[p.module]) grouped[p.module] = [];
      grouped[p.module].push(p);
    });

    return { permissions: data || [], grouped };
  }

  async setRolePermissions(roleId: number, permissionIds: number[]) {
    const { data: role } = await this.supabase
      .from("admin_roles")
      .select("name")
      .eq("id", roleId)
      .single();

    if (!role) throw new NotFoundException("Cargo nao encontrado");

    // Deletar permissoes atuais
    const { error: deleteError } = await this.supabase
      .from("admin_role_permissions")
      .delete()
      .eq("role_id", roleId);

    if (deleteError) throw new Error(`Erro ao limpar permissoes: ${deleteError.message}`);

    // Inserir novas
    if (permissionIds.length > 0) {
      const rows = permissionIds.map((pid) => ({ role_id: roleId, permission_id: pid }));
      const { error: insertError } = await this.supabase
        .from("admin_role_permissions")
        .insert(rows);

      if (insertError) throw new Error(`Erro ao definir permissoes: ${insertError.message}`);
    }

    return { message: "Permissoes atualizadas com sucesso", count: permissionIds.length };
  }

  // ==================== ADMIN USERS ====================

  async listAdminUsers() {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id, full_name, email, role, role_id, created_at, last_login_at, admin_role:admin_roles!role_id(id, name, display_name)")
      .in("role", ["admin", "super_admin", "editor", "viewer"])
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Erro ao listar admins: ${error.message}`);

    return (data || []).map((u: any) => ({
      ...u,
      admin_role: Array.isArray(u.admin_role) ? u.admin_role[0] : u.admin_role,
    }));
  }

  async createAdminUser(input: { email: string; name: string; password: string; role_id: number }) {
    // Verificar se email ja existe
    const { data: existing } = await this.supabase
      .from("profiles")
      .select("id, role")
      .eq("email", input.email)
      .maybeSingle();

    if (existing && existing.role !== "user") {
      throw new ConflictException("Este email ja e um administrador");
    }

    // Buscar cargo
    const { data: role } = await this.supabase
      .from("admin_roles")
      .select("name")
      .eq("id", input.role_id)
      .single();

    if (!role) throw new NotFoundException("Cargo nao encontrado");

    if (existing) {
      // Promover usuario existente a admin
      const { error } = await this.supabase
        .from("profiles")
        .update({ role: role.name, role_id: input.role_id })
        .eq("id", existing.id);

      if (error) throw new Error(`Erro ao promover usuario: ${error.message}`);
      return { message: "Usuario promovido a admin", id: existing.id };
    }

    // Criar novo perfil
    const passwordHash = await bcrypt.hash(input.password, 10);
    const { data, error } = await this.supabase
      .from("profiles")
      .insert({
        full_name: input.name,
        email: input.email,
        password_hash: passwordHash,
        role: role.name,
        role_id: input.role_id,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Erro ao criar admin: ${error.message}`);
    return { message: "Admin criado com sucesso", id: data.id };
  }

  async updateAdminRole(userId: string, roleId: number) {
    const { data: role } = await this.supabase
      .from("admin_roles")
      .select("name")
      .eq("id", roleId)
      .single();

    if (!role) throw new NotFoundException("Cargo nao encontrado");

    const { error } = await this.supabase
      .from("profiles")
      .update({ role: role.name, role_id: roleId })
      .eq("id", userId);

    if (error) throw new Error(`Erro ao alterar cargo: ${error.message}`);
    return { message: "Cargo atualizado com sucesso" };
  }

  async removeAdminUser(userId: string) {
    // Verificar se e super_admin unico
    const { data: user } = await this.supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!user) throw new NotFoundException("Usuario nao encontrado");

    if (user.role === "super_admin") {
      const { count } = await this.supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "super_admin");

      if (count && count <= 1) {
        throw new BadRequestException("Nao e possivel remover o unico super admin");
      }
    }

    // Rebaixar para user
    const { error } = await this.supabase
      .from("profiles")
      .update({ role: "user", role_id: null })
      .eq("id", userId);

    if (error) throw new Error(`Erro ao remover admin: ${error.message}`);
    return { message: "Acesso administrativo removido" };
  }

  // ==================== HELPER ====================

  async getUserPermissions(userId: string): Promise<string[]> {
    const { data: profile } = await this.supabase
      .from("profiles")
      .select("role, role_id")
      .eq("id", userId)
      .single();

    if (!profile) return [];

    // super_admin tem tudo
    if (profile.role === "super_admin") {
      const { data: allPerms } = await this.supabase
        .from("admin_permissions")
        .select("action");
      return (allPerms || []).map((p: any) => p.action);
    }

    if (!profile.role_id) return [];

    const { data: perms } = await this.supabase
      .from("admin_role_permissions")
      .select("permission:admin_permissions!inner(action)")
      .eq("role_id", profile.role_id);

    return (perms || []).map((p: any) => {
      const perm = Array.isArray(p.permission) ? p.permission[0] : p.permission;
      return perm?.action;
    }).filter(Boolean);
  }
}
