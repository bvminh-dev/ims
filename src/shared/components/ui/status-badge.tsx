"use client";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const getVariant = () => {
    if (variant) {
      return variant;
    }

    // Auto-detect variant from status
    const upperStatus = status.toUpperCase();
    if (upperStatus.includes("ACTIVE") || upperStatus === "IN") {
      return "success";
    }
    if (upperStatus.includes("INACTIVE")) {
      return "default";
    }
    if (upperStatus.includes("OUT_OF_STOCK") || upperStatus === "OUT") {
      return "danger";
    }
    if (upperStatus === "ADJUSTMENT") {
      return "info";
    }
    return "default";
  };

  const variantStyles = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  const selectedVariant = getVariant();

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${variantStyles[selectedVariant]}`}
    >
      {status}
    </span>
  );
}
