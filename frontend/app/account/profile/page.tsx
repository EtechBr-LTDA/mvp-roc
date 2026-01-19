"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Envelope,
  IdentificationCard,
  Phone,
  MapPin,
  House,
  Buildings,
  PencilSimple,
  Check,
  X,
  SpinnerGap,
  ArrowLeft,
  ShieldCheck,
} from "@phosphor-icons/react";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { apiClient } from "@/app/lib/api";

interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ProfileData {
  id: string;
  full_name: string;
  cpf: string;
  email: string;
  phone?: string;
  address?: Address;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: {
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getProfile();
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        address: data.address || {
          cep: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        },
      });
    } catch (err: any) {
      if (err.status === 401) {
        router.push("/auth/login");
        return;
      }
      setError(err.message || "Erro ao carregar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const updateData: any = {
        full_name: formData.full_name,
        phone: formData.phone,
      };

      // Só inclui address se tiver dados
      if (formData.address.cep && formData.address.street) {
        updateData.address = formData.address;
      }

      await apiClient.updateProfile(updateData);
      setSuccessMessage("Perfil atualizado com sucesso!");
      setIsEditing(false);
      fetchProfile();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return "";
    const numbers = cpf.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  const handleCepChange = async (value: string) => {
    const formatted = formatCEP(value);
    setFormData({
      ...formData,
      address: { ...formData.address, cep: formatted },
    });

    // Auto-buscar quando CEP completo
    const numbers = formatted.replace(/\D/g, "");
    if (numbers.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              street: data.logradouro || "",
              neighborhood: data.bairro || "",
              city: data.localidade || "",
              state: data.uf || "",
            },
          }));
        }
      } catch (e) {
        console.error("Erro ao buscar CEP:", e);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)]">
        <Header />
        <main className="pt-24 pb-12">
          <div className="mx-auto max-w-3xl px-4">
            <div className="flex items-center justify-center py-20">
              <SpinnerGap size={40} className="animate-spin text-[var(--color-roc-primary)]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Header />

      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-3xl px-4">
          {/* Header da página */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/account/vouchers")}
              className="mb-4 flex items-center gap-2 text-sm text-[var(--color-text-medium)] hover:text-[var(--color-roc-primary)] transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para vouchers
            </button>
            <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
              Meu Perfil
            </h1>
            <p className="text-sm text-[var(--color-text-medium)]">
              Gerencie seus dados pessoais e endereço de entrega
            </p>
          </div>

          {/* Mensagens de erro/sucesso */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl bg-[var(--color-roc-danger)]/10 border border-[var(--color-roc-danger)]/20 px-4 py-3 text-sm text-[var(--color-roc-danger)]"
            >
              {error}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl bg-[var(--color-roc-success)]/10 border border-[var(--color-roc-success)]/20 px-4 py-3 text-sm text-[var(--color-roc-success)]"
            >
              {successMessage}
            </motion.div>
          )}

          {/* Card de dados pessoais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 shadow-soft mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                  <User size={24} weight="fill" className="text-[var(--color-roc-primary)]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--color-text-dark)]">
                    Dados Pessoais
                  </h2>
                  <p className="text-xs text-[var(--color-text-medium)]">
                    Informações básicas da sua conta
                  </p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text-dark)] hover:bg-[var(--color-bg-light)] transition-colors"
                >
                  <PencilSimple size={16} />
                  Editar
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]">
                  <User size={16} className="text-[var(--color-text-medium)]" />
                  Nome completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                  />
                ) : (
                  <p className="text-[var(--color-text-dark)]">{profile?.full_name}</p>
                )}
              </div>

              {/* CPF (não editável) */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]">
                  <IdentificationCard size={16} className="text-[var(--color-text-medium)]" />
                  CPF
                </label>
                <p className="text-[var(--color-text-dark)]">{formatCPF(profile?.cpf || "")}</p>
                <p className="text-xs text-[var(--color-text-medium)]">
                  O CPF não pode ser alterado
                </p>
              </div>

              {/* Email (não editável) */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]">
                  <Envelope size={16} className="text-[var(--color-text-medium)]" />
                  E-mail
                </label>
                <p className="text-[var(--color-text-dark)]">{profile?.email}</p>
              </div>

              {/* Telefone */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]">
                  <Phone size={16} className="text-[var(--color-text-medium)]" />
                  Telefone
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                    className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                ) : (
                  <p className="text-[var(--color-text-dark)]">
                    {profile?.phone || "Não informado"}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Card de endereço */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white p-6 shadow-soft mb-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                <MapPin size={24} weight="fill" className="text-[var(--color-roc-primary)]" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--color-text-dark)]">
                  Endereço de Entrega
                </h2>
                <p className="text-xs text-[var(--color-text-medium)]">
                  Onde seu passaporte será enviado
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                {/* CEP */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--color-text-dark)]">CEP</label>
                  <input
                    type="text"
                    value={formData.address.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>

                {/* Rua e Número */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-medium text-[var(--color-text-dark)]">Rua</label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--color-text-dark)]">Número</label>
                    <input
                      type="text"
                      value={formData.address.number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, number: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                    />
                  </div>
                </div>

                {/* Complemento */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--color-text-dark)]">
                    Complemento <span className="font-normal text-[var(--color-text-medium)]">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address.complement}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, complement: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                    placeholder="Apto, Bloco, etc."
                  />
                </div>

                {/* Bairro */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--color-text-dark)]">Bairro</label>
                  <input
                    type="text"
                    value={formData.address.neighborhood}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, neighborhood: e.target.value },
                      })
                    }
                    className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                  />
                </div>

                {/* Cidade e Estado */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-sm font-medium text-[var(--color-text-dark)]">Cidade</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value },
                        })
                      }
                      className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--color-text-dark)]">Estado</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value.toUpperCase() },
                        })
                      }
                      className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            ) : profile?.address ? (
              <div className="space-y-2">
                <p className="text-[var(--color-text-dark)]">
                  {profile.address.street}, {profile.address.number}
                  {profile.address.complement && ` - ${profile.address.complement}`}
                </p>
                <p className="text-[var(--color-text-medium)]">
                  {profile.address.neighborhood}
                </p>
                <p className="text-[var(--color-text-medium)]">
                  {profile.address.city} - {profile.address.state}
                </p>
                <p className="text-[var(--color-text-medium)]">
                  CEP: {profile.address.cep}
                </p>
              </div>
            ) : (
              <p className="text-[var(--color-text-medium)]">
                Nenhum endereço cadastrado. Clique em "Editar" para adicionar.
              </p>
            )}
          </motion.div>

          {/* Botões de ação */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <button
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data
                  if (profile) {
                    setFormData({
                      full_name: profile.full_name || "",
                      phone: profile.phone || "",
                      address: profile.address || {
                        cep: "",
                        street: "",
                        number: "",
                        complement: "",
                        neighborhood: "",
                        city: "",
                        state: "",
                      },
                    });
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-text-dark)] transition-all hover:bg-[var(--color-bg-light)]"
              >
                <X size={18} />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-roc-primary)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-roc-primary-dark)] disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <SpinnerGap size={18} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Salvar alterações
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Info de segurança */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-text-medium)]">
            <ShieldCheck size={16} weight="fill" className="text-[var(--color-roc-success)]" />
            <span>Seus dados estão protegidos com criptografia</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
