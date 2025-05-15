import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Copy, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAnalysisFromStorage } from '@/utils/resumeAnalyzer';

// --- Aurora, Grid, and Particles Effects (copied from Match page) ---
import { motion } from "framer-motion";

const AuroraEffect = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-black/95" />
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${i * 45}deg, ${i % 2 === 0 ? 'rgba(128,0,255,0.4)' : 'rgba(0,255,255,0.4)'}, transparent)`,
          filter: 'blur(40px)',
        }}
        animate={{
          x: ['-50%', '150%'],
          y: ['-50%', '150%'],
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20 + i * 5,
          repeat: Infinity,
          ease: "linear",
          delay: i * 2,
        }}
      />
    ))}
  </div>
);

const GridOverlay = () => (
  <div className="fixed inset-0 -z-10 opacity-15">
    <motion.div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(var(--primary), 0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(var(--primary), 0.15) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
      animate={{
        backgroundPosition: ['0 0', '50px 50px'],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);

const ConnectedParticles = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-4 h-4 rounded-full"
        style={{
          background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(128,0,255,0.6)' : 'rgba(0,255,255,0.6)'} 0%, transparent 70%)`,
          boxShadow: `0 0 20px ${i % 2 === 0 ? 'rgba(128,0,255,0.4)' : 'rgba(0,255,255,0.4)'}`,
        }}
        initial={{
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`,
          opacity: 0,
          scale: 0,
        }}
        animate={{
          y: [
            `${Math.random() * 100}%`,
            `${Math.random() * 100}%`,
            `${Math.random() * 100}%`,
          ],
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: Math.random() * 10 + 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ))}
  </div>
);
// --- End Effects ---

interface Suggestion {
  explanation: string;
  snippet: string;
}

export default function AISuggestionsPage() {
  const [copied, setCopied] = useState<{ type: 'explanation' | 'snippet'; idx: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Suggestion[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSuggestions() {
      setLoading(true);
      setError(null);
      try {
        const analysis = await getAnalysisFromStorage();
        if (!analysis || !Array.isArray(analysis.recommendations)) {
          setError("No suggestions found. Please analyze your resume first.");
          setRecommendations([]);
        } else {
          setRecommendations(analysis.recommendations);
        }
      } catch (err) {
        setError("Failed to load suggestions. Try again.");
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSuggestions();
  }, []);

  const handleCopy = (type: 'explanation' | 'snippet', idx: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied({ type, idx });
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };

  return (
    <MainLayout>
      <AuroraEffect />
      <GridOverlay />
      <ConnectedParticles />
      {/* Hero Section */}
      <div className="relative pt-20 pb-10 px-4 sm:px-8 bg-gradient-to-br from-black via-black/80 to-primary/10 rounded-b-3xl shadow-lg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute left-1/2 top-0 w-[600px] h-[600px] -translate-x-1/2 bg-primary/20 rounded-full blur-3xl opacity-40" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-2 shadow-lg">
              <Sparkles className="w-8 h-8 text-primary animate-bounce" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent drop-shadow-lg">
              AI-Powered Suggestions
            </h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-2xl mx-auto">
              Optimize your resume with these AI-enhanced improvements tailored to your job description.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-5xl mx-auto mb-16 px-2 sm:px-0 mt-8">
        <Card className="bg-black/60 border-2 border-primary/40 shadow-2xl backdrop-blur-xl p-0 rounded-3xl relative lightning-border">
          <CardContent className="py-10 px-2 sm:px-10 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <Sparkles className="w-10 h-10 text-primary animate-spin mb-4" />
                <span className="text-primary font-medium">Generating suggestions...</span>
              </div>
            ) : error ? (
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="pt-6">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {recommendations.length === 0 ? (
                  <Card className="bg-secondary/30 border-primary/20">
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground">No suggestions found. Please analyze your resume first.</p>
                    </CardContent>
                  </Card>
                ) : (
                  recommendations.map((rec, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.015, boxShadow: '0 0 24px 4px #a78bfa, 0 0 40px 8px #06b6d4' }}
                      className="transition-all duration-300"
                    >
                      <Card className="bg-primary/10 border-2 border-cyan-400/60 shadow-xl rounded-2xl relative overflow-visible lightning-border">
                        <div className="absolute -inset-1 rounded-3xl pointer-events-none z-0 animate-pulse"
                          style={{
                            boxShadow: '0 0 24px 4px #a78bfa, 0 0 40px 8px #06b6d4',
                            opacity: 0.25
                          }}
                        />
                        <CardHeader className="flex flex-row items-center gap-3 pb-2 z-10 relative">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <CardTitle className="text-lg font-heading">Suggestion {idx + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4 space-y-4 z-10 relative">
                          <div className="flex items-start gap-2 w-full">
                            <span className="text-primary/90 text-base flex-1">
                              {rec.explanation}
                            </span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="ml-2 mt-1"
                              onClick={() => handleCopy('explanation', idx, rec.explanation)}
                            >
                              {copied && copied.type === 'explanation' && copied.idx === idx ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Copy className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-4 border-2 border-cyan-400/30 w-full">
                            <span className="whitespace-pre-line text-primary font-mono flex-1 text-lg">
                              {rec.snippet}
                            </span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="ml-2 mt-1"
                              onClick={() => handleCopy('snippet', idx, rec.snippet)}
                            >
                              {copied && copied.type === 'snippet' && copied.idx === idx ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Copy className="h-5 w-5" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button 
            size="lg" 
            onClick={() => navigate("/roadmap")}
            className="group"
          >
            Generate Personalized Roadmap
            <span className="ml-2">
              <svg className="inline w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
