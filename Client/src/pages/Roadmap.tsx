
import { useState } from "react";
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
  Star
} from "lucide-react";

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

export default function RoadmapPage() {
  const [selectedTab, setSelectedTab] = useState("progress");

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold">Your Learning Roadmap</h1>
          <p className="text-muted-foreground mt-2">
            Personalized learning path to help you reach your career goals
          </p>
        </div>

        <Tabs defaultValue="progress" value={selectedTab} onValueChange={setSelectedTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid grid-cols-3 w-auto">
              <TabsTrigger value="progress">Progress</TabsTrigger>
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

          <TabsContent value="progress" className="space-y-8">
            <Card className="border-primary/20 bg-secondary/30">
              <CardHeader>
                <CardTitle className="font-heading">Progress Overview</CardTitle>
                <CardDescription>
                  Your personalized learning roadmap based on job requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 glass-card rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-primary">25%</div>
                    <div className="text-sm text-muted-foreground mt-2">Overall Progress</div>
                  </div>
                  <div className="flex-1 glass-card rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-primary">1/4</div>
                    <div className="text-sm text-muted-foreground mt-2">Steps Completed</div>
                  </div>
                  <div className="flex-1 glass-card rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-primary">3</div>
                    <div className="text-sm text-muted-foreground mt-2">Days Streak</div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {roadmapSteps.map((step) => (
                    <div 
                      key={step.id} 
                      className={`glass-card rounded-xl p-6 transition-all ${
                        step.status === "completed" ? "border-green-500/30" :
                        step.status === "in-progress" ? "border-primary/30 glow" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            step.status === "completed" ? "bg-green-500/20 text-green-500" :
                            step.status === "in-progress" ? "bg-primary/20 text-primary" :
                            "bg-secondary text-muted-foreground"
                          }`}>
                            {step.status === "completed" ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <span>{step.id}</span>
                            )}
                          </div>
                          <h3 className="text-lg font-medium">{step.title}</h3>
                        </div>
                        <Badge variant={
                          step.status === "completed" ? "outline" :
                          step.status === "in-progress" ? "secondary" : "outline"
                        } className={
                          step.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/30" :
                          step.status === "in-progress" ? "bg-primary/10 text-primary border-primary/30" :
                          "bg-secondary text-muted-foreground"
                        }>
                          {step.status === "completed" ? "Completed" :
                           step.status === "in-progress" ? "In Progress" : "Not Started"}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 ml-11">{step.description}</p>
                      
                      <div className="ml-11 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{step.progress}%</span>
                        </div>
                        <Progress value={step.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certified" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {certifiedCourses.map((course) => (
                <Card key={course.id} className="bg-secondary/30 border-primary/20 overflow-hidden group hover:border-primary/40 transition-colors">
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
                      <h3 className="font-medium line-clamp-2 pr-4">{course.title}</h3>
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
                      <Button size="sm" variant={course.locked ? "outline" : "default"}>
                        {course.locked ? "Unlock" : "Enroll Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="free" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {freeResources.map((resource) => (
                <Card key={resource.id} className="bg-secondary/30 border-primary/20 overflow-hidden group hover:border-primary/40 transition-colors">
                  <div className="relative h-36">
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
                    <img 
                      src={resource.image} 
                      alt={resource.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center cursor-pointer">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium line-clamp-2">{resource.title}</h3>
                      <Badge className="bg-secondary text-muted-foreground border-none">
                        FREE
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
                      <Button size="sm" variant="outline" className="gap-1">
                        <ExternalLink className="w-4 h-4" />
                        Watch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
