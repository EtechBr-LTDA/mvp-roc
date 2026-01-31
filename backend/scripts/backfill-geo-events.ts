import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env") });

async function backfillGeoEvents() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao necessarios no .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Buscando usuarios...");

  // Buscar todos os usuarios (nao admins)
  const { data: users, error: fetchError } = await supabase
    .from("profiles")
    .select("id, full_name, city, address_city, address_state")
    .eq("role", "user");

  if (fetchError) {
    console.error("Erro ao buscar usuarios:", fetchError.message);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log("Nenhum usuario encontrado.");
    return;
  }

  console.log(`Encontrados ${users.length} usuarios.`);

  // Buscar usuarios que ja tem eventos (para evitar duplicatas)
  const { data: existingEvents } = await supabase
    .from("user_geo_events")
    .select("profile_id");

  const existingProfileIds = new Set(
    (existingEvents || []).map((e: any) => e.profile_id)
  );

  let created = 0;
  let skippedNoCity = 0;
  let skippedExisting = 0;

  for (const user of users) {
    // Pular se ja tem evento
    if (existingProfileIds.has(user.id)) {
      skippedExisting++;
      continue;
    }

    // Determinar cidade
    const city = user.address_city || user.city;
    if (!city) {
      skippedNoCity++;
      continue;
    }

    // Determinar estado
    const state = user.address_state || "RO";
    const stateName = state === "RO" ? "Rondonia" : state;

    const { error: insertError } = await supabase
      .from("user_geo_events")
      .insert({
        profile_id: user.id,
        ip: "backfill",
        state,
        state_name: stateName,
        city,
        event_type: "backfill",
      });

    if (insertError) {
      console.error(`  Erro ao inserir evento para ${user.full_name}: ${insertError.message}`);
      continue;
    }

    created++;
    console.log(`  + ${user.full_name} -> ${city}, ${state}`);
  }

  console.log("\n========== RESUMO ==========");
  console.log(`Total de usuarios: ${users.length}`);
  console.log(`Eventos criados:   ${created}`);
  console.log(`Sem cidade:        ${skippedNoCity}`);
  console.log(`Ja existentes:     ${skippedExisting}`);
  console.log("============================");
}

backfillGeoEvents().catch(console.error);
