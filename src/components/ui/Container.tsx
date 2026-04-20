import { clsx } from "@/lib/clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
  as?: "section" | "div" | "main" | "header" | "footer";
};

export function Container({
  children,
  className,
  size = "default",
  as: Tag = "div",
}: Props) {
  return (
    <Tag
      className={clsx(
        "mx-auto w-full px-6 lg:px-10",
        size === "narrow" && "max-w-4xl",
        size === "default" && "max-w-7xl",
        size === "wide" && "max-w-[88rem]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
