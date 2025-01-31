import React from 'react';
import { View, Text } from 'react-native';
import { Svg, Rect } from 'react-native-svg';

const StackedFact = ({ data, colors, employeeNames, width, height }) => {
    const maxValue = Math.max(...data.map(employeeData => employeeData.reduce((acc, val) => acc + val, 0)));
    const yScale = height / employeeNames.length;
    const xScale = width / maxValue;

    return (
        <View style={{ width, height }}>
            <Svg width={width} height={height}>
                {data.map((employeeData, index) => (
                    <React.Fragment key={index}>
                        {employeeData.map((value, dataIndex) => (
                            <Rect
                                key={dataIndex}
                                x={0}
                                y={index * yScale}
                                width={value * xScale}
                                height={yScale}
                                fill={colors[dataIndex % colors.length]}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </Svg>
            {/* Render employee names */}
            <View style={{ position: 'absolute', top: 0, left: 0, width: width * 0.2 }}>
                {employeeNames.map((name, index) => (
                    <Text key={index} style={{ marginBottom: 5 }}>
                        {name}
                    </Text>
                ))}
            </View>
        </View>
    );
};


export default StackedFact