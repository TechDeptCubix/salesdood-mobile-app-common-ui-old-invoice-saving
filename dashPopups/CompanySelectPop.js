import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { setDefaultOptions } from 'date-fns'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';


const CompanySelectPop = ({ setShowSwitchCmp }) => {

    const [selectedCompany, setSelectedCompany] = useState(null)

    const [loggedCompany, setLoggedCompany] = useState(null)

    const [cmpyList, setCmpnyList] = useState(null)

    const [cmpcode, setCmpCode] = useState('')

    const navigation = useNavigation();


    useEffect(() => {
        const fetchData = async () => {
            // Retrieve the selected company details from local storage
            const selectedCompanyString = await AsyncStorage.getItem("selectedCompany");

            // Check if a selected company is stored in local storage
            if (selectedCompanyString) {
                const selectedCompany = JSON.parse(selectedCompanyString);
                // Access the company details and set them as states
                setSelectedCompany(selectedCompany.cmpcode);

                setLoggedCompany(selectedCompany.cmpcode)
            } else {
                // Handle the case where no selected company is found
                console.error("No selected company found in local storage");
            }
        };

        fetchData();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    const storedUserDataArray = await AsyncStorage.getItem("userDataArray");
                    const parsedUserDataArray = JSON.parse(storedUserDataArray) || [];

                    setCmpnyList(parsedUserDataArray)

                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };

            fetchData();
        }, [])
    );

    const handleCompanySwitch = async (item) => {

        // console.log('setCmpnyClick', item)
        const selectedCompany = cmpyList.find(company => company.cmpcode === item);

        // console.log('selectedCompanyClick', selectedCompany)

        // console.log(selectedCompany, 'selectedCompany')
        // if (selectedCompany.cmpcode === cmpcode) {
        //     return
        // } 

        if (!selectedCompany.User || selectedCompany.User.trim() === '') {
            try {
                // Save the selected company to AsyncStorage
                await AsyncStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
                // Navigate to the login page
                navigation.navigate('LoginPage');
            } catch (error) {
                console.error('Error saving selected company to AsyncStorage:', error);
            }
        } else if (selectedCompany && selectedCompany.User) {

            try {
                // Save the selected company to AsyncStorage
                await AsyncStorage.setItem('selectedCompany', JSON.stringify(selectedCompany));
                // Navigate to the login page
                navigation.navigate('LoginPage');
            } catch (error) {
                console.error('Error saving selected company to AsyncStorage:', error);
            }
            // setIsLoading(true);
            // localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany))
            // window.location.reload();
        }
    }

    // console.log('cmpyList', cmpyList)
    console.log('selectedCompany', selectedCompany)
    console.log('loggedCompany', loggedCompany)
    return (
        <View style={styles.SwitchCmpModalWrapper}>

            <View style={styles.SwitchCmpModal}>

                <View style={styles.TopBanner}>
                    <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>Select a Company</Text>
                    <TouchableOpacity style={styles.closeIcon} onPress={() => setShowSwitchCmp(false)}>
                        <Image style={{ width: 25, height: 25 }} source={require('../dashImages/close.png')} />
                    </TouchableOpacity>
                </View>

                {/* <ScrollView nestedScrollEnabled={true} style={styles.CmpListWrap}>

                    <TouchableOpacity style={styles.CmpItems} onPress={() => setSelectedCompany('PENDULUM')}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', padding: 4 }}>Pendulum</Text>
                        <Text style={{ fontSize: 16, color: 'black', padding: 4 }}>12345</Text>

                        {
                            selectedCompany === 'PENDULUM' &&
                            <View style={styles.SelectBanner}>
                                <Text style={styles.SelectText}>Selected</Text>
                            </View>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.CmpItems} onPress={() => setSelectedCompany('FORUM')}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', padding: 4 }}>FORUM</Text>
                        <Text style={{ fontSize: 16, color: 'black', padding: 4 }}>12345</Text>

                        {
                            selectedCompany === 'FORUM' &&
                            <View style={styles.SelectBanner}>
                                <Text style={styles.SelectText}>Selected</Text>
                            </View>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.CmpItems} onPress={() => setSelectedCompany('MANTY')}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', padding: 4 }}>MANTY</Text>
                        <Text style={{ fontSize: 16, color: 'black', padding: 4 }}>12345</Text>

                        {
                            selectedCompany === 'MANTY' &&
                            <View style={styles.SelectBanner}>
                                <Text style={styles.SelectText}>Selected</Text>
                            </View>
                        }
                    </TouchableOpacity>

                </ScrollView> */}

                <ScrollView nestedScrollEnabled={true} style={styles.CmpListWrap}>
                    {
                        cmpyList &&
                        cmpyList.map(company => (
                            <TouchableOpacity
                                key={company.cmpcode}
                                style={styles.CmpItems}
                                onPress={() => setSelectedCompany(company.cmpcode)}
                            >
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', padding: 4 }}>{company.cmpcode}</Text>
                                <Text style={{ fontSize: 16, color: 'black', padding: 4 }}>{company.publick}</Text>

                                {selectedCompany === company.cmpcode && (
                                    <View style={styles.SelectBanner}>
                                        <Text style={styles.SelectText}>Selected</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                </ScrollView>

                {
                    loggedCompany && loggedCompany !== selectedCompany &&
                    <View style={styles.SetCompanyWrap}>
                        <TouchableOpacity style={styles.SetCmpnyButton} onPress={() => handleCompanySwitch(selectedCompany)}>
                            <Text style={{
                                color: 'white'
                            }}>
                                Set Company
                            </Text>
                        </TouchableOpacity>
                    </View>
                }

            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    SwitchCmpModalWrapper: {
        zIndex: 2,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: Dimensions.get('window').height,
    },
    SwitchCmpModal: {
        backgroundColor: 'white',
        position: 'absolute',
        top: '10%',
        left: '5%',
        right: '5%',
        width: '90%',
        height: 500,
        borderRadius: 8
    },
    TopBanner: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12
    },
    closeIcon: {
        backgroundColor: '#D9D9D9',
        padding: 8
    },
    CmpListWrap: {
        width: '100%',
        padding: 8
    },
    CmpItems: {
        padding: 12,
        marginBottom: 12,
        backgroundColor: "#D9D9D9",
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    SelectBanner: {
        justifyContent: 'center',
        flexDirection: 'row'
    },
    SelectText: {
        backgroundColor: 'purple',
        color: 'white',
        padding: 8,
        borderRadius: 4
    },
    SetCompanyWrap: {
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4
    },
    SetCmpnyButton: {
        backgroundColor: 'green',
        padding: 12,
        borderRadius: 8
    }
})

export default CompanySelectPop