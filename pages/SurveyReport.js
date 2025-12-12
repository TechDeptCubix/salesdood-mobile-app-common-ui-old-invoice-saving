import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import TableScreen from './fire_and_safety/TableScreen';
import axios from 'axios';



const SurveyReport = () => {

    const [list_of_equipments, setListOfEquipments] = useState(null)

    useEffect(()=>{
        axios.get(`https://cubixweberp.com:213/api/CpaysCount/SAFEFIRE/SURVEY_TEMPL_MAIN/-/-`).then((res) => {
            setListOfEquipments(res.data)
        }).catch((err) => {

        })
    },[])

    const initial_checkboxList = [{
        category: "A",
        equipment_details: [{
            name: "fire alarm system -addressable",
            status: true
        },
        {
            name: "conventional",
            status: false
        },
        {
            name: "aman/weqayah/hassantik status:connected",
            status: false
        },
        {
            name: "not connected",
            status: false
        },
        {
            name: "face description- common for whole plot",
            status: false
        },
        {
            name: "exclusive to the unit/shop",
            status: false
        },



        ]
    }]

    const [checkboxList, setCheckboxList] = useState(initial_checkboxList)

    const initial_checkboxList_survey_for =
        [{
            name: "RESIDENTIAL & COMMERCIAL BUILDING",
            status: true
        },
        {
            name: "LABOUR ACCOMODATION",
            status: false
        },
        {
            name: "SINGLE WAREHOUSE, SHOP & OFFICES WITH FIRE PROTECTION SYSTEM CONNECTED TO COMMON PUMP",
            status: false
        },
        {
            name: "WAREHOUSE COMPLEX",
            status: false
        },
        {
            name: "FUEL AND OIL",
            status: false
        }
        ]


    const [checkboxList_survey_for, setCheckboxList_survey_for] = useState(initial_checkboxList_survey_for)


    const clickedOnCheckBox = (category_name, name_of_checkbox) => {

        console.log("category_name, name_of_checkbox", category_name, name_of_checkbox)

        let newCheckList = checkboxList.map((itemCb) => {
            if (itemCb.category == category_name) {


                let new_equipment_details = itemCb.equipment_details.map((itemFind) => {
                    if (itemFind.name == name_of_checkbox) {
                        return { ...itemFind, status: !itemFind.status }
                    } else {
                        return itemFind
                    }
                })
                return { ...itemCb, equipment_details: new_equipment_details }
            } else {
                return itemCb
            }

        })

        console.log("newCheckList >>>+++", JSON.stringify(newCheckList, null, 2))

        setCheckboxList(newCheckList)

    }

    const clickedOnCheckBox_survey_for = (name_from_click) => {

        console.log("name_from_click", name_from_click)

        let newCheckList = checkboxList_survey_for.map((itemFind) => {
            if (itemFind.name == name_from_click) {
                return { ...itemFind, status: !itemFind.status }
            } else {
                return itemFind
            }
        })

        console.log("newCheckList_survey_for >>>+++", JSON.stringify(newCheckList, null, 2))

        setCheckboxList_survey_for(newCheckList)

    }

    // Reusable row component
    const FormRow = ({ label, keyboardType = 'default', multiline = false }) => (
        <View style={[styles.column, { width: "48%" }]}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && styles.multilineInput]}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}

            />
        </View>
    );

    const TableRow = ({ item }) => (


        <View style={styles.row}>
            <Text style={styles.cell_sl_no}>{item.subSlno == "1.1" ? item.mainSlno : item.subSlno}</Text>

            {
                item.type_of_question == "mcq" ?

                    <View style={[styles.cell_equipment_mcq, { flexDirection: "row", flexWrap: "wrap" }]}>


                        {
                            item.equipment_details.split(",").map((itemString, index) => {
                                return (
                                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 5, margin: 2, padding: 8 }}>
                                        <Text onPress={() => clickedOnCheckBox("A", itemString)} style={{ fontWeight: "600", color: "#000000" }}>{itemString}</Text>
                                        {console.log(`checkbox ...++ ${index}`, (checkboxList.filter((itemFil) => itemFil.category == "A")[0].equipment_details?.find((itemFind) => itemFind.name == itemString))?.status)}
                                        <CheckBox
                                            value={(checkboxList.filter((itemFil) => itemFil.category == "A")[0].equipment_details?.find((itemFind) => itemFind.name == itemString))?.status}
                                            onValueChange={(newValue) => clickedOnCheckBox("A", itemString)}
                                            tintColors={{ true: '#000000', false: '#000000' }}
                                        />
                                    </View>
                                )
                            })
                        }


                    </View>
                    :
                    <>
                        <View style={[styles.cell_equipment, { flexDirection: "row", flexWrap: "wrap" }]}>
                            <View><Text style={{ fontWeight: "600", color: "#000000" }}>{item.heading}</Text></View>
                            <View><Text style={{ fontWeight: "600", color: "#000000" }}>{item.equipment_details}</Text></View>
                        </View>
                        <TextInput style={styles.inputCell}/>
                        <TextInput style={styles.inputCell} />
                        <TextInput style={styles.inputCell} />
                        <TextInput style={styles.inputCell}  />
                    </>
            }
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ paddingTop: 20, paddingBottom: 200 }}>
                <View contentContainerStyle={{ flexGrow: 1, flexDirection: "row", flexWrap: "wrap" }}>

                    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                        <FormRow label="DATE" />
                        <FormRow label="REF_NO" />
                    </View>

                    <Text style={{ fontSize: 18, color: "#000000", fontWeight: "700", marginTop: 20, marginLeft: 10 }}>SURVEY REPORT FOR</Text>
                    <View style={[styles.cell_equipment_mcq, { flexDirection: "row", flexWrap: "wrap", marginTop: 10 }]}>


                        {
                            checkboxList_survey_for.map((item, index) => {
                                return (
                                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#d7d7d7", borderRadius: 5, margin: 2, padding: 8 }}>
                                        <Text onPress={() => clickedOnCheckBox("A", item)} style={{ fontWeight: "600", color: "#000000" }}>{item.name}</Text>

                                        <CheckBox
                                            value={item.status}
                                            onValueChange={(newValue) => clickedOnCheckBox_survey_for(item.name)}
                                            tintColors={{ true: '#000000', false: '#000000' }}
                                        />
                                    </View>
                                )
                            })
                        }


                    </View>
                    {/* Each row represents a label and its corresponding input */}
                    <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20 }}>
                        <FormRow label="BUILDING NAME" />
                        <FormRow label="CONTACT PERSON" />
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                        <FormRow label="OWNER/REAL ESTATE" />
                        <FormRow label="MOBILE NO" keyboardType="phone-pad" />
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                        <FormRow label="LOCATION" />
                        <FormRow label="E-mail" keyboardType="email-address" />
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                        <FormRow label="BUILDING DETAILS" multiline />
                        <FormRow label="NUMBER OF ROOMS" keyboardType="numeric" />
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                        <FormRow label="NUMBER OF KITCHENS" keyboardType="numeric" />
                        <FormRow label="NUMBER OF OTHER ROOMS" keyboardType="numeric" />
                    </View>
                    <View style={{ flexDirection: "row", padding: 5 }}>
                        <FormRow label="WATCHMAN(NAME & MOBILE)" />
                    </View>
                </View>

                {/* <ScrollView horizontal> */}
                    <View style={styles.container}>


                        {/* Table Header */}
                        <View style={[styles.row, styles.header]}>
                            <Text style={styles.headerCell_sl_no}>Sl. No</Text>
                            <Text style={styles.headerCell_equipment}>Equipment Details</Text>
                            <Text style={styles.headerCell}>Brand</Text>
                            <Text style={styles.headerCell}>Qty</Text>
                            <Text style={styles.headerCell}>Spec</Text>
                            <Text style={styles.headerCell}>Remarks</Text>
                        </View>

                        {/* Sections */}
                        <FlatList
                            data={list_of_equipments}
                            keyExtractor={(item, index) => `section-${index}`}
                            renderItem={({ item }) => (
                               

                                <TableRow item={item} />
                               
                            )}
                        />
                    </View>
                {/* </ScrollView> */}

                <Text style={{ fontSize: 18, color: "#000000", fontWeight: "700", marginTop: 20, marginLeft: 10, }}>FAULTS/COMMENTS</Text>

                <TableScreen />

                <Text style={{ fontSize: 18, color: "#000000", fontWeight: "700", marginTop: 20, marginLeft: 10 }}>NOTES</Text>

                <Text style={{ fontSize: 18, color: "#000000", fontWeight: "400", marginTop: 20, marginLeft: 10 }}>Number & type of rooms in each floor </Text>

                <TextInput style={[styles.cellInput, styles.textArea, { marginBottom: 10, width: "95%", marginLeft: "2%" }]} multiline></TextInput>

                <Text style={{ fontSize: 18, color: "#000000", fontWeight: "400", marginTop: 20, marginLeft: 10 }}>Any Other Comments </Text>

                <TextInput style={[styles.cellInput, styles.textArea, { marginBottom: 10, width: "95%", marginLeft: "2%" }]} multiline></TextInput>


                <TouchableOpacity style={{width:"40%", backgroundColor: "red", flexDirection: "row", alignItems: "center", padding: 4, borderRadius: 5, marginHorizontal: 3,marginBottom: 100, marginHorizontal:"auto", flexDirection:"row", justifyContent:"center" }}><Text style={{color:"#ffffff", fontWeight:"700"}}>SAVE</Text></TouchableOpacity>
            </ScrollView>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        minWidth: 600,
        maxWidth: 600,
        backgroundColor: "#d7d7d7",
        margin: 10,
        borderRadius: 10
    },
    title: {
        fontSize: 20,
        marginBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    sectionHeader: {
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: '#e0e0e0',
        padding: 6,
        marginBottom: 5,
    },
    column: {
        flexDirection: 'column',
        paddingVertical: 5,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
        paddingVertical: 5,
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#000000',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
        color: "#ffffff"
    },
    headerCell_sl_no: {
        flex: 0.6,
        fontWeight: 'bold',
        textAlign: 'center',
        color: "#ffffff",
        padding: 10
    },
    headerCell_equipment: {
        flex: 2,
        fontWeight: 'bold',
        textAlign: 'center',
        color: "#ffffff"
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    cell_sl_no: {
        flex: 0.6,
        textAlign: 'center',
        paddingHorizontal: 4,
        fontWeight: "900",
        color: "#000000"
    },
    cell_equipment: {
        flex: 2,
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    cell_equipment_mcq: {
        flex: 6,
        paddingHorizontal: 4,
    },
    inputCell: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: '#000000',
        backgroundColor: "#ffffff",
        paddingHorizontal: 5,
        marginHorizontal: 2,
        textAlign: 'center',
    },
    label: {
        flex: 1,
        fontWeight: '600',
        fontSize: 14,
        color: '#333',
        paddingRight: 8,
        minWidth: 130,
    },
    input: {
        flex: 2,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        fontSize: 14,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    cellInput: {
        width: 160,
        borderWidth: 1,
        padding: 6,
        fontSize: 13,
        borderRadius: 4,
        borderColor: '#000000',
        backgroundColor: "#ffffff",
        paddingHorizontal: 5,
        marginHorizontal: 2,
        textAlign: 'center',
    },
    textArea: {
        height: 100, // Or minHeight
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        textAlignVertical: 'top', // For Android to align text to the top
    },
});


export default SurveyReport;
