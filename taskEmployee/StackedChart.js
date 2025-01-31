import React from 'react';
import { View } from 'react-native';
import StackedFact from './StackedFact';

const data = [
    [45, 4, 1, 0, 1, 2, 3, 1, 33], // Employee 1
    [24, 17, 3, 0, 0, 0, 0, 1, 3], // Employee 2
    // Add more employees' data here
];

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

const employeeNames = ['FARHAN', 'AJMAL']; // Example employee names

const StackedChart = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <StackedFact
                data={data}
                colors={colors}
                employeeNames={employeeNames}
                width={300}
                height={200}
            />
        </View>
    );
};


export default StackedChart