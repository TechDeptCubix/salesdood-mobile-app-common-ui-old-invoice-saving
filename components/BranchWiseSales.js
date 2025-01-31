import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { format, addDays, subDays, addMonths, subMonths, addYears, subYears, lastDayOfMonth, lastDayOfYear, startOfYear, startOfMonth } from 'date-fns';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import urls from '../url/AppUrl'

const { DashUrl } = urls;


const BranchWiseSales = () => {

    const [showDateToggler, setShowDateToggler] = useState(false)

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [selectedDateTab, setSelectedDateTab] = useState('Day');

    const [deptSalesData, setDeptSalesData] = useState(null)

    const [cmpcode, setCmpCode] = useState(null)
    const [publick, setpublick] = useState(null)
    const [privatek, setprivatek] = useState(null)

    const [showLoader, setShowLoader] = useState(false)

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
            return format(selectedDate, 'MMMM');
        } else {
            return format(selectedDate, 'yyyy');
        }
    };

    useEffect(() => {
        console.log('tabChanged')
        setSelectedDate(new Date())
    }, [selectedDateTab, showDateToggler])


    useEffect(() => {

        if (cmpcode && privatek) {
            setShowLoader(true)
            if (selectedDateTab === 'Day') {
                const formattedDay = format(selectedDate, 'MM-dd-yyyy');
                const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOTAL_SALES&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formattedDay}&dt2=${formattedDay}`;

                console.log(url)
                axios.get(url)
                    .then(response => {
                        const data = response.data;
                        setDeptSalesData(data);
                        setShowLoader(false)

                        // const totalSales = data.reduce((acc, item) => acc + item.SALES_AMT, 0);
                        // const roundedTotalSales = totalSales.toFixed(2);
                        // if (roundedTotalSales) setTotalSales(roundedTotalSales);
                    })
                    .catch(error => {
                        console.error('DayToggelErr:', error)
                        setShowLoader(false)
                    });
            }

            if (selectedDateTab === 'Month') {
                const firstDayofMonth = startOfMonth(selectedDate)
                const lastDayOfMonthDate = lastDayOfMonth(selectedDate);
                const formatFirstdDay = format(firstDayofMonth, 'MM-dd-yyyy');
                const formatLastDay = format(lastDayOfMonthDate, 'MM-dd-yyyy');
                const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOTAL_SALES&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formatFirstdDay}&dt2=${formatLastDay}`;

                console.log(url)
                axios.get(url)
                    .then(response => {
                        const data = response.data;
                        setDeptSalesData(data);
                        setShowLoader(false)

                        // const totalSales = data.reduce((acc, item) => acc + item.SALES_AMT, 0);
                        // const roundedTotalSales = totalSales.toFixed(2);
                        // if (roundedTotalSales) setTotalSales(roundedTotalSales);
                    })
                    .catch(error => {
                        console.error('MonthToggelErr:', error)
                        setShowLoader(false)
                    });
            }

            if (selectedDateTab === 'Year') {
                const firstDayofYear = startOfYear(selectedDate)
                const lastDayOfYearDate = lastDayOfYear(selectedDate);
                const formatFirstdDay = format(firstDayofYear, 'MM-dd-yyyy');
                const formatLastDay = format(lastDayOfYearDate, 'MM-dd-yyyy');
                const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOTAL_SALES&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formatFirstdDay}&dt2=${formatLastDay}`;

                console.log(url)
                axios.get(url)
                    .then(response => {
                        const data = response.data;
                        setDeptSalesData(data);
                        setShowLoader(false)

                        // const totalSales = data.reduce((acc, item) => acc + item.SALES_AMT, 0);
                        // const roundedTotalSales = totalSales.toFixed(2);
                        // if (roundedTotalSales) setTotalSales(roundedTotalSales);
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

    // useEffect(() => {
    //     // setTotalSales(null)
    //     setDeptSales(null);

    //     // Get the current date
    //     const today = new Date();

    //     // Extract the components of the date (year, month, day)
    //     const year = today.getFullYear();
    //     const month = today.getMonth() + 1; // Months are zero-based, so add 1
    //     const day = today.getDate();

    //     // Format the date as a string (e.g., "YYYY-MM-DD")
    //     const formattedDate = `${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}-${year}`;
    //     // console.log(formattedDate);

    //     setTodayDate(formattedDate)

    //     const url = `https://cubixweberp.com:164/api/Dashboard/DashBoard?cmpcode=${cmpcode}&guid=${privatek}&mod=TOTAL_SALES&s1=%27%27&s2=%27%27&s3=%27%27&i1=100&i2=0&dt1=${formattedDate}&dt2=${formattedDate}`;
    //     // console.log(url)
    //     fetch(url)
    //         .then(response => response.json())
    //         .then((data) => {
    //             setSaleData(data)
    //             setDepSales(data);
    //             const totalSales = data.reduce((acc, item) => acc + item.SALES_AMT, 0);

    //             const roundedTotalSales = totalSales.toFixed(2);

    //             if (roundedTotalSales) setTotalSales(roundedTotalSales)
    //             // console.log(roundedTotalSales);
    //             if (data.length > 0) {
    //                 const firstItem = data[0];
    //                 const departmentColors = {
    //                     bgColor: firstItem.bgColor,
    //                     foreColor: firstItem.foreColor,
    //                     imgUrl: firstItem.imgUrl,
    //                 };

    //                 setDepartmentColors(departmentColors);
    //             }
    //         })
    //         .catch(error => console.error('Error:', error))
    // }, []);

    // console.log('selectedDate', selectedDate)

    // console.log('selectedDateTab', selectedDateTab)

    // console.log('deptSalesData', deptSalesData)

    return (
        <ImageBackground style={styles.CashWrapper}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                <Text style={{ fontSize: 18 }}>BranchWise Sales</Text>

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
                        <Image style={{ width: 16, height: 16 }} source={require('../images/CompBurg.png')} />
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

            <ScrollView nestedScrollEnabled={true} contentContainerStyle={{ width: '100%', alignItems: 'center' }}>
                <ScrollView horizontal={true}>
                    <View style={styles.TableContainer}>
                        <View style={styles.tableRow}>
                            <Text style={styles.headerCell}>Name</Text>
                            <Text style={styles.headerCell}>Todays Sales</Text>
                        </View>

                        {
                            deptSalesData && deptSalesData.length > 0 && deptSalesData.map((item, index) => (
                                <View style={styles.tableRow} key={index}>
                                    <Text style={styles.dataCell}>{item.DeptName}</Text>
                                    <Text style={styles.dataCell}>{item.SALES_AMT}</Text>
                                </View>

                            ))
                        }

                        {
                            showLoader &&

                            <ActivityIndicator />
                        }

                        {
                            !deptSalesData && !showLoader &&
                            <View>
                                <Text style={{
                                    color: 'red'
                                }}>No data available</Text>
                            </View>
                        }


                        {/* {cashBalanceData.map((item, index) => (
                            <View key={index} style={styles.row}>
                            <Text style={styles.cell}>{item.Account}</Text>
                            <Text style={styles.cell}>{item.Name}</Text>
                            <Text style={[styles.cell, styles.rightAlign]}>{item.BANK}</Text>
                            <Text style={styles.cell}>{item.Deptno.trim() !== '' ? item.Deptno : 'Nil'}</Text>
                            </View>
                        ))} */}
                    </View>
                </ScrollView>
            </ScrollView>

            {/* <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>123456</Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Image source={require('../images/TotalSale.png')} />
            </View> */}
        </ImageBackground >
    )
}

const styles = StyleSheet.create({
    CashWrapper: {
        width: '100%',
        paddingHorizontal: 12,
        paddingTop: 8,
        backgroundColor: 'white',
        borderRadius: 4,
        maxHeight: 500,
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
})

export default BranchWiseSales