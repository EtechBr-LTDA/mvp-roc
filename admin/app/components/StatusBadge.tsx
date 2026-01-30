interface StatusBadgeProps {
  status: string;
  type?: "user" | "voucher" | "restaurant";
}

function getStatusStyle(status: string, type?: string): { bg: string; text: string; label: string } {
  const normalized = status.toLowerCase();

  // Green: active, available, ativo
  if (["active", "available", "ativo", "ativa"].includes(normalized)) {
    return {
      bg: "bg-green-100",
      text: "text-green-700",
      label: status,
    };
  }

  // Blue: used, utilizado
  if (["used", "utilizado", "validated"].includes(normalized)) {
    return {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: status,
    };
  }

  // Red: suspended, suspenso, cancelled
  if (["suspended", "suspenso", "suspensa", "cancelled", "cancelado"].includes(normalized)) {
    return {
      bg: "bg-red-100",
      text: "text-red-700",
      label: status,
    };
  }

  // Yellow/amber: pending, pendente
  if (["pending", "pendente"].includes(normalized)) {
    return {
      bg: "bg-amber-100",
      text: "text-amber-700",
      label: status,
    };
  }

  // Gray: inactive, expired, inativo, expirado
  if (["inactive", "expired", "inativo", "inativa", "expirado", "expirada"].includes(normalized)) {
    return {
      bg: "bg-gray-100",
      text: "text-gray-600",
      label: status,
    };
  }

  // Default gray
  return {
    bg: "bg-gray-100",
    text: "text-gray-600",
    label: status,
  };
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const style = getStatusStyle(status, type);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
