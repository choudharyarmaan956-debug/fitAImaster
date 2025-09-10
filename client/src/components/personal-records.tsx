import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  TrendingUp, 
  Plus, 
  Calendar,
  Trophy,
  Target,
  Zap,
  Dumbbell,
  Clock,
  Award,
  Star
} from "lucide-react";

interface PersonalRecordsProps {
  user: any;
}

export default function PersonalRecords({ user }: PersonalRecordsProps) {
  const [open, setOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [recordType, setRecordType] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  // Get user's personal records
  const { data: personalRecords = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/personal-records/user", user.id],
    enabled: !!user.id,
  });

  const addRecordMutation = useMutation({
    mutationFn: async (recordData: any) => {
      const response = await apiRequest("POST", "/api/personal-records", recordData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-records/user", user.id] });
      
      toast({
        title: "New Personal Record! 🏆",
        description: `${data.exerciseName}: ${data.value} ${data.unit}`,
      });
      
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add personal record",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setExerciseName("");
    setRecordType("");
    setValue("");
    setUnit("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!exerciseName || !recordType || !value) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addRecordMutation.mutate({
      userId: user.id,
      exerciseName,
      recordType,
      value: parseFloat(value),
      unit: unit || (recordType === 'weight' ? 'lbs' : recordType === 'time' ? 'min' : 'reps'),
      notes: notes.trim() || undefined,
    });
  };

  // Group records by exercise
  const recordsByExercise = personalRecords.reduce((acc: any, record: any) => {
    if (!acc[record.exerciseName]) {
      acc[record.exerciseName] = [];
    }
    acc[record.exerciseName].push(record);
    return acc;
  }, {});

  // Get latest records for each exercise/type combination
  const getLatestRecords = () => {
    const latest: any = {};
    personalRecords.forEach(record => {
      const key = `${record.exerciseName}-${record.recordType}`;
      if (!latest[key] || new Date(record.createdAt) > new Date(latest[key].createdAt)) {
        latest[key] = record;
      }
    });
    return Object.values(latest);
  };

  const latestRecords = getLatestRecords();

  const getRecordIcon = (recordType: string) => {
    switch (recordType) {
      case 'weight':
        return <Dumbbell className="w-4 h-4 text-red-500" />;
      case 'reps':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'time':
        return <Clock className="w-4 h-4 text-green-500" />;
      case 'distance':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default:
        return <Star className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getRecordTypeColor = (recordType: string) => {
    switch (recordType) {
      case 'weight':
        return 'border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'reps':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20';
      case 'time':
        return 'border-green-200 bg-green-50 dark:bg-green-950/20';
      case 'distance':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-950/20';
      default:
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Personal Records</span>
          </h2>
          <p className="text-muted-foreground">Track your best performances and celebrate your progress</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2" data-testid="add-record">
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Add Personal Record</span>
              </DialogTitle>
              <DialogDescription>
                Record your personal best for an exercise.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Exercise Name */}
              <div className="space-y-2">
                <Label>Exercise Name *</Label>
                <Input
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="e.g., Bench Press, Squat, Deadlift"
                  data-testid="exercise-name-input"
                />
              </div>

              {/* Record Type */}
              <div className="space-y-2">
                <Label>Record Type *</Label>
                <Select value={recordType} onValueChange={setRecordType}>
                  <SelectTrigger data-testid="record-type-select">
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Max Weight</SelectItem>
                    <SelectItem value="reps">Max Reps</SelectItem>
                    <SelectItem value="time">Best Time</SelectItem>
                    <SelectItem value="distance">Max Distance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Value and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Value *</Label>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g., 225"
                    data-testid="record-value-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger data-testid="unit-select">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="reps">reps</SelectItem>
                      <SelectItem value="min">minutes</SelectItem>
                      <SelectItem value="sec">seconds</SelectItem>
                      <SelectItem value="miles">miles</SelectItem>
                      <SelectItem value="km">km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details..."
                  data-testid="notes-input"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={addRecordMutation.isPending}
                className="w-full"
                data-testid="submit-record"
              >
                {addRecordMutation.isPending ? "Adding..." : "Add Personal Record"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Records Summary */}
      {latestRecords.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {latestRecords.slice(0, 6).map((record: any) => (
            <Card key={record.id} className={`border-2 ${getRecordTypeColor(record.recordType)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getRecordIcon(record.recordType)}
                    <h3 className="font-semibold text-sm">{record.exerciseName}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {record.recordType}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {record.value} <span className="text-lg text-muted-foreground">{record.unit}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Records by Exercise */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading personal records...</div>
        ) : Object.keys(recordsByExercise).length === 0 ? (
          <Card className="text-center py-12 border-2 border-dashed">
            <CardContent>
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Personal Records Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your best performances to see your progress over time.
              </p>
              <Button onClick={() => setOpen(true)}>
                Add Your First Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(recordsByExercise).map(([exerciseName, records]: [string, any]) => (
            <Card key={exerciseName}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  <span>{exerciseName}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {records.length} record{records.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {records
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((record: any) => (
                      <div key={record.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getRecordIcon(record.recordType)}
                            <span className="text-sm font-medium capitalize">{record.recordType}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {new Date(record.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-foreground">
                            {record.value} <span className="text-sm text-muted-foreground">{record.unit}</span>
                          </div>
                          {record.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}