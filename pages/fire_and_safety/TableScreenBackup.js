import axios from 'axios';
import React, { useEffect, useState, memo, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image } from 'react-native';
import { Button } from 'react-native-share';
import ic_placeholder_image from "../../images/ic_camera_no_image.png"
import ic_camera from "../../images/ic_camera.png"


const TableScreenBackup = memo(({ listOfFaultsComments, setListOfFaultsComments, uploadImage, setVisible, URI }) => {

    const [currentImageRow, setCurrentImageRow] = useState(null)



    const uploadFromChild = useCallback(
        (mainNumber, subNumber) => uploadImage(mainNumber, subNumber),
        [uploadImage]
    );


    const handleInputFirstTable = (mainSlno, name_from_typing, text) => {

        console.log("mainSlno text", mainSlno, name_from_typing, text)

        let filteredMainSlno = listOfFaultsComments.map((item) => {
            if (item.mainSlno == mainSlno) {

                return { ...item, [name_from_typing]: text }


            } else {
                return item
            }
        })

        console.log("filteredMainSlno -->", filteredMainSlno)

        setListOfFaultsComments(filteredMainSlno)


    }


    useEffect(() => {
        console.log("URI -->>++ ", URI)
    }, [URI])


    const clickedOnImageUpload = useCallback(() => {
        setVisible(prev => !prev);
    }, []);

    return (
        <ScrollView horizontal>

            <View style={styles.container}>
                {/* Table Header */}
                <View style={[styles.row, styles.header]}>
                    <Text style={[styles.cell, styles.headerCell]}>Item Description</Text>
                    <Text style={[styles.cell, styles.headerCell]}>Location</Text>
                    <Text style={[styles.cell, styles.headerCell]}>Reason for Fault</Text>
                    <Text style={[styles.cell, styles.headerCell]}>Rectification Time</Text>
                    <Text style={[styles.cell, styles.headerCell]}>Remarks</Text>
                    <Text style={[styles.cell, styles.headerCell]}>Photo</Text>
                </View>

                {/* Table Rows */}
                <FlatList
                    data={listOfFaultsComments}
                    keyExtractor={(item, index) => item.mainSlno}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <Text style={styles.cell}>{item.item_description}</Text>
                            <TextInput value={item.location} onChangeText={(text) => handleInputFirstTable(item.mainSlno, "location", text)} style={styles.cellInput} />
                            <TextInput value={item.reason_for_fault} onChangeText={(text) => handleInputFirstTable(item.mainSlno, "reason_for_fault", text)} style={styles.cellInput} />
                            <TextInput value={item.rectification_time} onChangeText={(text) => handleInputFirstTable(item.mainSlno, "rectification_time", text)} style={styles.cellInput} />
                            <TextInput value={item.remarks_install_replace_materials_required} onChangeText={(text) => handleInputFirstTable(item.mainSlno, "remarks_install_replace_materials_required", text)} style={styles.cellInput} />

                            <TouchableOpacity style={{ backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "#000000", borderRadius: 4 }} onPress={() => { clickedOnImageUpload(); setCurrentImageRow(item.mainSlno + "" + item.subSlno) }}><Image style={{ width: 20, height: 20 }} source={ic_camera} /><Text style={{ marginLeft: 4, padding: 4, color: "#000000", fontWeight: 500 }}>Select Image</Text></TouchableOpacity>

                            {currentImageRow &&
                                currentImageRow == item.mainSlno + "" + item.subSlno && URI != null && URI != '' &&
                                <View style={{ flexDirection: "column" }}>
                                    <Image
                                        style={{
                                            width: 100, height: 100,
                                            borderColor: '#ffffff',
                                            borderWidth: 4,
                                        }}
                                        source={{ uri: URI }}
                                    />

                                </View>
                            }

                            <TouchableOpacity onPress={() => uploadFromChild("fault", item.mainSlno)} style={{ width: "50px", backgroundColor: "red", flexDirection: "row", alignItems: "center", padding: 4, borderRadius: 5, marginHorizontal: 3, marginHorizontal: "auto", flexDirection: "row", justifyContent: "center" }}><Text style={{ color: "#ffffff", fontWeight: "700" }}>Upload</Text></TouchableOpacity>
                        </View>
                    )}
                />
            </View>
        </ScrollView>
    );
});

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 8,
    },
    headerRow: {
        backgroundColor: '#f0f0f0',
    },
    cell: {
        width: 160,
        paddingHorizontal: 6,
        textAlignVertical: 'center',
        fontSize: 13,
        fontWeight: "600",
        color: "#000000"
    },
    cellInput: {
        width: 160,
        borderWidth: 1,
        padding: 4,
        fontSize: 13,
        borderRadius: 4,
        borderColor: '#000000',
        backgroundColor: "#ffffff",
        paddingHorizontal: 5,
        marginHorizontal: 2,
    },
    headerCell: {
        fontWeight: 'bold',
        color: "#ffffff",
        padding: 10
    },
    container: {
        minWidth: 600,
        backgroundColor: "#d7d7d7",
        margin: 10,
        borderRadius: 10
    },
    header: {
        backgroundColor: '#000000',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
});

export default TableScreenBackup;
