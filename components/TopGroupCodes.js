import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { format, addDays, subDays, addMonths, subMonths, addYears, subYears, lastDayOfMonth, lastDayOfYear, startOfYear, startOfMonth } from 'date-fns';
// import PieChart from 'react-native-pie-chart'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import urls from '../url/AppUrl'

const { DashUrl } = urls;



const TopGroupCodes = () => {

    const [grpData, setGrpData] = useState(null)
    const [series, setSeries] = useState(null)
    const [grpNames, setGrpNames] = useState(null)

    const [showLoader, setShowLoader] = useState(false)

    const [cmpcode, setCmpCode] = useState(null)
    const [publick, setpublick] = useState(null)
    const [privatek, setprivatek] = useState(null)

    const [showNoData, setShowNoData] = useState(false)

    const [showToolTip, setShowToolTip] = useState(false)

    const [tipValue, setTipValue] = useState()

    const [pieData, setPieData] = useState(null)

    const [colorIndex, setColorIndex] = useState()

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

    const handleSlicePress = (value, index) => {
        console.log('value', value)
        setShowToolTip(true)
        setTipValue(value)
        setColorIndex(index)
    };

    const widthAndHeight = 200
    // const series = [123, 321, 123, 789, 537]
    const sliceColor = ['#fbd203', '#ffb300', '#ff9100', '#ff6c00', '#ff3c00']

    const hexValues = [
        '#FF6384',
        '#36A2EB',
        // '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
    ];

    // const data = [
    //     'Group1',
    //     'Group2',
    //     'Group3',
    //     'Group4',
    //     'Group5',
    // ]

    useEffect(() => {
        if (grpData) {
            const data = grpData.map(item => item.CODE); // Extract group names
            const series = grpData.map(item => Math.abs(item.QTY)); // Extract quantity values

            setSeries(series)
            setGrpNames(data)
            // console.log(data);
            // console.log(series);
        }
    }, [grpData])

    useEffect(() => {
        if (series) {
            const pieData = series.map((value, index) => ({
                value,
                svg: {
                    fill: hexValues[index % hexValues.length], // Cycle through colors
                    onPress: () => handleSlicePress(value, index),
                },
                key: `pie-${index}`,
            }));

            pieData && setPieData(pieData)
        }
    }, [series])


    const [showDateToggler, setShowDateToggler] = useState(false)

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [selectedDateTab, setSelectedDateTab] = useState('Day');

    const decreaseDay = () => {
        if (selectedDateTab === 'Day') {
            const newDate = subDays(selectedDate, 1);
            setSelectedDate(newDate);
        }
    };

    const increaseDay = () => {
        if (selectedDateTab === 'Day') {
            const newDate = addDays(selectedDate, 1);
            if (newDate <= new Date()) {
                setSelectedDate(newDate);
            }
        }
    };

    const decreaseMonth = () => {
        if (selectedDateTab === 'Month') {
            const newDate = subMonths(selectedDate, 1);
            setSelectedDate(newDate);
        }
    };

    const increaseMonth = () => {
        if (selectedDateTab === 'Month') {
            const newDate = addMonths(selectedDate, 1);
            if (newDate <= new Date()) {
                setSelectedDate(newDate);
            }
        }
    };

    const decreaseYear = () => {
        if (selectedDateTab === 'Year') {
            const newDate = subYears(selectedDate, 1);
            setSelectedDate(newDate);
        }
    };

    const increaseYear = () => {
        if (selectedDateTab === 'Year') {
            const newDate = addYears(selectedDate, 1);
            if (newDate <= new Date()) {
                setSelectedDate(newDate);
            }
        }
    };

    const formatDate = () => {
        if (selectedDateTab === 'Day') {
            return format(selectedDate, 'MM-dd-yyyy');
        } else if (selectedDateTab === 'Month') {
            return format(selectedDate, 'MMMM');
        } else {
            return format(selectedDate, 'yyyy');
        }
    };

    useEffect(() => {

        if (cmpcode && privatek) {
            setShowLoader(true)
            setShowNoData(false)
            setTipValue()
            if (selectedDateTab === 'Day') {
                const formattedDay = format(selectedDate, 'MM-dd-yyyy');
                const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOP_PRODUCTS&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formattedDay}&dt2=${formattedDay}`;

                console.log('topGrpUrl', url)
                axios.get(url)
                    .then(response => {
                        const data = response.data;

                        if (data.length > 0) {
                            setGrpData(data)
                            setShowLoader(false)
                        } else {
                            setShowNoData(true)
                            setShowLoader(false)
                        }

                    })
                    .catch(error => {
                        console.error('DayToggelErr:', error)
                        setShowLoader(false)
                        setShowNoData(true)
                    });
            }

            if (selectedDateTab === 'Month') {
                const firstDayofMonth = startOfMonth(selectedDate)
                const lastDayOfMonthDate = lastDayOfMonth(selectedDate);
                const formatFirstdDay = format(firstDayofMonth, 'MM-dd-yyyy');
                const formatLastDay = format(lastDayOfMonthDate, 'MM-dd-yyyy');
                const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOP_PRODUCTS&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formatFirstdDay}&dt2=${formatLastDay}`;

                // console.log(url)
                axios.get(url)
                    .then(response => {
                        const data = response.data;

                        if (data.length > 0) {
                            setGrpData(data)
                            setShowLoader(false)
                        } else {
                            setShowNoData(true)
                            setShowLoader(false)
                        }
                    })
                    .catch(error => {
                        console.error('MonthToggelErr:', error)
                        setShowLoader(false)
                        setShowNoData(true)
                    });
            }

            if (selectedDateTab === 'Year') {
                const firstDayofYear = startOfYear(selectedDate)
                const lastDayOfYearDate = lastDayOfYear(selectedDate);
                const formatFirstdDay = format(firstDayofYear, 'MM-dd-yyyy');
                const formatLastDay = format(lastDayOfYearDate, 'MM-dd-yyyy');
                const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOP_PRODUCTS&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formatFirstdDay}&dt2=${formatLastDay}`;

                // console.log(url)
                axios.get(url)
                    .then(response => {
                        const data = response.data;

                        if (data.length > 0) {
                            setGrpData(data)
                            setShowLoader(false)
                        } else {
                            setShowNoData(true)
                            setShowLoader(false)
                        }
                    })
                    .catch(error => {
                        console.error('YearToggelErr:', error)
                        setShowLoader(false)
                        setShowNoData(true)
                    });
            }
        }

    }, [selectedDateTab, selectedDate, cmpcode, privatek]);

    useEffect(() => {
        console.log('tabChanged')
        setSelectedDate(new Date())
        setShowNoData(false)

    }, [selectedDateTab, showDateToggler])

    useEffect(() => {
        if (showDateToggler === false) {

            setSelectedDate(new Date())
            setSelectedDateTab('Day')
            console.log('selectedDateTab', selectedDateTab)
        }
    }, [showDateToggler])

    // console.log('selectedDate', selectedDate)

    // console.log('selectedDateTab', selectedDateTab)

    return (
        <View style={styles.CashWrapper}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                <Text style={{ fontSize: 18 }}>Top 5 Groups Codes</Text>

                <TouchableOpacity onPress={() => setShowDateToggler(!showDateToggler)} style={{ backgroundColor: 'green', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'white' }}>Today</Text>
                    {
                        showDateToggler ?
                            <Image style={{ width: 18, height: 18 }} source={require('../dashImages/dropUp.png')} /> :
                            <Image style={{ width: 18, height: 18 }} source={require('../dashImages/dropDown.png')} />
                    }
                </TouchableOpacity>


                {/* <View style={{ width: '35%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>


                    <TouchableOpacity onPress={() => setTotalSalesTablePop(true)}>
                        <Image style={{ width: 16, height: 16 }} source={require('../dashImages/CompBurg.png')} />
                    </TouchableOpacity>

                </View> */}

            </View>

            {
                showDateToggler &&
                <View style={styles.DateTogglerWrap}>

                    <View style={{ width: '100%', flexDirection: "row", justifyContent: 'center' }}>

                        <Text style={{ fontSize: 18 }}>{formatDate()}</Text>

                        <TouchableOpacity onPress={() => setShowDateToggler(false)} style={styles.closeIcon}>
                            <Image style={{ width: 20, height: 20 }} source={require('../dashImages/close.png')} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.DateToggle}>

                        <TouchableOpacity onPress={() => setSelectedDateTab('Day')} style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: selectedDateTab === 'Day' ? 'white' : '#B5D8FF',
                            padding: 12,
                            width: '30%'
                        }}>
                            <TouchableOpacity style={styles.LeftArrow} onPress={decreaseDay}>
                                <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Day' ? 'block' : 'none' }} source={require('../dashImages/LeftArrow.png')} />
                            </TouchableOpacity>
                            <Text>Day</Text>
                            <TouchableOpacity style={styles.RightArrow} onPress={increaseDay}>
                                <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Day' ? 'block' : 'none' }} source={require('../dashImages/rightArrow.png')} />
                            </TouchableOpacity>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setSelectedDateTab('Month')} style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: selectedDateTab === 'Month' ? 'white' : '#B5D8FF',
                            padding: 12,
                            width: '30%'
                        }}>
                            <TouchableOpacity style={styles.LeftArrow} onPress={decreaseMonth}>
                                <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Month' ? 'block' : 'none' }} source={require('../dashImages/LeftArrow.png')} />
                            </TouchableOpacity>
                            <Text>Month</Text>
                            <TouchableOpacity style={styles.RightArrow} onPress={increaseMonth}>
                                <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Month' ? 'block' : 'none' }} source={require('../dashImages/rightArrow.png')} />
                            </TouchableOpacity>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setSelectedDateTab('Year')} style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: selectedDateTab === 'Year' ? 'white' : '#B5D8FF',
                            padding: 12,
                            width: '30%'
                        }}>
                            <TouchableOpacity style={styles.LeftArrow} onPress={decreaseYear}>
                                <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Year' ? 'block' : 'none' }} source={require('../dashImages/LeftArrow.png')} />
                            </TouchableOpacity>
                            <Text>Year</Text>
                            <TouchableOpacity style={styles.RightArrow} onPress={increaseYear}>
                                <Image style={{ width: 20, height: 20, display: selectedDateTab === 'Year' ? 'block' : 'none' }} source={require('../dashImages/rightArrow.png')} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                </View>
            }


            <View style={styles.container}>


                {
                    showNoData && !showLoader &&
                    <View>
                        <Text style={{
                            color: 'red'
                        }}>No Data Available</Text>
                    </View>
                }

                
                {
                    showLoader === true &&
                    <ActivityIndicator size={180} color={'green'} />
                }

                {
                    showToolTip && tipValue &&

                    <View style={[styles.tooltipContainer, { backgroundColor: `${hexValues[colorIndex]}` }]}>
                        <Text style={{ color: 'white' }}>{tipValue}</Text>
                    </View>
                }


            </View>

            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                {
                    showNoData === false &&
                    grpNames &&
                    grpNames.map((item, index) => (
                        <View key={index} style={{ width: 'auto', flexDirection: 'row', alignItems: 'center', marginBottom: 12, margin: 6 }}>
                            <View style={{ width: 25, height: 25, borderRadius: 50, backgroundColor: hexValues[index] }}></View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={{ fontSize: 13 }}>
                                    {item}
                                </Text>
                            </View>
                        </View>
                    ))
                }
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

    tooltipContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        top: '45%',
        left: '44%',
        padding: 6,
        // backgroundColor: '#2887F3',
        borderRadius: 4
        // transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    },
})

export default TopGroupCodes