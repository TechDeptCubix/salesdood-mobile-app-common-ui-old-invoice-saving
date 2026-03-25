// import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import { BarChart, LineChart } from 'react-native-chart-kit';
// import { XAxis, YAxis } from 'react-native-chart-kit';
// import { format, addDays, subDays, addMonths, subMonths, addYears, subYears, lastDayOfMonth, lastDayOfYear, startOfYear, startOfMonth } from 'date-fns';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import urls from '../url/AppUrl'

// const { DashUrl } = urls;

// // import PieChart from 'react-native-pie-chart'


// const TopCustomer = () => {

//     const [showDateToggler, setShowDateToggler] = useState(false)

//     const [selectedDate, setSelectedDate] = useState(new Date());

//     const [selectedDateTab, setSelectedDateTab] = useState('Day');

//     const [showLoader, setShowLoader] = useState(false)

//     const [topCustomerData, setTopCutomerData] = useState(null)

//     const [chartData, setChartData] = useState(null)

//     const [maxAmount, setMaxAmount] = useState(null)

//     const [cmpcode, setCmpCode] = useState(null)
//     const [publick, setpublick] = useState(null)
//     const [privatek, setprivatek] = useState(null)


//     // let cmpcode = 'PENDULUM'
//     // let privatek = '1F12412E-9F7D-4C6B-9622-F6BCA1694C12'

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



//     const data = {
//         labels: ["COMP1", "COMP2", "COMP3", "COMP4", "COMP5"],
//         datasets: [
//             {
//                 data: [20, 45, 28, 80, 99],
//                 colors: [
//                     (opacity = 1) => `#FF6384`,
//                     (opacity = 1) => `#36A2EB`,
//                     (opacity = 1) => `#FFCE56`,
//                     (opacity = 1) => `#4BC0C0`,
//                     (opacity = 1) => `#9966FF`,
//                 ]
//             }
//         ]
//     };

//     const hexValues = [
//         '#FF6384',
//         '#36A2EB',
//         '#FFCE56',
//         '#4BC0C0',
//         '#9966FF',
//         // '#FF9F40'
//     ];

//     // const colors = data.datasets[0].data.map((_, index) => hexValues[index % hexValues.length]);

//     // console.log(colors)

//     const chartConfig = {
//         backgroundColor: "white", // Set background color to white
//         backgroundGradientFrom: "white", // Set background gradient from white
//         backgroundGradientTo: "white", // Set background gradient to white
//         decimalPlaces: 2, // optional, defaults to 2dp
//         color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Set line and label color to black
//         labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//         // barColors: colors,
//         style: {
//             borderRadius: 16
//         },
//         propsForDots: {
//             r: "6",
//             strokeWidth: "2",
//             stroke: "#000000" // Set dot stroke color to black
//         },
//         barColors: hexValues,
//     };



//     const decreaseDay = () => {
//         if (selectedDateTab === 'Day') {
//             const newDate = subDays(selectedDate, 1);
//             setSelectedDate(newDate);
//         }
//     };

//     const increaseDay = () => {
//         if (selectedDateTab === 'Day') {
//             const newDate = addDays(selectedDate, 1);
//             if (newDate <= new Date()) {
//                 setSelectedDate(newDate);
//             }
//         }
//     };

//     const decreaseMonth = () => {
//         if (selectedDateTab === 'Month') {
//             const newDate = subMonths(selectedDate, 1);
//             setSelectedDate(newDate);
//         }
//     };

//     const increaseMonth = () => {
//         if (selectedDateTab === 'Month') {
//             const newDate = addMonths(selectedDate, 1);
//             if (newDate <= new Date()) {
//                 setSelectedDate(newDate);
//             }
//         }
//     };

//     const decreaseYear = () => {
//         if (selectedDateTab === 'Year') {
//             const newDate = subYears(selectedDate, 1);
//             setSelectedDate(newDate);
//         }
//     };

//     const increaseYear = () => {
//         if (selectedDateTab === 'Year') {
//             const newDate = addYears(selectedDate, 1);
//             if (newDate <= new Date()) {
//                 setSelectedDate(newDate);
//             }
//         }
//     };

//     const formatDate = () => {
//         if (selectedDateTab === 'Day') {
//             return format(selectedDate, 'MM-dd-yyyy');
//         } else if (selectedDateTab === 'Month') {
//             return format(selectedDate, 'MMMM');
//         } else {
//             return format(selectedDate, 'yyyy');
//         }
//     };

//     useEffect(() => {

//         if (cmpcode && privatek) {
//             setShowLoader(true)
//             if (selectedDateTab === 'Day') {
//                 const formattedDay = format(selectedDate, 'MM-dd-yyyy');
//                 const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOP_CUSTOMER&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formattedDay}&dt2=${formattedDay}`;
//                 axios.get(url)
//                     .then(response => {
//                         const data = response.data;

//                         setTopCutomerData(data)
//                         setShowLoader(false)

//                     })
//                     .catch(error => {
//                         console.error('DayToggelErr:', error)
//                         setShowLoader(false)
//                     });
//             }

//             if (selectedDateTab === 'Month') {
//                 const firstDayofMonth = startOfMonth(selectedDate)
//                 const lastDayOfMonthDate = lastDayOfMonth(selectedDate);
//                 const formatFirstdDay = format(firstDayofMonth, 'MM-dd-yyyy');
//                 const formatLastDay = format(lastDayOfMonthDate, 'MM-dd-yyyy');
//                 const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOP_CUSTOMER&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formatFirstdDay}&dt2=${formatLastDay}`;

//                 // console.log(url)
//                 axios.get(url)
//                     .then(response => {
//                         const data = response.data;

//                         setTopCutomerData(data)
//                         setShowLoader(false)

//                     })
//                     .catch(error => {
//                         console.error('MonthToggelErr:', error)
//                         setShowLoader(false)
//                     });
//             }

//             if (selectedDateTab === 'Year') {
//                 const firstDayofYear = startOfYear(selectedDate)
//                 const lastDayOfYearDate = lastDayOfYear(selectedDate);
//                 const formatFirstdDay = format(firstDayofYear, 'MM-dd-yyyy');
//                 const formatLastDay = format(lastDayOfYearDate, 'MM-dd-yyyy');
//                 const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOP_CUSTOMER&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formatFirstdDay}&dt2=${formatLastDay}`;

//                 // console.log(url)
//                 axios.get(url)
//                     .then(response => {
//                         const data = response.data;

//                         setTopCutomerData(data)
//                         setShowLoader(false)

//                     })
//                     .catch(error => {
//                         console.error('YearToggelErr:', error)
//                         setShowLoader(false)
//                     });
//             }
//         }

//     }, [selectedDateTab, selectedDate, cmpcode, privatek]);

//     // useEffect(() => {
//     //     if (topCustomerData !== null) {
//     //         // Mapping data to the format expected by BarChart
//     //         const chartData = {
//     //             labels: topCustomerData.map(item => item.Customer),
//     //             datasets: [
//     //                 {
//     //                     data: topCustomerData.map(item => item.Amount),
//     //                 },
//     //             ],
//     //         }
//     //     }
//     // , [topCustomerData]})

//     useEffect(() => {
//         if (topCustomerData !== null) {
//             const chartData = {
//                 labels: topCustomerData.map(item => item.Customer),
//                 datasets: [
//                     {
//                         data: topCustomerData.map(item => item.Amount),
//                         colors: [
//                             (opacity = 1) => `#FF6384`,
//                             (opacity = 1) => `#36A2EB`,
//                             (opacity = 1) => `#FFCE56`,
//                             (opacity = 1) => `#4BC0C0`,
//                             (opacity = 1) => `#9966FF`,
//                         ]
//                     },
//                 ],
//             };

//             setChartData(chartData)

//             const maxAmount = Math.max(...topCustomerData.map(item => item.Amount));

//             setMaxAmount(maxAmount)
//         }
//     }, [topCustomerData])

//     useEffect(() => {
//         console.log('tabChanged')
//         setSelectedDate(new Date())
//     }, [selectedDateTab, showDateToggler])


//     useEffect(() => {
//         if (showDateToggler === false) {

//             setSelectedDate(new Date())
//             setSelectedDateTab('Day')
//             console.log('selectedDateTab', selectedDateTab)
//         }
//     }, [showDateToggler])

//     // console.log('selectedDate', selectedDate)

//     // console.log('selectedDateTab', selectedDateTab)

//     // console.log('topCustomerData', topCustomerData)

//     // console.log('chartData', chartData)

//     return (
//         <View style={styles.CashWrapper}>

//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

//                 <Text style={{ fontSize: 18 }}>Top 5 Customers</Text>

//                 <TouchableOpacity onPress={() => setShowDateToggler(!showDateToggler)} style={{ backgroundColor: 'green', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
//                     <Text style={{ color: 'white' }}>Today</Text>
//                     {
//                         showDateToggler ?
//                             <Image style={{ width: 18, height: 18 }} source={require('../dashImages/dropUp.png')} /> :
//                             <Image style={{ width: 18, height: 18 }} source={require('../dashImages/dropDown.png')} />
//                     }
//                 </TouchableOpacity>


//             </View>

//             {
//                 showDateToggler &&
//                 <View style={styles.DateTogglerWrap}>

//                     <View style={{ width: '100%', flexDirection: "row", justifyContent: 'center' }}>

//                         <Text style={{ fontSize: 18 }}>{formatDate()}</Text>

//                         <TouchableOpacity onPress={() => setShowDateToggler(false)} style={styles.closeIcon}>
//                             <Image style={{ width: 20, height: 20 }} source={require('../dashImages/close.png')} />
//                         </TouchableOpacity>
//                     </View>

//                     <View style={styles.DateToggle}>

//                         <TouchableOpacity onPress={() => setSelectedDateTab('Day')} style={{
//                             flexDirection: 'row',
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             backgroundColor: selectedDateTab === 'Day' ? 'white' : '#B5D8FF',
//                             padding: 12,
//                             width: '30%'
//                         }}>
//                             <TouchableOpacity style={styles.LeftArrow} onPress={decreaseDay}>
//                                 <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Day' ? 'block' : 'none' }} source={require('../dashImages/LeftArrow.png')} />
//                             </TouchableOpacity>
//                             <Text>Day</Text>
//                             <TouchableOpacity style={styles.RightArrow} onPress={increaseDay}>
//                                 <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Day' ? 'block' : 'none' }} source={require('../dashImages/rightArrow.png')} />
//                             </TouchableOpacity>
//                         </TouchableOpacity>

//                         <TouchableOpacity onPress={() => setSelectedDateTab('Month')} style={{
//                             flexDirection: 'row',
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             backgroundColor: selectedDateTab === 'Month' ? 'white' : '#B5D8FF',
//                             padding: 12,
//                             width: '30%'
//                         }}>
//                             <TouchableOpacity style={styles.LeftArrow} onPress={decreaseMonth}>
//                                 <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Month' ? 'block' : 'none' }} source={require('../dashImages/LeftArrow.png')} />
//                             </TouchableOpacity>
//                             <Text>Month</Text>
//                             <TouchableOpacity style={styles.RightArrow} onPress={increaseMonth}>
//                                 <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Month' ? 'block' : 'none' }} source={require('../dashImages/rightArrow.png')} />
//                             </TouchableOpacity>
//                         </TouchableOpacity>

//                         <TouchableOpacity onPress={() => setSelectedDateTab('Year')} style={{
//                             flexDirection: 'row',
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             backgroundColor: selectedDateTab === 'Year' ? 'white' : '#B5D8FF',
//                             padding: 12,
//                             width: '30%'
//                         }}>
//                             <TouchableOpacity style={styles.LeftArrow} onPress={decreaseYear}>
//                                 <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Year' ? 'block' : 'none' }} source={require('../dashImages/LeftArrow.png')} />
//                             </TouchableOpacity>
//                             <Text>Year</Text>
//                             <TouchableOpacity style={styles.RightArrow} onPress={increaseYear}>
//                                 <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Year' ? 'block' : 'none' }} source={require('../dashImages/rightArrow.png')} />
//                             </TouchableOpacity>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             }

//             <View style={{ marginTop: 12, marginBottom: 12 }}>

//                 {/* {
//                     chartData !== null && topCustomerData.length > 0 &&
//                     <ScrollView horizontal={true}>
//                         <BarChart
//                             // style={graphStyle}
//                             data={chartData}
//                             width={Dimensions.get("window").width}
//                             height={350}
//                             yAxisLabel=""
//                             chartConfig={chartConfig}
//                             verticalLabelRotation={30}
//                             fromZero={true}
//                             withCustomBarColorFromData={true}
//                             flatColor={true}
//                             horizontal={true}
//                         />
//                     </ScrollView>
//                 } */}

//                 {
//                     !topCustomerData && !showLoader &&
//                     <View>
//                         <Text style={{
//                             color: 'red'
//                         }}>No Data Available</Text>
//                     </View>
//                 }

//                 {
//                     showLoader &&
//                     <ActivityIndicator size={180} color={'green'} />
//                 }


//                 {
//                     topCustomerData !== null && (
//                         <ScrollView horizontal={true}>
//                             <View style={styles.container}>
//                                 {topCustomerData.map((item, index) => {
//                                     // Calculate the width percentage based on the item amount
//                                     const widthPercentage = Math.max(25, Math.min(100, (item.Amount / maxAmount) * 100));


//                                     // console.log('widthPercentage', widthPercentage)
//                                     return (
//                                         <>
//                                             <View key={index} style={{
//                                                 flexDirection: 'row',
//                                                 alignItems: 'center',
//                                                 marginBottom: 12
//                                             }}>

//                                                 <View style={{
//                                                     width: '25%'
//                                                 }}>
//                                                     <Text style={styles.yText}>{item.Amount.toFixed(2)}</Text>
//                                                 </View>

//                                                 <View style={[styles.bar, { width: `${widthPercentage}%`, backgroundColor: `${hexValues[index]}` }]} >
//                                                     <Text style={styles.barText}>{item.Customer}</Text>
//                                                 </View >

//                                                 {/*                                                 
//                                                 <View style={styles.barContainer}>
//                                                 </View> */}

//                                             </View>
//                                         </>
//                                     );
//                                 })}
//                             </View>
//                         </ScrollView>
//                     )
//                 }

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

//     container: {
//         flex: 1,
//         flexDirection: 'column',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         paddingHorizontal: 10,
//     },
//     bar: {
//         height: 60,
//         // backgroundColor: '#b3e5fc',
//         borderRadius: 5,
//         justifyContent: 'center'
//     },
//     barContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         backgroundColor: '#b3e5fc',
//         height: 40,
//         marginVertical: 5,
//         borderRadius: 5,
//         paddingLeft: 10,
//         paddingRight: 5,
//     },
//     barText: {
//         color: '#000',
//         fontSize: 12,
//         width: 200,
//         marginLeft: 6
//         // backgroundColor: '#b3e5fc',
//         // padding: 4
//     },

//     yText: {
//         color: '#000',
//         fontSize: 12,
//     },

//     textContainer: {
//         position: 'absolute',
//         left: 0,
//         right: 0,
//         top: 0,
//         bottom: 0,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 10,
//         color: '#000',
//         fontSize: 14,
//     },


//     // container: {
//     //     flexDirection: 'column',
//     //     paddingHorizontal: 10,
//     //     paddingVertical: 5,
//     // },
//     // barContainer: {
//     //     flexDirection: 'row',
//     //     alignItems: 'center',
//     //     marginVertical: 5,
//     //     position: 'relative',
//     // },
//     // bar: {
//     //     height: 40,
//     //     backgroundColor: '#b3e5fc',
//     //     borderRadius: 5,
//     // },
//     // textContainer: {
//     //     position: 'absolute',
//     //     left: 0,
//     //     right: 0,
//     //     top: 0,
//     //     bottom: 0,
//     //     flexDirection: 'row',
//     //     justifyContent: 'space-between',
//     //     alignItems: 'center',
//     //     paddingHorizontal: 10,
//     // },
//     // barText: {
//     //     color: '#000',
//     //     fontSize: 14,
//     // },
// })

// export default TopCustomer