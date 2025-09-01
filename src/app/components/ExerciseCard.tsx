import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Exercise } from '@/lib/sanity/types';

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

interface  ExerciseCardProps {
    item : Exercise;
    onPress: () => void;
    showChevron?: boolean;
}

export default function ExerciseCard({
    item,
    onPress,
    showChevron = false,
}: ExerciseCardProps) {
  return (
    <TouchableOpacity 
    className='bg-white rounded-2xl mb-4 shadow-sm border border-gray-100'
    onPress={onPress}
    >
      <Text>ExerciseCard</Text>
    </TouchableOpacity>
  );
}