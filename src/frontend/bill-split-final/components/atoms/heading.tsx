interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export function Heading({ level = 1, children, className = "" }: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return <Tag className={`text-gray-900 ${className}`}>{children}</Tag>;
}
