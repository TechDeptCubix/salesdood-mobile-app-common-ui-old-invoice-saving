import axios from 'axios';
import React, { useEffect, useState, memo, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image } from 'react-native';
import { Button } from 'react-native-share';
import ic_placeholder_image from "../../images/ic_camera_no_image.png"


const TableScreen = memo(({ listOfFaultsComments, setListOfFaultsComments, uploadImage }) => {


    // Memoized row component
    const FaultRow = React.memo(({ item, onInputChange, onUpload }) => {
        return (
            <View style={styles.row}>
                <Text style={styles.cell}>{item.item_description}</Text>

                <TextInput
                    value={item.location}
                    onChangeText={(text) => onInputChange(item.mainSlno, "location", text)}
                    style={styles.cellInput}
                />
                 <TextInput
                    value={item.reason_for_fault}
                    onChangeText={(text) => onInputChange(item.mainSlno, "reason_for_fault", text)}
                    style={styles.cellInput}
                />
                <TextInput
                    value={item.rectification_time}
                    onChangeText={(text) => onInputChange(item.mainSlno, "rectification_time", text)}
                    style={styles.cellInput}
                />
                <TextInput
                    value={item.remarks_install_replace_materials_required}
                    onChangeText={(text) => onInputChange(item.mainSlno, "remarks_install_replace_materials_required", text)}
                    style={styles.cellInput}
                />

               <TouchableOpacity
                    onPress={() => onUpload("fault", item.mainSlno)}
                    style={styles.uploadButton}
                >
                    <Text style={styles.uploadText}>Upload</Text>
                </TouchableOpacity>
            </View>
        );
    });



    const uploadFromChild = useCallback(
        (mainNumber, subNumber) => uploadImage(mainNumber, subNumber),
        [uploadImage]
    );

    const handleInputFirstTable = (mainSlno, name_from_typing, text) => {

        

        let filteredMainSlno = listOfFaultsComments.map((item) => {
            if (item.mainSlno == mainSlno) {

                return { ...item, [name_from_typing]: text }


            } else {
                return item
            }
        })

       

        setListOfFaultsComments(filteredMainSlno)


    }

    const onInputChange = useCallback((mainSlno, field, value) => {
        handleInputFirstTable(mainSlno, field, value);
    }, [handleInputFirstTable]);

    const onUpload = useCallback((type, mainSlno) => {
        uploadFromChild(type, mainSlno);
    }, [uploadFromChild]);

    const renderItem = useCallback(({ item }) => (
        <FaultRow item={item} onInputChange={onInputChange} onUpload={onUpload} />
    ), [onInputChange, onUpload]);

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
                    renderItem={renderItem}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={true} // On Android helps reduce memory
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

export default TableScreen;
