// import React from 'react';
// import { View } from 'react-native';
// import { PieChart } from 'react-native-chart-kit';

// const data = [
//     {
//         name: 'Seoul',
//         population: 21500000,
//         color: '#F00',
//         legendFontColor: '#7F7F7F',
//         legendFontSize: 15,
//     },
//     {
//         name: 'Toronto',
//         population: 2800000,
//         color: '#0F0',
//         legendFontColor: '#7F7F7F',
//         legendFontSize: 15,
//     },
//     {
//         name: 'New York',
//         population: 8538000,
//         color: '#00F',
//         legendFontColor: '#7F7F7F',
//         legendFontSize: 15,
//     },
// ];

// const Test = () => {
//     return (
//         <View>
//             <PieChart
//                 data={data}
//                 width={300}
//                 height={220}
//                 chartConfig={{
//                     backgroundColor: 'transparent',
//                     backgroundGradientFrom: 'transparent',
//                     backgroundGradientTo: 'transparent',
//                     color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                 }}
//                 accessor="population"
//                 backgroundColor="transparent"
//                 paddingLeft="15"
//                 hasLegend={false} // Disable legend
//                 absolute
//             />
//         </View>
//     );
// };

// export default Test;
