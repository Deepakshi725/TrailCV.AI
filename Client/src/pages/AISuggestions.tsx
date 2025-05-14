
import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ArrowRight, 
  Copy, 
  CheckCircle,
  FileText,
  Briefcase,
  BookOpen,
  Award,
  Code
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SECTION_TYPES = [
  {
    id: "experience",
    title: "Professional Experience",
    icon: Briefcase,
    description: "Enhance your work history presentation"
  },
  {
    id: "education",
    title: "Education",
    icon: BookOpen,
    description: "Optimize educational credentials"
  },
  {
    id: "skills",
    title: "Technical Skills",
    icon: Code,
    description: "Improve skills section with targeted keywords"
  },
  {
    id: "certifications",
    title: "Certifications",
    icon: Award,
    description: "Showcase relevant certifications"
  }
];

export default function AISuggestionsPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
    
    toast({
      title: "Copied to clipboard",
      description: "The suggestion has been copied to your clipboard.",
    });
  };
  
  // Sample AI suggestions
  const suggestions = {
    experience: {
      original: "Frontend Developer at TechCorp (2020-2023)\n• Developed web applications using React\n• Worked with team on UI/UX improvements",
      improved: "Frontend Developer at TechCorp (2020-2023)\n• Engineered responsive web applications using React.js and TypeScript, reducing load time by 40%\n• Spearheaded UI/UX improvements that increased user engagement by 25% and reduced bounce rate by 15%\n• Implemented API integration with RESTful services and handled complex state management using Redux\n• Collaborated in an Agile environment, delivering 30+ features on time with 98% client satisfaction"
    },
    education: {
      original: "Bachelor's in Computer Science, State University (2016-2020)",
      improved: "Bachelor of Science in Computer Science, State University (2016-2020)\n• Specialization in Software Engineering and Interactive Systems\n• Relevant Coursework: Advanced Web Development, Data Structures & Algorithms, UI/UX Design Principles, Cloud Computing\n• Senior Project: Developed a full-stack job application tracking system with React, Node.js, and MongoDB"
    },
    skills: {
      original: "React, JavaScript, HTML, CSS",
      improved: "• Frontend: React.js, TypeScript, Next.js, Redux, HTML5, CSS3, SASS, Tailwind CSS\n• Tools & Methods: Git, Webpack, Jest, React Testing Library, CI/CD, Agile/Scrum\n• API Integration: RESTful APIs, GraphQL, Axios\n• Performance Optimization: Lazy loading, Code splitting, Memoization techniques\n• UI Libraries: Material-UI, Chakra UI, Bootstrap, Ant Design"
    },
    certifications: {
      original: "None listed",
      improved: "• AWS Certified Developer - Associate (2022)\n• Meta Frontend Developer Professional Certificate (2021)\n• Google UX Design Professional Certificate (2020)\n• JavaScript Algorithms and Data Structures, freeCodeCamp (2019)"
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">AI-Powered Suggestions</h1>
          <p className="text-muted-foreground mt-2">
            Optimize your resume with these AI-enhanced improvements
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {SECTION_TYPES.map((section) => (
            <Card key={section.id} className="bg-secondary/30 border-primary/20 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center mb-1">
                  <div className="p-2 rounded-full bg-primary/20 mr-3">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-heading">{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="comparison" className="border-primary/20">
                    <AccordionTrigger className="py-4 text-base font-medium">
                      View Comparison
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                          <h4 className="text-sm font-medium text-muted-foreground">Original Content</h4>
                        </div>
                        <div className="p-4 rounded bg-secondary/50 text-sm whitespace-pre-line">
                          {suggestions[section.id as keyof typeof suggestions].original}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                          <h4 className="text-sm font-medium text-primary">AI-Enhanced Suggestion</h4>
                        </div>
                        <div className="relative p-4 rounded bg-primary/10 border border-primary/20 text-sm whitespace-pre-line">
                          {suggestions[section.id as keyof typeof suggestions].improved}
                          
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute top-2 right-2 h-8 w-8 p-0"
                            onClick={() => handleCopy(
                              section.id, 
                              suggestions[section.id as keyof typeof suggestions].improved
                            )}
                          >
                            {copiedSection === section.id ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button 
            size="lg" 
            onClick={() => navigate("/roadmap")}
            className="group"
          >
            Generate Personalized Roadmap
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
