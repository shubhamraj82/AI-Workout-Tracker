import { Tabs } from 'expo-router'
import React from 'react'
import AntDesign from "@expo/vector-icons/AntDesign"
import { Image } from 'react-native'

function Layout() {
  return (
   <Tabs>
    <Tabs.Screen 
    name="index" 
    options={{
         headerShown: false , 
    title:"Home",
    tabBarIcon: ({ color }) => 
    <AntDesign name="home" size={24} color={color} />
    }}
    />

     <Tabs.Screen 
    name="exercises" 
    options={{ 
        headerShown: false , 
    title:"Exercises",
    tabBarIcon: ({ color }) => 
    <AntDesign name="book" size={24} color={color} />
    }}
    />

      <Tabs.Screen 
    name="workout" 
    options={{
         headerShown: false , 
    title:"Workout",
    tabBarIcon: ({ color }) => 
    <AntDesign name="pluscircle" size={24} color={color} />
    }}
    />

     <Tabs.Screen 
    name="active-workout" 
    options={{ 
        headerShown: false , 
    title:"Active Workout",
    href:null,
    tabBarStyle: {
        display: "none",
    }
    }}
    />

     <Tabs.Screen 
    name="history" 
    options={{
    headerShown: false , 
    title:"History",
    tabBarIcon: ({ color }) => 
    <AntDesign name="clockcircle" size={24} color={color} />
    }}
    />

      <Tabs.Screen 
    name="profile" 
    options={{
        title:"Profile",
    headerShown: false , 
    // title:"Profile",
    // tabBarIcon: ({ color , size}) => (
    //     <Image
    //     source={user?.imageUrl ?? user?.externalAccounts[0]?.imageUrl}
    //     className='rounded-full'
    //     style={{width:28,height: 28, borderRadius:100}}
    //     />
    // ) 
    }}
    />
   </Tabs>
  )
}

export default Layout
