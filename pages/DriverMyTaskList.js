import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'



const DriverMyTaskList = ({
    appUrl, cmpCode, loginUser,
    van, deptno, portNo,
    areaCode, setMyTaskLength, setShowLoader,
    showStartJobSuccess, showStartJobError, showLoader, showDetailsPopItem, fetchOnTheWayTaskCount
}) => {


    const [myTaskList, setMyTaskList] = useState('')

    const [onTheWayDono, setOnTheWayDono] = useState('')

    const fetchMyTask = async () => {
        setShowLoader(true)
        try {
            console.log('fetchMyTaskurl', `https://cubixweberp.com:${portNo}/${cmpCode}/MYLIST/${areaCode}/${loginUser}/${deptno}/-/`)
            const response = await axios.get(`https://cubixweberp.com:${portNo}/${cmpCode}/MYLIST/${areaCode}/${loginUser}/${deptno}/-/`)

            if (response.status === 200) {
                setMyTaskList(response.data)
                setMyTaskLength(response.data.length)
                setShowLoader(false)
            }
        } catch (error) {
            console.log('fetchMyTaskError', error)
            setShowLoader(false)
        }
    }

    const StartJob = async (item) => {
        setOnTheWayDono(item.do_no)

        const itemDono = item.do_no
        const itemDeptno = item.deptno
        try {
            const data = [
                {
                    "cmpcode": cmpCode,
                    "operation": "ON THE WAY",
                    "do_no": itemDono,
                    "user": loginUser,
                    "vehicleno": van,
                    "deptno": itemDeptno,
                    "status": "-"
                }
            ]

            const postData = JSON.stringify(data)
            console.log('postData', postData)

            const response = await axios.post(`${appUrl}Delivery`, postData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (response.status === 200) {
                fetchMyTask()
                fetchOnTheWayTaskCount()
                showStartJobSuccess()
                setOnTheWayDono('')
            }
        } catch (error) {
            console.log('StartJobError', error)
            showStartJobError()
            setOnTheWayDono('')
        }
    }

    const formattedDate = (date) => {
        return format(new Date(date), 'dd-MM-yy hh:mm a');
    }


    useEffect(() => {
        if (cmpCode && loginUser && deptno && portNo && areaCode) {
            fetchMyTask()
        }
    }, [cmpCode, loginUser, deptno, portNo, areaCode])

    // console.log('myTaskList', myTaskList)

    return (
        // <ScrollView contentContainerStyle={styles.ScrollView}>

        <>
            <View style={styles.TopBanner}>
                <Text style={styles.TopBannerText}>
                    My Task List
                </Text>
            </View>

            <FlatList
                data={myTaskList}
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
                                    <Image style={styles.Image} source={require('../images/myTaskList.png')}></Image>
                                </View>
                            </View>
                            <View style={styles.TitleDescBox}>
                                <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.Customer}</Text>
                                <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.do_no}</Text>
                                <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.deptno}</Text>
                            </View>
                        </View>


                        <View style={styles.TaskItemRight}>
                            {/* <Text style={styles.TitleText}>{item.do_date.split('T')[0]}</Text> */}
                            <Text style={[styles.TitleText, { fontSize: 13 }]}>{formattedDate(item.do_date)}</Text>

                            <View style={styles.BottomButtonCont}>
                                <TouchableOpacity style={styles.DetailsButton} onPress={() => showDetailsPopItem(item)}>
                                    <Text style={styles.DetailsText}>Details</Text>
                                </TouchableOpacity>

                                {/* <TouchableOpacity style={styles.AcceptButton} onPress={() => StartJob(item.do_no)}> */}
                                <TouchableOpacity style={styles.AcceptButton} onPress={() => StartJob(item)}>
                                    {
                                        (item.do_no === onTheWayDono) ?
                                            <ActivityIndicator color={'white'} size={'large'} /> :
                                            <Text style={styles.AcceptText}>Start Job</Text>
                                    }

                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View>
                        <Text style={{ color: 'red' }}>No data available</Text>
                    </View>
                }
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

export default DriverMyTaskList