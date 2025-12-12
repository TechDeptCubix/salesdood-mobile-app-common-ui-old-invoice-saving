import React, { useMemo, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Dimensions, ScrollView
} from 'react-native';
import {
    RecyclerListView, DataProvider, LayoutProvider
} from 'recyclerlistview';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ROW_HEIGHT = 60; // Adjust as needed

const TableRecyclerView = ({ listOfFaultsComments, setListOfFaultsComments, uploadImage  }) => {



    const recyclerRef = useRef(null);

    const dataProvider = useMemo(() => {
        const safeList = Array.isArray(listOfFaultsComments) ? listOfFaultsComments : [];
        return new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(safeList);
    }, [listOfFaultsComments]);

    const layoutProvider = useMemo(() =>
        new LayoutProvider(
            () => 'ROW',
            (type, dim) => {
                dim.width = SCREEN_WIDTH;
                dim.height = ROW_HEIGHT;
            }
        ),
        []
    );


    const onInputChange = useCallback((mainSlno, field, value) => {
        handleInputFirstTable(mainSlno, field, value);
    }, [handleInputFirstTable]);

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

    const rowRenderer = (type, item) => (
        <ScrollView horizontal>
            <View style={styles.row}>
                <Text style={styles.cell}>{item.item_description}</Text>
                <TextInput
                    style={styles.cellInput}
                    value={item.location}
                    onChangeText={text => onInputChange(item.mainSlno, 'location', text)}
                />
                <TextInput
                    style={styles.cellInput}
                    value={item.reason_for_fault}
                    onChangeText={text => onInputChange(item.mainSlno, 'reason_for_fault', text)}
                />
                <TextInput
                    style={styles.cellInput}
                    value={item.rectification_time}
                    onChangeText={text => onInputChange(item.mainSlno, 'rectification_time', text)}
                />
                <TextInput
                    style={styles.cellInput}
                    value={item.remarks_install_replace_materials_required}
                    onChangeText={text =>
                        onInputChange(item.mainSlno, 'remarks_install_replace_materials_required', text)
                    }
                />
                <TouchableOpacity
                    onPress={() => onUpload('fault', item.mainSlno)}
                    style={styles.uploadButton}
                >
                    <Text style={styles.uploadText}>Upload</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <ScrollView horizontal>
                <View style={[styles.row, styles.header]}>
                    {['Item Description', 'Location', 'Reason for Fault', 'Rectification Time', 'Remarks', 'Photo'].map((label, i) => (
                        <Text key={i} style={[styles.cell, styles.headerCell]}>{label}</Text>
                    ))}
                </View>
            </ScrollView>

            <View style={{ height: 500, flex: 1 }}>
                {/* RecyclerListView Body */}
                <RecyclerListView
                    ref={recyclerRef}
                    dataProvider={dataProvider}
                    layoutProvider={layoutProvider}
                    rowRenderer={rowRenderer}
                    scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
        backgroundColor: '#d7d7d7',
        borderRadius: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    cell: {
        width: 160,
        paddingHorizontal: 6,
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
    },
    cellInput: {
        width: 160,
        borderWidth: 1,
        padding: 4,
        fontSize: 13,
        borderRadius: 4,
        borderColor: '#000',
        backgroundColor: '#fff',
        marginHorizontal: 2,
    },
    header: {
        backgroundColor: '#000',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    headerCell: {
        color: '#fff',
        fontWeight: 'bold',
        padding: 10,
    },
    uploadButton: {
        width: 50,
        backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        borderRadius: 5,
        marginHorizontal: 3,
    },
    uploadText: {
        color: '#fff',
        fontWeight: '700',
    },
});

export default TableRecyclerView;
