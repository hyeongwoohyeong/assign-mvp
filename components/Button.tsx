import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center font-semibold transition-colors duration-150 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-navy-900 text-white hover:bg-navy-800",
  secondary:
    "bg-white text-navy-900 border border-navy-200 hover:border-navy-400 hover:bg-navy-50",
  ghost: "bg-transparent text-navy-800 hover:bg-navy-100",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

interface AsButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {
  href?: never;
}

interface AsLinkProps extends CommonProps {
  href: string;
  type?: never;
}

type ButtonProps = AsButtonProps | AsLinkProps;

export default function Button(props: ButtonProps) {
  const { children, variant = "primary", size = "md", className = "" } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as AsButtonProps;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
