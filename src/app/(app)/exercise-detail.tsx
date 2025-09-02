import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Image, ActivityIndicator, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import {  useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import {  client, urlFor } from '@/lib/sanity/client';
import { Exercise } from '@/lib/sanity/types';
import { defineQuery } from 'groq';
import Markdown from "react-native-markdown-display"

const singleExerciseQuery = defineQuery(
    `*[_type == "exercise" && _id== $id][0] {
        _id,
        name,
        description,
        difficulty,
        image,
        videoUrl,
        isActive
    }`
);

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case "beginner":
            return "bg-green-500";
        case "intermediate":
            return "bg-yellow-500";
        case "advanced" :
            return "bg-red-500";
        default: 
            return "bg-gray-500"    
    }
};

const getDifficultyText = (difficulty : string)=>{
    switch (difficulty) {
        case "beginner":
            return "Beginner";
        case "intermediate":
            return "Intermediate";
        case "advanced" :
            return "Advanced";
        default: 
            return "Unknown"
    }
};

export default function ExerciseDetail() {
    const router=useRouter()
    const [exercise , setExercise] = useState<Exercise | null>(null)
    const [loading , setLoading] = useState(true)
    const [aiGuidance , setAiGuidance] = useState<string>("")
    const [aiLoading, setAiLoading]=useState(false)

    //get the id from the params
    const { id } = useLocalSearchParams<{
        id:string;
}>();

useEffect(()=>{
    const fetchExercise = async () =>{
        if(!id) {
            console.log("No ID provided");
            return;
        }

        try{
            console.log("Fetching exercise with ID:", id);
            const exerciseData = await client.fetch(singleExerciseQuery, {id});
            console.log("Fetched exercise data:", exerciseData);
            console.log("Exercise image:", exerciseData?.image);
            setExercise(exerciseData);
        }catch(error){
            console.log("Error fetching Exercise", error);
        }finally{
            setLoading(false);
        }
    }
    fetchExercise()
},[id])

const getAiGuidence = async () =>{
    if(!exercise) return;

    setAiLoading(true);
    try {
        const response = await fetch("/api/ai", {
            method:"POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                exerciseName:exercise.name,
            }),
        });

        if(!response.ok) {
            throw new Error("Failed to fetch AI guidance");
        }

        const data = await response.json();
        setAiGuidance(data.message);
    } catch (error) {
        console.error("Error fetching AI Guidance:", error);
        setAiGuidance(
            "Sorry, we couldn't fetch AI guidance at this time. Please try again later."
        );
    }finally {
        setAiLoading(false);
    }
};

if(loading){
    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='flex-1 items-center justify-center'>
                <ActivityIndicator size="large" color="#0000ff"/>
                <Text className='text-gray-500'>Loading Exercise....</Text>
            </View>
        </SafeAreaView>
    )
}

if(!exercise){
    return (
        <SafeAreaView className='flex-1 bg-white'>
            <View className='flex-1 items-center justify-center'>
                <Text className='text-gray-500'>Exercise not found: {id}</Text>
                <TouchableOpacity
                onPress={()=> router.back()}
                className='mt-4 bg-blue-500 px-6 py-3 rounded-lg'
                >
                    <Text className='text-white font-semibold'>Go Back</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

  return (
    <SafeAreaView className='flex-1 bg-white'>
        <StatusBar barStyle='light-content' backgroundColor="#000000"/>

        {/* Header */}
        <View className='absolute top-12 left-0 right-0 z-10 px-4'>
            <TouchableOpacity
            onPress={() => router.back()}
            className='w-10 h-10 bg-black/20 rounded-full items-center justify-center backdrop-blur-sm'
            >
                <Ionicons name='close' size={24} color="white"/>
            </TouchableOpacity>
        </View>
      
      <ScrollView
      className='flex-1'
      showsVerticalScrollIndicator={false}
      >
        {/* hero Image */}

        <View className='h-80 bg-white relative'>
            {exercise?.image?.asset?._ref ? (
                (() => {
                    try {
                        const imageUrl = urlFor(exercise.image.asset._ref).url();
                        console.log("Generated image URL:", imageUrl);
                        return (
                            <Image
                            source={{ uri: imageUrl }}
                            className='w-full h-full'
                            resizeMode='contain'
                            onError={(error) => {
                                console.log('Image load error:', error);
                            }}
                            onLoad={() => {
                                console.log('Image loaded successfully');
                            }}
                            />
                        );
                    } catch (error) {
                        console.log("Error generating image URL:", error);
                        return (
                            <View className='w-full h-full bg-red-400 items-center justify-center'>
                                <Ionicons name='warning' size={80} color="white"/>
                                <Text className='text-white mt-2'>Image Error</Text>
                            </View>
                        );
                    }
                })()
            ):(
                <View className='w-full h-full bg-blue-400 items-center justify-center'>
                    <Ionicons name='fitness' size={80} color="white"/>
                    <Text className='text-white mt-2'>No Image Available</Text>
                </View>
            )}
            <View className='absolute bottom-0 left-0 right-0 h-20 bg-black/60'/>
        </View>

        {/* content */} 
        <View className='px-6 py-6'>
            {/* title and difficulty */}
            <View className='flex-row items-start justify-between mb-4'>
                <View className='flex-1 mr-4 '>
                    <Text className='text-3xl font-bold text-gray-800 mb-2'>
                        {exercise?.name}
                    </Text>
                    <View
                    className={`self-start px-4 py-2 rounded-full ${getDifficultyColor(exercise?.difficulty)}`}
                    >
                        <Text className='text-sm font-semibold text-white'>
                            {getDifficultyText(exercise?.difficulty)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Description */}
            <View className='mb-6'>
                <Text className='text-xl font-semibold text-gray-800 mb-3'>
                    DESCRIPTION
                </Text>
                <Text className='text-gray-600 loading-6 text-base'>
                    {exercise.description || "No description available for this exercise."}
                </Text>
            </View>

            {/* video-url */}
            {exercise.videoUrl && (
                <View className='mb-6'>
                    <Text className='text-xl font-semibold text-gray-800 mb-3'>
                        Video Tutorial
                    </Text>
                    <TouchableOpacity
                    className='bg-red-600 rounded-xl p-4 flex-row items-center '
                    onPress={() => Linking.openURL(exercise.videoUrl)}
                    >
                        <View className='w-12 h-12 bg-white rounded-full items-center justify-center mr-4'>
                            <Ionicons name='play' size={20} color="#EF4444"/>
                        </View>
                        <View >
                            <Text className='text-white font-semibold text-lg'>
                                Watch Tutorial
                            </Text>
                            <Text className='text-red-100 text-sm'>
                                Learn Proper form
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* AI Guidance */}
{(aiGuidance || aiLoading ) && ( 
    <View className='mb-6'>
        <View className='flex-row items-center mb-3'>
            <Ionicons name='fitness' size={24} color="3B82F6"/>
            <Text className='text-xl text-gray-800 font-semibold ml-2'>
                AI Coach says....
            </Text>
        </View>

{aiLoading ? (
    <View className='bg-gray-50 rounded-xl p-4 items-center'>
        <ActivityIndicator size="small" color="3B82F6"/>
        <Text className='text-gray-600 mt-2'>
            Getiing personalized guidance....
        </Text>
    </View>
) : (
    <View className='bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500'>
        <Markdown
        style={{
            body:{
                paddingBottom: 20,
            },
            heading2: {
                fontSize: 18,
                fontWeight: "bold",
                color: "#1f2937",
                marginTop: 12,
                marginBottom: 6,
            },
            heading3: {
                fontSize: 16,
                fontWeight: "600",
                color: "#374151",
                marginTop:8,
                marginBottom:4,
            },
        }}
        >
            {aiGuidance}
        </Markdown>
    </View>
)}
    </View>
)}

            {/* Action-buttons */}
            <View className='mt-8 gap-2'>
                {/* Ai Coach Button */}
                <TouchableOpacity
                className={`rounded-xl py-4 items-center ${
                    aiLoading
                    ? "bg-gray-400"
                    : aiGuidance
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
                onPress={getAiGuidence}
                disabled={aiLoading}
                >
                    {aiLoading ? (
                        <View className='flex-row items-center'>
                            <ActivityIndicator size="small" color="white"/>
                            <Text className='text-white font-bold text-lg ml-2'>
                                Loading....
                            </Text>
                        </View>
                    ) : (
                        <Text className='text-white font-bold text-lg'>
                            {aiGuidance 
                            ? "Refresh AI Guidance"
                            : "Get AI Guidance on Form and Technique"}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                className='bg-gray-200 rounded-xl py-4 items-center'
                onPress={() => router.back()}>
                    <Text className='text-gray-800 font-bold text-lg'>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}