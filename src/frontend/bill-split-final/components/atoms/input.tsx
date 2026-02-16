interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  type?: "text" | "number"
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export function Input({
  value,
  onChange,
  placeholder,
  id,
  required = false,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid = false
}: InputProps) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      aria-required={required}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder:text-gray-500"
    />
  );
}