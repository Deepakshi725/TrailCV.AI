
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function MatchPage() {
  const [matchScore, setMatchScore] = useState(0);
  const navigate = useNavigate();
  
  // Mock data
  const matchedKeywords = [
    "React", "TypeScript", "UI/UX", "Front-end Development", 
    "Responsive Design", "JavaScript", "API Integration", "Git"
  ];
  
  const missingKeywords = [
    "GraphQL", "Next.js", "Webpack", "CI/CD"
  ];
  
  const improvements = [
    "Add specific metrics and achievements",
    "Include relevant projects with quantifiable results",
    "Mention experience with GraphQL and Next.js",
    "Add CI/CD tools you've worked with"
  ];

  useEffect(() => {
    // Animate score counter
    let start = 0;
    const end = 76;
    
    const timer = setInterval(() => {
      setMatchScore(prevScore => {
        if (prevScore >= end) {
          clearInterval(timer);
          return end;
        }
        return prevScore + 1;
      });
    }, 20);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">ATS Match Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Here's how your resume matches with the job description
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Card */}
          <Card className="md:col-span-1 bg-secondary/30 border-primary/20">
            <CardContent className="pt-6">
              <h2 className="text-xl font-heading font-semibold">ATS Match Score</h2>
              
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative w-40 h-40">
                  <div className="absolute inset-0 rounded-full border-8 border-primary/20"></div>
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-primary"
                      strokeDasharray={`${440 * (matchScore / 100)} 440`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold">{matchScore}%</span>
                    <span className="text-sm text-muted-foreground">Match rate</span>
                  </div>
                </div>
                
                <div className="mt-6 w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Strength</span>
                    <span className="font-medium">Good</span>
                  </div>
                  <Progress value={matchScore} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Matched Keywords */}
          <Card className="bg-secondary/30 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <h2 className="text-xl font-heading font-semibold">Matched Keywords</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {matchedKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Missing Keywords */}
          <Card className="bg-secondary/30 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <XCircle className="w-5 h-5 text-destructive mr-2" />
                <h2 className="text-xl font-heading font-semibold">Missing Keywords</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Suggested Improvements */}
        <Card className="bg-secondary/30 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              <h2 className="text-xl font-heading font-semibold">Suggested Improvements</h2>
            </div>
            
            <ul className="space-y-3">
              {improvements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-yellow-500 font-medium text-xs">{index + 1}</span>
                  </div>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <div className="flex justify-center mt-8">
          <Button 
            size="lg" 
            onClick={() => navigate("/ai-suggestions")}
            className="group"
          >
            Generate AI Suggestions
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
