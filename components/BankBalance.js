import { View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import urls from '../url/AppUrl'

const { DashUrl } = urls;

const BankBalance = ({ setShowBankBalancePop, setBankBalanceList }) => {

    // const [cashBalanceData, setCashBalanceData] = useState(null)
    const [bankBalance, setBankBalance] = useState(null)

    const [showLoader, setShowLoader] = useState(false)

    const [cmpcode, setCmpCode] = useState(null)
    const [publick, setpublick] = useState(null)
    const [privatek, setprivatek] = useState(null)

    const [apiError, setApiError] = useState('')



    // let cmpcode = 'PENDULUM'
    // let privatek = '1F12412E-9F7D-4C6B-9622-F6BCA1694C12'

    console.log('DashUrl', DashUrl)


    useEffect(() => {
        const fetchData = async () => {
            // Retrieve the selected company details from local storage
            const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

            const userDataArray = await AsyncStorage.getItem('userDataArray')

            console.log('userDataArray', userDataArray)

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

        setShowLoader(true)

        const fetchBankBalanceData = async () => {
            const url = `${DashUrl}?cmpcode=${cmpcode}&guid=${privatek}&mod=BANKBALANCE&s1=%27test%27&s2=%27test%27&s3=%27test%27&i1=100&i2=0&dt1=1-1-2022&dt2=1-1-2022`

            console.log('BankBalanceurl', url)

            try {
                // console.log('bankBALANCEAPIRUN')
                const response = await axios.get(url)

                // console.log('BankBalanceRes', response.data)

                if (response.status === 200) {
                    // console.log('BankBalanceRes', response.data)
                    setBankBalanceList(response.data);
                    calculateTotalCash(response.data);
                    setShowLoader(false)
                }
            } catch (error) {
                console.log('bankblceerror', error)
                setShowLoader(false)
                setApiError('Some Error Occured')
            }
        }

        if (cmpcode && privatek) {
            fetchBankBalanceData()
        }

    }, [cmpcode, privatek])

    const calculateTotalCash = (data) => {
        if (data) {
            const totalCash = data.reduce((sum, item) => sum + item.BANK, 0);
            const formattedTotalCash = totalCash.toFixed(2);
            setBankBalance(formattedTotalCash);
        }
    };

    return (
        // <ImageBackground style={styles.BankWrapper} source={require('../images/BankBg.png')}>

        //     <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        //         <Text style={{ fontSize: 20 }}>Bank Balance</Text>
        //         <TouchableOpacity onPress={() => setShowBankBalancePop(true)}>
        //             <Image style={{ width: 16, height: 16 }} source={require('../images/CompBurg.png')} />
        //         </TouchableOpacity>
        //     </View>

        //     <View style={{ marginTop: 8 }}>
        //         {
        //             showLoader &&
        //             <ActivityIndicator size='small' />
        //         }
        //         <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{bankBalance && bankBalance}</Text>
        //     </View >

        //     <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        //         <Image source={require('../images/BankImg.png')} />
        //     </View>
        // </ImageBackground >

        <View style={styles.BankWrapper}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 18 }}>Bank Balance</Text>

                {
                    bankBalance &&
                    <TouchableOpacity onPress={() => setShowBankBalancePop(true)}>
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
                    !showLoader && apiError && !bankBalance &&
                    <Text style={{ fontSize: 14, fontWeight: 'light', color: 'red' }}>{apiError}</Text>
                }
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>{bankBalance && bankBalance}</Text>
            </View >
        </View>
    )
}

const styles = StyleSheet.create({
    BankWrapper: {
        width: '100%',
        paddingHorizontal: 12,
        paddingTop: 8,
        backgroundColor: '#FFEB38',
        backgroundColor: 'white',
        borderRadius: 4,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    }
})

export default BankBalance