import React, { useCallback, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import { useOAuth } from '@clerk/clerk-expo' // ← Fixed: Use useOAuth instead of useSSO
import { View, TouchableOpacity, Text, Alert } from 'react-native'
import { useRouter } from 'expo-router' // ← Fixed: Import useRouter
import { Ionicons } from '@expo/vector-icons'

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

WebBrowser.maybeCompleteAuthSession()

export default function GoogleSignIn() {
  useWarmUpBrowser()
  
  const router = useRouter() // ← Fixed: Use useRouter hook
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' }) // ← Fixed: Use useOAuth

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow()

      if (createdSessionId) {
        await setActive({ session: createdSessionId })
        router.replace('/(app)/(tabs)') // ← Fixed: Correct route
      } else {
        // Handle sign-up flow if needed
        console.log('OAuth flow incomplete - additional steps required')
      }
    } catch (err) {
      console.error('Google Sign-In Error:', JSON.stringify(err, null, 2))
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.')
    }
  }, [startOAuthFlow, router])

  return (
    <TouchableOpacity
      onPress={onPress}
      className='bg-white border-2 border-gray-200 rounded-xl py-4 shadow-sm'
      activeOpacity={0.8}
    >
      <View className='flex-row items-center justify-center'>
        <Ionicons name='logo-google' size={20} color="#EA4335" />
        <Text className='text-gray-900 font-semibold text-lg ml-3'>
          Continue with Google {/* ← Fixed: Removed extra "in" */}
        </Text>
      </View>
    </TouchableOpacity>
  )
}