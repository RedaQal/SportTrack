export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  age?: number;
  weight?: number; // kg
  height?: number; // cm
  goals: Goal[];
  createdAt: string;
}

export interface Goal {
  id: string;
  type: 'weight' | 'calories' | 'workouts' | 'distance' | 'custom';
  label: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
}

export type ExerciseCategory = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'hiit';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  icon: string;
  defaultDuration?: number; // minutes
  caloriesPerMinute?: number;
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: WorkoutExercise[];
  totalCalories: number;
  totalDuration: number; // minutes
  notes?: string;
  mood: 1 | 2 | 3 | 4 | 5;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  duration: number; // minutes
  sets?: number;
  reps?: number;
  weight?: number; // kg
  distance?: number; // km
  calories: number;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}
