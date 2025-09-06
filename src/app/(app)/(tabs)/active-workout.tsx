import { View, Text, SafeAreaView, StatusBar, Platform, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView } from 'react-native'
import React, { useState } from 'react'
import {useStopwatch} from 'react-timer-hook';
import { useWorkoutStore, WorkoutSet } from 'store/workout-store';
import {  useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ExerciseSelectionModal from '@/app/components/ExerciseSelectionModal';

export default function ActiveWorkout() {
  const [showExerciseSelection,setShowExerciseSelection] = useState(false);
  const router =useRouter()

  const {
    workoutExercises,
    setWorkoutExercises,
    resetWorkout,
    weightUnit,
    setWeightUnit,
  }= useWorkoutStore();

  //use the syopwatch hook for timing with offset based on workout start time
  const {seconds,minutes,hours,totalSeconds,reset}=useStopwatch({
    autoStart:true
  });

  //Reset timer when screen is focused and no active workout {fresh start}
  useFocusEffect(
    React.useCallback(() => {
      //only reset if we have no exercises (indicates a fresh start after ending workout)
      if (workoutExercises.length === 0) {
        reset();
      }
    }, [workoutExercises.length, reset])
  );

  const getWorkoutDuration=()=>{
    return `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`
  };

  const cancelWorkout =()=>{
    Alert.alert(
      "Cancel Wokout",
      "Are you sure you want to cancel the workout? All progress will be lost.",
      [
        {text:"No" , style:"cancel"},
        {
          text:"End Workout",
          onPress:()=>{
            resetWorkout();
            router.back();
          },
        },
      ]
    );
  };

  const addExercise=()=>{
    setShowExerciseSelection(true); 
  }

  const deleteExercise=( exerciseId :string)=>{
    setWorkoutExercises((exercises) =>
      exercises.filter((exercise) => exercise.id !== exerciseId)
    );
  };

  const addNewSet =(exerciseId:string)=>{
    const newSet: WorkoutSet ={
      id : Math.random().toString(),
      reps:"",
      weight:"",
      weightUnit: weightUnit,
      isCompleted:false,
    };

    setWorkoutExercises((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId ? 
    { ...exercise, sets: [...exercise.sets, newSet] }
     : exercise
      )
    );
  }

  const updateSet=(
    exerciseId:string,
    setId:string,
    field: "reps" | "weight",
    value:string
  )=>{
    setWorkoutExercises((exercises) =>
    exercises.map((exercise) =>
      exercise.id === exerciseId
    ?{
        ...exercise,
        sets: exercise.sets.map((set) =>
          set.id === setId ? { ...set, [field]: value } : set
      ),
    }
    :exercise
    )
    );
  };

  const deleteSet=(
    exerciseId:string,
    setId:string
  )=>{
    setWorkoutExercises((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise
      )
    );
  };

  const toggleSetCompletion= (exerciseId:string,setId:string)=>{
    setWorkoutExercises((exercises) =>
    exercises.map((exercise) =>
    exercise.id === exerciseId
    ?{
        ...exercise,
        sets: exercise.sets.map((set)=>
         set.id === setId ? { ...set, isCompleted: !set.isCompleted }
         : set
        ),
    }
    :exercise
    )
    );
  };


  return (
    <View className='flex-1'>
      <StatusBar barStyle='light-content' backgroundColor="#1F2937"/>

      {/* Top safe area */}
      <View className='bg-gray-800'
      style={{
        paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight || 0,
      }}
      />

        {/* Header */}
        <View className='bg-gray-800 px-6 py-4'>
          <View className='flex-row items-center justify-between'>
            <View>
              <Text className='text-white text-xl font-semibold'>
                Active Workout
              </Text>
              <Text className='text-gray-300'>{getWorkoutDuration()}</Text>
            </View>
            <View className='flex-row items-center space-x-3 gap-2'>
              {/* Weight Unit Toggle */}
              <View className='flex-row bg-gray-700 rounded-lg p-1'>
                <TouchableOpacity
                onPress={() => setWeightUnit("lbs")}
              className={`px-3 py-1 rounded ${
              weightUnit === "lbs" ? "bg-blue-600" : ""
            }`}
                >
                  <Text
                  className={`text-sm font-medium ${
                    weightUnit === "lbs" ? "text-white" : "text-gray-300"
                  }`}
                  >
                    libs
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                onPress={() => setWeightUnit("kg")}
               className={`px-3 py-1 rounded ${
              weightUnit === "kg" ? "bg-blue-600" : ""
            }`}
                >
                  <Text
                   className={`text-sm font-medium ${
                    weightUnit === "kg" ? "text-white" : "text-gray-300"
                  }`}
                  >
                    kgs
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
              onPress={cancelWorkout}
              className='bg-red-600 px-4 py-2 rounded-lg'
              >
                <Text className='text-white font-medium'>End Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
{/* Content Area with white Background */}
<View className='flex-1 bg-white'>
  {/* Workout Progress */}
  <View className='px-6 mt-4'>
    <Text className='text-center text-gray-600 mb-2'>
      {workoutExercises.length} exercises
    </Text>
  </View>

  {/* if no exercise, show a message */}
  {workoutExercises.length===0 && (
    <View className='bg-gray-50 rounded-2xl p-8 items-center mx-6'>
      <Ionicons name='barbell-outline' size={48} color="#9CA3AF"/>
      <Text className='text-gray-600 text-lg text-center mt-4 font-medium'>
        No exercise yet
      </Text>
      <Text className='text-gray-500 text-center mt-2'>
        Get Started by adding your first exercise below
      </Text>
    </View>
  )}

  {/* All Exercises Vertical list */}
  <KeyboardAvoidingView
  behavior={Platform.OS == "ios" ? "padding" : "height"}
  className='flex-1'
  >
    <ScrollView className='flex-1 px-6 mt-4'>
      {workoutExercises.map((exercise)=>(
        <View key={exercise.id} className='mb-8'>

{/* Execise header */}
<TouchableOpacity
onPress={()=>
  router.push({
    pathname:"/exercise-detail",
    params:{
      id:exercise.sanityId
    },
  })
}
className='bg-blue-50 rounded-2xl p-4 mb-3'
>
  <View className='flex-row items-center justify-between'>
    <View className='flex-1'>
      <Text className='text-xl font-bold text-gray-900 mb-2'>
        {exercise.name}
      </Text>
      <Text className='text-gray-600'>
        {exercise.sets.length} sets *{" "}
        {exercise.sets.filter((set) => set.isCompleted).length}
        {" "}
        completed
      </Text>
    </View>

    {/* Delete Exercise Button */}
    <TouchableOpacity
    onPress={()=>deleteExercise(exercise.id)}
    className='w-10 h-10 rounded-xl items-center justify-center bg-red-500 ml-3'
    >
      <Ionicons name='trash' size={16} color="white"/>
    </TouchableOpacity>
  </View>
</TouchableOpacity>


        </View>
      ))}


      {/* Add Exercise Button */}
      <TouchableOpacity
      onPress={addExercise}
      className='bg-blue-600 rounded-2xl py-4 items-center mb-8 active:bg-blue-700'
      activeOpacity={0.8}
      >
        <View className='flex-row items-center'>
          <Ionicons
          name='add'
          size={20}
          color="white"
          style={{marginRight:8}}
          />
          <Text className='text-white font-semibold text-lg'>
            Add Exercise
          </Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  </KeyboardAvoidingView>
</View>

{/* Exercise Selection Modal  */}
<ExerciseSelectionModal
visible={showExerciseSelection}
onClose={() => setShowExerciseSelection(false)}
/>
      </View>
    
  )
}

