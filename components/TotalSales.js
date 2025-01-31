import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { format, addDays, subDays, addMonths, subMonths, addYears, subYears, lastDayOfMonth, lastDayOfYear, startOfYear } from 'date-fns';
import axios from 'axios'
import { startOfMonth } from 'date-fns/startOfMonth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import urls from '../url/AppUrl'

const { DashUrl } = urls;

const TotalSales = ({ setTotalSalesTablePop, setSalesData }) => {

    const [showDateToggler, setShowDateToggler] = useState(false)

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [selectedDateTab, setSelectedDateTab] = useState('Day');

    const [totalSales, setTotalSales] = useState(null)

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
            const lastDayOfMonthDate = lastDayOfMonth(selectedDate);
            console.log('lastDayOfMonthDate', lastDayOfMonthDate)
            return format(selectedDate, 'MMMM');
        } else {
            const lastDayOfYearDate = lastDayOfYear(selectedDate);
            console.log('lastDayOfYearDate', lastDayOfYearDate)
            return format(selectedDate, 'yyyy');
        }
    };

    useEffect(() => {
        // console.log('tabChanged')
        setSelectedDate(new Date())
    }, [selectedDateTab, showDateToggler])

    useEffect(() => {

        if (cmpcode && privatek) {
            if (selectedDateTab === 'Day') {
                setShowLoader(true)
                const formattedDay = format(selectedDate, 'MM-dd-yyyy');
                const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOTAL_SALES&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formattedDay}&dt2=${formattedDay}`;
                console.log('DayToggelUrl', url)
                axios.get(url)
                    .then(response => {
                        const data = response.data;
                        // console.log(data)
                        setSalesData(data);
                        const totalSales = data.reduce((acc, item) => acc + item.SALES_AMT, 0);
                        const roundedTotalSales = totalSales.toFixed(2);
                        if (roundedTotalSales) setTotalSales(roundedTotalSales);
                        setShowLoader(false)
                    })
                    .catch(error => {
                        console.error('DayToggelErr:', error)
                        setShowLoader(false)
                    });
            }

            if (selectedDateTab === 'Month') {
                setShowLoader(true)
                const firstDayofMonth = startOfMonth(selectedDate)
                const lastDayOfMonthDate = lastDayOfMonth(selectedDate);
                const formatFirstdDay = format(firstDayofMonth, 'MM-dd-yyyy');
                const formatLastDay = format(lastDayOfMonthDate, 'MM-dd-yyyy');
                const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOTAL_SALES&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formatFirstdDay}&dt2=${formatLastDay}`;

                console.log('MonthToggel', url)
                axios.get(url)
                    .then(response => {
                        const data = response.data;
                        setSalesData(data);
                        const totalSales = data.reduce((acc, item) => acc + item.SALES_AMT, 0);
                        const roundedTotalSales = totalSales.toFixed(2);
                        if (roundedTotalSales) setTotalSales(roundedTotalSales);
                        setShowLoader(false)
                    })
                    .catch(error => {
                        console.error('MonthToggelErr:', error)
                        setShowLoader(false)
                    });
            }

            if (selectedDateTab === 'Year') {
                setShowLoader(true)
                const firstDayofYear = startOfYear(selectedDate)
                const lastDayOfYearDate = lastDayOfYear(selectedDate);
                const formatFirstdDay = format(firstDayofYear, 'MM-dd-yyyy');
                const formatLastDay = format(lastDayOfYearDate, 'MM-dd-yyyy');
                const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOTAL_SALES&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formatFirstdDay}&dt2=${formatLastDay}`;

                console.log('YearToggel', url)
                axios.get(url)
                    .then(response => {
                        const data = response.data;
                        setSalesData(data);
                        const totalSales = data.reduce((acc, item) => acc + item.SALES_AMT, 0);
                        const roundedTotalSales = totalSales.toFixed(2);
                        if (roundedTotalSales) setTotalSales(roundedTotalSales);
                        setShowLoader(false)
                    })
                    .catch(error => {
                        console.error('YearToggelErr:', error)
                        setShowLoader(false)
                    });
            }
        }

    }, [selectedDateTab, selectedDate, cmpcode, privatek]);

    useEffect(() => {
        if (showDateToggler === false) {
            setSelectedDateTab('Day')
            setSelectedDate(new Date())
        }
    }, [showDateToggler])

    // console.log('selectedDate', selectedDate)

    // console.log('showLoader', showLoader)

    // console.log('selectedDateTab', selectedDateTab)

    return (
        <ImageBackground style={styles.CashWrapper}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                <Text style={{ fontSize: 18 }}>Total Sales</Text>

                <View style={{ width: '35%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                    <TouchableOpacity onPress={() => setShowDateToggler(!showDateToggler)} style={{ backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: 'green' }}>Todays</Text>
                        {
                            showDateToggler ?
                                <Image style={{ width: 18, height: 18 }} source={require('../dashImages/dropUp.png')} /> :
                                <Image style={{ width: 18, height: 18 }} source={require('../dashImages/dropDown.png')} />
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setTotalSalesTablePop(true)}>
                        <Image style={{ width: 16, height: 16 }} source={require('../dashImages/CompBurg.png')} />
                    </TouchableOpacity>

                </View>

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

            <View style={{ marginTop: 8, paddingVertical: 12 }}>

                {
                    showLoader &&
                    <ActivityIndicator />
                }

                {
                    !showLoader && totalSales &&
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>
                        {totalSales}
                    </Text>
                }

                {
                    totalSales === null && showLoader === false &&
                    <Text style={{ fontSize: 14, fontWeight: 'light', color: 'red' }}>
                        Some Error Occured
                    </Text>
                }
                {/* <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>
                    {
                        showLoader ?
                            <ActivityIndicator /> :
                            totalSales
                    }

                    {
                        totalSales === null && showLoader === false &&
                        'No Data Available'
                    }
                </Text> */}
            </View>

            {/* <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Image source={require('../dashImages/TotalSale.png')} />
            </View> */}
        </ImageBackground >
    )
}

const styles = StyleSheet.create({
    CashWrapper: {
        width: '100%',
        paddingHorizontal: 12,
        paddingTop: 8,
        backgroundColor: '#B2FEA8',
        borderRadius: 4,

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
    }
})

export default TotalSales