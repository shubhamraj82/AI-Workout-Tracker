import { Stack } from 'expo-router'
import React from 'react'

function  Layout() {
  return ( 
  <Stack>
    <Stack.Screen name='index' options={{ 
    headerShown:false,
    }}
    />
    <Stack.Screen name='wokout-record'
    options={{
      headerShown:false,
      headerTitle:"workout Record",
      headerBackTitle: "History",
    }}
    />
  </Stack>
  )
}

export default Layout
