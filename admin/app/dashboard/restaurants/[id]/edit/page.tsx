"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { adminApi } from "../../../../lib/api";

export default function EditRestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

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

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoadingData(true);
      try {
        const res = await adminApi.getRestaurants({ page: 1, limit: 1000 });
        const restaurant = res.data.find((r: any) => r.id === id);
        if (restaurant) {
          setFormData({
            name: restaurant.name || "",
            city: restaurant.city || "",
            category: restaurant.category || "",
            discount_label: restaurant.discount_label || "",
            description: restaurant.description || "",
            image_url: restaurant.image_url || "",
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
      setError("O desconto e obrigatorio.");
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
      setTimeout(() => {
        router.push("/dashboard/restaurants");
      }, 1000);
    } catch (err: any) {
      console.error("Erro ao atualizar restaurante:", err);
      setError(err?.message || "Erro ao atualizar restaurante.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-96 bg-white rounded-xl shadow-soft animate-pulse max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/dashboard/restaurants"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-medium)] hover:text-[var(--color-text-dark)] transition-colors"
      >
        <ArrowLeft size={18} />
        Voltar para Restaurantes
      </Link>

      <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
        Editar Restaurante
      </h1>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-soft p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[var(--color-text-dark)] mb-1.5"
            >
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

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-[var(--color-text-dark)] mb-1.5"
            >
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
            <label
              htmlFor="category"
              className="block text-sm font-medium text-[var(--color-text-dark)] mb-1.5"
            >
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

          {/* Discount Label */}
          <div>
            <label
              htmlFor="discount_label"
              className="block text-sm font-medium text-[var(--color-text-dark)] mb-1.5"
            >
              Desconto <span className="text-red-500">*</span>
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
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[var(--color-text-dark)] mb-1.5"
            >
              Descricao
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
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
            <label
              htmlFor="image_url"
              className="block text-sm font-medium text-[var(--color-text-dark)] mb-1.5"
            >
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
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white
                bg-[var(--color-roc-primary)] hover:bg-[var(--color-roc-primary-dark)]
                transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : "Salvar Alteracoes"}
            </button>
            <Link
              href="/dashboard/restaurants"
              className="px-6 py-2.5 rounded-lg text-sm font-medium
                text-[var(--color-text-medium)] bg-gray-100 hover:bg-gray-200
                transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
