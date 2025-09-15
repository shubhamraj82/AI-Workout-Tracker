import { client } from "@/lib/sanity/client";
import { GetWorkoutsQueryResult } from "@/lib/sanity/types";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { defineQuery } from "groq";
import { formatDuration } from "lib/utils";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, Text,TouchableOpacity,View } from "react-native";

export const getWorkoutsQuery =
defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc){
  _id,
  date,
  duration,
  exercises[]{
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
  }`)
export default function ProfilePage() {

  const [workouts, setWorkouts] = useState<GetWorkoutsQueryResult>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchWorkouts = async () => {
    if (!user?.id) return;

    try {
      const result: GetWorkoutsQueryResult = await client.fetch(getWorkoutsQuery, { userId: user.id });
      setWorkouts(result);
    } catch (error) {
      console.error("Error fetching Workouts", error);
    }finally{
      setLoading(false);
    }
  };

const { signOut } = useAuth()
const handleSignOut =()=>{
  Alert.alert("Sign out", "Are you sure you want to sign out?",[
    {
      text:"Cancel",
      style:"cancel",
    },
    {
      text:"Sign Out",
      style:"destructive",
      onPress:()=> signOut(),
    },
  ])
}

useEffect(()=>{
  fetchWorkouts();
},[user?.id]);

// calculate stats
const totalWorkouts = workouts.length;
const totalDuration = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

// calculate days  since joining (using creatwdAt from clerk)
const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date();
const daySinceJoining = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

const formatJoinDate =(joinDate: Date)=>{
  return joinDate.toLocaleDateString("en-US",{
    month: "long",
    year: "numeric",
  });
};

if(loading){
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6"/>
        <Text className="text-gray-600 mt-4 ">Loading profile....</Text>
      </View>
    </SafeAreaView>
  );
}


return (
    <SafeAreaView className="flex flex-1">
      <ScrollView className="flex-1">
{/* Header */}
<View className="px-6 pt-8 pb-6">
  <Text className="text-3xl font-bold text-gray-900">Profile</Text>
  <Text className="text-lg text-gray-600 mt-1">
    Manage your account and stats
  </Text>
</View>

{/* user info card */}
<View className="px-6 mb-6">
  <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ">
    <View className="flex-row items-center mb-4">
      <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center mr-4">
        <Image
        source={{
          uri: user?.imageUrl ?? user?.externalAccounts[0]?.imageUrl,
        }}
        className="rounded-full"
        style={{ width: 64, height: 64, borderRadius: 100 }}
        />
      </View>
      <View className="flex-1">
        <Text className="text-xl font-semibold text-gray-900">
          {user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.firstName || "User"}
        </Text>
        <Text className="text-gray-600">
          {user?.emailAddresses?.[0]?.emailAddress}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Member since {formatJoinDate(joinDate)}
        </Text>
      </View>
    </View>
  </View>
</View>

{/* sets-overview */}
<View className="px-6 mb-6">
  <View className="bg-white rounded-2xl p-6 shadown-sm border border-gray-100">
    <Text className="text-lg font-semibold text-gray-900 mb-4">
      Your fintness stats
    </Text>

    <View className="flex-row justify-between">
      <View className="items-center flex-1">
        <Text className="text-2xl font-bold text-blue-600">
          {totalWorkouts}
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Total{"\n"}Workouts
        </Text>
      </View>
      <View className="items-center flex-1">
        <Text className="text-2xl font-bold text-green-600">
        {formatDuration(totalDuration)}
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Total{"\n"}Time
        </Text>
      </View>
      <View className="items-center flex-1">
        <Text className="text-2xl font-bold text-purple-600">
          {daySinceJoining}
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Days{"\n"}Since Joining
        </Text>
      </View>
    </View>
    {totalWorkouts>0 && (
        <View className="mt-4 pt-4 border-t border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600">
              Average Workout durations:
            </Text>
            <Text className="font-semibold text-gray-900">
              {formatDuration(averageDuration)}
            </Text>
          </View>
        </View>
      )}
  </View>
</View>

{/* //account-settings */}

<View className="px-6 mb-6">
  <Text className="text-lg font-semibold text-gray-900">
    Account Settings
  </Text>

  {/* Setting Options */}
  <View className="bg-white rounded-2xl shadow-sm border border-gray-100">
    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
      <View className=" flex-row items-center">
        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
          <Ionicons name="person-outline" size={20} color="#3B82F6"/>
        </View>
        <Text className="text-gray-900 font-medium">Edit Profile</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280"/>
    </TouchableOpacity>

    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <View className="h-10 w-10 bg-green-100 rounded-full items-center justify-center mr-3">
          <Ionicons
          name="notifications-outline"
          size={20}
          color="#10B981"
          />
        </View>
        <Text className="text-gray-900 font-medium">Notifications</Text>
      </View>
      <Ionicons  name="chevron-forward" size={20} color="#6B7280"/>
    </TouchableOpacity>

 <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <View className="h-10 w-10 bg-purple-100 rounded-full items-center justify-center mr-3">
          <Ionicons
          name="settings-outline"
          size={20}
          color="#10B981"
          />
        </View>
        <Text className="text-gray-900 font-medium">Prefrences</Text>
      </View>
      <Ionicons  name="chevron-forward" size={20} color="#6B7280"/>
    </TouchableOpacity>

    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <View className="h-10 w-10 bg-purple-100 rounded-full items-center justify-center mr-3">
          <Ionicons
          name="help-circle-outline"
          size={20}
          color="#10B981"
          />
        </View>
        <Text className="text-gray-900 font-medium">Help & Support</Text>
      </View>
      <Ionicons  name="chevron-forward" size={20} color="#6B7280"/>
    </TouchableOpacity>
  </View>
</View>
      {/* sign-out */}
      <View className="px-6 mb-8">
        <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-600 rounded-2xl p-4 shadow-sm"
        activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">\
            <Ionicons name="log-out-outline" size={20} color="white"></Ionicons>
            <Text className="text-white font-semibold text-lg ml-2">
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
