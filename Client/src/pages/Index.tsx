
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login page after a short delay to show the splash screen
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center animate-fade-in">
        <Logo size="lg" className="mb-8" />
        <h1 className="text-4xl font-heading font-bold mt-4 text-center">
          Find your fit.<br />Build your trail.
        </h1>
        <div className="mt-8 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-500"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
