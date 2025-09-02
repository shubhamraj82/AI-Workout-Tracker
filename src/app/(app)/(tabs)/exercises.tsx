import { View, Text,SafeAreaView, TextInput, TouchableOpacity, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from "expo-router"
import { defineQuery } from 'groq'
import { client } from '@/lib/sanity/client'
import { Exercise } from '@/lib/sanity/types'
import ExerciseCard from '@/app/components/ExerciseCard'
import { set } from 'date-fns'

// Define the query outside the component for proper type generation
export const exercisesQuery = defineQuery(`*[_type == "exercise" && isActive == true] | order(name asc) {
  _id,
  name,
  description,
  difficulty,
  image,
  videoUrl,
  isActive
}`);
const Exercises = () => {
  const [searchQuery , setSearchQuery] = useState("")
  const [exercises , setExercises] = useState<Exercise[]>([])
  const [filteredExercises , setFilteredExercises] = useState([])
  const router = useRouter()
  const [refreshing , setRefreshing] = useState(false)
  

  const fetchExercises = async () =>{
    try{
      //fetch exercises form sanity
      const exercises = await client.fetch(exercisesQuery)
      setExercises(exercises)
      setFilteredExercises(exercises)
    }catch(error){ 
      console.error("Error fetching exercises :", error)
      //you could add error handling here , like showing a toast
    }
  }

  useEffect(()=>{
    fetchExercises();
  },[])

  useEffect(()=>{
    const filtered=exercises.filter((exercises : Exercise) =>
   exercises.name.toLowerCase().includes(searchQuery.toLocaleLowerCase()) 
    );
    setFilteredExercises(filtered)
  },[searchQuery,exercises]);


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercises()
    setRefreshing(false)
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      {/* header */}
      <View className='px-6 py-4 bg-white border-b border-gray-200'>
        <Text className='text-2xl font-bold text-gray-900'>
          Exercise Library
        </Text>
        <Text className='text-gray-600 mt-1'>
          Discover and Master New Exercises
        </Text>

        {/* Search-bar */}
        <View className='flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mt-4'>
          <Ionicons name='search' size={20} color="6B7280"/>
          <TextInput
          className='flex-1 ml-3 text-gray-800'
          placeholder='search-exercises...'
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={()=> setSearchQuery("")}>
              <Ionicons name='close-circle' size={20} color="#6B7280"/>
            </TouchableOpacity>
          )}
        </View>
      </View>
{/* Exercise-List */}
<FlatList 
  data={filteredExercises}
  keyExtractor={(item) => item._id}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{padding:24}}
  renderItem={({ item }) => (
    <ExerciseCard
      item={item}
      onPress={() => router.push(`/exercise-detail?id=${item._id}`)}
    />
  )}
  refreshControl={
    <RefreshControl
    refreshing={refreshing}
    onRefresh={onRefresh}
    colors={["#3B82F6"]} //android
    tintColor="3B82F6" //ios
    title='Pull to refresh exercises'
    titleColor="#6B7280"
    />
  }
  ListEmptyComponent={
    <View className='bg-white rounded-2xl p-8 items-center'>
      <Ionicons className='text-outline' size={64} color="9CA3AF"/>
      <Text className='text-xl font-semibold text-gray-900 mt-4'>
        {searchQuery ? "no exercises found " : "Loading exercises..."}
      </Text>
      <Text className='text-gray-600 text-center mt-2'>
        {searchQuery
        ? "Try adjusting your search"
        : "your exercise will appear here"
        }
      </Text>
    </View>
  }
/> 
    </SafeAreaView>
  )
}

export default Exercises