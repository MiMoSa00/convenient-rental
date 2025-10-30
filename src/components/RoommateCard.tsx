import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, User, MapPin, DollarSign, Sparkles } from "lucide-react";
import { useState } from "react";

interface RoommateCardProps {
  name: string;
  age: number;
  occupation: string;
  interests: string[];
  budget: string;
  compatibility: number;
  bio: string;
  location?: string;
  index?: number;
}

export default function RoommateCard({
  name,
  age,
  occupation,
  interests,
  budget,
  compatibility,
  bio,
  location = "New York, NY",
  index = 0,
}: RoommateCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "from-success to-green-400";
    if (score >= 80) return "from-primary to-primary-glow";
    return "from-accent to-accent-glow";
  };

  const getCompatibilityBg = (score: number) => {
    if (score >= 90) return "bg-success-light text-success";
    if (score >= 80) return "bg-primary-light text-primary";
    return "bg-accent-light text-accent";
  };

  const getCompatibilityGlowColor = (score: number) => {
    if (score >= 90) return "hsl(145 80% 42% / 0.5)";
    if (score >= 80) return "hsl(210 90% 65% / 0.5)";
    return "hsl(280 90% 70% / 0.5)";
  };

  return (
  <Card
  className="group p-6 hover:shadow-[var(--shadow-elegant)] transition-all duration-500 animate-fade-in-up border-border/50 relative overflow-hidden"
  style={{ 
    animationDelay: `${index * 0.1}s`,
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.animation = 'bounce-hover 0.6s ease-in-out';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.animation = 'none';
  }}
  >
      {/* Background Glow Effect */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${getCompatibilityColor(compatibility)} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16 ring-2 ring-border group-hover:ring-primary transition-all duration-300">
            <AvatarFallback className={`bg-gradient-to-br ${getCompatibilityColor(compatibility)} text-white text-lg font-semibold`}>
              {name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold truncate group-hover:text-primary transition-colors">
                  {name}
                </h3>
                <p className="text-sm text-muted-foreground">{age} years old</p>
              </div>
              <Badge 
                className={`${getCompatibilityBg(compatibility)} border-0 flex items-center gap-1 shrink-0 animate-glow-pulse px-2 py-1`}
                style={{
                  boxShadow: `0 0 20px ${getCompatibilityGlowColor(compatibility)}, 0 0 40px ${getCompatibilityGlowColor(compatibility)}`
                }}
              >
                <Sparkles className="h-3 w-3" />
                <span className="text-xs animate-blur-pulse">{compatibility}%</span>
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 text-primary" />
                <span className="truncate">{occupation}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{budget}</span>
                <span className="text-xs">/month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {bio}
        </p>

        {/* Interests */}
        <div className="mb-5">
          <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
            Interests
          </p>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, idx) => (
              <Badge
                key={interest}
                variant="secondary"
                className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            className="flex-1 relative overflow-hidden group/btn" 
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="relative z-10">Message</span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </Button>
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            className={`transition-all duration-300 ${isSaved ? "bg-destructive hover:bg-destructive/90" : ""}`}
            onClick={() => setIsSaved(!isSaved)}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
