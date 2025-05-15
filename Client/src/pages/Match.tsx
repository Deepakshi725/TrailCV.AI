import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ResumeAnalysis } from "@/components/ResumeAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Brain, Sparkles, Zap, Target, CheckCircle2, LucideIcon, ArrowRight, Lightbulb } from "lucide-react";
import { getAnalysisFromStorage } from '@/utils/resumeAnalyzer';
import { useNavigate } from "react-router-dom";

// Enhanced Aurora effect with more dynamic colors
const AuroraEffect = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-black/95" />
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${i * 45}deg, 
              ${i % 2 === 0 ? 'rgba(128,0,255,0.4)' : 'rgba(0,255,255,0.4)'}, 
              transparent)`,
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
};

// Enhanced Grid overlay with animated lines
const GridOverlay = () => {
  return (
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
};

// Enhanced Connected Particles with glowing trails
const ConnectedParticles = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 rounded-full"
          style={{
            background: `radial-gradient(circle, 
              ${i % 2 === 0 ? 'rgba(128,0,255,0.6)' : 'rgba(0,255,255,0.6)'} 0%, 
              transparent 70%)`,
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
};

// Success celebration animation
const SuccessCelebration = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: '50%',
            y: '50%',
            opacity: 0,
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
        </motion.div>
      ))}
    </div>
  );
};

interface Metric {
  icon: LucideIcon;
  label: string;
  value: string;
  tooltip?: string;
}

// Floating metrics cards
const FloatingMetrics = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    { icon: Target, label: "Match Score", value: "Calculating..." },
    { icon: Zap, label: "Keywords", value: "Calculating..." },
    { icon: CheckCircle2, label: "Skills Match", value: "Calculating..." },
  ]);

  useEffect(() => {
    async function calculateMetrics() {
      try {
        const analysis = await getAnalysisFromStorage();
        if (!analysis) return;

        const totalKeywords = analysis.matched_keywords.length + analysis.missing_keywords.length;
        const matchScore = Math.round((analysis.matched_keywords.length / totalKeywords) * 100);
        const skillsMatch = Math.round((analysis.matched_keywords.length / (analysis.matched_keywords.length + analysis.missing_keywords.length)) * 100);

        setMetrics([
          { 
            icon: Target, 
            label: "Match Score", 
            value: `${matchScore}%`,
            tooltip: `${analysis.matched_keywords.length} out of ${totalKeywords} keywords matched`
          },
          { 
            icon: Zap, 
            label: "Keywords", 
            value: `${analysis.matched_keywords.length}/${totalKeywords}`,
            tooltip: `${analysis.missing_keywords.length} keywords missing`
          },
          { 
            icon: CheckCircle2, 
            label: "Skills Match", 
            value: `${skillsMatch}%`,
            tooltip: `${analysis.matched_keywords.length} skills matched`
          },
        ]);
      } catch (error) {
        console.error('Error calculating metrics:', error);
        setMetrics([
          { icon: Target, label: "Match Score", value: "Error" },
          { icon: Zap, label: "Keywords", value: "Error" },
          { icon: CheckCircle2, label: "Skills Match", value: "Error" },
        ]);
      }
    }

    calculateMetrics();
  }, []);

  return (
    <div className="flex justify-center gap-6 mb-8">
      {metrics.map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          transition={{ 
            delay: i * 0.2,
            duration: 0.3, 
            ease: "easeOut" 
          }}
          className="relative group"
        >
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-xl blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <Card className="relative bg-black/40 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-500 ease-out">
            <CardContent className="p-4 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <metric.icon className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <motion.p 
                  className="text-sm text-muted-foreground"
                  whileHover={{ color: "var(--primary)" }}
                  transition={{ duration: 0.3 }}
                >
                  {metric.label}
                </motion.p>
                <motion.p 
                  className="text-xl font-bold text-primary"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {metric.value}
                </motion.p>
                {metric.tooltip && (
                  <motion.p 
                    className="text-xs text-muted-foreground"
                    initial={{ opacity: 0, y: 5 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {metric.tooltip}
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Path animation component
const PathAnimation = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dots path */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary"
              initial={{ 
                x: "50%", 
                y: "50%", 
                opacity: 0,
                scale: 0 
              }}
              animate={{ 
                x: "100%", 
                y: "50%", 
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Glowing trail */}
          <motion.div
            className="absolute w-1 h-1 bg-primary/50 blur-sm"
            initial={{ 
              x: "50%", 
              y: "50%", 
              opacity: 0,
              scale: 0 
            }}
            animate={{ 
              x: "100%", 
              y: "50%", 
              opacity: [0, 0.5, 0],
              scale: [0, 2, 0]
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Loader animation for suggestions generation
const SuggestionsLoader = ({ isVisible }: { isVisible: boolean }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="relative w-24 h-24 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <span className="absolute inset-0 rounded-full border-4 border-primary/40 animate-pulse" />
            <span className="absolute inset-4 rounded-full border-4 border-primary/60 animate-spin" />
            <Sparkles className="w-12 h-12 text-primary drop-shadow-lg animate-bounce" />
          </motion.div>
          <motion.div
            className="text-xl font-semibold text-primary text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Generating Tailored Suggestions...
          </motion.div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function MatchPage() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showPath, setShowPath] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show celebration animation after a short delay
    const timer = setTimeout(() => setShowCelebration(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSuggestionsClick = () => {
    setShowLoader(true);
    setTimeout(() => {
      setShowLoader(false);
      setShowPath(true);
      setTimeout(() => {
        navigate('/ai-suggestions');
      }, 1500);
    }, 2000);
  };

  return (
    <MainLayout>
      <AuroraEffect />
      <GridOverlay />
      <ConnectedParticles />
      <AnimatePresence>
        {showCelebration && <SuccessCelebration />}
      </AnimatePresence>
      <SuggestionsLoader isVisible={showLoader} />
      <PathAnimation isVisible={showPath} />
      
      <div className="max-w-4xl mx-auto space-y-8 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="pt-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <motion.div
              className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(128,0,255,0.3)',
                  '0 0 40px rgba(128,0,255,0.5)',
                  '0 0 20px rgba(128,0,255,0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Brain className="h-10 w-10 text-primary" />
            </motion.div>
          </motion.div>
          <motion.h1 
            className="text-4xl md:text-6xl font-heading font-bold bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            ATS Match Analysis
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Here's how your resume matches with the job description. Our AI has analyzed your documents to provide actionable insights.
          </motion.p>
        </motion.div>
        
        <FloatingMetrics />
        
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ResumeAnalysis />
        </motion.div>

        {/* Suggestions Button */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.button
            onClick={handleSuggestionsClick}
            className="group relative px-8 py-4 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl overflow-hidden transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <div className="relative flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                View Tailored Suggestions
              </span>
              <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </motion.button>
        </motion.div>
      </div>
    </MainLayout>
  );
}
