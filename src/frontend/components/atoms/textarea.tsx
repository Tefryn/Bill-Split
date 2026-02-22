interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  rows?: number;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  id,
  rows = 4,
  required = false,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid = false
}: TextareaProps) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      required={required}
      aria-required={required}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-gray-900 placeholder:text-gray-500"
    />
  );
}
