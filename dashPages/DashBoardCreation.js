import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native'
import CheckBox from '@react-native-community/checkbox';
import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import ApprovalPop from '../dashPopups/ApprovalPop'
import CompanySelectPop from '../dashPopups/CompanySelectPop'
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


const DashBoardCreation = () => {

    const [showSidePanel, setShowSidePanel] = useState(false)
    const [showApprovals, setShowApprovals] = useState(false)
    const [showSwitchCmp, setShowSwitchCmp] = useState(false)

    const [displayComponent, setDisplayComponent] = useState('BankBalance')

    const [selectedComponents, setSelectedComponents] = useState([]);


    const [showBankBalancePop, setShowBankBalancePop] = useState(false)
    const [showCashBalancePop, setShowCashBalancePop] = useState(false)
    const [showTotalSalesTablePop, setTotalSalesTablePop] = useState(false)
    const [showTotalRecPop, setShowTotalRecPop] = useState(false)
    const [showTotalIssuedPop, setShowTotalIssuedPop] = useState(false)

    const [bankBalanceList, setBankBalanceList] = useState(null)
    const [cashBalanceData, setCashBalanceData] = useState(null)
    const [salesData, setSalesData] = useState(null)

    // const [selectedComponents, setSelectedComponents] = useState([
    //     'BankBalance',
    //     'CashBalance',
    //     'TotalSales',
    //     'TotalRecPdc',
    //     'TotalIssuedPdc',
    //     'Payables',
    //     'BranchWiseSales',
    //     'TopSalesMan',
    //     'TopGroups',
    //     'TopGroupCodes',
    //     'TopCustomer',
    //     'TopSales',
    //     'DebtorsAgeing',
    //     'CreditorsAgeing'
    // ]);

    const navigation = useNavigation()

    const renderComponent = (displayComponent) => {
        switch (displayComponent) {
            case 'BankBalance':
                return <BankBalance setBankBalanceList={setBankBalanceList} setShowBankBalancePop={setShowBankBalancePop} />;
            case 'CashBalance':
                return <CashBalance setCashBalanceData={setCashBalanceData} setShowCashBalancePop={setShowCashBalancePop} />;
            case 'TotalSales':
                return <TotalSales setSalesData={setSalesData} setTotalSalesTablePop={setTotalSalesTablePop} />;
            case 'BankBalancePop':
                return <BankBalancePop />;
            case 'CashBalancePop':
                return <CashBalancePop />;
            case 'TotalSalesTablePop':
                return <TotalSalesTablePop />;
            case 'TotalRecPdc':
                return <TotalRecPdc setShowTotalRecPop={setShowTotalRecPop} />;
            case 'TotalRecPop':
                return <TotalRecPop />;
            case 'TotalIssuedPdc':
                return <TotalIssuedPdc setShowTotalIssuedPop={setShowTotalIssuedPop} />;
            case 'TotalIssuedPop':
                return <TotalIssuedPop />;
            case 'Payables':
                return <Payables />;
            case 'BranchWiseSales':
                return <BranchWiseSales />;
            case 'TopSalesMan':
                return <TopSalesMan />;
            case 'TopGroups':
                return <TopGroups />;
            case 'TopGroupCodes':
                return <TopGroupCodes />;
            case 'TopCustomer':
                return <TopCustomer />;
            case 'TopSales':
                return <TopSales />;
            case 'DebtorsAgeing':
                return <DebtorsAgeing />;
            case 'CreditorsAgeing':
                return <CreditorsAgeing />;
            default:
                return null;
        }
    };

    const toggleComponent = (name) => {

        setDisplayComponent(name)

        const isSelected = selectedComponents.includes(name);
        if (isSelected) {
            setSelectedComponents(selectedComponents.filter(item => item !== name));
        } else {
            setSelectedComponents([...selectedComponents, name]);
        }
    };

    const componentNames = [
        'BankBalance',
        'CashBalance',
        'TotalSales',
        'TotalRecPdc',
        'TotalIssuedPdc',
        'Payables',
        'BranchWiseSales',
        'TopSalesMan',
        'TopGroups',
        'TopGroupCodes',
        'TopCustomer',
        'TopSales',
        'DebtorsAgeing',
        'CreditorsAgeing'
    ];

    const saveData = async () => {
        try {
            await AsyncStorage.setItem('selectedComponents', JSON.stringify(selectedComponents));
            console.log('Data saved successfully!');
            navigation.navigate('Home')
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    const resetData = async () => {
        try {
            await AsyncStorage.setItem('selectedComponents', JSON.stringify(componentNames));
            console.log('Data saved successfully!');
            navigation.navigate('Home')
        } catch (error) {
            console.error('Error reset data:', error);
        }
    }

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedData = await AsyncStorage.getItem('selectedComponents');
                if (storedData !== null) {
                    setSelectedComponents(JSON.parse(storedData));
                } else {
                    // If no data is found, set the default list
                    setSelectedComponents([
                        'BankBalance',
                        'CashBalance',
                        'TotalSales',
                        'TotalRecPdc',
                        'TotalIssuedPdc',
                        'Payables',
                        'BranchWiseSales',
                        'TopSalesMan',
                        'TopGroups',
                        'TopGroupCodes',
                        'TopCustomer',
                        'TopSales',
                        'DebtorsAgeing',
                        'CreditorsAgeing'
                    ]);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, [])

    // console.log('selectedComponents', selectedComponents)

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

                <View style={{ width: '100%', alignItems: 'center' }}>
                    <View style={{ width: '90%', marginTop: 22 }}>
                        {renderComponent(displayComponent)}
                    </View>
                </View>

                <View style={{ width: '100%', alignItems: 'center', height: 600 }}>
                    <ScrollView nestedScrollEnabled={true} style={{ width: '90%', marginTop: 22 }}>

                        {componentNames.map((name, index) => (
                            <TouchableOpacity onPress={() => toggleComponent(name)} key={index} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderBlockColor: 'grey', borderBottomWidth: 1 }}>
                                <Text style={{ flex: 1 }}>{index + 1}</Text>
                                <Text style={{ flex: 4 }}>{name}</Text>
                                <CheckBox
                                    value={selectedComponents.includes(name)}
                                    onValueChange={() => toggleComponent(name)}
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ width: '100%', alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity style={{ backgroundColor: "green", padding: 12, borderRadius: 4, marginHorizontal: 12 }} onPress={() => saveData()}>
                        <Text style={{ color: 'white', fontSize: 16 }}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: "red", padding: 12, borderRadius: 4, marginHorizontal: 12 }} onPress={() => resetData()}>
                        <Text style={{ color: 'white', fontSize: 16 }}>Reset</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

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

export default DashBoardCreation