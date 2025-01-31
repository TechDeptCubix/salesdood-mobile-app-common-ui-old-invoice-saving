import { View, Text, ImageBackground, StyleSheet, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import urls from '../url/AppUrl'

const { DashUrl } = urls;

const Payables = () => {

    const [debtorsData, setDebtorsData] = useState([]);
    const [creditorsData, setCreditorsData] = useState([]);
    const [credTotal, setCredTotal] = useState(null)
    const [debTotal, setDebTotal] = useState(null)
    const [cashBalanceData, setCashBalanceData] = useState(null)
    const [cashBalance, setCashBalance] = useState(null)
    const [total, setTotal] = useState(null)

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
        const fetchDebtorsData = async () => {
            try {
                const response = await axios.get(`${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=DEBTORS_AGEING&s1=%27%27&s2=%27%27&s3=%27%27&i1=0&i2=0&dt1=11-DEC-2023&dt2=11-DEC-2023`);
                const data = response.data;
                setDebtorsData(data);
                setDebTotal(data[0]?.AMOUNT);
            } catch (error) {
                console.error('Error fetching debtors data:', error);
            }
        };

        const fetchCreditorsData = async () => {
            try {
                const response = await axios.get(`${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=CREDITORS_AGEING&s1=%27%27&s2=%27%27&s3=%27%27&i1=0&i2=0&dt1=11-DEC-2023&dt2=11-DEC-2023`);
                const data = response.data;
                setCreditorsData(data);
                setCredTotal(Math.abs(data[0]?.AMOUNT));
            } catch (error) {
                console.error('Error fetching creditors data:', error);
            }
        };

        if (cmpcode && privatek) {
            fetchDebtorsData();
            fetchCreditorsData();
        }

    }, [cmpcode, privatek]);

    useEffect(() => {
        const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=BANKBALANCE&s1=%27test%27&s2=%27test%27&s3=%27test%27&i1=100&i2=0&dt1=1-1-2022&dt2=1-1-2022`;

        console.log('payablesUrl', url)

        axios.get(url)
            .then((response) => {
                const data = response.data;
                setCashBalanceData(data);
                calculateTotalCash(data);
            })
            .catch((error) => console.error("Error:", error));
    }, [cmpcode, privatek]);

    const calculateTotalCash = (data) => {
        if (data) {
            const totalCash = data.reduce((sum, item) => sum + item.BANK, 0);
            const formattedTotalCash = totalCash.toFixed(2);
            setCashBalance(formattedTotalCash);
        }
    };

    useEffect(() => {
        const calculateTotal = (credTotal, debTotal, cashBalance) => {
            // Parse the string values to numbers using parseFloat
            const numericCred = parseFloat(credTotal) || 0;
            const numericDeb = parseFloat(debTotal) || 0;
            const numericCashBalance = parseFloat(cashBalance) || 0;

            // Perform the calculations
            const total = numericCred - numericDeb + numericCashBalance;

            // Format the total to fixed 2 decimal places
            const formattedTotal = total.toFixed(2);

            // Set the state with the calculated total
            setTotal(formattedTotal);
        };

        calculateTotal(credTotal, debTotal, cashBalance)
    }, [credTotal, debTotal, cashBalance])
    return (
        <ImageBackground style={styles.PayableWrapper} source={require('../dashImages/bg_payables.png')}>
            <View style={styles.ViewCont}>

                <Text style={styles.TextStyle}>Payables</Text>
                {
                    credTotal &&
                    <Text style={styles.NumberStyle}>{credTotal && credTotal}</Text>
                }
                {
                    !credTotal &&
                    <Text style={{ color: 'red', fontSize: 14, fontWeight: 'light' }}>No data available</Text>
                }

                <Image style={styles.Image} source={require('../dashImages/minus.png')} />

                <Text style={styles.TextStyle}>Receivables</Text>
                {
                    debTotal &&
                    <Text style={styles.NumberStyle}>{debTotal && debTotal}</Text>
                }
                {
                    !debTotal &&
                    <Text style={{ color: 'red', fontSize: 14, fontWeight: 'light' }}>No data available</Text>
                }


                <Image style={styles.Image} source={require('../dashImages/plus.png')} />

                <Text style={styles.TextStyle}>Cash & Bank</Text>
                {
                    cashBalance &&
                    <Text style={styles.NumberStyle}>{cashBalance && cashBalance}</Text>
                }
                {
                    !cashBalance &&
                    <Text style={{ color: 'red', fontSize: 14, fontWeight: 'light' }}>No data available</Text>
                }


                <Image style={styles.Image} source={require('../dashImages/equal.png')} />

                <Text style={styles.TextStyle}>Balance</Text>
                <Text style={styles.NumberStyle}>{total && total}</Text>

            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    PayableWrapper: {
        width: '100%',
        // paddingHorizontal: 12,
        // paddingVertical: 8,
        // backgroundColor: '#FFEB38',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    ViewCont: {
        marginTop: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    TextStyle: {
        color: 'white',
        fontStyle: 'italic',
        fontSize: 18,
        marginBottom: 12
    },
    NumberStyle: {
        color: 'white',
        fontSize: 20,
        marginBottom: 12
    },
    Image: {
        margin: 12,
        width: 25,
        height: 25
    }
})

export default Payables