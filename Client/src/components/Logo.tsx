
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
          <span className="font-bold text-sm">T</span>
        </div>
        <div className="absolute inset-0 rounded-full blur-sm bg-gradient-to-br from-primary to-accent opacity-70 -z-10"></div>
      </div>
      <div className="font-heading font-bold">
        <span className={cn(sizeClasses[size])}>
          Trail<span className="text-gradient">CV.AI</span>
        </span>
      </div>
    </div>
  );
}
