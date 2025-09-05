import { View, Text, SafeAreaView, StatusBar, Platform, TouchableOpacity } from 'react-native'
import React from 'react'

const ActiveWorkout = () => {
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
                onPress={() => setWeightUnit("libs")}
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
                onPress={() => setWeightUnit("kgs")}
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

export default ActiveWorkout