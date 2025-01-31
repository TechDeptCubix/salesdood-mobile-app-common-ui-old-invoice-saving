import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, FlatList, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from './Header'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'


const PickingList = () => {

    const ITEMS_PER_PAGE = 20;

    const navigation = useNavigation()

    const [currentPage, setCurrentPage] = useState(1);

    const [pickingList, setPickingList] = useState()

    const [showLoader, setShowLoader] = useState(false)

    const [showError, setShowError] = useState(false)

    const fetchPickingList = async () => {
        setShowLoader(true)
        try {
            // const response = await axios.get(`https://cubixweberp.com:199/api/Pick/ShowPick?cmpcode=PREMIER&guid=501FDABB-47FD-4851-AB6C-3A7AE0576D3F&mod=SHOW_PICK&deptno=%27%27%27`);
            const response = await axios.get(`https://cubixweberp.com:199/api/Pick/ShowPick?cmpcode=autoland&guid=425cc3d5-8e70-4502-a3a2-dc85e4bfbd83&mod=SHOW_PICK&deptno=%27%27%27`);
            setPickingList(response.data);
            setShowLoader(false)
        } catch (error) {
            console.log('fetchPickingListError', error)
            setShowLoader(false)
            setShowError(true)
        }
    }

    const totalPages = pickingList && Math.ceil(pickingList.length / ITEMS_PER_PAGE);

    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return pickingList.slice(startIndex, endIndex);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    useEffect(() => {
        fetchPickingList()
    }, [])

    // console.log('pickingList', pickingList)

    return (
        <View style={styles.HomeWrap}>
            <Header />

            <View style={styles.HomeCont}>


                <View style={styles.HomeTextCont}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Image style={styles.HeadIcon} source={require('../images/backIcon.png')} />
                    </TouchableOpacity>
                    <Text style={styles.HomeText}>Picking List</Text>
                </View>

                {
                    pickingList &&
                    // <ScrollView horizontal={true}>
                    //     <View style={styles.TableContainer}>
                    //         <View style={styles.tableRow}>
                    //             <Text
                    //                 style={[styles.headerCell, {
                    //                     borderTopLeftRadius: 4
                    //                 }]}
                    //             >
                    //                 PickNo
                    //             </Text>
                    //             <Text style={styles.headerCell}>
                    //                 InvoiceNo
                    //             </Text>
                    //             <Text style={styles.headerCell}>
                    //                 Customer
                    //             </Text>
                    //             <Text
                    //                 style={[styles.headerCell, {
                    //                     borderTopRightRadius: 4
                    //                 }]}
                    //             >
                    //                 Deptno
                    //             </Text>
                    //         </View>

                    //         <FlatList
                    //             data={getPaginatedData()}
                    //             keyExtractor={(item, index) => index}
                    //             style={{ height: Dimensions.get('window').height - 310, }}
                    //             renderItem={({ item }) => (

                    //                 // <ScrollView style={styles.ScrollView}>
                    //                 <ScrollView>
                    //                     <TouchableOpacity style={styles.tableRow} onPress={() => navigation.navigate('PickingListDetails', { PickNo: item.PickNo })}>
                    //                         <Text style={styles.dataCell}>{item.PickNo}</Text>
                    //                         <Text style={styles.dataCell}>{item.InvoiceNo}</Text>
                    //                         <Text style={styles.dataCell}>{item.Customer}</Text>
                    //                         <Text style={styles.dataCell}>{item.Deptno}</Text>
                    //                     </TouchableOpacity>
                    //                 </ScrollView>


                    //             )}
                    //         />

                    //         {
                    //             pickingList && pickingList.length === 0 &&
                    //             <View>
                    //                 <Text style={{
                    //                     color: 'red'
                    //                 }}>No data available</Text>
                    //             </View>
                    //         }

                    //     </View>
                    // </ScrollView>

                    <ScrollView horizontal={true}>
                        <View style={styles.TableContainer}>
                            <View style={styles.tableRow}>
                                <Text style={[styles.headerCell, { borderTopLeftRadius: 4 }]}>
                                    PickNo
                                </Text>
                                <Text style={styles.headerCell}>
                                    InvoiceNo
                                </Text>
                                <Text style={styles.headerCell}>
                                    Customer
                                </Text>
                                <Text style={[styles.headerCell, { borderTopRightRadius: 4 }]}>
                                    Deptno
                                </Text>
                            </View>

                            <FlatList
                                data={getPaginatedData()}
                                keyExtractor={(item, index) => index.toString()}
                                style={{ height: Dimensions.get('window').height - 310, width: '100%' }}
                                // contentContainerStyle={{ paddingBottom: 50 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.tableRow} onPress={() => navigation.navigate('PickingListDetails', { PickNo: item.PickNo })}>
                                        <Text style={styles.dataCell}>{item.PickNo}</Text>
                                        <Text style={styles.dataCell}>{item.InvoiceNo}</Text>
                                        <Text style={styles.dataCell}>{item.Customer}</Text>
                                        <Text style={styles.dataCell}>{item.Deptno}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <View>
                                        <Text style={{ color: 'red' }}>No data available</Text>
                                    </View>
                                }
                            />
                        </View>
                    </ScrollView>
                }

                {
                    showLoader &&
                    <View style={{
                        height: Dimensions.get('window').height - 200
                    }}>
                        <ActivityIndicator size={'large'} />
                    </View>
                }

                {
                    showError &&
                    <View style={{
                        height: Dimensions.get('window').height - 200
                    }}>
                        <Text style={{
                            color: 'red',
                            fontSize: 14,
                            fontFamily: 'Lexend-Bold'
                        }}>Error, no data available</Text>
                    </View>
                }

                <View style={styles.pagination}>
                    {
                        currentPage !== 1 &&
                        <TouchableOpacity onPress={handlePreviousPage} disabled={currentPage === 1} style={styles.pageButton}>
                            <Text style={styles.pageButtonText}>Previous</Text>
                        </TouchableOpacity>
                    }
                    <Text style={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </Text>
                    {
                        currentPage !== totalPages &&
                        <TouchableOpacity onPress={handleNextPage} disabled={currentPage === totalPages} style={styles.pageButton}>
                            <Text style={styles.pageButtonText}>Next</Text>
                        </TouchableOpacity>
                    }
                </View>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    HomeWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5A55CA'
    },
    HomeCont: {
        width: '98%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        backgroundColor: '#F0F4FD',
        height: Dimensions.get('window').height - 70

    },
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    HomeText: {
        fontSize: 18,
        color: 'black',
        borderBottomColor: 'gold',
        borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'Lexend-Bold'
    },
    HeadIcon: {
        width: 25,
        height: 25
    },

    TableContainer: {
        width: "100%",
        // padding: 10,
        marginTop: 8,
        alignItems: 'center',
        paddingBottom: 50,
    },
    tableRow: {
        flexDirection: 'row',
        width: '100%',
        // justifyContent: 'space-between',
        // marginBottom: 5,
        // paddingVertical: 5,
    },
    headerCell: {
        // flex: 1,
        backgroundColor: '#5A55CA',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: '25%',
        color: 'white',
        fontFamily: 'Lexend-Bold',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',

    },
    dataCell: {
        // flex: 1,
        // backgroundColor: '#F3F3F3',
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: '25%',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'Lexend-Regular'

    },
    ScrollView: {
        height: Dimensions.get('window').height - 300,
        // marginBottom: 8
    },

    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // marginTop: 20,
        width: '80%',
        marginBottom: 20
    },
    pageButton: {
        padding: 10,
        backgroundColor: '#5A55CA',
        borderRadius: 5,
    },
    pageButtonText: {
        color: '#fff',
        fontFamily: 'Lexend-Regular',
    },
    pageInfo: {
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: 'black'
    },



})

export default PickingList