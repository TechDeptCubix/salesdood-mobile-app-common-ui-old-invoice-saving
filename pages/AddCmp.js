import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, View, TextInput, TouchableOpacity, Text, Image, KeyboardAvoidingView, ActivityIndicator, ImageBackground, Dimensions } from 'react-native'
import cbxLogo from '../images/cbxLogo.png'
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ToastManager, { Toast } from 'toastify-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';



const AddCmp = () => {
    return (
        <View style={{
            flexGrow: 1, backgroundColor: '#1A6CF6'
        }}>

            <ToastManager width={350} height={100} textStyle={{ fontSize: 17 }} />

            <View>
                <ImageBackground
                    source={require('../images/top_slant.png')}
                    style={styles.topCont}
                    imageStyle={{ backgroundColor: 'transparent' }}
                >
                    <View style={styles.topCirclesCont}>
                        <Image source={require('../images/top_right_circles.png')} style={styles.topCirclesImg}></Image>
                    </View>
                </ImageBackground>
            </View>

            <View>
                <ImageBackground
                    source={require('../images/bottom_slant.png')}
                    style={styles.bottomCont}
                    imageStyle={{ backgroundColor: 'transparent' }}
                >

                    {/* leftImg */}
                    <View style={styles.leftImgCont}>
                        <Image source={require('../images/left_side_bg.png')} style={styles.leftImg}></Image>
                    </View>
                    {/* leftImg */}

                    {/* rightImg */}
                    <View style={styles.rightImgCont}>
                        <Image source={require('../images/right_side_bg.png')} style={styles.rightImg}></Image>
                    </View>
                    {/* rightImg */}


                    <View style={styles.CmpSwtchWrap}>
                        <Text style={styles.cmpcodeText}>{cmpcode}</Text>

                        <View>
                            <TouchableOpacity style={styles.SwtchCmpButtonWrap}>
                                <Image style={styles.SwtchIcon} source={require('../images/swtchCmp.png')} />
                                <Text style={styles.cmpcodeText}>Switch company</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                </ImageBackground>
            </View>
        </View>
    )
}

export default AddCmp