import { View, Text, KeyboardAvoidingView, ScrollView, StyleSheet, FlatListComponent, FlatList, ActivityIndicator, Button, TouchableOpacity, Image, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';



const LeadList = () => {

    const navigation = useNavigation()

    const [portNo, setPortNo] = useState('')

    const [appUrl, setAppUrl] = useState('')

    const [cmpCode, setCmpCode] = useState('')

    const [leadListData, setLeadListData] = useState('')

    const [dataLoader, setDataLoader] = useState(false)

    const [showFilterModal, setShowFilterModal] = useState(false)

    const [selectedPriority, setSelectedPriority] = useState('-');

    const priorities = ['High', 'Medium', 'Low'];

    const [selectedStatus, setSelectedStatus] = useState('-')

    const statusItems = ['New','Qualified', 'Discovery', 'Proposed', 'Negotiation', 'Demo', 'Prospecting'];


    // State for the date pickers
    const [fromDate, setFromDate] = useState(new Date('1900-01-01'));
    const [toDate, setToDate] = useState(new Date());
    const [openFromDatePicker, setOpenFromDatePicker] = useState(false);
    const [openToDatePicker, setOpenToDatePicker] = useState(false);

    const clearFilters = () => {
        setSelectedPriority('-')
        setSelectedStatus('-')
        setShowFilterModal(false)
    }

    const resetDate = () => {
        setFromDate(new Date('1900-01-01'))
        setToDate(new Date())

    }


    const fetchListData = async () => {

        const deptNo = await AsyncStorage.getItem('DEPTNO')

        setDataLoader(true);
        try {
            const formattedFromDate = fromDate.toISOString().split('T')[0];
            const formattedToDate = toDate.toISOString().split('T')[0];

            console.log(`${appUrl}CRMLeadMainList/${cmpCode}/${(selectedStatus == "-"  || selectedStatus == "New" ) ? "EXqualified" : "ALL" }/-/-/-/-/${deptNo}/1900-01-01/${formattedToDate}/-/${selectedStatus == "New" ? "-": selectedStatus}/-?task_coordinator=-&task_salesperson=-&task_creator_id=-`)

            

            const response = await axios.get(
                `${appUrl}CRMLeadMainList/${cmpCode}/${(selectedStatus == "-"  || selectedStatus == "New" ) ? "EXqualified" : "ALL" }/-/-/-/-/${deptNo}/1900-01-01/${formattedToDate}/-/${selectedStatus == "New" ? "-": selectedStatus}/-?task_coordinator=-&task_salesperson=-&task_creator_id=-`
            );

            if (response.status === 200 && response.data?.length > 0) {
                setLeadListData(response.data);
            } else {
                setLeadListData([]);
            }
        } catch (error) {
            console.log('fetchListDataErr', error);
        } finally {
            setDataLoader(false);
        }
    };


    useEffect(() => {
        if (appUrl && cmpCode && (selectedPriority || selectedStatus || (fromDate && toDate))) {
            fetchListData();
        }
    }, [appUrl, selectedPriority, selectedStatus, fromDate, toDate, cmpCode]);



    useEffect(() => {
        const fetchPortNo = async () => {
            try {
                const data = await AsyncStorage.getItem("portNoData");

                const appUrl = await AsyncStorage.getItem('appUrl')

                if (appUrl) {
                    setAppUrl(appUrl)
                }

                if (data !== null) {
                    const parsedData = JSON.parse(data);
                    // Assuming `PORTNO` is the key you want from the first object in the array
                    const portNumber = parsedData[0]?.PORTNO || "";
                    setPortNo(portNumber);
                    setCmpCode(parsedData[0].COMPID)
                }
            } catch (error) {
                console.error("Error fetching port number:", error);
            }
        };

        fetchPortNo();
    }, []);


    // console.log('dataLoader', dataLoader)
    console.log('leadListData', leadListData[0])


    return (
        <KeyboardAvoidingView
            behavior='padding'
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}

        >

            <View>


                <ScrollView contentContainerStyle={styles.LeadListWrap} bounces={false} keyboardShouldPersistTaps="handled">

                    <View style={styles.LeadListHead}>

                        <TouchableOpacity
                            style={{
                                padding: 8,
                                borderRadius: 4,
                                backgroundColor: 'white',
                                elevation: 5
                            }}
                            onPress={() => navigation.navigate('Home')}
                        >


                            <Image style={{
                                width: 25,
                                height: 25
                            }} source={require('../../images/HomeBondTimeMob.png')} />
                        </TouchableOpacity>

                        <Text style={styles.TitleText}>Lead List</Text>

                        <TouchableOpacity
                            style={{
                                // position: 'absolute',
                                // right: 10,

                                padding: 12,
                                borderRadius: 4,
                                backgroundColor: 'white',
                                elevation: 5
                            }}

                            onPress={() => setShowFilterModal(true)}
                        >
                            <Image style={{
                                width: 15,
                                height: 15
                            }} source={require('../../images/LeadListFilterIcon.png')} />
                        </TouchableOpacity>
                    </View>

                    {/* Modal */}
                    <Modal
                        visible={showFilterModal}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setShowFilterModal(false)} // Close the modal when tapping outside
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <View>
                                    <Text style={styles.modalTitle}>Select Priority</Text>
                                    <View style={styles.priorityContainer}>
                                        {priorities.map((priority) => (
                                            <TouchableOpacity
                                                key={priority}
                                                style={[
                                                    styles.priorityItem,
                                                    selectedPriority === priority
                                                        ? styles.selectedPriority
                                                        : styles.unselectedPriority,
                                                ]}
                                                onPress={() => setSelectedPriority(priority)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.priorityText,
                                                        selectedPriority === priority
                                                            ? styles.selectedPriorityText
                                                            : styles.unselectedPriorityText,
                                                    ]}
                                                >
                                                    {priority}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View>
                                    <Text style={styles.modalTitle}>Reset Date</Text>
                                    <View>
                                        <TouchableOpacity style={styles.ResetDatButton} onPress={resetDate}>
                                            <Text style={styles.ResetButtonText}>Reset Date</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View>
                                    <Text style={styles.modalTitle}>Select Status</Text>
                                    <View style={styles.statusContainer}>
                                        {statusItems.map((status) => (
                                            <TouchableOpacity
                                                key={status}
                                                style={[
                                                    styles.statusItem,
                                                    selectedStatus === status
                                                        ? styles.selectedPriority
                                                        : styles.unselectedPriority,
                                                ]}
                                                onPress={() => setSelectedStatus(status)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.priorityText,
                                                        selectedStatus === status
                                                            ? styles.selectedPriorityText
                                                            : styles.unselectedPriorityText,
                                                    ]}
                                                >
                                                    {status}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>


                                <View style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => clearFilters()}
                                    >
                                        <Text style={styles.closeButtonText}>Clear</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.closeButton,
                                        { backgroundColor: '#64558E' }
                                        ]}
                                        onPress={() =>  {setShowFilterModal(false); fetchListData()} }
                                    >
                                        <Text style={styles.closeButtonText}>Ok</Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </View>
                    </Modal>

                    <View style={styles.DatePickerCont}>
                        {/* Date Picker for From Date */}
                        {/* <Button title="Select From Date" onPress={() => setOpenFromDatePicker(true)} /> */}
                        <TouchableOpacity
                            onPress={() => setOpenFromDatePicker(true)}
                            style={styles.DateButtons}>
                            <Text style={styles.DateButtonText}>
                                From Date
                            </Text>
                        </TouchableOpacity>
                        <DatePicker
                            modal
                            mode="date"
                            open={openFromDatePicker}
                            date={fromDate}
                            onConfirm={(date) => {
                                setOpenFromDatePicker(false);
                                setFromDate(date);
                            }}
                            onCancel={() => setOpenFromDatePicker(false)}
                        />

                        {/* Date Picker for To Date */}
                        {/* <Button title="Select To Date" onPress={() => setOpenToDatePicker(true)} /> */}

                        <TouchableOpacity
                            onPress={() => setOpenToDatePicker(true)}
                            style={styles.DateButtons}>
                            <Text style={styles.DateButtonText}>
                                To Date
                            </Text>
                        </TouchableOpacity>
                        <DatePicker
                            modal
                            mode="date"
                            open={openToDatePicker}
                            date={toDate}
                            onConfirm={(date) => {
                                setOpenToDatePicker(false);
                                setToDate(date);
                            }}
                            onCancel={() => setOpenToDatePicker(false)}
                        />


                    </View>

                    <View style={styles.DateDisplayCont}>
                        <Text style={styles.DateDisplayText}>From Date:  { (fromDate.getFullYear() != '1900') && fromDate.toDateString()}</Text>
                        <Text style={styles.DateDisplayText}>To Date: {toDate.toDateString()}</Text>
                    </View>


                    {
                        dataLoader &&
                        <View style={{
                            position: 'absolute',
                            top: 180,
                            zIndex: 5
                        }}>

                            <ActivityIndicator color={'green'} size={'large'} />
                        </View>
                    }

                    <ScrollView horizontal style={styles.TableContainer}>

                        <ScrollView nestedScrollEnabled style={{ height: '100%' }}>
                            <View style={styles.headerContainer}>
                                <Text style={styles.headerCellPhStk}>Name</Text>
                                <Text style={styles.headerCellPhStk}>Organization</Text>
                                <Text style={styles.headerCellPhStk}>Email</Text>
                                <Text style={styles.headerCellPhStk}>Status</Text>
                                <Text style={styles.headerCellPhStk}>Lead_Probabilty</Text>
                                <Text style={styles.headerCellPhStk}>BookedAmount</Text>
                                <Text style={styles.headerCellPhStk}>Priority</Text>
                                <Text style={styles.headerCellPhStk}>Lead_source</Text>
                            </View>

                            {/* Table Data */}
                            {/* <FlatList
                                data={productData && productData}
                                renderItem={renderProductData}
                                keyExtractor={(item) => item.id}
                            /> */}

                            {
                                !dataLoader && leadListData.length === 0 &&

                                <View style={styles.ErrorCont}>
                                    <Text style={styles.ErrorText}>
                                        No Data Available
                                    </Text>
                                </View>
                            }

                            {/* Table Data */}
                            {leadListData && leadListData.map((item, index) => {
                                // Determine background color based on Priority
                                const priorityBackgroundColor =
                                    item.Priority === "High" ? "#FFD1D1" :  // Light red for High
                                        item.Priority === "Medium" ? "#FFE4B2" :  // Light orange for Medium
                                            item.Priority === "Low" ? "#D9FDD3" :  // Light green for Low
                                                "transparent"; // Default for undefined priority

                                // Determine background color based on Status
                                const statusBackgroundColor =
                                    item.Status === "Qualified" ? "#D9EAFD" :  // Light blue for Qualified
                                        item.Status === "Discovery" ? "#E8D9FD" :  // Light purple for Discovery
                                            item.Status === "Proposed" ? "#D9FDDC" :  // Light green for Proposed
                                                item.Status === "Negotiation" ? "#FFF4D9" :  // Light yellow for Negotiation
                                                    item.Status === "Demo" ? "#FDD9E2" :  // Light pink for Demo
                                                        item.Status === "Prospecting" ? "#D9FDF2" :  // Light teal for Prospecting
                                                            "transparent"; // Default for undefined status

                                return (
                                    <View style={styles.rowContainer} key={index}>
                                        <Text style={styles.cell}>{item.lead_primarycontact}</Text>
                                        <Text style={styles.cell}>{item.lead_organization}</Text>
                                        <Text style={styles.cell}>{item.lead_email}</Text>
                                        {/* Status Text with Dynamic Background */}
                                        <Text
                                            style={[
                                                styles.cell,
                                                styles.statusCell,
                                                { backgroundColor: statusBackgroundColor }, // Apply conditional background
                                            ]}
                                        >
                                            {item.Status}
                                        </Text>
                                        <Text style={styles.cell}>{item.lead_probability}%</Text>
                                        <Text style={styles.cell}>{item.lead_bookedamount}</Text>
                                        {/* Priority Text with Dynamic Background */}
                                        <Text
                                            style={[
                                                styles.cell,
                                                styles.priorityCell,
                                                { backgroundColor: priorityBackgroundColor }, // Apply conditional background
                                            ]}
                                        >
                                            {item.lead_priority}
                                        </Text>
                                        <Text style={styles.cell}>{item.lead_source}</Text>
                                    </View>
                                );
                            })}

                        </ScrollView>

                    </ScrollView>


                </ScrollView>

            </View>

        </KeyboardAvoidingView >
    )
}

const styles = StyleSheet.create({
    LeadListWrap: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 16,
        // height: Dimensions.get('window').height

        paddingBottom: 120
    },

    LeadListHead: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center',
        marginVertical: 10
    },

    TitleText: {
        fontFamily: 'Lexend-Bold',
        fontSize: 14,
        color: 'black'
    },

    DatePickerCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12
    },

    DateButtons: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#2AB6A1'
    },

    DateButtonText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 13,
        color: 'white'
    },

    DateDisplayCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    DateDisplayText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 12,
        color: 'black'
    },

    // table
    TableContainer: {
        // width: 1000,
        minHeight: 'auto',
        maxHeight: 650,
        backgroundColor: '#f9f9f9',
        // padding: 10,

        overflow: 'scroll',

        elevation: 5,
        borderRadius: 8,
        marginTop: 16
    },
    headerContainer: {
        flexDirection: 'row',
        // backgroundColor: '#007BFF',
        // backgroundColor: '#908CEE',
        backgroundColor: '#fcdcc3',
        backgroundColor: '#15a7a2',
        paddingVertical: 10,
        // paddingHorizontal: 5,
    },
    headerCell: {
        fontFamily: 'Lexend-Bold',
        fontSize: 12,
        color: '#fff',
        color: 'black',
        width: 120,
        textAlign: 'center',
        padding: 5,
    },
    headerCellPhStk: {
        fontFamily: 'Lexend-Bold',
        fontSize: 12,
        // fontWeight: 'bold',
        color: '#fff',
        color: 'black',
        color: 'white',
        width: 120,
        textAlign: 'center',
        // padding: 5,
        // marginHorizontal: 4
    },
    rowContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    cell: {
        width: 120,
        textAlign: 'center',
        padding: 5,
        fontSize: 12,
        fontFamily: 'Lexend-Regular',
        color: 'black'
    },

    ErrorCont: {
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        paddingVertical: 12,
        paddingLeft: 12
    },
    ErrorText: {
        fontFamily: 'Lexend-Bold',
        fontSize: 14,
        color: 'red'
    },


    // Modal
    // MODAL
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        marginBottom: 12,
        color: 'black'
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalItemText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: 'black'
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: '#007bff',
        paddingVertical: 10,
        borderRadius: 4,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontFamily: 'Lexend-Regular',
        fontSize: 14
    },


    modalButtons: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    logoutButton: {
        backgroundColor: '#FF5C5C',
    },
    ResetcancelButton: {
        backgroundColor: '#909090',
    },

    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Lexend-Regular'
    },


    modalText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        color: 'black'
    },

    priorityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },

    statusItem: {
        // flex: 1,
        margin: 5,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },

    statusContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        // justifyContent: 'space-between',
        width: '100%',
    },

    priorityItem: {
        flex: 1,
        margin: 5,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedPriority: {
        backgroundColor: 'green',
    },
    unselectedPriority: {
        backgroundColor: 'grey',
    },
    priorityText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: 'black'
    },
    selectedPriorityText: {
        color: 'white',
    },
    unselectedPriorityText: {
        color: 'white',
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'red',
        width: '25%'
    },
    closeButtonText: {
        color: 'white',
        fontFamily: 'Lexend-Regular',
        textAlign: 'center'
    },


    ResetDatButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'grey',
        width: '35%'
    },

    ResetButtonText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: 'white',
    }




})

export default LeadList