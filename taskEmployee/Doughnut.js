// import React from 'react';
// import { View } from 'react-native';
// import { Svg, Path } from 'react-native-svg';
// import * as d3Shape from 'd3-shape';

// const Doughnut = ({ data, colors, width, height, innerRadius, outerRadius }) => {
//     const total = data.reduce((acc, val) => acc + val, 0);
//     const arcs = d3Shape.pie()(data.map((d) => d / total));

//     const arcGenerator = d3Shape
//         .arc()
//         .innerRadius(innerRadius)
//         .outerRadius(outerRadius);

//     return (
//         <View style={{ width, height }}>
//             <Svg width={width} height={height}>
//                 {arcs.map((arc, index) => (
//                     <Path
//                         key={index}
//                         d={arcGenerator(arc)}
//                         fill={colors[index % colors.length]} // Use colors cyclically
//                         transform={`translate(${width / 2},${height / 2})`}
//                     />
//                 ))}
//             </Svg>
//         </View>
//     );
// };

// export default Doughnut;


// import React from 'react';
// import { View } from 'react-native';
// import { Svg, Path, Text } from 'react-native-svg';
// import * as d3Shape from 'd3-shape';

// const DoughnutChart = ({ data, colors, counts, width, height, innerRadius, outerRadius }) => {
//     const total = data.reduce((acc, val) => acc + val, 0);
//     const arcs = d3Shape.pie()(data.map((d) => d / total));

//     const arcGenerator = d3Shape
//         .arc()
//         .innerRadius(innerRadius)
//         .outerRadius(outerRadius);

//     const labels = counts.map((count, index) => (
//         <Text
//             key={index}
//             fill="#000"
//             fontSize="14"
//             fontWeight="bold"
//             x={outerRadius * Math.cos((arcs[index].startAngle + arcs[index].endAngle) / 2)}
//             y={outerRadius * Math.sin((arcs[index].startAngle + arcs[index].endAngle) / 2)}
//             textAnchor="middle"
//             alignmentBaseline="middle"
//         >
//             {count}
//         </Text>
//     ));

//     return (
//         <View style={{ width, height }}>
//             <Svg width={width} height={height}>
//                 {arcs.map((arc, index) => (
//                     <React.Fragment key={index}>
//                         <Path
//                             d={arcGenerator(arc)}
//                             fill={colors[index % colors.length]}
//                             transform={`translate(${width / 2},${height / 2})`}
//                         />
//                         {labels[index]}
//                     </React.Fragment>
//                 ))}
//             </Svg>
//         </View>
//     );
// };

// export default DoughnutChart;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import * as d3Shape from 'd3-shape';

const Doughnut = ({ data, colors, width, height, innerRadius, outerRadius }) => {
    const total = data.reduce((acc, val) => acc + val, 0);
    const arcs = d3Shape.pie()(data.map((d) => d / total));

    const arcGenerator = d3Shape
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    return (
        <View style={{ width, height }}>
            <Svg width={width} height={height}>
                {arcs.map((arc, index) => (
                    <Path
                        key={index}
                        d={arcGenerator(arc)}
                        fill={colors[index % colors.length]} // Use colors cyclically
                        transform={`translate(${width / 2},${height / 2})`}
                    />
                ))}
            </Svg>
            {/* Overlay labels */}
            {arcs.map((arc, index) => {
                const textAnchor = arc.startAngle + (arc.endAngle - arc.startAngle) / 2 > Math.PI ? 'end' : 'start';
                const position = arcGenerator.centroid(arc);
                return (
                    <Text
                        key={index}
                        style={[styles.label, { left: position[0] + width / 2, top: position[1] + height / 2 }]}
                        textAnchor={textAnchor}
                    >
                        {data[index]}
                    </Text>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        position: 'absolute',
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white'
    },
});

export default Doughnut;



