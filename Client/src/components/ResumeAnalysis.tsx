import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalysisFromStorage } from '@/utils/resumeAnalyzer';
import { Loader } from 'lucide-react';

interface AnalysisResult {
  matched_keywords: string[];
  missing_keywords: string[];
  recommendations: string[];
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
        <Loader className="h-8 w-8 animate-spin text-primary" />
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
      <Card className="bg-secondary/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-heading font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ✅ Matched Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.matched_keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing Keywords */}
      <Card className="bg-secondary/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-heading font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ❌ Missing Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-secondary/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-heading font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            📈 Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-foreground">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 