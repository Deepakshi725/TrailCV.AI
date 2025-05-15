import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalysisFromStorage } from '@/utils/resumeAnalyzer';
import { Loader, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Suggestion {
  explanation: string;
  snippet: string;
}

interface AnalysisResult {
  matched_keywords: string[];
  missing_keywords: string[];
  recommendations: Suggestion[];
}

export function ResumeAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const result = await getAnalysisFromStorage();
        setAnalysis(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="bg-secondary/30 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No analysis data found. Please upload a resume and job description first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Matched Keywords */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-secondary/30 border-primary/20 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-heading font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
                Matched Keywords
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.matched_keywords.map((keyword, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm border border-green-500/30"
                >
                  {keyword}
                </motion.span>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Missing Keywords */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-secondary/30 border-primary/20 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-heading font-semibold flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                Missing Keywords
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.missing_keywords.map((keyword, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-sm border border-red-500/30"
                >
                  {keyword}
                </motion.span>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-secondary/30 border-primary/20 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-heading font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Recommendations
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-2 group"
                >
                  <span className="text-primary mt-1 group-hover:scale-110 transition-transform duration-300">•</span>
                  <span className="text-foreground group-hover:text-primary/80 transition-colors duration-300">
                    {recommendation.explanation}
                  </span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 