import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, Button, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import urls from '../url/AppUrl'

const { DashUrl } = urls;

const TotalIssuedPdc = ({ setShowTotalIssuedPop }) => {

    const [issuedPdcData, setIssuedPdcData] = useState(null)

    const [cmpcode, setCmpCode] = useState(null)
    const [publick, setpublick] = useState(null)
    const [privatek, setprivatek] = useState(null)

    const [showLoader, setShowLoader] = useState(false)


    // let cmpcode = 'PENDULUM'
    // let privatek = '1F12412E-9F7D-4C6B-9622-F6BCA1694C12'

    // Initial date set to January 1, 2050
    const initialDate = new Date(2050, 0, 1);

    const [date, setDate] = useState(initialDate);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (selectedDate) => {
        setDate(selectedDate);
        hideDatePicker();
    };

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
        if (cmpcode && privatek) {
            setShowLoader(true)
            // Get today's date
            const today = new Date();

            // Format the date as 'MM-DD-YYYY'
            const formattedDateToday = format(today, 'MM-dd-yyyy');

            const initDate = format(date, 'MM-dd-yyyy')

            // console.log(formatteddate)
            const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=TOTAL_PDCI&s1=%27test%27&s2=%27test%27&s3=%27test%27&i1=100&i2=0&dt1=${formattedDateToday}&dt2=${initDate}`;
            console.log('totalIsuuedPdcUrl', url)
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    // Sort the data based on ChqDate in ascending order
                    const sortedData = data.slice().sort((a, b) => {
                        const dateA = new Date(a.ChqDate);
                        const dateB = new Date(b.ChqDate);
                        return dateA - dateB;
                    });

                    setIssuedPdcData(sortedData);
                    setShowLoader(false)
                })
                .catch(error => {
                    console.error('IssuedPDCError:', error)
                    setShowLoader(false)
                });
        }
    }, [date, cmpcode, privatek])

    const totalAmount = issuedPdcData && issuedPdcData.reduce((acc, item) => acc + item.Amount, 0);

    return (
        <ImageBackground style={styles.BankWrapper}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Image source={require('../dashImages/TotalIssued.png')} />

                <View>
                    <Button onPress={showDatePicker} title={format(date, 'MM-dd-yyyy')} />
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        date={date}
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                    />
                </View>
                {/* <TouchableOpacity onPress={() => setShowBankBalancePop(true)}>
                    <Image style={{ width: 16, height: 16 }} source={require('../dashImages/CompBurg.png')} />
                </TouchableOpacity> */}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <Text style={{ fontSize: 18 }}>Total Issued PDC</Text>
                <TouchableOpacity onPress={() => setShowTotalIssuedPop(true)}>
                    <Image style={{ width: 25, height: 25 }} source={require('../dashImages/ListButton.png')} />
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                {
                    showLoader &&
                    <ActivityIndicator />
                }
                {
                    !showLoader && !totalAmount &&
                    <Text style={{ fontSize: 14, fontWeight: 'light', color: 'red' }}>Some Error Occured</Text>
                }
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>{totalAmount && totalAmount.toFixed(2)}</Text>
                {/* <TouchableOpacity>
                    <Image style={{ width: 25, height: 25 }} source={require('../dashImages/chq.png')} />
                </TouchableOpacity> */}
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    BankWrapper: {
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F1E6E9',
        backgroundColor: 'white',
        borderRadius: 4,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    }
})

export default TotalIssuedPdc