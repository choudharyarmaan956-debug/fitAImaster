import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Brain,
  Zap,
  Heart,
  Target,
  Lightbulb,
  Star
} from "lucide-react";

interface AiCoachChatProps {
  user: any;
}

export default function AiCoachChat({ user }: AiCoachChatProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get chat messages
  const { data: messages = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/chat/user", user.id],
    enabled: !!user.id,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Get today's check-in for context
  const { data: todayCheckin } = useQuery<any>({
    queryKey: ["/api/checkins/today", user.id],
    enabled: !!user.id,
  });

  // Get recent workout plan for context
  const { data: workoutPlan } = useQuery<any>({
    queryKey: ["/api/workout-plans/user", user.id],
    enabled: !!user.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await apiRequest("POST", "/api/chat", messageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/user", user.id] });
      setMessage("");
      setIsTyping(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage("");
    setIsTyping(true);

    // Send user message
    await sendMessageMutation.mutateAsync({
      userId: user.id,
      content: userMessage,
      role: "user"
    });

    // Generate AI response with context
    const context = {
      userName: user.name,
      fitnessGoal: user.fitnessGoal,
      activityLevel: user.activityLevel,
      todayReadiness: todayCheckin?.readinessScore,
      hasWorkoutPlan: !!workoutPlan,
      recentMessages: messages.slice(-5)
    };

    try {
      // Generate contextual AI response
      const aiResponse = await generateAIResponse(userMessage, context);
      
      // Send AI response
      await sendMessageMutation.mutateAsync({
        userId: user.id,
        content: aiResponse,
        role: "assistant"
      });
    } catch (error) {
      console.error("Failed to generate AI response:", error);
      // Send fallback response
      await sendMessageMutation.mutateAsync({
        userId: user.id,
        content: "I'm here to help you with your fitness journey! Feel free to ask me about workouts, nutrition, or how you're feeling today.",
        role: "assistant"
      });
    }
  };

  const generateAIResponse = async (userMessage: string, context: any) => {
    // Create a contextual response based on user data
    const prompt = `You are FitGenius AI Coach, a supportive and knowledgeable fitness coach.

User Context:
- Name: ${context.userName}
- Fitness Goal: ${context.fitnessGoal}
- Activity Level: ${context.activityLevel}
- Today's Readiness Score: ${context.todayReadiness}% ${context.todayReadiness ? (context.todayReadiness > 75 ? "(Good energy)" : context.todayReadiness > 50 ? "(Moderate energy)" : "(Low energy)") : ""}
- Has Workout Plan: ${context.hasWorkoutPlan ? "Yes" : "No"}

User Message: "${userMessage}"

Provide a helpful, encouraging, and personalized response. Keep it conversational, supportive, and under 150 words. Include specific fitness advice when relevant.`;

    try {
      const response = await apiRequest("POST", "/api/ai/chat", { prompt });
      const data = await response.json();
      return data.response || "I'm here to help you achieve your fitness goals! What would you like to know?";
    } catch {
      // Fallback responses based on context
      if (userMessage.toLowerCase().includes('workout')) {
        return `Based on your ${context.todayReadiness}% readiness score today, ${
          context.todayReadiness > 75 
            ? "you're in great shape for an intense workout! 💪" 
            : context.todayReadiness > 50 
              ? "a moderate workout would be perfect. Listen to your body!"
              : "consider some light stretching or active recovery today. 🧘‍♀️"
        }`;
      }
      
      if (userMessage.toLowerCase().includes('nutrition') || userMessage.toLowerCase().includes('diet')) {
        return "Nutrition is key to reaching your fitness goals! Focus on getting adequate protein, staying hydrated, and eating whole foods. Would you like help creating a meal plan?";
      }
      
      return `Hi ${context.userName}! I'm here to support your ${context.fitnessGoal} journey. How can I help you today? 🌟`;
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCoachSuggestions = () => {
    const suggestions = [];
    
    if (todayCheckin?.readinessScore < 60) {
      suggestions.push("How can I recover better?");
    } else if (todayCheckin?.readinessScore > 85) {
      suggestions.push("What's a good high-intensity workout?");
    }
    
    if (!workoutPlan) {
      suggestions.push("Help me create a workout plan");
    }
    
    suggestions.push(
      "How do I improve my nutrition?",
      "What are good recovery strategies?",
      "How can I stay motivated?"
    );
    
    return suggestions.slice(0, 3);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-primary" />
          <span>AI Fitness Coach</span>
          <Badge variant="secondary" className="ml-auto">
            <Brain className="w-3 h-3 mr-1" />
            Smart & Contextual
          </Badge>
        </CardTitle>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="p-4 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading chat history...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Hi {user.name}! 👋
              </h3>
              <p className="text-muted-foreground mb-6">
                I'm your AI fitness coach, here to help you reach your goals with personalized advice!
              </p>
              
              {/* Quick suggestion buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                {getCoachSuggestions().map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setMessage(suggestion)}
                    data-testid={`suggestion-${index}`}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={msg.role === "user" ? "bg-blue-100" : "bg-green-100"}>
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Bot className="w-4 h-4 text-green-600" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 ${msg.role === "user" ? "text-right" : ""}`}>
                    <div
                      className={`inline-block p-3 rounded-lg max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-green-100">
                      <Bot className="w-4 h-4 text-green-600" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask your AI coach anything..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={sendMessageMutation.isPending}
            data-testid="chat-input"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending || !message.trim()}
            data-testid="send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick suggestions when empty */}
        {!isLoading && messages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {getCoachSuggestions().slice(0, 2).map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => setMessage(suggestion)}
                className="text-xs"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}