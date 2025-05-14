import { useState, DragEvent } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, Loader, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

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
        extractedText = await api.extractPdfText(uploadedFile);
      }
      
      if (type === 'resume') {
        setResumeFile(uploadedFile);
        if (extractedText) {
          setResumeText(extractedText);
        }
      } else {
        setJdFile(uploadedFile);
        if (extractedText) {
          setJdText(extractedText);
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

  const handleAnalyze = () => {
    const hasResume = resumeFile || resumeText.trim();
    const hasJD = jdFile || jdText.trim();

    if (!hasResume) {
      toast({
        title: "Resume missing",
        description: "Please provide your resume in either text or file format",
        variant: "destructive"
      });
      return;
    }

    if (!hasJD) {
      toast({
        title: "Job description missing",
        description: "Please provide a job description in either text or file format",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    // Simulate processing delay
    setTimeout(() => {
      setIsLoading(false);
      navigate("/match");
    }, 2000);
  };

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
      <Card className="bg-secondary/30 border-primary/20 hover:shadow-lg transition-shadow duration-300">
        <CardContent className="pt-8 pb-6 px-6">
          <h2 className="text-2xl font-heading font-semibold mb-6">
            {type === 'resume' ? 'Resume' : 'Job Description'}
          </h2>
          
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="text" className="text-base">Text Input</TabsTrigger>
              <TabsTrigger value="file" className="text-base">File Upload</TabsTrigger>
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
                  className="min-h-[200px] bg-secondary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 pr-12"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                {text && (
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
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  } ${file ? "bg-secondary/50" : ""}`}
                >
                  {!file ? (
                    <motion.div 
                      className="space-y-4"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-center">
                        <motion.div 
                          className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Upload className="h-8 w-8 text-primary" />
                        </motion.div>
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
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-center">
                        <motion.div 
                          className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FileText className="h-8 w-8 text-primary" />
                        </motion.div>
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
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-12 py-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Resume Analysis
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Upload your resume and job description to start the analysis
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
            className="relative overflow-hidden group px-8 py-6 text-lg"
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
