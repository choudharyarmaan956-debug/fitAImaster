import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertWorkoutAlarmSchema, type InsertWorkoutAlarm } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Pause, Play, Trash2 } from "lucide-react";
import { z } from "zod";
import DynamicBackgroundWrapper from "./dynamic-background-wrapper";

const alarmSchema = insertWorkoutAlarmSchema.pick({
  time: true,
  days: true,
  message: true,
});

interface AlarmSystemProps {
  user: any;
}

export default function AlarmSystem({ user }: AlarmSystemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof alarmSchema>>({
    resolver: zodResolver(alarmSchema),
    defaultValues: {
      time: "07:00",
      days: [],
      message: "Time to crush your workout! 💪",
    },
  });

  const { data: alarms = [] } = useQuery<any[]>({
    queryKey: ["/api/alarms/user", user.id],
    enabled: !!user.id,
  });

  const createAlarmMutation = useMutation({
    mutationFn: async (data: InsertWorkoutAlarm) => {
      const response = await apiRequest("POST", "/api/alarms", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alarms/user", user.id] });
      form.reset();
      setIsExpanded(false);
      toast({
        title: "Alarm Set! ⏰",
        description: "Your workout reminder has been created.",
      });
      
      // Request notification permission if not already granted
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({
              title: "Notifications Enabled!",
              description: "You'll receive workout reminders.",
            });
          }
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create alarm",
        variant: "destructive",
      });
    },
  });

  const updateAlarmMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/alarms/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alarms/user", user.id] });
      toast({
        title: "Alarm Updated!",
        description: "Your workout reminder has been updated.",
      });
    },
  });

  const deleteAlarmMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/alarms/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alarms/user", user.id] });
      toast({
        title: "Alarm Deleted",
        description: "Your workout reminder has been removed.",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof alarmSchema>) => {
    createAlarmMutation.mutate({
      userId: user.id,
      ...data,
    });
  };

  const toggleAlarm = (alarm: any) => {
    updateAlarmMutation.mutate({
      id: alarm.id,
      updates: { isActive: !alarm.isActive },
    });
  };

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const motivationalMessages = [
    "Time to crush your workout! 💪",
    "Your body will thank you later! 🏃‍♂️",
    "Beast mode: ON! 🔥",
    "Every rep counts! Let's go! ⚡",
    "Stronger than yesterday! 💯",
    "Make it happen! 🎯",
  ];

  if (!isExpanded) {
    return (
      <DynamicBackgroundWrapper section="alarms">
        <div className="fixed bottom-6 right-6 z-40">
          <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          data-testid="button-expand-alarms"
        >
          <Bell className="w-6 h-6" />
        </Button>
      </div>
      </DynamicBackgroundWrapper>
    );
  }

  return (
    <DynamicBackgroundWrapper section="alarms">
      <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-2rem)]">
        <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Workout Alarms</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(false)}
              data-testid="button-collapse-alarms"
            >
              ✕
            </Button>
          </div>

          {/* Alarm Setup Form */}
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mb-6">
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                {...form.register("time")}
                data-testid="input-alarm-time"
              />
            </div>

            <div>
              <Label>Days</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {dayLabels.map((day, index) => (
                  <label key={day} className="flex items-center space-x-1 cursor-pointer">
                    <Checkbox
                      checked={form.watch("days")?.includes(day) ?? false}
                      onCheckedChange={(checked) => {
                        const currentDays = (form.getValues("days") as string[]) || [];
                        if (checked) {
                          form.setValue("days", [...currentDays, day]);
                        } else {
                          form.setValue("days", currentDays.filter((d: string) => d !== day));
                        }
                      }}
                      data-testid={`checkbox-day-${day.toLowerCase()}`}
                    />
                    <span className="text-xs">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Select onValueChange={(value) => form.setValue("message", value)}>
                <SelectTrigger data-testid="select-alarm-message">
                  <SelectValue placeholder="Choose a motivational message" />
                </SelectTrigger>
                <SelectContent>
                  {motivationalMessages.map((message, index) => (
                    <SelectItem key={index} value={message}>{message}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createAlarmMutation.isPending}
              data-testid="button-create-alarm"
            >
              <Plus className="mr-2 w-4 h-4" />
              {createAlarmMutation.isPending ? "Creating..." : "Set Alarm"}
            </Button>
          </form>

          {/* Active Alarms */}
          {alarms.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Active Alarms</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {alarms.map((alarm: any) => (
                  <div key={alarm.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-foreground text-sm">
                        {alarm.time} • {alarm.days?.join(", ")}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {alarm.message}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge 
                        variant={alarm.isActive ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {alarm.isActive ? "Active" : "Paused"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleAlarm(alarm)}
                        data-testid={`button-toggle-alarm-${alarm.id}`}
                      >
                        {alarm.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAlarmMutation.mutate(alarm.id)}
                        data-testid={`button-delete-alarm-${alarm.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </DynamicBackgroundWrapper>
  );
}
