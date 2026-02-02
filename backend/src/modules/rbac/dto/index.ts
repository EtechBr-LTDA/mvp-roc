export class CreateRoleDto {
  name!: string;
  display_name!: string;
  description?: string;
}

export class UpdateRoleDto {
  display_name?: string;
  description?: string;
}

export class SetRolePermissionsDto {
  permission_ids!: number[];
}

export class CreateAdminUserDto {
  email!: string;
  name!: string;
  password!: string;
  role_id!: number;
}

export class UpdateAdminRoleDto {
  role_id!: number;
}
