import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award,
  BookOpen,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  Lock,
  Play,
  Star,
  FileText,
  Globe,
  Video
} from "lucide-react";
import { getAnalysisFromStorage, getLearningResourcesForSkills } from '@/utils/resumeAnalyzer';
import { motion } from "framer-motion";

// Mock data for learning resources
const certifiedCourses = [
  {
    id: 1,
    title: "Advanced React & GraphQL Development",
    provider: "Frontend Masters",
    duration: "20 hours",
    level: "Advanced",
    price: "$99",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=150",
    locked: true
  },
  {
    id: 2,
    title: "Next.js & Server Components",
    provider: "Udemy",
    duration: "15 hours",
    level: "Intermediate",
    price: "$79",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=300&h=150",
    locked: false
  },
  {
    id: 3,
    title: "CI/CD Pipeline Mastery",
    provider: "Coursera",
    duration: "25 hours",
    level: "Intermediate",
    price: "$129",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&h=150",
    locked: true
  }
];

const freeResources = [
  {
    id: 1,
    title: "GraphQL Crash Course",
    creator: "Web Dev Simplified",
    duration: "45 minutes",
    platform: "YouTube",
    views: "250K+",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=300&h=150"
  },
  {
    id: 2,
    title: "Getting Started with Next.js",
    creator: "Vercel",
    duration: "1 hour",
    platform: "YouTube",
    views: "480K+",
    image: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=300&h=150"
  },
  {
    id: 3,
    title: "CI/CD for Frontend Developers",
    creator: "Fireship",
    duration: "20 minutes",
    platform: "YouTube",
    views: "320K+",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=150"
  }
];

// Roadmap steps
const roadmapSteps = [
  { 
    id: 1, 
    title: "Learn GraphQL Fundamentals", 
    description: "Master the basics of GraphQL queries, mutations, and schema design.",
    progress: 100,
    status: "completed"
  },
  { 
    id: 2, 
    title: "Build First Next.js App", 
    description: "Create a small Next.js project to understand routing and SSR.",
    progress: 65,
    status: "in-progress"
  },
  { 
    id: 3, 
    title: "Setup CI/CD Pipeline", 
    description: "Learn to implement continuous integration and deployment.",
    progress: 0,
    status: "not-started"
  },
  { 
    id: 4, 
    title: "Advanced State Management", 
    description: "Master Redux, Context API and server state with React Query.",
    progress: 0,
    status: "not-started"
  }
];

// Helper to check if a YouTube video is available
async function isYouTubeVideoAvailable(url: string): Promise<boolean> {
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) return true;
  try {
    const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (!videoId) return false;
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    return res.ok;
  } catch {
    return false;
  }
}

// --- Aurora, Grid, and Particles Effects (from Match/Suggestions) ---
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

function getResourceIcon(type: string) {
  switch (type) {
    case 'video': return <Video className="w-8 h-8 text-primary" />;
    case 'article': return <FileText className="w-8 h-8 text-primary" />;
    case 'blog': return <BookOpen className="w-8 h-8 text-primary" />;
    case 'docs': return <Globe className="w-8 h-8 text-primary" />;
    default: return <ExternalLink className="w-8 h-8 text-primary" />;
  }
}

export default function RoadmapPage() {
  const [selectedTab, setSelectedTab] = useState("certified");
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [certifiedCourses, setCertifiedCourses] = useState<any[]>([]);
  const [freeResources, setFreeResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      setError(null);
      try {
        const analysis = await getAnalysisFromStorage();
        if (!analysis || !Array.isArray(analysis.missing_keywords) || analysis.missing_keywords.length === 0) {
          setError("No missing skills found. Please analyze your resume first.");
          setSkillsToLearn([]);
          setCertifiedCourses([]);
          setFreeResources([]);
        } else {
          const resources = await getLearningResourcesForSkills(analysis.missing_keywords);
          setSkillsToLearn(resources.skillsToLearn);
          setCertifiedCourses(resources.certifiedCourses);

          // Validate free resources (YouTube videos)
          const validFreeResources: any[] = [];
          for (const resource of resources.freeResources) {
            let isValid = await isYouTubeVideoAvailable(resource.url);
            let retryCount = 0;
            // If not valid, try to get a new video for the same topic (up to 2 retries)
            while (!isValid && retryCount < 2) {
              const retryPrompt = `Find a currently available YouTube video for the topic: '${resource.title}' or skill: '${resource.platform}'. Return a JSON object with title, creator, duration, platform, views, image, and url. Only return a video that is available now.`;
              try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      contents: [{ parts: [{ text: retryPrompt }] }]
                    })
                  }
                );
                if (response.ok) {
                  const data = await response.json();
                  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  const jsonMatch = text.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    const newResource = JSON.parse(jsonMatch[0]);
                    isValid = await isYouTubeVideoAvailable(newResource.url);
                    if (isValid) {
                      validFreeResources.push(newResource);
                      break;
                    }
                  }
                }
              } catch {}
              retryCount++;
            }
            if (isValid) validFreeResources.push(resource);
          }
          setFreeResources(validFreeResources);
        }
      } catch (err) {
        setError("Failed to load learning resources. Try again.");
        setSkillsToLearn([]);
        setCertifiedCourses([]);
        setFreeResources([]);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
              <BookOpen className="w-8 h-8 text-primary animate-bounce" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent drop-shadow-lg">
              Your Learning Roadmap
            </h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-2xl mx-auto">
              Personalized learning path to help you reach your career goals
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-6xl mx-auto mb-16 px-2 sm:px-0 mt-8">
        <Card className="bg-black/60 border-primary/20 shadow-xl backdrop-blur-xl p-0 rounded-3xl relative">
          <CardContent className="py-10 px-2 sm:px-10 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <span className="text-primary font-medium text-lg mb-2">Finding the best resources for you...</span>
                <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4" />
              </div>
            ) : error ? (
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="pt-6">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Skills to Learn Section (dynamic) */}
                {skillsToLearn.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2 text-primary">Skills to Learn</h2>
                    <div className="flex flex-wrap gap-2">
                      {skillsToLearn.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm border border-primary/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Tabs defaultValue="certified" value={selectedTab} onValueChange={setSelectedTab}>
                  <div className="flex justify-between items-center mb-6">
                    <TabsList className="grid grid-cols-2 w-auto">
                      <TabsTrigger value="certified">Certified Courses</TabsTrigger>
                      <TabsTrigger value="free">Free Resources</TabsTrigger>
                    </TabsList>
                    <div className="hidden sm:flex items-center gap-2">
                      <Badge variant="outline" className="bg-secondary text-primary px-3 py-1 text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        Updated today
                      </Badge>
                    </div>
                  </div>

                  <TabsContent value="certified" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {certifiedCourses.map((course, i) => (
                        <Card key={i} className="bg-secondary/30 border-primary/20 overflow-hidden group hover:border-primary/40 transition-colors">
                          <div className="relative h-36">
                            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
                            <img 
                              src={course.image} 
                              alt={course.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {course.locked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                                <div className="text-center">
                                  <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                  <span className="text-sm text-muted-foreground">Premium Content</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium line-clamp-2 pr-4">
                                <a href={course.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                  {course.title}
                                </a>
                              </h3>
                              <Badge className="bg-primary/20 text-primary border-none">
                                {course.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {course.provider}
                            </p>
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center text-yellow-500">
                                <Star className="fill-yellow-500 w-4 h-4" />
                                <span className="text-sm font-medium ml-1">{course.rating}</span>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="w-4 h-4 mr-1" />
                                {course.duration}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{course.price}</span>
                              <Button size="sm" variant="default" asChild>
                                <a href={course.url} target="_blank" rel="noopener noreferrer">
                                  Enroll Now
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="free" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {freeResources.map((resource, i) => (
                        <Card key={i} className="bg-secondary/30 border-primary/20 overflow-hidden group hover:border-primary/40 transition-colors relative">
                          <div className="relative h-36">
                            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
                            {resource.image ? (
                              <img 
                                src={resource.image} 
                                alt={resource.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-primary/10">
                                {getResourceIcon(resource.type)}
                                <span className="mt-2 text-primary font-semibold text-base text-center px-2 truncate w-full">
                                  {resource.platform || resource.type}
                                </span>
                              </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-black/70">
                              <span className="text-lg font-bold text-primary text-center px-4 mb-2 truncate w-full">{resource.title}</span>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="w-32 py-2 rounded-full bg-primary/80 text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary">
                                Visit {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-medium line-clamp-2">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                  {resource.title}
                                </a>
                              </h3>
                              <Badge className="bg-secondary text-muted-foreground border-none capitalize">
                                {resource.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {resource.creator}
                            </p>
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center text-sm">
                                <BookOpen className="w-4 h-4 mr-1 text-muted-foreground" />
                                <span>{resource.platform}</span>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="w-4 h-4 mr-1" />
                                {resource.duration}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">{resource.views} views</span>
                              <Button size="sm" variant="outline" className="gap-1" asChild>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                  Watch
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
