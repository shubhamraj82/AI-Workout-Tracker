import { Stack } from 'expo-router'
import React from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { ActivityIndicator, View } from 'react-native'

function Layout() {
  const {isLoaded , isSignedIn , userId , sessionId , getToken } = useAuth()

  console.log("isSignedIn >>>>>>>>>",isSignedIn)

  if(!isLoaded){
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size="large" color="#0000ff"></ActivityIndicator>
      </View>
    )
  }
  return (
   <Stack>
    <Stack.Protected guard={isSignedIn}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack.Protected>

     <Stack.Protected guard={!isSignedIn}>
    <Stack.Screen name="sign-in" options={{headerShown:false}}></Stack.Screen>
    <Stack.Screen name="sign-out" options={{headerShown:false}}></Stack.Screen>
    </Stack.Protected>
   </Stack>
  )
}

export default Layout
