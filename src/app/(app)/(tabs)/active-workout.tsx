import { View, Text, SafeAreaView, StatusBar, Platform, TouchableOpacity, Alert } from 'react-native'
import React, { use } from 'react'
import {useStopwatch} from 'react-timer-hook';
import { useWorkoutStore } from 'store/workout-store';
import {  useFocusEffect, useRouter } from 'expo-router';

export default function ActiveWorkout() {
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



  return (
    <View className='flex-1'>
      <StatusBar barStyle='light-content' backgroundColor="#1F2937"/>

      {/* Top safe area */}
      <View className='bg-gray-800'
      style={{
        paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight || 0,
      }}
      >
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
      </View>
    </View>
  )
}

