import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ResumeAnalysis } from "@/components/ResumeAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Brain, Sparkles, Zap, Target, CheckCircle2, LucideIcon } from "lucide-react";
import { getAnalysisFromStorage } from '@/utils/resumeAnalyzer';

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

export default function MatchPage() {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Show celebration animation after a short delay
    const timer = setTimeout(() => setShowCelebration(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout>
      <AuroraEffect />
      <GridOverlay />
      <ConnectedParticles />
      <AnimatePresence>
        {showCelebration && <SuccessCelebration />}
      </AnimatePresence>
      
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
      </div>
    </MainLayout>
  );
}
