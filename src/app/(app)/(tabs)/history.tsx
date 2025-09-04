import { client } from "@/lib/sanity/client";
import { GetWorkoutQueryResult } from "@/lib/sanity/types";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { set } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { defineQuery } from "groq";
import { formatDuration } from "lib/utils";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Text,TouchableOpacity,View } from "react-native";
import workout from "workout-ai-app/schemaTypes/workout";

export const getWorkoutQuery = 
defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc) {
  _id,
  date,
  duration,
  exercises[] {
  exercise-> {
  _id,
  name
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
export default function HistoryPage() {
  const {user} =useUser();
  const [workouts,setWorkouts]=useState<GetWorkoutQueryResult>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing]=useState(false)
  const {refresh} = useLocalSearchParams();
  const router = useRouter();

  const fetchWorkouts = async () =>{
    if(!user?.id) return;

    try {
      const results= await client.fetch(getWorkoutQuery, { userId: user.id});
      setWorkouts(results);
    } catch (error) {
      console.error("Error fetching Workouts", error);
    }finally{
      setLoading(false)
      setRefreshing(false);
    }
  };

  useEffect(()=>{
    fetchWorkouts();
  },[user?.id]);

  //handle refresh parameter from deleted workout
  useEffect(()=>{
    if(refresh==="true"){
      fetchWorkouts();
      //clear the refresh paramenter from the URL
      router.replace("/(app)/(tabs)/history");
    }
  },[refresh]);

  const onRefresh = () =>{
    setRefreshing(true)
    fetchWorkouts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate()-1);

    if(date.toDateString() === today.toDateString()){
      return "Today";
    }else if(date.toDateString() === yesterday.toDateString()){
      return "Yesterday";
    }else{
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  const formatWorkoutDuration =(seconds?: number) =>{
    if(!seconds) return "Duration not recorded";
    return formatDuration(seconds);
  }

  const getTotalSets =(workout : GetWorkoutQueryResult[number]) => {
    return (
      workout.exercises?.reduce((total,exercise) => {
        return total + (exercise.sets?.length || 0);
      },0) || 0
    );
  };

  const getExerciseNames = (workout: GetWorkoutQueryResult[number]) =>{
    return (
      workout.exercises?.map((ex) => ex.exercise?.name).filter(Boolean) || []
    );
  };

  if(loading){
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">
            Workout Histroy
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading your workouts....</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* header */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">
          WorkOut History
        </Text>
        <Text className="text-gray-600 mt-1">
          {workouts.length} workout{workouts.length !== 1 ?"s" : ""} completed
        </Text>
      </View>


      {/* workout-list */}\
      <ScrollView
      className="flex-1"
      contentContainerStyle={{padding:24}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
      }
      >
        {workouts.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Ionicons name="barbell-outline" size={64} color="#9CA3AF"/>
            <Text className="text-xl font-semibold text-gray-900 mt-4">
              Your completed workout will appear here
            </Text>
          </View>
        ) : (
          <View className="space-y-4 gap-4">
            {workouts.map((workout) => (
              <TouchableOpacity
                key={workout._id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname : "history/workout-record",
                    params: {
                      workoutId: workout._id,
                    },
                  });
                }}
              >
                {/* workout-Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {formatDate(workout.date || "")}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="time-outline" size={16} color="#6B7280"/>
                      <Text className="text-gray-600 ml-2">
                        {formatWorkoutDuration(workout.duration)}
                      </Text>
                    </View>
                  </View>
                  <View className=" bg-blue-100 rounded-full w-12 h-12 items-center justify-center">
                    <Ionicons
                    name="fitness-outline"
                    size={24}
                    color="#3882F6"
                    />
                  </View>
                </View>

                {/* Workout stats */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className="bg-gray-100 rounded-lg px-3 py-2 mr-3">
                      <Text className="text-sm font-medium text-gray-700">
                        {workout.exercises?.length || 0} exercises
                      </Text>
                    </View>
                    <View className="bg-gray-100 rounded-lg px-3 py-2">
                      <Text className="text-sm font-medium text-gray-700">
                        {getTotalSets(workout)} sets
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Exercise-List */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Exercises:
                    </Text>
                    <View className="flex-row flex-wrap">
                      {getExerciseNames(workout)
                      .slice(0,3)
                      .map((name,index)=>(
                        <View
                        key={index}
                        className="bg-blue-50 rounded-lg px-3 py-1 mr-2 mb-2"
                        >
                          <Text className="text-blue-700 text-sm font-medium">
                            {name}
                          </Text>
                        </View>
                      ))}
                      {getExerciseNames(workout).length > 3 && (
                        <View className="bg-gray-100 rounded-lg px-3 py-1 mr-2 mb-2">
                          <Text className="text-gray-600 text-sm font-medium">
                            +{getExerciseNames(workout).length-3} more
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


