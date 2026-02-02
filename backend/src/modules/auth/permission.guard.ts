import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../../config/supabase.config";
import { PERMISSION_KEY } from "./permission.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se nao tem @Permission() no endpoint, passa (compativel com sistema atual)
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Usuario nao autenticado");
    }

    // super_admin sempre tem acesso total
    if (user.role === "super_admin") {
      return true;
    }

    // Buscar role_id do usuario
    const { data: profile } = await this.supabase
      .from("profiles")
      .select("role_id")
      .eq("id", user.id)
      .single();

    if (!profile?.role_id) {
      throw new ForbiddenException("Sem cargo atribuido");
    }

    // Verificar se o cargo do usuario tem a permissao requerida
    const { data: permission } = await this.supabase
      .from("admin_role_permissions")
      .select("permission_id, permission:admin_permissions!inner(action)")
      .eq("role_id", profile.role_id)
      .eq("permission.action", requiredPermission)
      .maybeSingle();

    if (!permission) {
      throw new ForbiddenException(`Sem permissao: ${requiredPermission}`);
    }

    return true;
  }
}
