import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import urls from '../url/AppUrl'

const { DashUrl } = urls;


const CashBalance = ({ setShowCashBalancePop, setCashBalanceData }) => {

    const [cashBalance, setCashBalance] = useState(null)

    const [showLoader, setShowLoader] = useState(false)

    const [cmpcode, setCmpCode] = useState(null)
    const [publick, setpublick] = useState(null)
    const [privatek, setprivatek] = useState(null)

    const [apiError, setApiError] = useState('')


    // let cmpcode = 'PENDULUM'
    // let privatek = '1F12412E-9F7D-4C6B-9622-F6BCA1694C12'


    useEffect(() => {
        const fetchData = async () => {
            // Retrieve the selected company details from local storage
            const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

            console.log('selectedCompanyString', selectedCompanyString)

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
        const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=CASHBALANCE&s1=%27test%27&s2=%27test%27&s3=%27test%27&i1=100&i2=0&dt1=1-1-2022&dt2=1-1-2022`

        console.log('CashBalanceurl', url)
        setShowLoader(true)

        const fetchBankBalanceData = async () => {

            try {
                // console.log('CashBALANCEAPIRUN')
                const response = await axios.get(url)

                // console.log('CashBalanceRes', response.data)

                if (response.status === 200) {
                    // console.log('CashBalanceRes', response.data)
                    setCashBalanceData(response.data);
                    calculateTotalCash(response.data);
                    setShowLoader(false)
                }
            } catch (error) {
                console.log('cashblceerror', error)
                setShowLoader(false)
                setApiError('Some Error Occured')
            }
        }

        if (cmpcode && privatek) {
            fetchBankBalanceData()
        }

        // fetch(url)
        //     .then((response) => response.json())
        //     .then((data) => {
        //         setCashBalanceData(data);
        //         calculateTotalCash(data);

        //         if (data.length > 0) {
        //             const firstItem = data[0];
        //             const departmentColors = {
        //                 bgColor: firstItem.bgColor,
        //                 foreColor: firstItem.foreColor,
        //                 imgUrl: firstItem.imgUrl,
        //             };

        //             setDepartmentColors(departmentColors);
        //         }
        //     })
        //     .catch((error) => console.error("Error:", error));
    }, [cmpcode, privatek])

    const calculateTotalCash = (data) => {
        if (data) {
            const totalCash = data.reduce((sum, item) => sum + item.CASH, 0);
            const formattedTotalCash = totalCash.toFixed(2);
            setCashBalance(formattedTotalCash);
        }
    };

    return (
        // <ImageBackground style={styles.CashWrapper}>

        //     <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        //         <Text style={{ fontSize: 20 }}>Cash Balance</Text>
        //         <TouchableOpacity onPress={() => setShowCashBalancePop(true)}>
        //             <Image style={{ width: 16, height: 16 }} source={require('../images/CompBurg.png')} />
        //         </TouchableOpacity>
        //     </View>

        //     <View style={{ marginTop: 8 }}>
        //         {
        //             showLoader &&
        //             <ActivityIndicator size='small' />
        //         }
        //         <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{cashBalance && cashBalance}</Text>
        //     </View>

        //     <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        //         <Image source={require('../images/CashBalance.png')} />
        //     </View>
        // </ImageBackground>


        <View style={styles.CashWrapper}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 18 }}>Cash Balance</Text>
                {
                    cashBalance &&
                    <TouchableOpacity onPress={() => setShowCashBalancePop(true)}>
                        <Image style={{ width: 16, height: 16 }} source={require('../dashImages/CompBurg.png')} />
                    </TouchableOpacity>
                }
            </View>

            <View style={{ marginTop: 8, paddingVertical: 12 }}>
                {
                    showLoader &&
                    <ActivityIndicator size='small' />
                }
                {
                    !showLoader && apiError && !cashBalance &&
                    <Text style={{ fontSize: 14, fontWeight: 'light', color: 'red' }}>{apiError}</Text>
                }
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>{cashBalance && cashBalance}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    CashWrapper: {
        width: '100%',
        paddingHorizontal: 12,
        paddingTop: 8,
        backgroundColor: '#ABA2E5',
        backgroundColor: 'white',
        borderRadius: 4,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    }
})

export default CashBalance