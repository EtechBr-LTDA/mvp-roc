import { createClient } from "@supabase/supabase-js";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env") });

const ADMIN_EMAIL = "adm@roc.com.br";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Administrador ROC";

async function seedAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao necessarios no .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Hash da senha
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Verificar se ja existe
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("email", ADMIN_EMAIL)
    .single();

  if (existing) {
    // Atualizar para super_admin e definir senha
    const { error } = await supabase
      .from("profiles")
      .update({
        role: "super_admin",
        password_hash: passwordHash,
        full_name: ADMIN_NAME,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Erro ao atualizar admin:", error.message);
      process.exit(1);
    }

    console.log(`Admin atualizado com sucesso!`);
    console.log(`  ID: ${existing.id}`);
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Role: super_admin`);
  } else {
    // Criar novo admin
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        full_name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password_hash: passwordHash,
        role: "super_admin",
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar admin:", error.message);
      process.exit(1);
    }

    console.log(`Admin criado com sucesso!`);
    console.log(`  ID: ${data.id}`);
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Role: super_admin`);
  }

  console.log(`  Senha: ${ADMIN_PASSWORD}`);
  console.log(`\nAcesse: http://localhost:3002/login`);
}

seedAdmin().catch(console.error);
