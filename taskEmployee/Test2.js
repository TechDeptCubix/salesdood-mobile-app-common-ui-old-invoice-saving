import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Doughnut from './Doughnut';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'

const colors = [
    '#8A8D90',
    '#000000',
    '#7CC674',
    '#8BC1F7',
    '#F4B678',
    '#F4C145',
    '#5752D1',
    '#C9190B',
    '#38812F',
];

const dataTypes = [
    'TOTAL_ASSIGNED',
    'PENDING',
    'ACCEPTED_OPEN',
    'ACCDEPTED_HOLD',
    'TRAVEL',
    'ESCALATED',
    'TASK_PROCESS',
    'CUSTOMER_REJECTION',
    'COMPLETED',
];


const DoughnutChart = () => {

    const [userData, setUserData] = useState(null)

    const [empId, setEmpId] = useState('')

    const [taskCount, setTaskCount] = useState(null)


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDataJson = await AsyncStorage.getItem('userData');
                const userData = JSON.parse(userDataJson);
                // Now you have userData, you can use it here
                setUserData(userData)
                setEmpId(userData.empid)
                // console.log(userData, 'userData')
                // showUserDataToast(userData)

            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const fetchTaskCount = async () => {
        try {

            const response = await axios.get(`https://cubixweberp.com:156/api/CRMTaskCount/CPAYS/creator/${empId}/-/1900-01-01/1900-01-01`)

            console.log(response.data, 'fetchTaskCount')

            if (response.data.length === 0) {
                setTaskCount([])
                return
            }

            const selectedEmployee = response?.data.find(employee => employee.EMPID === empId);
            if (selectedEmployee) {
                // Align the data according to the desired order
                const alignedData = [
                    selectedEmployee.TOTAL_ASSIGNED,
                    selectedEmployee.PENDING,
                    selectedEmployee.ACCEPTED_OPEN,
                    selectedEmployee.ACCEPTED_HOLD,
                    selectedEmployee.TRAVEL,
                    selectedEmployee.ESCALATED,
                    selectedEmployee.TASK_PROCESS,
                    selectedEmployee.CUSTOMER_REJECTION,
                    selectedEmployee.COMPLETED
                ];
                setTaskCount(alignedData);
            } else {
                console.error('Employee not found');
            }
        } catch (error) {
            console.error('fetchTaskCountError:', error);
            setTaskCount('apiError')
            // console.log(`https://cubixweberp.com:156/api/CRMTaskCount/CPAYS/creator/${empId}/-/1900-01-01/1900-01-01`)
        }
    }

    useEffect(() => {
        if (empId !== '') {
            fetchTaskCount()
        }
    }, [empId])

    console.log(userData, 'userData')
    console.log('taskCount', taskCount)
    return (
        <View style={{
            justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', width: '94%', padding: 8, borderRadius: 4, shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3,
            elevation: 5,
        }}>

            <View style={{
                width: '100%', padding: 8, margin: 4
            }}>
                <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold' }}>Task Count</Text>
            </View>

            {/* legend */}
            <View style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                marginBottom: 12
            }}>
                {
                    dataTypes.map((item, index) => (
                        <View key={index} style={{ flexDirection: 'row', margin: 2, padding: 2, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, marginRight: 4 }}>{item}</Text>
                            <View style={{ width: 14, height: 14, backgroundColor: colors[index], borderRadius: 20 }} />
                        </View>
                    ))
                }
            </View>
            {/* legend */}

            <View style={{ minHeight: 200, maxHeight: 'auto', paddingBottom: 8 }}>
                {
                    taskCount === null &&
                    <ActivityIndicator color='blue' size='large'></ActivityIndicator>
                }

                {
                    taskCount === 'apiError' &&
                    <View>
                        <Text style={{ color: 'red', fontWeight: 'bold' }}>some error in the backend, please wait...</Text>
                    </View>
                }

                {
                    taskCount && taskCount.length === 0 &&
                    <View>
                        <Text style={{ color: 'red', fontWeight: 'bold' }}>No Data available</Text>
                    </View>
                }

                {
                    taskCount && taskCount !== 'apiError' && taskCount.length !== 0 &&
                    <Doughnut
                        data={taskCount}
                        counts={taskCount}
                        colors={colors}
                        width={200}
                        height={200}
                        innerRadius={60}
                        outerRadius={100}
                    />
                }
            </View>
        </View>
    );
};

export default DoughnutChart;
