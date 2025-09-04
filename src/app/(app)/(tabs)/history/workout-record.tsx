import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { defineQuery } from 'groq';
import { GetworkoutRecordQueryResult } from '@/lib/sanity/types';
import { client } from '@/lib/sanity/client';
import { set } from 'date-fns';
import { formatDuration } from "lib/utils";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const getworkoutRecordQuery = 
defineQuery(`*[_type == "workout" && _id == $workoutId ][0]{
  _id,
  _type,
  _createdAt,
  date,
  duration,
  exercises[] {
  exercise-> {
  _id,
  name,
  description
  },
  sets[] {
  reps,
  weight,
  weightUnit,
  _type,
  _key
  },
  _type,
  _key
}
  }`);

export default function WorkoutRecord () {
  const router = useRouter()
  const {workoutId} = useLocalSearchParams();
  const[loading,setLoading]=useState(true);
  const[deleting,setDeleting]=useState(false);
  const[workout,setWorkout]=useState<GetworkoutRecordQueryResult | null>(null);

  useEffect(()=>{
    const fetchworkout = async () =>{
      if(!workoutId) return;

      try {
        const result=await client.fetch(getworkoutRecordQuery,{
          workoutId,      
          });
          setWorkout(result);
      } catch (error) {
        console.error("Error fetching workout:",error);
      }finally{
        setLoading(false);
      }
    };
    fetchworkout();
  },[workoutId]);

const formatDate=(dateString?: string) =>{
    if(!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US" ,{
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
};

  const formatTime =(dateString?: string) =>{
    if(!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US",{
      hour:'numeric',
      minute:'2-digit',
      hour12:true,
    });
  };

  const formatWorkoutDuration =(seconds?: number) =>{
    if(!seconds) return "Duration not recorded";
    return formatDuration(seconds);
  }

    const getTotalSets =() => {
      return (
        workout.exercises?.reduce((total,exercise) => {
          return total + (exercise.sets?.length || 0);
        },0) || 0
      );
    };
  
const getTotalVolume = () => {
  let totalVolume = 0;
  let unit = "lbs";

  workout?.exercises?.forEach((exercise) => {
    exercise.sets?.forEach((set) => {
      if(set.weight && set.reps){
      totalVolume += (set.weight ?? 0) * (set.reps ?? 0);
      unit = set.weightUnit || "lbs";
      }
    });
  });

  return { volume: totalVolume, unit };
};

if(loading){
  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size="large" color="#3B82F6"/>
        <Text className='text-gray-600 mt-4 '> Loading workout...</Text>
      </View>
    </SafeAreaView>
  )
}

if(!workout){
  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View className='flex-1 items-center justify-center'>
        <Ionicons name='alert-circle-outline' size={64} color="#EF4444"/>
        <Text className=' text-xl font-semibold text-gray-900 mt-4'>
          Workout Not Found
        </Text>
        <Text className='text-gray-600 text-center mt-2'>
          This workout record could not be found. 
        </Text>
        <TouchableOpacity
        onPress={() => router.back()}
        className='bg-blue-600 px-6 py-3 rounded-lg mt-6'
        >
          <Text className='text-white font-medium'>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const { volume,unit} = getTotalVolume();
  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <ScrollView className='flex-1'>
        {/* workout-summary */}
        <View className='bg-white p-6 border-b border-gray-300'>
          <View className='flex-row items-center justify-between mb-4'>
            <Text className='text-lg font-semibold text-gray-900'>
              Workout Summary
            </Text>
            <TouchableOpacity 
            // onPress={handleDeleteWorkout}
            disabled={deleting}
            className='bg-red-600 px-4 py-2 rounded-lg flex-row items-center'
            >
              {deleting ? (
                <ActivityIndicator size="small" color="FFFFFF"/>
              ):(
                <>
                <Ionicons name='trash-outline' size={16} color="FFFFFF"/>
                <Text className='text-white font-medium ml-2'>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className='flex-row items-center mb-3'>
            <Ionicons name='calendar-outline' size={20} color="#6B7280"/>
            <Text className='text-gray-700 ml-3 font-medium'>
              {formatDate(workout.date)} at {formatTime(workout.date)}
            </Text>
          </View>

<View className='flex-row items-center mb-3'>
  <Ionicons name='time-outline' size={20} color="#6B7280"/>
  <Text className='text-gray-700 ml-3 font-medium'>
     {formatWorkoutDuration(workout.duration)}
  </Text>
</View>

<View className='flex-row items-center mb-3'>
  <Ionicons name='fitness-outline' size={20} color="#6B72280"/>
  <Text className='text-gray-700 ml-3 font-medium'>
    {workout.exercises?.length || 0} exercises
  </Text>
</View>

<View className='flex-row items-center mb-3'>
  <Ionicons name='bar-chart-outline' size={20} color="#6B72280"/>
  <Text className='text-gray-700 ml-3 font-medium'>
    {getTotalSets()} total sets
  </Text>
</View>

{volume >0 && (
  <View className='flex-row items-center mb-3'>
  <Ionicons name='barbell-outline' size={20} color="#6B72280"/>
  <Text className='text-gray-700 ml-3 font-medium'>
    {volume.toLocaleString()} {unit} total volume
  </Text>
</View>
)}
 </View>
      </ScrollView>
    </SafeAreaView>
  )
}