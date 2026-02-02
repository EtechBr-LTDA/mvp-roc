import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { RbacService } from "./rbac.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "../auth/admin.guard";
import { PermissionGuard } from "../auth/permission.guard";
import { Roles } from "../auth/roles.decorator";
import { Permission } from "../auth/permission.decorator";
import { CurrentUser, CurrentUserData } from "../auth/current-user.decorator";
import {
  CreateRoleDto,
  UpdateRoleDto,
  SetRolePermissionsDto,
  CreateAdminUserDto,
  UpdateAdminRoleDto,
} from "./dto";

@Controller("admin/rbac")
@UseGuards(JwtAuthGuard, AdminGuard, PermissionGuard)
@Roles("admin", "super_admin", "editor", "viewer")
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ==================== ROLES ====================

  @Get("roles")
  @Permission("rbac.roles.list")
  async listRoles() {
    return this.rbacService.listRoles();
  }

  @Get("roles/:id")
  @Permission("rbac.roles.list")
  async getRoleDetail(@Param("id") id: string) {
    const roleId = parseInt(id, 10);
    if (isNaN(roleId)) throw new BadRequestException("ID invalido");
    return this.rbacService.getRoleWithPermissions(roleId);
  }

  @Post("roles")
  @Permission("rbac.roles.create")
  async createRole(@Body() body: CreateRoleDto) {
    if (!body.name || !body.display_name) {
      throw new BadRequestException("Nome e nome de exibicao sao obrigatorios");
    }
    return this.rbacService.createRole(body);
  }

  @Put("roles/:id")
  @Permission("rbac.roles.update")
  async updateRole(@Param("id") id: string, @Body() body: UpdateRoleDto) {
    const roleId = parseInt(id, 10);
    if (isNaN(roleId)) throw new BadRequestException("ID invalido");
    return this.rbacService.updateRole(roleId, body);
  }

  @Delete("roles/:id")
  @Permission("rbac.roles.delete")
  async deleteRole(@Param("id") id: string) {
    const roleId = parseInt(id, 10);
    if (isNaN(roleId)) throw new BadRequestException("ID invalido");
    return this.rbacService.deleteRole(roleId);
  }

  // ==================== PERMISSIONS ====================

  @Get("permissions")
  @Permission("rbac.permissions.list")
  async listPermissions() {
    return this.rbacService.listPermissions();
  }

  @Put("roles/:id/permissions")
  @Permission("rbac.roles.permissions")
  async setRolePermissions(
    @Param("id") id: string,
    @Body() body: SetRolePermissionsDto,
  ) {
    const roleId = parseInt(id, 10);
    if (isNaN(roleId)) throw new BadRequestException("ID invalido");
    if (!Array.isArray(body.permission_ids)) {
      throw new BadRequestException("permission_ids deve ser um array");
    }
    return this.rbacService.setRolePermissions(roleId, body.permission_ids);
  }

  // ==================== ADMIN USERS ====================

  @Get("users")
  @Permission("rbac.users.list")
  async listAdminUsers() {
    return this.rbacService.listAdminUsers();
  }

  @Post("users")
  @Permission("rbac.users.create")
  async createAdminUser(@Body() body: CreateAdminUserDto) {
    if (!body.email || !body.name || !body.password || !body.role_id) {
      throw new BadRequestException("Email, nome, senha e cargo sao obrigatorios");
    }
    if (body.password.length < 8) {
      throw new BadRequestException("Senha deve ter pelo menos 8 caracteres");
    }
    return this.rbacService.createAdminUser(body);
  }

  @Put("users/:id/role")
  @Permission("rbac.users.update_role")
  async updateAdminRole(
    @Param("id") id: string,
    @Body() body: UpdateAdminRoleDto,
  ) {
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new BadRequestException("ID invalido");
    }
    if (!body.role_id) throw new BadRequestException("role_id e obrigatorio");
    return this.rbacService.updateAdminRole(id, body.role_id);
  }

  @Delete("users/:id")
  @Permission("rbac.users.delete")
  async removeAdminUser(@Param("id") id: string) {
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      throw new BadRequestException("ID invalido");
    }
    return this.rbacService.removeAdminUser(id);
  }

  // ==================== USER PERMISSIONS (self) ====================

  @Get("my-permissions")
  async getMyPermissions(@CurrentUser() user: CurrentUserData) {
    return this.rbacService.getUserPermissions(user.id);
  }
}
