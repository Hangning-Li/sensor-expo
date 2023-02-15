import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes
} from "react-native-sensors";
import { useState, useEffect } from "react";
import { View, StyleSheet, Text } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

// setUpdateIntervalForType(SensorTypes.accelerometer, 400); // defaults to 100ms
const BACKGROUND_FETCH_TASK = 'background-fetch';

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({ data, error }) => {
  if (error) {
    // Error occurred - check `error.message` for more details.
    console.log(error.message);
    return;
  }
  if (data) {
    //below 3 lines of code is the accelerometer is for the accelerometer tracking
    accelerometer.subscribe(accelerometerData => {
      console.log(accelerometerData);
    })

    gyroscope.subscribe((gyroscopeData) => {
      console.log(gyroscopeData)
    })
  }
  
  console.log("success");

});


const SensorScreen = () => {
  const [accelerometerData, setAccelerometerData] = useState({});
  const [gyroscopeData, setGyroscopeData] = useState({});

  const [isRegistered, setIsRegistered] = useState(false);
  const [status, setStatus] = useState(null);

  async function registerBackgroundFetchAsync() {

    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60, // 15 minutes
      stopOnTerminate: false, // android only,
      startOnBoot: true, // android only
    }

    );
  }

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    setStatus(status);
    setIsRegistered(isRegistered);
  };


  useEffect(() => {
    checkStatusAsync();
    registerBackgroundFetchAsync()

    const a_subcription = accelerometer.subscribe((accelerometerData) =>
      setAccelerometerData(accelerometerData)
    )

    const g_subscription = gyroscope.subscribe((gyroscopeData) =>
      setGyroscopeData(gyroscopeData)
    )

    return () => {
      a_subcription.unsubscribe();
      g_subscription.unsubscribe();
    };
  }, []);

  // console.log(status);
  // console.log(isRegistered);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accelerometer Data</Text>
      <Text style={styles.data}>x: {accelerometerData.x}</Text>
      <Text style={styles.data}>y: {accelerometerData.y}</Text>
      <Text style={styles.data}>z: {accelerometerData.z}</Text>
      <Text style={styles.data}>time: {accelerometerData.timestamp}</Text>
      <Text style={styles.title}>Gyroscope Data</Text>
      <Text style={styles.data}>x: {gyroscopeData.x}</Text>
      <Text style={styles.data}>y: {gyroscopeData.y}</Text>
      <Text style={styles.data}>z: {gyroscopeData.z}</Text>
      <Text style={styles.data}>time: {accelerometerData.timestamp}</Text>
      <Text>
        Background fetch status:{' '}
        <Text style={styles.title}>
          {status && BackgroundFetch.BackgroundFetchStatus[status]}
        </Text>
      </Text>
      <Text>
        Background fetch task name:{' '}
        <Text style={styles.title}>
          {isRegistered ? BACKGROUND_FETCH_TASK : 'Not registered yet!'}
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    marginTop: 20,
  },
  data: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default SensorScreen;