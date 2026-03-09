interface SpinnerProps {
  size?: number;
}

export default function Spinner({ size = 8 }: SpinnerProps) {
  const h = `${size}rem`;
  return (
    <div
      className="flex flex-col items-center justify-center py-12"
      role="status"
      aria-live="polite"
      aria-label="Processing image"
    >
      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4`} aria-hidden="true" />
      <span className="sr-only">Processing your image, please wait...</span>
    </div>
  );
}
