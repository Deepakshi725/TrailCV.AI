
import { ReactNode } from "react";
import { Logo } from "./Logo";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Brand/Image section */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-primary/20 to-background flex flex-col items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md flex flex-col items-center animate-fade-in">
          <Logo size="lg" className="mb-8" />
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">
            Find your fit.<br />Build your trail.
          </h1>
          <p className="text-muted-foreground text-center max-w-sm mb-8">
            Optimize your resume and discover personalized learning paths to match your dream job.
          </p>
          <div className="relative w-full aspect-square max-w-lg mt-4">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/30 to-primary/30 rounded-full blur-3xl opacity-20"></div>
            <div className="relative glass-card rounded-3xl w-full h-full flex items-center justify-center overflow-hidden">
              <div className="grid grid-cols-2 gap-4 p-6 w-full">
                <div className="glass-card rounded-xl h-32 animate-pulse-glow"></div>
                <div className="glass-card rounded-xl h-24 mt-8 animate-pulse-glow animation-delay-200"></div>
                <div className="glass-card rounded-xl h-24 animate-pulse-glow animation-delay-700"></div>
                <div className="glass-card rounded-xl h-32 mt-4 animate-pulse-glow animation-delay-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-bold">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
