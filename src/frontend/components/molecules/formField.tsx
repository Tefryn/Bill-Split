import { Label } from "@/components/atoms/label";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "input" | "textarea";
  placeholder?: string;
  id: string;
  rows?: number;
  required?: boolean;
  error?: string;
}

export function FormField({
  label,
  value,
  onChange,
  type = "input",
  placeholder,
  id,
  rows,
  required = false,
  error
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-600 ml-1" aria-label="required">*</span>}
      </Label>
      {type === "input" ? (
        <Input
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-describedby={errorId}
          aria-invalid={hasError}
        />
      ) : (
        <Textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          aria-describedby={errorId}
          aria-invalid={hasError}
        />
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
