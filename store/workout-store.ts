import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface WorkoutSet{
    id:string;
    reps:string;
    weight:string;
    weightUnit:"kg" | "lbs";
    isCompleted:boolean;
}

interface WorkoutExercise{
    id:string;
    sanityId:string; //store the sanity ID
    name:string;
    sets:WorkoutSet[];
}

interface WorkoutStore {
    //these are the state variables

    workoutExercises: WorkoutExercise[];
    weightUnit: "kg" | "lbs";

    // actions that can be performed on the state
    addExerciseToWorkout: (exercise: { name: string; sanityId: string }) => void;
    setWorkoutExercises: (
        exercises: WorkoutExercise[] | ((prev: WorkoutExercise[]) => WorkoutExercise[])
    ) => void;
    setWeightUnit: (unit: "kg" | "lbs") => void;
    resetWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
    persist(
        (set) => ({
            workoutExercises: [],
            weightUnit: "lbs",

            addExerciseToWorkout: (exercise) =>
                set((state) => {
                    const newExercise: WorkoutExercise = {
                        id: Math.random().toString(),
                        sanityId: exercise.sanityId,
                        name: exercise.name,
                        sets: [], // start with empty sets
                    };
                    return {
                        workoutExercises: [...state.workoutExercises, newExercise],
                    };
                }),

            setWorkoutExercises: (exercises) =>
                set((state) => ({
                    workoutExercises:
                        typeof exercises === "function"
                            ? exercises (state.workoutExercises)
                            : exercises,
                })),

            setWeightUnit: (unit) =>
                set ({
                    weightUnit: unit,
                }),

            resetWorkout: () =>
                set ({
                    workoutExercises: [],
                }),
        }),
        {
            name: "workout-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                weightUnit: state.weightUnit,
            }),
        }
    )
);