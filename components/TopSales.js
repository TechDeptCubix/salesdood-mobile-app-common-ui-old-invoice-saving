// import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { BarChart, LineChart } from 'react-native-chart-kit';
// import axios from 'axios';
// import { G } from 'react-native-svg';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import urls from '../url/AppUrl'

// const { DashUrl } = urls;

// // import PieChart from 'react-native-pie-chart'


// const TopSales = () => {

//     const [showDateToggler, setShowDateToggler] = useState(false)

//     const [apiData, setApiData] = useState(null)

//     const [selectedYear, setSelectedYear] = useState(null);

//     const [chartData, setChartData] = useState(null);

//     const [legend, setLegend] = useState(null)

//     const [showLoader, setShowLoader] = useState(false)

//     // const [selectedYear, setSelectedYear] = useState('')

//     // let cmpcode = 'PENDULUM'
//     // let privatek = '1F12412E-9F7D-4C6B-9622-F6BCA1694C12'

//     const [cmpcode, setCmpCode] = useState(null)
//     const [publick, setpublick] = useState(null)
//     const [privatek, setprivatek] = useState(null)

//     useEffect(() => {
//         const fetchData = async () => {
//             // Retrieve the selected company details from local storage
//             const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

//             // console.log('selectedCompanyString', selectedCompanyString)

//             // Check if a selected company is stored in local storage
//             if (selectedCompanyString) {
//                 const selectedCompany = JSON.parse(selectedCompanyString);

//                 // Access the company details and set them as states
//                 setCmpCode(selectedCompany.cmpcode);
//                 setpublick(selectedCompany.publick);
//                 setprivatek(selectedCompany.privatek);
//             } else {
//                 // Handle the case where no selected company is found
//                 console.error("No selected company found in local storage");
//             }
//         };

//         fetchData();
//     }, []);


//     // Labels based on months
//     const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

//     // const colors = ["#FF5733", "#33FF57", "#3366FF"];
//     const colors = ["yellow", "blue", "green", 'red', 'orange'];

//     const data1 = {
//         labels: ["January", "February", "March", "April", "May", "June", 'July'],
//         datasets: [
//             {
//                 data: [20, 45, 28, 80, 99, 43],
//                 color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
//                 strokeWidth: 2 // optional
//             },
//             {
//                 data: [10, 20, 50, 44, 81, 12],
//                 color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
//                 strokeWidth: 2 // optional
//             }
//         ],
//         // legend: ["Rainy Days"] // optional
//     };

//     const testData = [
//         {
//             "Year": 2024,
//             "Month": 1,
//             "Column1": 1375633.30,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2024,
//             "Month": 2,
//             "Column1": 1163255.58,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2024,
//             "Month": 3,
//             "Column1": 1131404.18,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2024,
//             "Month": 4,
//             "Column1": 772697.11,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2024,
//             "Month": 5,
//             "Column1": 607150.80,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 1,
//             "Column1": 1200000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 2,
//             "Column1": 1300000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 3,
//             "Column1": 1100000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 4,
//             "Column1": 900000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 5,
//             "Column1": 800000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 6,
//             "Column1": 700000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 7,
//             "Column1": 600000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 8,
//             "Column1": 500000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 9,
//             "Column1": 400000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 10,
//             "Column1": 600000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 11,
//             "Column1": 500000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2023,
//             "Month": 12,
//             "Column1": 400000,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2022,
//             "Month": 1,
//             "Column1": 137444.30,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2022,
//             "Month": 2,
//             "Column1": 114571.58,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2022,
//             "Month": 3,
//             "Column1": 113144.18,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2022,
//             "Month": 4,
//             "Column1": 77269.11,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//         {
//             "Year": 2022,
//             "Month": 5,
//             "Column1": 60715.80,
//             "bgColor": "#DAF7A6",
//             "foreColor": "#111010",
//             "imgUrl": ""
//         },
//     ]


//     const chartConfig = {
//         backgroundColor: "white", // Set background color to white
//         backgroundGradientFrom: "white", // Set background gradient from white
//         backgroundGradientTo: "white", // Set background gradient to white
//         decimalPlaces: 0, // optional, defaults to 2dp
//         color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Set line and label color to black
//         labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Set label color to black
//         style: {
//             borderRadius: 16
//         },
//         propsForDots: {
//             r: "6",
//             strokeWidth: "2",
//             stroke: "#000000" // Set dot stroke color to black
//         },
//         fillShadowGradient: 'transparent', // Set the fill shadow gradient to transparent
//         fillShadowGradientOpacity: 0 // Set the fill shadow gradient opacity to 0
//     };

//     const fetchApiData = async () => {

//         try {
//             setShowLoader(true)
//             axios.get(`${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=SALES_MONTH&s1=%27test%27&s2=%27test%27&s3=%27test%27&i1=100&i2=0&dt1=1-1-2022&dt2=1-1-2022`)
//                 .then((response) => {
//                     setApiData(response.data)

//                     const groupedData = response.data && response.data.reduce((acc, curr) => {
//                         const year = curr.Year.toString();
//                         if (!acc[year]) {
//                             acc[year] = [];
//                         }
//                         acc[year].push(curr);
//                         return acc;
//                     }, {});

//                     // console.log('groupedData', groupedData)

//                     // Create chart data
//                     const data = groupedData && Object.keys(groupedData).map((year, index) => {
//                         const yearData = groupedData[year];
//                         const monthValues = Array.from({ length: 12 }, (_, i) => {
//                             const monthData = yearData.find(data => data.Month === i + 1);
//                             return monthData ? monthData.Column1 : null;
//                         }).filter(value => value !== null); // Filter out null values

//                         return {
//                             data: monthValues,
//                             color: (opacity = 1) => colors[index % colors.length], // Use different colors based on the index
//                             strokeWidth: 2
//                         };
//                     });

//                     // console.log('data', data)


//                     // Create legend array
//                     const legend = groupedData && Object.keys(groupedData).map((year, index) => {
//                         return {
//                             name: year,
//                             color: colors[index % colors.length]
//                         };
//                     });

//                     setLegend(legend)

//                     // Update chart data
//                     setChartData({
//                         labels: labels,
//                         datasets: data,
//                     });

//                     setShowLoader(false)

//                 })
//                 .catch(error => {
//                     console.log('TopSalesError', error)
//                     setShowLoader(false)
//                 })
//         } catch (error) {
//             console.log('TopSalesError', error)
//             setShowLoader(false)

//         }
//     }

//     useEffect(() => {
//         if (cmpcode && privatek) {
//             fetchApiData()
//         }
//     }, [cmpcode, privatek])

//     // const groupedData = testData && testData.reduce((acc, curr) => {
//     //     const year = curr.Year.toString();
//     //     if (!acc[year]) {
//     //         acc[year] = [];
//     //     }
//     //     acc[year].push(curr);
//     //     return acc;
//     // }, {});

//     // const data = groupedData && Object.keys(groupedData).map((year, index) => {
//     //     const yearData = groupedData[year];
//     //     const monthValues = Array.from({ length: 12 }, (_, i) => {
//     //         const monthData = yearData.find(data => data.Month === i + 1);
//     //         return monthData ? monthData.Column1 : null;
//     //     }).filter(value => value !== null); // Filter out null values

//     //     return {
//     //         data: monthValues,
//     //         color: (opacity = 1) => colors[index % colors.length], // Use different colors based on the index
//     //         strokeWidth: 2
//     //     };
//     // });

//     // // Create legend array
//     // const legend = groupedData && Object.keys(groupedData).map((year, index) => {
//     //     return {
//     //         name: year,
//     //         color: colors[index % colors.length]
//     //     };
//     // });

//     // Function to handle year selection
//     const handleYearSelect = (year) => {
//         if (year === 'All') {
//             setSelectedYear(year);
//             setShowDateToggler(!showDateToggler)
//             fetchApiData()
//             return
//         }
//         setSelectedYear(year);
//         setShowDateToggler(!showDateToggler)
//     };


//     useEffect(() => {

//         if (selectedYear === 'All') {
//             fetchApiData()
//             return
//         }

//         if (selectedYear !== null) {

//             const filteredData = selectedYear ? apiData.filter(item => item.Year.toString() === selectedYear) : apiData;
//             // Grouping test data by year
//             const groupedData = filteredData && filteredData.reduce((acc, curr) => {
//                 const year = curr.Year.toString();
//                 if (!acc[year]) {
//                     acc[year] = [];
//                 }
//                 acc[year].push(curr);
//                 return acc;
//             }, {});

//             // Create chart data
//             const data = groupedData && Object.keys(groupedData).map((year, index) => {
//                 const yearData = groupedData[year];
//                 const monthValues = Array.from({ length: 12 }, (_, i) => {
//                     const monthData = yearData.find(data => data.Month === i + 1);
//                     return monthData ? monthData.Column1 : '';
//                 })


//                 // .filter(value => value !== null);// Filter out null values


//                 return {
//                     data: monthValues,
//                     color: (opacity = 1) => {
//                         const legendItem = legend.find(item => item.name === year);
//                         // console.log('legendItem', legendItem)
//                         return legendItem ? legendItem.color : colors[index % colors.length];
//                     }, strokeWidth: 2
//                 };
//             });

//             // Create legend array
//             const legend = groupedData && Object.keys(groupedData).map((year, index) => {
//                 return {
//                     name: year,
//                     color: colors[index % colors.length]
//                 };
//             });

//             // setLegend(legend)

//             // Update chart data
//             setChartData({
//                 labels: labels,
//                 datasets: data,
//             });
//         }

//         // Filter API data based on selected year
//     }, [selectedYear])

//     // useEffect(() => {
//     //     fetchApiData()
//     // }, [showDateToggler])




//     // const chartData = {
//     //     labels: labels,
//     //     datasets: data,
//     // };


//     // console.log('TopSalesData', apiData)

//     // console.log('chartData', chartData.datasets)

//     // console.log('legend', legend)

//     // console.log('data', data)

//     // console.log('filteredData', filteredData)

//     // console.log('chartData', chartData)

//     // console.log('apiData', apiData)

//     // console.log('selectedYear', selectedYear)

//     return (
//         <View style={styles.CashWrapper}>

//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

//                 <Text style={{ fontSize: 18 }}>Top Sales(AED)</Text>

//                 <TouchableOpacity onPress={() => setShowDateToggler(!showDateToggler)} style={{ backgroundColor: 'green', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
//                     <Text style={{ color: 'white' }}>
//                         {
//                             selectedYear && selectedYear
//                         }
//                         {/* {
//                             selectedYear === null && legend && legend.length > 0 ? 'All' : (legend && legend.length > 0 ? legend[0].name : null)
//                         } */}

//                     </Text>
//                     {
//                         showDateToggler ?
//                             <Image style={{ width: 18, height: 18 }} source={require('../dashImages/dropUp.png')} /> :
//                             <Image style={{ width: 18, height: 18 }} source={require('../dashImages/dropDown.png')} />
//                     }
//                 </TouchableOpacity>


//                 {/* <View style={{ width: '35%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>


//                     <TouchableOpacity onPress={() => setTotalSalesTablePop(true)}>
//                         <Image style={{ width: 16, height: 16 }} source={require('../dashImages/CompBurg.png')} />
//                     </TouchableOpacity>

//                 </View> */}

//                 {
//                     showDateToggler &&
//                     <View style={{
//                         position: 'absolute',
//                         right: 0,
//                         top: 30,
//                         zIndex: 2,
//                         width: 100,
//                         // justifyContent: 'center',
//                         // alignItems: 'center'
//                     }}>
//                         <View style={{
//                             padding: 8,
//                             backgroundColor: 'white',
//                             shadowColor: '#000',
//                             shadowOffset: { width: 0, height: 2 },
//                             shadowOpacity: 0.25,
//                             shadowRadius: 3,
//                             elevation: 5,
//                             width: '100%',
//                             justifyContent: 'center',
//                             alignItems: 'center'
//                         }}>

//                             <TouchableOpacity style={{
//                                 padding: 6,
//                                 borderBottomWidth: 1,
//                                 borderBottomColor: 'grey', width: '100%', alignItems: 'center'
//                             }}
//                                 onPress={() => handleYearSelect('All')}
//                             >
//                                 <Text style={{ fontSize: 18 }}>All</Text>
//                             </TouchableOpacity>

//                             {
//                                 legend && legend.map((item, index) => (
//                                     <TouchableOpacity style={{
//                                         padding: 6,
//                                         borderBottomWidth: 1,
//                                         borderBottomColor: 'grey', width: '100%', alignItems: 'center'
//                                     }}
//                                         onPress={() => handleYearSelect(item.name)}
//                                         key={index}
//                                     >
//                                         <Text style={{ fontSize: 18 }}>{item.name}</Text>
//                                     </TouchableOpacity>
//                                 ))
//                             }
//                         </View>
//                     </View>
//                 }

//             </View>



//             <View style={{ marginTop: 12, marginBottom: 12 }}>

//                 {
//                     showLoader &&
//                     <ActivityIndicator />
//                 }

//                 {
//                     !showLoader && !apiData && !chartData &&
//                     <View>
//                         <Text style={{
//                             color: 'red'
//                         }}>No Data Available</Text>
//                     </View>
//                 }

//                 {
//                     apiData && apiData.length > 0 && chartData &&
//                     <ScrollView horizontal={true}>
//                         <LineChart
//                             data={chartData}
//                             width={Dimensions.get("window").width}
//                             height={350}
//                             verticalLabelRotation={25}
//                             chartConfig={chartConfig}
//                             fromZero={true}
//                             bezier
//                         />
//                     </ScrollView>
//                 }


//                 <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
//                     {legend && legend.map(item => (
//                         <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }} key={item.name}>
//                             <View style={{ width: 10, height: 10, backgroundColor: item.color, marginRight: 5 }}></View>
//                             <Text>{item.name}</Text>
//                         </View>
//                     ))}
//                 </View>

//             </View>



//         </View>
//     )
// }

// const styles = StyleSheet.create({
//     CashWrapper: {
//         width: '100%',
//         paddingHorizontal: 12,
//         paddingTop: 8,
//         backgroundColor: 'white',
//         borderRadius: 4,
//         // maxHeight: 500,
//         // alignItems: 'center',
//         // justifyContent: 'space-between',

//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3,
//         elevation: 5,
//     },
//     DateTogglerWrap: {
//         backgroundColor: '#B5D8FF',
//         paddingVertical: 12,
//         paddingHorizontal: 8,
//         borderRadius: 4, marginTop: 4
//     },
//     closeIcon: {
//         position: 'absolute',
//         right: 0
//     },
//     DateToggle: {
//         flexDirection: 'row',
//         width: '100%',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 0,
//         paddingVertical: 12
//     },
//     LeftArrow: {
//         position: 'absolute',
//         left: 0
//     },
//     RightArrow: {
//         position: "absolute",
//         right: 0
//     },
//     TableContainer: {
//         width: "100%",
//         padding: 10,
//         marginTop: 8
//     },
//     tableRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         // marginBottom: 5,
//         // paddingVertical: 5,
//     },
//     headerCell: {
//         // flex: 1,
//         backgroundColor: 'white',
//         padding: 10,
//         textAlign: 'center',
//         fontWeight: 'bold',
//         flexWrap: 'nowrap',
//         width: 150
//     },
//     dataCell: {
//         // flex: 1,
//         backgroundColor: '#F3F3F3',
//         padding: 10,
//         textAlign: 'center',
//         width: 150,
//         borderTopWidth: 1,
//         borderLeftWidth: 1,
//         borderColor: 'white',
//         color: "black"
//     },


//     container: {
//         width: '100%',
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         marginTop: 20,
//         marginBottom: 18
//     },
//     title: {
//         fontSize: 24,
//         margin: 10,
//     },
// })

// export default TopSales