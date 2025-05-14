import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/AuthLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";
import { api } from "@/lib/api";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.signup({
        firstName,
        lastName,
        email,
        phoneNum: parseInt(phoneNum),
        password,
      });
      
      // Store the token and user info in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.user._id,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email
      }));
      
      toast({
        title: "Account created successfully",
        description: "Welcome to TrailCV.AI",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create an account"
      subtitle="Enter your information to get started"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              required
              className="bg-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              required
              className="bg-secondary/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email" 
            placeholder="your.email@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            className="bg-secondary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNum">Phone Number</Label>
          <Input
            id="phoneNum"
            type="tel" 
            placeholder="1234567890" 
            value={phoneNum} 
            onChange={(e) => setPhoneNum(e.target.value)} 
            required
            className="bg-secondary/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            className="bg-secondary/50"
          />
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters long
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="terms" required />
          <Label htmlFor="terms" className="text-sm font-normal">
            I agree to the{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : "Sign up"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
