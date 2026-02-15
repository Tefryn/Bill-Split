import Link from "next/link";
import { Heading } from "@/components/atoms/heading";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
}

export function Header({ title, subtitle, showBackButton, backHref }: HeaderProps) {
  return (
    <header className="mb-8">
      {showBackButton && backHref && (
        <div className="mb-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      )}

      <Heading level={1} className="text-4xl text-white font-bold mb-2">
        {title}
      </Heading>

      {subtitle && (
        <p className="text-gray-600">{subtitle}</p>
      )}
    </header>
  );
}
