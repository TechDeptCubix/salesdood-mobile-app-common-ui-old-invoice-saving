import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'



const DriverOntheWay = ({
    appUrl, cmpCode, loginUser,
    van, deptno, portNo,
    areaCode, setOnTheWayListLength, setShowLoader,
    showDeliveredSuccess, showDeliveredError, showLoader, fetchCompletdtaskCount, showDetailsPopItem
}) => {

    const [onTheWayList, setOnTheWayList] = useState('')

    const [onTheWayDono, setOnTheWayDono] = useState('')

    const fetchOnTheWayTask = async () => {
        setShowLoader(true)
        try {
            console.log('fetchOnTheWayTaskurl', `${appUrl}/${cmpCode}/ONTHEWAY/${areaCode}/${loginUser}/${deptno}/-/`)
            const response = await axios.get(`${appUrl}/${cmpCode}/ONTHEWAY/${areaCode}/${loginUser}/${deptno}/-/`)

            if (response.status === 200) {
                setOnTheWayList(response.data)
                setOnTheWayListLength(response.data.length)
                setShowLoader(false)
            }
        } catch (error) {
            console.log('fetchOnTheWayTaskError', error)
            setShowLoader(false)
        }
    }

    const handleDeliveryAction = async (item) => {
        setOnTheWayDono(item.do_no)

        const itemDono = item.do_no
        const itemDeptno = item.deptno
        try {
            const data = [
                {
                    "cmpcode": cmpCode,
                    "operation": "DELIVERED",
                    "do_no": itemDono,
                    "user": loginUser,
                    "vehicleno": van,
                    "deptno": itemDeptno,
                    "status": "-"
                }
            ]

            const postData = JSON.stringify(data)
            console.log('postData', postData)

            const response = await axios.post(`${appUrl}/api/Delivery`, postData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (response.status === 200) {
                fetchOnTheWayTask()
                showDeliveredSuccess()
                fetchCompletdtaskCount()
                setOnTheWayDono('')
            }
        } catch (error) {
            console.log('StartJobError', error)
            showDeliveredError()
            setOnTheWayDono('')
        }
    }

    const formattedDate = (date) => {
        return format(new Date(date), 'dd-MM-yy hh:mm a');
    }


    useEffect(() => {
        if (cmpCode && loginUser && deptno && portNo && areaCode) {
            fetchOnTheWayTask()
        }
    }, [cmpCode, loginUser, deptno, portNo, areaCode])

    console.log('onTheWayList', onTheWayList)

    return (
        // <ScrollView contentContainerStyle={styles.ScrollView}>

        <>
            <View style={styles.TopBanner}>
                <Text style={styles.TopBannerText}>
                    On the Way Deliveries
                </Text>
            </View>

            <FlatList
                data={onTheWayList}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingBottom: 250 }}
                renderItem={({ item }) => (

                    <View style={styles.TaskCont}>

                        {
                            item.Priority === 'high' &&
                            <>
                                <View style={{
                                    position: "absolute",
                                    left: 5,
                                    top: -8,
                                    padding: 6,
                                    backgroundColor: '#CCE5CC',
                                    borderRadius: 50
                                }}>
                                    <Image source={require('../images/alert.png')} style={{
                                        width: 20,
                                        height: 20
                                    }} />

                                    <View style={{
                                        position: 'absolute',
                                        width: 75,
                                        left: 25,
                                        top: 5,
                                        padding: 2,
                                        backgroundColor: '#CCE5CC',
                                        borderRadius: 4
                                    }}>
                                        <Text style={{
                                            fontFamily: 'Lexend-Bold',
                                            color: 'red',
                                            fontSize: 10
                                        }}>High Priority</Text>
                                    </View>
                                </View>
                            </>
                        }

                        <View style={styles.TaskItemLeft}>
                            <View style={styles.ImageCont}>
                                <View style={styles.ImageWrap}>
                                    <Image style={styles.Image} source={require('../images/onTheWay.png')}></Image>
                                </View>
                            </View>
                            <View style={styles.TitleDescBox}>
                                <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.Customer}</Text>
                                <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.do_no}</Text>
                                <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.deptno.trim()}</Text>
                            </View>
                        </View>

                        <View style={styles.TaskItemRight}>
                            {/* <Text style={styles.TitleText}>{item.do_date.split('T')[0]}</Text> */}
                            <Text style={[styles.TitleText, { fontSize: 13 }]}>{formattedDate(item.do_date)}</Text>

                            <View style={styles.BottomButtonCont}>
                                <TouchableOpacity style={styles.DetailsButton} onPress={() => showDetailsPopItem(item)}>
                                    <Text style={styles.DetailsText}>Details</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.AcceptButton} onPress={() => handleDeliveryAction(item)}>
                                    {
                                        (item.do_no === onTheWayDono) ?
                                            <ActivityIndicator color={'white'} size={'large'} /> :
                                            <Text style={styles.AcceptText}>Delivered</Text>
                                    }

                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                )}
            />
        </>
        // </ScrollView>
    )
}

const styles = StyleSheet.create({

    ScrollView: {
        paddingBottom: 200,
    },

    TopBanner: {
        flexDirection: 'row',
        paddingVertical: 4
    },

    TopBannerText: {
        fontSize: 14,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Bold',
    },

    TaskCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'white',
        marginVertical: 6,
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderRadius: 4
    },

    TaskItemLeft: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 'auto',
        maxWidth: '45%'
    },

    ImageCont: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    ImageWrap: {
        backgroundColor: 'grey',
        borderRadius: 50,
        padding: 6
    },
    Image: {
        width: 28,
        height: 28,
    },
    TitleDescBox: {
        flexDirection: 'column',
        marginLeft: 8
    },
    TitleText: {
        fontSize: 14,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Regular',
    },
    DescText: {
        fontSize: 12,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Regular',
    },

    TaskItemRight: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    AcceptButton: {
        backgroundColor: '#30B3A4',
        padding: 8,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
    },
    AcceptText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },

    DetailsButton: {
        backgroundColor: '#D8D8DA',
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
        borderWidth: 0.5,
        borderColor: 'grey',
    },
    DetailsText: {
        fontSize: 14,
        color: 'black',
        fontFamily: 'Lexend-Regular',
    },

    BottomButtonCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8
        // paddingHorizontal: 12
    }

})

export default DriverOntheWay