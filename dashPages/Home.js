import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import BankBalance from '../components/BankBalance'
import CashBalance from '../components/CashBalance'
import TotalSales from '../components/TotalSales'
import BankBalancePop from '../dashPopups/BankBalancePop'
import CashBalancePop from '../dashPopups/CashBalancePop'
import TotalSalesTablePop from '../dashPopups/TotalSalesTablePop'
import TotalRecPdc from '../components/TotalRecPdc'
import TotalRecPop from '../dashPopups/TotalRecPop'
import TotalIssuedPdc from '../components/TotalIssuedPdc'
import TotalIssuedPop from '../dashPopups/TotalIssuedPop'
import Payables from '../components/Payables'
import BranchWiseSales from '../components/BranchWiseSales'
import TopSalesMan from '../components/TopSalesMan'
import TopGroups from '../components/TopGroups'
import TopGroupCodes from '../components/TopGroupCodes'
import TopCustomer from '../components/TopCustomer'
import TopSales from '../components/TopSales'
import DebtorsAgeing from '../components/DebtorsAgeing'
import CreditorsAgeing from '../components/CreditorsAgeing'
import ApprovalPop from '../dashPopups/ApprovalPop'
import CompanySelectPop from '../dashPopups/CompanySelectPop'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import PieChartComp from '../components/PieChart'


const Home = () => {

    const [showBankBalancePop, setShowBankBalancePop] = useState(false)
    const [showCashBalancePop, setShowCashBalancePop] = useState(false)
    const [showTotalSalesTablePop, setTotalSalesTablePop] = useState(false)
    const [showTotalRecPop, setShowTotalRecPop] = useState(false)
    const [showTotalIssuedPop, setShowTotalIssuedPop] = useState(false)

    const [bankBalanceList, setBankBalanceList] = useState(null)
    const [cashBalanceData, setCashBalanceData] = useState(null)
    const [salesData, setSalesData] = useState(null)


    const [showSidePanel, setShowSidePanel] = useState(false)
    const [showApprovals, setShowApprovals] = useState(false)
    const [showSwitchCmp, setShowSwitchCmp] = useState(false)


    const [selectedComponents, setSelectedComponents] = useState([]);

    const [showAll, setShowAll] = useState(false)

    const allComponents = [
        { name: 'BankBalance', component: <BankBalance setBankBalanceList={setBankBalanceList} setShowBankBalancePop={setShowBankBalancePop} /> },
        { name: 'CashBalance', component: <CashBalance setCashBalanceData={setCashBalanceData} setShowCashBalancePop={setShowCashBalancePop} /> },
        { name: 'TotalSales', component: <TotalSales setSalesData={setSalesData} setTotalSalesTablePop={setTotalSalesTablePop} /> },
        { name: 'TotalRecPdc', component: <TotalRecPdc setShowTotalRecPop={setShowTotalRecPop} /> },
        { name: 'TotalIssuedPdc', component: <TotalIssuedPdc setShowTotalIssuedPop={setShowTotalIssuedPop} /> },
        { name: 'Payables', component: <Payables /> },
        { name: 'BranchWiseSales', component: <BranchWiseSales /> },
        { name: 'TopGroups', component: <TopGroups /> },
        { name: 'TopGroupCodes', component: <TopGroupCodes /> },
        { name: 'TopSales', component: <TopSales /> },
        { name: 'TopCustomer', component: <TopCustomer /> },
        { name: 'DebtorsAgeing', component: <DebtorsAgeing /> },
        { name: 'CreditorsAgeing', component: <CreditorsAgeing /> },
        { name: 'TopSalesMan', component: <TopSalesMan /> }
    ];

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                try {
                    const storedData = await AsyncStorage.getItem('selectedComponents');
                    if (storedData !== null) {
                        setSelectedComponents(JSON.parse(storedData));
                    } else {
                        setShowAll(true);
                    }
                } catch (error) {
                    console.error('Error loading data:', error);
                }
            };

            loadData();
        }, [])
    );




    return (
        <SafeAreaView>

            <ScrollView scrollEnabled={!showSidePanel && !showApprovals} style={{ marginBottom: 12, backgroundColor: '#F1F1FB' }}>
                <Header
                    setShowSidePanel={setShowSidePanel}
                    showSidePanel={showSidePanel}
                    setShowApprovals={setShowApprovals}
                    showApprovals={showApprovals}
                    setShowSwitchCmp={setShowSwitchCmp}
                />

                {
                    showAll &&
                    <View style={styles.ScrollWrap}>


                        <View style={{ marginTop: 22, width: '50%', padding: 8 }}>
                            <BankBalance setBankBalanceList={setBankBalanceList} setShowBankBalancePop={setShowBankBalancePop} />
                        </View>

                        <View style={{ marginTop: 22, width: '50%', padding: 8 }}>
                            <CashBalance setCashBalanceData={setCashBalanceData} setShowCashBalancePop={setShowCashBalancePop} />
                        </View>

                        <View style={{ marginTop: 22, width: '90%' }}>
                            <TotalSales setSalesData={setSalesData} setTotalSalesTablePop={setTotalSalesTablePop} />
                        </View>

                        <View style={{ marginTop: 22, width: '90%' }}>
                            <TotalRecPdc setShowTotalRecPop={setShowTotalRecPop} />
                        </View>

                        <View style={{ marginTop: 22, width: '90%' }}>
                            <TotalIssuedPdc setShowTotalIssuedPop={setShowTotalIssuedPop} />
                        </View>

                        <View style={{ marginTop: 22, width: '90%' }}>
                            <Payables />
                        </View>

                        <View style={{ marginTop: 22, width: '90%' }}>
                            <BranchWiseSales />
                        </View>

                        <View style={{ marginTop: 22, width: '90%' }}>
                            <TopGroups />
                        </View>

                        <View style={{ marginTop: 22, width: '90%' }}>
                            <TopGroupCodes />
                        </View>

                        <View style={{ marginTop: 22, width: '90%' }}>
                            <TopSales />
                        </View>

                        <View style={{ marginTop: 22, width: '90%' }}>
                            <TopCustomer />
                        </View>

                        <View style={{ marginTop: 22, width: '90%' }}>
                            <DebtorsAgeing />
                        </View>

                        <View style={{ marginTop: 22, width: '90%' }}>
                            <CreditorsAgeing />
                        </View>

                        <View style={{ marginBottom: 56, width: '90%' }}>
                            <TopSalesMan />
                        </View>

                    </View>
                }

                {
                    selectedComponents && selectedComponents.length > 0 && (
                        <View style={styles.ScrollWrap}>
                            {selectedComponents.map((componentName, index) => {
                                const selectedComponent = allComponents.find(comp => comp.name === componentName);

                                // console.log('selectedComponent', selectedComponent.name)
                                if (selectedComponent.name !== 'BankBalance' && selectedComponent.name !== 'CashBalance') {
                                    return (
                                        <View style={{ marginTop: 22, width: '90%' }} key={index}>
                                            {selectedComponent.component}
                                        </View>
                                    );
                                }
                                if (selectedComponent.name === 'BankBalance' || selectedComponent.name === 'CashBalance') {
                                    return (
                                        <View style={{ marginTop: 22, width: '50%', padding: 8 }} key={index}>
                                            {selectedComponent.component}
                                        </View>
                                    );
                                }
                                return null;
                            })}
                        </View>
                    )
                }

                {/* <View style={styles.ScrollWrap}>
                    <View style={{ marginTop: 22, width: '90%' }}>
                        <PieChartComp />
                    </View>
                </View> */}


            </ScrollView>

            {/* component Pop */}

            {
                showBankBalancePop &&
                <BankBalancePop bankBalanceList={bankBalanceList} setShowBankBalancePop={setShowBankBalancePop} />
            }

            {
                showCashBalancePop &&
                <CashBalancePop cashBalanceData={cashBalanceData} setShowCashBalancePop={setShowCashBalancePop} />
            }

            {
                showTotalSalesTablePop &&
                <TotalSalesTablePop salesData={salesData} setTotalSalesTablePop={setTotalSalesTablePop} />
            }

            {
                showTotalRecPop &&
                <TotalRecPop setShowTotalRecPop={setShowTotalRecPop} />
            }

            {
                showTotalIssuedPop &&
                <TotalIssuedPop setShowTotalIssuedPop={setShowTotalIssuedPop} />
            }

            {/* component Pop */}


            {/* HeaderPop */}

            {
                showApprovals &&

                <ApprovalPop
                    setShowApprovals={setShowApprovals}
                    showApprovals={showApprovals}
                />
            }

            {
                showSwitchCmp &&
                <CompanySelectPop setShowSwitchCmp={setShowSwitchCmp} />
            }

            {/* HeaderPop */}


        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    ScrollWrap: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

        flexWrap: 'wrap',

        minHeight: Dimensions.get('window').height
        // marginBottom: 14,
        // height: 400
    },

})

export default Home