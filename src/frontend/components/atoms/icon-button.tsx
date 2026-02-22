interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  variant?: "primary" | "color";
  color?: string;
  type?: "button" | "submit" | "reset";
}

export function IconButton({
  children,
  onClick,
  ariaLabel,
  variant = "primary",
  color,
  type = "button"
}: IconButtonProps) {
  const baseStyles = "w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer";
  const variantStyles = variant === "primary"
    ? "bg-black text-white hover:bg-gray-800"
    : "hover:opacity-80";

  const style = color && variant === "color" ? { backgroundColor: color } : undefined;

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variantStyles}`}
      style={style}
    >
      {children}
    </button>
  );
}
