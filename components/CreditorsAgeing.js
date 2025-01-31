import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { format, addDays, subDays, addMonths, subMonths, addYears, subYears } from 'date-fns';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { XAxis, YAxis } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import urls from '../url/AppUrl'

const { DashUrl } = urls;

// import PieChart from 'react-native-pie-chart'


const CreditorsAgeing = () => {

    const [creditorsData, setCreditorsData] = useState([]);

    const [graphData, setGraphData] = useState(null)

    const [labels, setLabels] = useState([]);

    const [dataPoints, setDataPoints] = useState([]);

    const [showLoader, setShowLoader] = useState(false)

    const [cmpcode, setCmpCode] = useState(null)
    const [publick, setpublick] = useState(null)
    const [privatek, setprivatek] = useState(null)

    // let cmpcode = 'PENDULUM'
    // let privatek = '1F12412E-9F7D-4C6B-9622-F6BCA1694C12'

    useEffect(() => {
        const fetchData = async () => {
            // Retrieve the selected company details from local storage
            const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

            // console.log('selectedCompanyString', selectedCompanyString)

            // Check if a selected company is stored in local storage
            if (selectedCompanyString) {
                const selectedCompany = JSON.parse(selectedCompanyString);

                // Access the company details and set them as states
                setCmpCode(selectedCompany.cmpcode);
                setpublick(selectedCompany.publick);
                setprivatek(selectedCompany.privatek);
            } else {
                // Handle the case where no selected company is found
                console.error("No selected company found in local storage");
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        if (labels.length > 0 && dataPoints.length > 0) {
            const data = {
                labels: labels && labels,
                datasets: [
                    {
                        data: dataPoints && dataPoints,
                        colors: [
                            (opacity = 1) => `#82ca9d`,
                            (opacity = 1) => `#82ca9d`,
                            (opacity = 1) => `#82ca9d`,
                            (opacity = 1) => `#82ca9d`,
                            (opacity = 1) => `#82ca9d`,
                        ]
                    }
                ]
            };

            setGraphData(data)
        }
    }, [labels, dataPoints])

    // const data = {
    //     labels: ["0-30", "31-60", "61-90", "91-120", "120+"],
    //     datasets: [
    //         {
    //             data: [20, 45, 28, 80, 99],
    //             colors: [
    //                 (opacity = 1) => `#82ca9d`,
    //                 (opacity = 1) => `#82ca9d`,
    //                 (opacity = 1) => `#82ca9d`,
    //                 (opacity = 1) => `#82ca9d`,
    //                 (opacity = 1) => `#82ca9d`,
    //             ]
    //         }
    //     ]
    // };

    // const hexValues = [
    //     '#FF6384',
    //     '#36A2EB',
    //     '#FFCE56',
    //     '#4BC0C0',
    //     '#9966FF',
    //     // '#FF9F40'
    // ];

    // const colors = data.datasets[0].data.map((_, index) => hexValues[index % hexValues.length]);

    // console.log(colors)

    const chartConfig = {
        backgroundColor: "white", // Set background color to white
        backgroundGradientFrom: "white", // Set background gradient from white
        backgroundGradientTo: "white", // Set background gradient to white
        decimalPlaces: 0, // optional, defaults to 2dp
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Set line and label color to black
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        // barColors: colors, // Set label color to black
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#000000" // Set dot stroke color to black
        }
    };

    const fetchDebtorsData = async () => {
        setShowLoader(true)
        try {
            const response = await fetch(`${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=CREDITORS_AGEING&s1=%27%27&s2=%27%27&s3=%27%27&i1=0&i2=0&dt1=11-DEC-2023&dt2=11-DEC-2023`);
            const data = await response.json();

            if (data && data.length > 0) {
                const firstEntry = data[0];
                const newLabels = [];
                const newDataPoints = [];

                for (const key in firstEntry) {
                    if (key !== "AMOUNT") {
                        newLabels.push(key);
                        newDataPoints.push(Math.abs(firstEntry[key]));
                    }
                }

                // Update state with new labels and data points
                setLabels(newLabels);
                setDataPoints(newDataPoints);
            }
            setCreditorsData(data);
            setShowLoader(false)
        } catch (error) {
            console.error('Error fetching debtors data:', error);
            setShowLoader(false)
        }
    };

    useEffect(() => {
        if (cmpcode && privatek) {
            fetchDebtorsData();
        }
    }, [cmpcode, privatek]);

    // console.log('creditorsData', creditorsData)

    // console.log(dataPoints, labels)

    // console.log('creditorsGrapghData', graphData)


    return (
        <View style={styles.CashWrapper}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                <Text style={{ fontSize: 18 }}>Creditors Ageing</Text>

            </View>


            <View style={{ marginTop: 12, marginBottom: 12 }}>

                {
                    showLoader &&
                    <ActivityIndicator size={180} color={'green'} />
                }

                {
                    !showLoader && creditorsData.length === 0 &&
                    <View>
                        <Text style={{
                            color: 'red'
                        }}>No data available</Text>
                    </View>
                }



                <ScrollView horizontal={true}>

                    {
                        creditorsData && creditorsData.length > 0 &&
                        <BarChart
                            // style={graphStyle}
                            data={graphData}
                            width={Dimensions.get("window").width}
                            height={350}
                            yAxisLabel=""
                            chartConfig={chartConfig}
                            verticalLabelRotation={0}
                            fromZero={true}
                            withCustomBarColorFromData={true}
                            flatColor={true}
                        />

                    }
                </ScrollView>

            </View>



        </View>
    )
}

const styles = StyleSheet.create({
    CashWrapper: {
        width: '100%',
        paddingHorizontal: 12,
        paddingTop: 8,
        backgroundColor: 'white',
        borderRadius: 4,
        // maxHeight: 500,
        // alignItems: 'center',
        // justifyContent: 'space-between',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    DateTogglerWrap: {
        backgroundColor: '#B5D8FF',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 4, marginTop: 4
    },
    closeIcon: {
        position: 'absolute',
        right: 0
    },
    DateToggle: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 0,
        paddingVertical: 12
    },
    LeftArrow: {
        position: 'absolute',
        left: 0
    },
    RightArrow: {
        position: "absolute",
        right: 0
    },
    TableContainer: {
        width: "100%",
        padding: 10,
        marginTop: 8
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    headerCell: {
        // flex: 1,
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 150
    },
    dataCell: {
        // flex: 1,
        backgroundColor: '#F3F3F3',
        padding: 10,
        textAlign: 'center',
        width: 150,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: 'white',
        color: "black"
    },


    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        marginBottom: 18
    },
    title: {
        fontSize: 24,
        margin: 10,
    },
})

export default CreditorsAgeing