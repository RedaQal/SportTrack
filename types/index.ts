export type ExerciseCategory = 'cardio' | 'strength' | 'flexibility' | 'hiit' | 'sports';

export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  goals: Goal[];
  createdAt: string;
}

export interface Goal {
  id: number;
  type: 'weight' | 'calories' | 'workouts' | 'distance' | 'custom';
  label: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
}

export interface Exercise {
  id: number;
  name: string;
  category: ExerciseCategory;
  icon: string;
  caloriesPerMin?: number;
  description?: string;
}

export interface WorkoutSession {
  id: number;
  date: string;
  exercises: WorkoutExercise[];
  totalCalories: number;
  totalDuration: number;
  mood: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface WorkoutExercise {
  exerciseId: number;
  exerciseName: string;
  category: ExerciseCategory;
  duration: number;
  sets?: number;
  reps?: number;
  weight?: number;
  distance?: number;
  calories: number;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}