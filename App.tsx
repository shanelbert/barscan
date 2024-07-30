import React from 'react';
import { Image } from 'react-native';

import Scan from "./components/Scan";
import Setting from "./components/Setting";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Scan'>
        <Stack.Screen 
          name="Scan" 
          component={Scan} 
          options={{ 
            title: '',
            animation: 'none',
            headerRight: () => (
              <Image 
                source={require('./assets/setting.png')} 
                style={{ width: undefined, height: undefined }}
              />
            ),
         }} 
        />
        <Stack.Screen 
          name="Setting" 
          component={Setting} 
          options={{ 
            title: 'Setting' ,
            animation: 'none',
          }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;