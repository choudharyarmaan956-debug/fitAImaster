import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Moon, 
  Zap, 
  Heart, 
  Smile, 
  Brain, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Target
} from "lucide-react";

interface DailyCheckinProps {
  user: any;
  showModal?: boolean;
  onComplete?: () => void;
}

export default function DailyCheckin({ user, showModal = false, onComplete }: DailyCheckinProps) {
  const [open, setOpen] = useState(showModal);
  const [sleepQuality, setSleepQuality] = useState([7]);
  const [energyLevel, setEnergyLevel] = useState([7]);
  const [soreness, setSoreness] = useState([3]);
  const [mood, setMood] = useState([8]);
  const [stress, setStress] = useState([3]);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  // Check if user has already checked in today
  const { data: todayCheckin, isLoading } = useQuery<any>({
    queryKey: ["/api/checkins/today", user.id],
    enabled: !!user.id,
  });

  // Get recent check-ins for trend
  const { data: recentCheckins = [] } = useQuery<any[]>({
    queryKey: ["/api/checkins/user", user.id, 7],
    enabled: !!user.id,
  });

  const submitCheckinMutation = useMutation({
    mutationFn: async (checkinData: any) => {
      const response = await apiRequest("POST", "/api/checkins", checkinData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkins/today", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/checkins/user", user.id] });
      
      toast({
        title: `Readiness Score: ${data.readinessScore}% ✨`,
        description: getReadinessMessage(data.readinessScore),
      });
      
      setOpen(false);
      if (onComplete) onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit check-in",
        variant: "destructive",
      });
    },
  });

  // Calculate readiness score in real-time
  const calculateReadinessScore = () => {
    return Math.round(
      ((sleepQuality[0] + energyLevel[0] + (11 - soreness[0]) + mood[0] + (11 - stress[0])) / 50) * 100
    );
  };

  const getReadinessMessage = (score: number) => {
    if (score >= 85) return "You're firing on all cylinders! 💪 Great day for intense training.";
    if (score >= 70) return "Feeling good! 👍 Normal training intensity recommended.";
    if (score >= 55) return "A bit tired today. 😌 Consider lighter training or active recovery.";
    return "Your body needs rest. 😴 Perfect day for recovery or light stretching.";
  };

  const getReadinessColor = (score: number) => {
    if (score >= 85) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-blue-600 dark:text-blue-400";
    if (score >= 55) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleSubmit = () => {
    submitCheckinMutation.mutate({
      userId: user.id,
      sleepQuality: sleepQuality[0],
      energyLevel: energyLevel[0],
      soreness: soreness[0],
      mood: mood[0],
      stress: stress[0],
      notes: notes.trim() || undefined,
    });
  };

  // Auto-open modal if user hasn't checked in today
  useEffect(() => {
    if (!isLoading && !todayCheckin && !showModal) {
      setOpen(true);
    }
  }, [todayCheckin, isLoading, showModal]);

  const currentReadinessScore = calculateReadinessScore();

  if (isLoading) return null;

  // If user has already checked in today, show summary
  if (todayCheckin && !open) {
    return (
      <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Today's Readiness</h3>
                  <p className="text-sm text-muted-foreground">Daily check-in completed</p>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${getReadinessColor(todayCheckin.readinessScore)}`}>
                  {todayCheckin.readinessScore}%
                </div>
                <div className="text-xs text-muted-foreground">Readiness Score</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setOpen(true)}
                data-testid="view-checkin-details"
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!showModal && (
        <DialogTrigger asChild>
          <Card className="mb-6 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Daily Check-in Required</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Help us personalize your workout intensity based on how you're feeling today
              </p>
              <Button className="pulse-animation" data-testid="start-checkin">
                Start Daily Check-in
              </Button>
            </CardContent>
          </Card>
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span>Daily Wellness Check-in</span>
          </DialogTitle>
          <DialogDescription>
            Help us understand how you're feeling today so we can adapt your workout accordingly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Real-time Readiness Score */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${getReadinessColor(currentReadinessScore)}`}>
                  {currentReadinessScore}%
                </div>
                <div className="text-sm font-medium text-foreground mb-2">Current Readiness Score</div>
                <Progress value={currentReadinessScore} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {getReadinessMessage(currentReadinessScore)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Check-in Form */}
          <div className="grid gap-6">
            {/* Sleep Quality */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Moon className="w-4 h-4 text-blue-500" />
                <Label className="font-medium">Sleep Quality</Label>
                <Badge variant="outline">{sleepQuality[0]}/10</Badge>
              </div>
              <Slider
                value={sleepQuality}
                onValueChange={setSleepQuality}
                max={10}
                min={1}
                step={1}
                className="w-full"
                data-testid="sleep-quality-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor</span>
                <span>Average</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <Label className="font-medium">Energy Level</Label>
                <Badge variant="outline">{energyLevel[0]}/10</Badge>
              </div>
              <Slider
                value={energyLevel}
                onValueChange={setEnergyLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
                data-testid="energy-level-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Exhausted</span>
                <span>Moderate</span>
                <span>Energized</span>
              </div>
            </div>

            {/* Muscle Soreness */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <Label className="font-medium">Muscle Soreness</Label>
                <Badge variant="outline">{soreness[0]}/10</Badge>
              </div>
              <Slider
                value={soreness}
                onValueChange={setSoreness}
                max={10}
                min={1}
                step={1}
                className="w-full"
                data-testid="soreness-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>No Pain</span>
                <span>Moderate</span>
                <span>Very Sore</span>
              </div>
            </div>

            {/* Mood */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Smile className="w-4 h-4 text-green-500" />
                <Label className="font-medium">Mood</Label>
                <Badge variant="outline">{mood[0]}/10</Badge>
              </div>
              <Slider
                value={mood}
                onValueChange={setMood}
                max={10}
                min={1}
                step={1}
                className="w-full"
                data-testid="mood-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>Neutral</span>
                <span>Great</span>
              </div>
            </div>

            {/* Stress Level */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <Label className="font-medium">Stress Level</Label>
                <Badge variant="outline">{stress[0]}/10</Badge>
              </div>
              <Slider
                value={stress}
                onValueChange={setStress}
                max={10}
                min={1}
                step={1}
                className="w-full"
                data-testid="stress-slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Calm</span>
                <span>Moderate</span>
                <span>High Stress</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label className="font-medium">Additional Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific concerns or observations about how you're feeling today..."
                className="min-h-[80px]"
                data-testid="notes-textarea"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <Button
              onClick={handleSubmit}
              disabled={submitCheckinMutation.isPending}
              className="flex-1"
              data-testid="submit-checkin"
            >
              {submitCheckinMutation.isPending ? "Submitting..." : "Complete Check-in"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitCheckinMutation.isPending}
            >
              Skip Today
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}