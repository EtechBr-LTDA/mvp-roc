"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FloppyDisk,
  MapPin,
  Tag,
  Storefront,
  Image,
  TextAlignLeft,
  Lightning,
  CheckCircle,
  XCircle,
  Pencil,
} from "@phosphor-icons/react";
import { adminApi } from "../../../../lib/api";
import { StatusBadge } from "../../../../components/StatusBadge";

export default function EditRestaurantPage() {
  const params = useParams();
  const id = Number(params.id);

  const [restaurant, setRestaurant] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    category: "",
    discount_label: "",
    description: "",
    image_url: "",
  });

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoadingData(true);
      try {
        const res = await adminApi.getRestaurants({ page: 1, limit: 1000 });
        const found = res.data.find((r: any) => r.id === id);
        if (found) {
          setRestaurant(found);
          setFormData({
            name: found.name || "",
            city: found.city || "",
            category: found.category || "",
            discount_label: found.discount_label || "",
            description: found.description || "",
            image_url: found.image_url || "",
          });
        } else {
          setError("Restaurante nao encontrado.");
        }
      } catch (err: any) {
        console.error("Erro ao buscar restaurante:", err);
        setError(err?.message || "Erro ao carregar restaurante.");
      } finally {
        setLoadingData(false);
      }
    };

    if (id) fetchRestaurant();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    if (!formData.name.trim()) {
      setError("O nome e obrigatorio.");
      return false;
    }
    if (!formData.city.trim()) {
      setError("A cidade e obrigatoria.");
      return false;
    }
    if (!formData.discount_label.trim()) {
      setError("A oferta principal e obrigatoria.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) return;

    setLoading(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        discount_label: formData.discount_label.trim(),
      };
      if (formData.category.trim()) payload.category = formData.category.trim();
      if (formData.description.trim()) payload.description = formData.description.trim();
      if (formData.image_url.trim()) payload.image_url = formData.image_url.trim();

      await adminApi.updateRestaurant(id, payload);
      setSuccess("Restaurante atualizado com sucesso!");
      setEditing(false);
      // Refresh data
      setRestaurant({ ...restaurant, ...payload });
    } catch (err: any) {
      console.error("Erro ao atualizar restaurante:", err);
      setError(err?.message || "Erro ao atualizar restaurante.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await adminApi.toggleRestaurant(id);
      setRestaurant({ ...restaurant, active: !restaurant.active });
    } catch (err: any) {
      console.error("Erro ao alterar status:", err);
      setError(err?.message || "Erro ao alterar status.");
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
        <div className="h-8 w-64 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white rounded-xl shadow-soft animate-pulse" />
          <div className="h-52 bg-white rounded-xl shadow-soft animate-pulse" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/restaurants"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-medium)] hover:text-[var(--color-text-dark)] transition-colors"
        >
          <ArrowLeft size={18} />
          Voltar para Restaurantes
        </Link>
        <div className="bg-white rounded-xl shadow-soft p-12 text-center">
          <Storefront size={48} className="mx-auto text-[var(--color-text-light)] mb-3" />
          <p className="text-[var(--color-text-medium)]">Restaurante nao encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/restaurants"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-medium)] hover:text-[var(--color-text-dark)] transition-colors"
      >
        <ArrowLeft size={18} />
        Voltar para Restaurantes
      </Link>

      {/* Header with name + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-roc-primary)]/10 flex items-center justify-center">
            <Storefront size={24} className="text-[var(--color-roc-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
              {restaurant.name}
            </h1>
            <p className="text-sm text-[var(--color-text-medium)]">
              ID #{restaurant.id} · {restaurant.city || "Sem cidade"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                text-[var(--color-roc-primary)] bg-blue-50 hover:bg-blue-100
                transition-colors"
            >
              <Pencil size={18} />
              Editar
            </button>
          )}
          <button
            onClick={handleToggleActive}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-colors ${
                restaurant.active
                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                  : "text-green-700 bg-green-50 hover:bg-green-100"
              }`}
          >
            {restaurant.active ? <XCircle size={18} /> : <CheckCircle size={18} />}
            {restaurant.active ? "Desativar" : "Ativar"}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados Cadastrais - 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-base font-semibold text-[var(--color-text-dark)] mb-5">
            Dados Cadastrais
          </h2>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-dark)] mb-1.5">
                  <Storefront size={14} className="text-[var(--color-text-light)]" />
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome do restaurante"
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm
                    text-[var(--color-text-dark)] placeholder:text-[var(--color-text-light)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
                    focus:border-[var(--color-roc-primary)] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label htmlFor="city" className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-dark)] mb-1.5">
                    <MapPin size={14} className="text-[var(--color-text-light)]" />
                    Cidade <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Cidade"
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm
                      text-[var(--color-text-dark)] placeholder:text-[var(--color-text-light)]
                      focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
                      focus:border-[var(--color-roc-primary)] transition-colors"
                  />
                </div>
                {/* Category */}
                <div>
                  <label htmlFor="category" className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-dark)] mb-1.5">
                    <Tag size={14} className="text-[var(--color-text-light)]" />
                    Categoria
                  </label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Ex: Italiana, Japonesa, Bar..."
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm
                      text-[var(--color-text-dark)] placeholder:text-[var(--color-text-light)]
                      focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
                      focus:border-[var(--color-roc-primary)] transition-colors"
                  />
                </div>
              </div>

              {/* Discount Label */}
              <div>
                <label htmlFor="discount_label" className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-dark)] mb-1.5">
                  <Lightning size={14} className="text-[var(--color-text-light)]" />
                  Oferta Principal <span className="text-red-500">*</span>
                </label>
                <input
                  id="discount_label"
                  name="discount_label"
                  type="text"
                  value={formData.discount_label}
                  onChange={handleChange}
                  placeholder="Ex: 20% de desconto, 2 por 1..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm
                    text-[var(--color-text-dark)] placeholder:text-[var(--color-text-light)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
                    focus:border-[var(--color-roc-primary)] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-dark)] mb-1.5">
                  <TextAlignLeft size={14} className="text-[var(--color-text-light)]" />
                  Descricao
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descricao do restaurante..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm
                    text-[var(--color-text-dark)] placeholder:text-[var(--color-text-light)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
                    focus:border-[var(--color-roc-primary)] transition-colors resize-vertical"
                />
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="image_url" className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-dark)] mb-1.5">
                  <Image size={14} className="text-[var(--color-text-light)]" />
                  URL da Imagem
                </label>
                <input
                  id="image_url"
                  name="image_url"
                  type="text"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm
                    text-[var(--color-text-dark)] placeholder:text-[var(--color-text-light)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
                    focus:border-[var(--color-roc-primary)] transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white
                    bg-[var(--color-roc-primary)] hover:bg-[var(--color-roc-primary-dark)]
                    transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FloppyDisk size={18} />
                  {loading ? "Salvando..." : "Salvar Alteracoes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                    // Reset form
                    setFormData({
                      name: restaurant.name || "",
                      city: restaurant.city || "",
                      category: restaurant.category || "",
                      discount_label: restaurant.discount_label || "",
                      description: restaurant.description || "",
                      image_url: restaurant.image_url || "",
                    });
                  }}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium
                    text-[var(--color-text-medium)] bg-gray-100 hover:bg-gray-200
                    transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            /* View mode */
            <div className="space-y-4">
              <InfoRow icon={<Storefront size={16} />} label="Nome" value={restaurant.name} />
              <InfoRow icon={<MapPin size={16} />} label="Cidade" value={restaurant.city || "—"} />
              <InfoRow icon={<Tag size={16} />} label="Categoria" value={restaurant.category || "—"} />
              <InfoRow
                icon={<Lightning size={16} />}
                label="Oferta Principal"
                value={restaurant.discount_label || "—"}
                highlight
              />
              <InfoRow
                icon={<TextAlignLeft size={16} />}
                label="Descricao"
                value={restaurant.description || "Sem descricao"}
              />
              {restaurant.image_url && (
                <div className="flex items-start gap-3 py-2">
                  <Image size={16} className="text-[var(--color-text-light)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[var(--color-text-light)] mb-1">URL da Imagem</p>
                    <p className="text-sm text-[var(--color-roc-primary)] break-all">{restaurant.image_url}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status da Parceria - 1/3 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-base font-semibold text-[var(--color-text-dark)] mb-4">
              Status da Parceria
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-medium)]">Status</span>
                <StatusBadge
                  status={restaurant.active ? "Ativo" : "Inativo"}
                  type="restaurant"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-medium)]">ID</span>
                <span className="text-sm font-mono text-[var(--color-text-dark)]">#{restaurant.id}</span>
              </div>
              {restaurant.created_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-medium)]">Cadastrado em</span>
                  <span className="text-sm text-[var(--color-text-dark)]">
                    {new Date(restaurant.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {restaurant.discount_label && (
                <div className="pt-3 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-light)] mb-2">Oferta em destaque</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-sm font-medium text-amber-700">
                    <Lightning size={14} />
                    {restaurant.discount_label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-base font-semibold text-[var(--color-text-dark)] mb-4">
              Acoes Rapidas
            </h2>
            <div className="space-y-2">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                    text-[var(--color-roc-primary)] bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <Pencil size={16} />
                  Editar dados cadastrais
                </button>
              )}
              <button
                onClick={handleToggleActive}
                className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-colors ${
                    restaurant.active
                      ? "text-red-600 bg-red-50 hover:bg-red-100"
                      : "text-green-700 bg-green-50 hover:bg-green-100"
                  }`}
              >
                {restaurant.active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                {restaurant.active ? "Desativar restaurante" : "Ativar restaurante"}
              </button>
              <Link
                href="/dashboard/restaurants"
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                  text-[var(--color-text-medium)] bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft size={16} />
                Voltar para lista
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
      <span className="text-[var(--color-text-light)] mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--color-text-light)]">{label}</p>
        {highlight ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-md bg-amber-50 text-sm font-medium text-amber-700">
            {value}
          </span>
        ) : (
          <p className="text-sm text-[var(--color-text-dark)]">{value}</p>
        )}
      </div>
    </div>
  );
}
