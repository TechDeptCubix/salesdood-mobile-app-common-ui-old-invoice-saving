import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import HeaderUiNew from './HeaderUiNew'
import AsyncStorage from '@react-native-async-storage/async-storage'



const MaterialRequest = () => {

    const [showLoader, setShowLoader] = useState(false)

    const [appUrl, setAppUrl] = useState('')

    const [cmpCode, setCmpCode] = useState('')

    const [myTaskList, setMyTaskList] = useState('')

    const [onTheWayDono, setOnTheWayDono] = useState('')

    const fetchAsycData = async () => {

        const appUrlFromStorage = await AsyncStorage.getItem('appUrl')
        const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
        const parsedUserDataArray = storedUserDataArray && JSON.parse(storedUserDataArray) || [];

      
        if (parsedUserDataArray) {
            setCmpCode(parsedUserDataArray[0].cmpcode.trim())
        }

        if (appUrlFromStorage) {

            let apiUrlEdited = appUrlFromStorage.replace("/api/", '');
            console.log("apiUrlEdited ", apiUrlEdited)
            setAppUrl(apiUrlEdited)
        }

    }

    const fetchMyTask = async () => {
        setShowLoader(true)
        try {
            console.log('fetch job list url ', `${appUrl}/api/Search_Items/${cmpCode}/joblist/-`)
            const response = await axios.get(`${appUrl}/api/Search_Items/${cmpCode}/joblist/-`)

            if (response.status === 200) {
                setMyTaskList(response.data)
                setShowLoader(false)
            }
        } catch (error) {
            console.log('fetchMyTaskError', error)
            setShowLoader(false)
        }
    }

    

    const formattedDate = (date) => {
        return format(new Date(date), 'dd-MM-yy hh:mm a');
    }


    useEffect(() => {
        if (cmpCode && appUrl) {
            fetchMyTask()
        }
    }, [cmpCode, appUrl])

    useEffect(()=>{
        fetchAsycData()
    },[])

    // console.log('myTaskList', myTaskList)

    return (
        // <ScrollView contentContainerStyle={styles.ScrollView}>

        <>
            <HeaderUiNew name={'Material Request'} />

            {
                showLoader && 
                <ActivityIndicator size={'large'} color={'#30B3A4'} />
            }

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
                                <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.jno}</Text>
                                <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.accdesc}</Text>
                                <Text style={[styles.TitleText, { marginVertical: 3 }]}>{item.REGNO}</Text>
                                
                            </View>
                        </View>


                        <View style={styles.TaskItemRight}>
                            {/* <Text style={styles.TitleText}>{item.do_date.split('T')[0]}</Text> */}
                            <Text style={[styles.TitleText, { fontSize: 13 }]}>{formattedDate(item.jdate)}</Text>

                            <View style={styles.BottomButtonCont}>
                                <TouchableOpacity style={styles.DetailsButton} onPress={() => showDetailsPopItem(item)}>
                                    <Text style={styles.DetailsText}>Create Request</Text>
                                </TouchableOpacity>

                              
                            </View>

                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View>
                        <Text style={{ color: 'red' ,padding:20}}>No data available</Text>
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

export default MaterialRequest