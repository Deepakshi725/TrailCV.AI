import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ResumeAnalysis } from "@/components/ResumeAnalysis";

export default function MatchPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-12 px-4 sm:px-6 lg:px-8">
        <div className="pt-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ATS Match Analysis
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Here's how your resume matches with the job description
          </p>
        </div>
        
        <div className="mt-8">
          <ResumeAnalysis />
        </div>
      </div>
    </MainLayout>
  );
}
