import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Timer,
  Dumbbell,
  Coffee,
  Clock,
  Settings,
  Volume2,
  VolumeX
} from "lucide-react";

interface WorkoutTimerProps {
  compact?: boolean;
}

type TimerType = 'workout' | 'rest' | 'custom';

export default function WorkoutTimer({ compact = false }: WorkoutTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // in seconds
  const [targetTime, setTargetTime] = useState(30 * 60); // 30 minutes default
  const [timerType, setTimerType] = useState<TimerType>('workout');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [rounds, setRounds] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;
          
          // Check for completion
          if (newTime >= targetTime) {
            handleTimerComplete();
            return targetTime;
          }
          
          // Check for milestone notifications
          const remaining = targetTime - newTime;
          if (remaining === 60 && audioEnabled) {
            playNotificationSound();
            toast({
              title: "1 minute remaining! ⏰",
              description: "Almost done with this set!",
            });
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, targetTime, audioEnabled]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (audioEnabled) {
      playNotificationSound();
    }
    
    toast({
      title: `${timerType === 'rest' ? 'Rest' : 'Workout'} Complete! 🎉`,
      description: currentRound < rounds 
        ? `Round ${currentRound} done! Moving to round ${currentRound + 1}`
        : "All rounds completed! Great work!",
    });

    // Handle multiple rounds
    if (currentRound < rounds) {
      setCurrentRound(prev => prev + 1);
      setTime(0);
      // Auto-switch between workout and rest
      if (timerType === 'workout') {
        setTimerType('rest');
        setTargetTime(90); // 90 seconds rest
      } else {
        setTimerType('workout');
        setTargetTime(30 * 60); // 30 minutes workout
      }
    } else {
      // All rounds complete
      resetTimer();
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setTime(0);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    setCurrentRound(1);
    setTimerType('workout');
    setTargetTime(30 * 60);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = () => {
    return Math.max(0, targetTime - time);
  };

  const getProgress = () => {
    return (time / targetTime) * 100;
  };

  const getTimerIcon = () => {
    switch (timerType) {
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-blue-500" />;
      case 'rest':
        return <Coffee className="w-4 h-4 text-green-500" />;
      default:
        return <Timer className="w-4 h-4 text-purple-500" />;
    }
  };

  const getTimerColor = () => {
    switch (timerType) {
      case 'workout':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20';
      case 'rest':
        return 'border-green-200 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-purple-200 bg-purple-50 dark:bg-purple-950/20';
    }
  };

  if (compact) {
    return (
      <Card className={`${getTimerColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getTimerIcon()}
              <div>
                <div className="font-mono text-lg font-bold">
                  {formatTime(time)}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {timerType} Timer
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              {!isRunning ? (
                <Button size="sm" onClick={startTimer} data-testid="start-timer">
                  <Play className="w-3 h-3" />
                </Button>
              ) : (
                <Button size="sm" onClick={pauseTimer} data-testid="pause-timer">
                  <Pause className="w-3 h-3" />
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={stopTimer}>
                <Square className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${getTimerColor()}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Timer className="w-5 h-5 text-primary" />
            <span>Workout Timer</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="capitalize">
              {timerType}
            </Badge>
            {rounds > 1 && (
              <Badge variant="secondary">
                Round {currentRound}/{rounds}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Timer Display */}
        <div className="text-center">
          <div className="font-mono text-6xl font-bold text-foreground mb-2">
            {formatTime(time)}
          </div>
          <div className="text-sm text-muted-foreground">
            Target: {formatTime(targetTime)} | Remaining: {formatTime(getTimeRemaining())}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(getProgress())}%</span>
          </div>
          <Progress value={getProgress()} className="h-3" />
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center space-x-3">
          {!isRunning ? (
            <Button onClick={startTimer} className="flex items-center space-x-2" data-testid="start-timer">
              <Play className="w-4 h-4" />
              <span>Start</span>
            </Button>
          ) : (
            <Button onClick={pauseTimer} className="flex items-center space-x-2" data-testid="pause-timer">
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </Button>
          )}
          
          <Button variant="outline" onClick={stopTimer} className="flex items-center space-x-2">
            <Square className="w-4 h-4" />
            <span>Stop</span>
          </Button>
          
          <Button variant="outline" onClick={resetTimer} className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
        </div>

        {/* Quick Timer Presets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => { setTargetTime(5 * 60); setTimerType('workout'); setTime(0); }}
            className="text-xs"
          >
            5 min
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => { setTargetTime(15 * 60); setTimerType('workout'); setTime(0); }}
            className="text-xs"
          >
            15 min
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => { setTargetTime(30 * 60); setTimerType('workout'); setTime(0); }}
            className="text-xs"
          >
            30 min
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => { setTargetTime(60 * 60); setTimerType('workout'); setTime(0); }}
            className="text-xs"
          >
            60 min
          </Button>
        </div>

        {/* Timer Settings */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="flex items-center space-x-2"
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span className="text-xs">Audio</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}