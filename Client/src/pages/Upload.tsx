import { useState, DragEvent, useEffect, useRef } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, Loader, Copy, Check, Sparkles, Brain, Rocket } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

// Aurora effect component (debug: bright color, higher opacity, border)
const AuroraEffect = ({ analyzingFx }: { analyzingFx: boolean }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-black/95" />
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${i * 60}deg, rgba(128,0,255,${analyzingFx ? 0.7 : 0.4}), transparent)`,
            filter: analyzingFx ? 'blur(10px)' : 'blur(30px)',
            border: analyzingFx ? '2px solid #00fff7' : '2px solid magenta',
          }}
          animate={{
            x: ['-50%', '150%'],
            y: ['-50%', '150%'],
            opacity: [analyzingFx ? 0.7 : 0.4, analyzingFx ? 0.9 : 0.6, analyzingFx ? 0.7 : 0.4],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 2,
          }}
        />
      ))}
    </div>
  );
};

// Grid overlay effect
const GridOverlay = () => {
  return (
    <div className="fixed inset-0 -z-10 opacity-10">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(var(--primary), 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(var(--primary), 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }} />
    </div>
  );
};

// Floating particles with connection lines (debug: larger, brighter, border)
const ConnectedParticles = ({ analyzingFx }: { analyzingFx: boolean }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${analyzingFx ? 'w-8 h-8 bg-cyan-400/80' : 'w-4 h-4 bg-cyan-400'}`}
          style={{ border: analyzingFx ? '3px solid #00fff7' : '2px solid cyan' }}
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: 0,
          }}
          animate={{
            y: [
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
            ],
            opacity: [analyzingFx ? 0.8 : 0.4, analyzingFx ? 1 : 0.6, analyzingFx ? 0.8 : 0.4],
            scale: analyzingFx ? [1, 1.3, 1] : 1,
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

// Glowing accent with pulse effect (debug: brighter, less blur, border)
const GlowingAccent = ({ analyzingFx }: { analyzingFx: boolean }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{ background: analyzingFx ? 'rgba(0,255,255,0.5)' : 'rgba(128,0,255,0.3)', filter: analyzingFx ? 'blur(10px)' : 'blur(30px)', border: analyzingFx ? '3px solid #00fff7' : '2px solid magenta' }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, analyzingFx ? 1.5 : 1.2, 1],
          opacity: [analyzingFx ? 0.7 : 0.3, analyzingFx ? 1 : 0.5, analyzingFx ? 0.7 : 0.3],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{ background: analyzingFx ? 'rgba(128,0,255,0.5)' : 'rgba(0,255,255,0.3)', filter: analyzingFx ? 'blur(10px)' : 'blur(30px)', border: analyzingFx ? '3px solid #00fff7' : '2px solid cyan' }}
        animate={{
          x: [100, 0, 100],
          y: [50, 0, 50],
          scale: [analyzingFx ? 1.5 : 1.2, 1, analyzingFx ? 1.5 : 1.2],
          opacity: [analyzingFx ? 1 : 0.4, analyzingFx ? 0.7 : 0.2, analyzingFx ? 1 : 0.4],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default function UploadPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedType, setCopiedType] = useState<'resume' | 'jd' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analyzingFx, setAnalyzingFx] = useState(false);
  const analyzeTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, type: 'resume' | 'jd') => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await handleFileUpload(droppedFile, type);
    }
  };

  const handleFileUpload = async (uploadedFile: File, type: 'resume' | 'jd') => {
    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(uploadedFile.type)) {
      toast({
        title: "Invalid file format",
        description: "Please upload a PDF or DOCX file",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      let extractedText = '';
      
      if (uploadedFile.type === 'application/pdf') {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        // Call the API to extract text without saving to DB
        const response = await fetch(`http://localhost:5000/api/upload/extract-text-only?type=${type}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to extract text from PDF');
        }

        const data = await response.json();
        extractedText = data.text;
      }
      
      if (type === 'resume') {
        setResumeFile(uploadedFile);
        if (extractedText) {
          setResumeText(extractedText);
          sessionStorage.setItem('resumeText', extractedText);
        }
      } else {
        setJdFile(uploadedFile);
        if (extractedText) {
          setJdText(extractedText);
          sessionStorage.setItem('jdText', extractedText);
        }
      }
      
      toast({
        title: "File uploaded successfully",
        description: `${uploadedFile.name} is ready for analysis.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = async (text: string, type: 'resume' | 'jd') => {
    try {
      if (type === 'resume') {
        setResumeText(text);
        sessionStorage.setItem('resumeText', text);
      } else {
        setJdText(text);
        sessionStorage.setItem('jdText', text);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save text",
        variant: "destructive"
      });
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'jd') => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await handleFileUpload(selectedFile, type);
    }
  };

  const removeFile = (type: 'resume' | 'jd') => {
    if (type === 'resume') {
      setResumeFile(null);
      setResumeText("");
    } else {
      setJdFile(null);
      setJdText("");
    }
  };

  const handleCopy = async (type: 'resume' | 'jd') => {
    const textToCopy = type === 'resume' ? resumeText : jdText;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: "The text has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleAnalyze = async () => {
    // Trigger futuristic animation
    setAnalyzingFx(true);
    if (analyzeTimeout.current) clearTimeout(analyzeTimeout.current);
    analyzeTimeout.current = setTimeout(() => setAnalyzingFx(false), 2500);

    const hasResume = resumeFile || resumeText.trim();
    const hasJD = jdFile || jdText.trim();

    if (!hasResume) {
      toast({
        title: "Resume missing",
        description: "Please provide your resume in either text or file format",
        variant: "destructive"
      });
      setAnalyzingFx(false);
      return;
    }
    if (!hasJD) {
      toast({
        title: "Job description missing",
        description: "Please provide a job description in either text or file format",
        variant: "destructive"
      });
      setAnalyzingFx(false);
      return;
    }
    setIsLoading(true);
    try {
      // Save to localStorage first
      const analysisData = {
        resume: {
          text: resumeText.trim(),
          fileType: resumeFile?.type || 'text/plain',
          fileName: resumeFile?.name || 'manual-input.txt'
        },
        jobDescription: {
          text: jdText.trim(),
          fileType: jdFile?.type || 'text/plain',
          fileName: jdFile?.name || 'manual-input.txt'
        },
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('lastAnalysis', JSON.stringify(analysisData));

      // Save to MongoDB
      const response = await fetch('http://localhost:5000/api/upload/save-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(analysisData),
      });
      if (!response.ok) throw new Error('Failed to save analysis');
      sessionStorage.removeItem('resumeText');
      sessionStorage.removeItem('jdText');
      navigate("/match");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze documents",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setAnalyzingFx(false), 1000);
    }
  };

  // Load text from session storage on component mount
  useEffect(() => {
    const savedResumeText = sessionStorage.getItem('resumeText');
    const savedJdText = sessionStorage.getItem('jdText');
    
    if (savedResumeText) {
      setResumeText(savedResumeText);
    }
    if (savedJdText) {
      setJdText(savedJdText);
    }
  }, []);

  const FileUploadCard = ({ type, file, setFile, text, setText }: {
    type: 'resume' | 'jd';
    file: File | null;
    setFile: (file: File | null) => void;
    text: string;
    setText: (text: string) => void;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-secondary/30 to-secondary/10 border-primary/20 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
        <CardContent className="pt-8 pb-6 px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              {type === 'resume' ? (
                <FileText className="h-6 w-6 text-primary" />
              ) : (
                <Brain className="h-6 w-6 text-primary" />
              )}
            </div>
            <h2 className="text-2xl font-heading font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {type === 'resume' ? 'Resume' : 'Job Description'}
            </h2>
          </div>
          
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 p-1 rounded-lg backdrop-blur-sm">
              <TabsTrigger 
                value="text" 
                className="text-base data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                Text Input
              </TabsTrigger>
              <TabsTrigger 
                value="file" 
                className="text-base data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                File Upload
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="mt-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Textarea 
                  placeholder={`Enter your ${type === 'resume' ? 'resume' : 'job description'} here...`}
                  className="min-h-[200px] bg-secondary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 pr-12 rounded-xl border-primary/20 backdrop-blur-sm"
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value, type)}
                />
                {text && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 hover:bg-primary/10"
                      onClick={() => handleCopy(type)}
                    >
                      {copiedType === type ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="file" className="mt-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, type)}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragging ? "border-primary bg-primary/10" : "border-primary/20 hover:border-primary/50 hover:bg-secondary/50"
                  } ${file ? "bg-secondary/50" : ""}`}
                >
                  <AnimatePresence mode="wait">
                    {!file ? (
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-center">
                          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <Upload className="h-10 w-10 text-primary" />
                          </div>
                        </div>
                        <div>
                          <p className="text-foreground font-medium text-lg">
                            Drag & drop your {type === 'resume' ? 'resume' : 'job description'} here
                          </p>
                          <p className="text-muted-foreground text-sm mt-2">
                            or click to browse files
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Supported formats: PDF, DOCX
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(e) => handleFileInputChange(e, type)}
                          className="hidden"
                          id={`${type}-upload`}
                        />
                        <Button 
                          asChild 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-primary/10 transition-colors duration-300"
                        >
                          <label htmlFor={`${type}-upload`} className="cursor-pointer">Browse files</label>
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-center">
                          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <FileText className="h-10 w-10 text-primary" />
                          </div>
                        </div>
                        <div>
                          <p className="text-foreground font-medium text-lg line-clamp-1">
                            {file.name}
                          </p>
                          <p className="text-muted-foreground text-sm mt-2">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFile(type)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-300"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                          {text && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(type)}
                              className="hover:bg-primary/10 transition-colors duration-300"
                            >
                              {copiedType === type ? (
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="mr-2 h-4 w-4" />
                              )}
                              Copy Text
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Futuristic Analyze Button Animation Overlay
  const AnalyzeFxOverlay = () => (
    <AnimatePresence>
      {analyzingFx && (
        <motion.div
          key="analyze-fx"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 60%, rgba(128,0,255,0.25) 0%, rgba(0,255,255,0.12) 60%, transparent 100%)"
          }}
        >
          {/* AI scan lines */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 w-full h-1 bg-gradient-to-r from-cyan-400/60 via-purple-500/80 to-transparent blur-lg"
              style={{ top: `${30 + i * 7}%` }}
              initial={{ opacity: 0, x: -200 }}
              animate={{ opacity: [0.7, 0.2, 0.7], x: [0, 100, 0] }}
              transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
            />
          ))}
          {/* AI burst */}
          <motion.div
            className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            initial={{ scale: 0.7, opacity: 0.7 }}
            animate={{ scale: [0.7, 1.5, 1.2], opacity: [0.7, 0.2, 0] }}
            transition={{ duration: 1.2 }}
            style={{ width: 320, height: 320, background: "radial-gradient(circle, rgba(0,255,255,0.25) 0%, rgba(128,0,255,0.18) 80%, transparent 100%)", filter: "blur(8px)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <MainLayout>
      <AnalyzeFxOverlay />
      <AuroraEffect analyzingFx={analyzingFx} />
      <GridOverlay />
      <ConnectedParticles analyzingFx={analyzingFx} />
      <GlowingAccent analyzingFx={analyzingFx} />
      <div className="max-w-4xl mx-auto space-y-12 py-12 px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Resume Analysis
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            Upload your resume and job description to start the analysis. Our AI will help you optimize your resume for better job matches.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 gap-12">
          <FileUploadCard
            type="resume"
            file={resumeFile}
            setFile={setResumeFile}
            text={resumeText}
            setText={setResumeText}
          />
          
          <FileUploadCard
            type="jd"
            file={jdFile}
            setFile={setJdFile}
            text={jdText}
            setText={setJdText}
          />
        </div>
        
        <motion.div 
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button 
            size="lg" 
            onClick={handleAnalyze} 
            disabled={(!resumeFile && !resumeText.trim()) || (!jdFile && !jdText.trim()) || isLoading}
            className="relative overflow-hidden group px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
          >
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </motion.div>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Analyze Match
                <motion.span 
                  className="absolute inset-0 w-full h-full bg-white/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
}
