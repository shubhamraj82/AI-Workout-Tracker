import { client } from "@/lib/sanity/client";
import { GetWorkoutQueryResult } from "@/lib/sanity/types";
import { useUser } from "@clerk/clerk-expo";
import { set } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { defineQuery } from "groq";
import { formatDuration } from "lib/utils";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Text,View } from "react-native";

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
        
      </ScrollView>
    </SafeAreaView>
  );
}


