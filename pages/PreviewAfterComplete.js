import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,Alert } from "react-native";

import axios from "axios";
import { format } from 'date-fns';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import ToastManager, { Toast } from 'toastify-react-native'
import mime from "mime";
import RNFS from 'react-native-fs';

function PreviewAfterComplete(props) {

    const { setShowPreview, survey_number, currentCompletedItem } = props

    const [showPreviewContent, setShowPreviewContent] = useState(false)

    const [topPanelObject, setTopPanelObject] = useState(null)
    const [list_of_equipments, setlist_of_equipments] = useState(null)
    const [listOfFaultsComments, setlistOfFaultsComments] = useState(null)

    const getStaticDetails = () => {
        axios.get(`https://cubixweberp.com:213/api/CpaysCount/SAFEFIRE/SURVEY_DETAILSSUB2/${currentCompletedItem.survey_no}/MAIN`).then((res) => {

            if (res.data?.length > 0) {
                setTopPanelObject(res.data[0])
            }


            console.log("res data getStaticDetails", res.data)

        }).catch((err) => {

        })
    }

    const getListOfEquipments = () => {
        axios.get(`https://cubixweberp.com:213/api/CpaysCount/SAFEFIRE/SURVEY_DETAILSMAIN/${currentCompletedItem.survey_no}/main`).then((res) => {
            setlist_of_equipments(res.data)

        }).catch((err) => {

        })
    }


    const getFaultComments = () => {
        axios.get(`https://cubixweberp.com:213/api/CpaysCount/SAFEFIRE/SURVEY_DETAILSSUB/${currentCompletedItem.survey_no}/MAIN`).then((res) => {
            setlistOfFaultsComments(res.data)

        }).catch((err) => {

        })
    }

    useEffect(() => {

        if (currentCompletedItem) {
            getStaticDetails()
            getListOfEquipments()
            getFaultComments()
        }
    }, [currentCompletedItem])

    useEffect(() => {

        if (topPanelObject && listOfFaultsComments && list_of_equipments) {
            setShowPreviewContent(true)

            console.log("topPanelObject ", topPanelObject)
        }

    }, [topPanelObject, listOfFaultsComments, list_of_equipments])


    const uploadImage = (file) => {

        const apiUrl = `http://safefire.dyndns.org:90/api/Image/upload`;
        const pathToStoreImage = `D:\\SALESDOOD_UPLOADED_IMAGES`;



        console.log("file response upload image ", file)



        try {
            // if (!(pickerResponseRef.current?.assets?.[0])) {
            //     Toast.error("No image selected");
            //     console.log("imageDescription>>>> No image selected", imageDescription);
            //     return;
            // }

            const formData = new FormData();

            formData.append('DOC_CODE', currentCompletedItem.survey_no);
            formData.append('DOC_TYPE', 'SR_COMPLETED_DOC');
            //formData.append('DOC_TYPE', 'DOCIMAGE');
            formData.append('IMAGEPATH', pathToStoreImage);
            formData.append('IMGBASE64', 'test'); // Adjust as needed
            formData.append('cmpcode', 'SAFEFIRE');

            formData.append('file', {
                uri: Platform.OS === 'android'
                ? `file://${file.filePath}`
                : file.filePath,
                name: file.filePath.split('/').pop(),
                type: mime.getType(file.filePath),
            });

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            console.log("file.uri ", file.filePath, file.filePath.split('/').pop(), mime.getType(file.filePath))
            console.log('formData +++>>>> pdf upload ', formData, config);

            // return; // ← If testing only, keep this; else remove to continue

            axios.post(apiUrl, formData, config).then((response) => {

                if (response.data.message?.trim() == "Image uploaded successfully.") {

                    console.log('Response:>>>++ inside++', response.data.message);
                    Toast.success("PDF Uploaded successfully");
                    
                    
                }
            }).catch((err) => {
                console.log('err inside++>>', err);
            })


        } catch (error) {
            console.error('Error uploading data:>>>>+++....', error);
            Toast.error('Some error occurred');

            if (error.response) {
                console.log("Error response:", error.response);
            } else if (error.request) {
                console.log("Error request:", error.request);
            } else if (error.message) {
                console.log("Error message:", error.message);
            }
        }
    };

    const createPDF = async () => {
        const htmlContent = `
        <div style="background-color: #ffffff; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 20px; color: #000000; font-weight: bold; text-decoration: underline; text-align: center; display: block; width: 100%; box-sizing: border-box;">
          SURVEY REPORT
        </span>
           
          </div>
      
          <div>
            <p><strong>Date:</strong> ${currentCompletedItem.createdon ? format(new Date(currentCompletedItem.createdon), 'dd-MM-yyyy') : ""}</p>
            <p><strong>Survey Number:</strong> ${topPanelObject.survey_no}</p>
            <p><strong>Survey Report For:</strong> ${topPanelObject.survey_report_for}</p>
            <p><strong>Building Name:</strong> ${topPanelObject.building_name}</p>
            <p><strong>Contact Person:</strong> ${topPanelObject.contact_person}</p>
            <p><strong>Owner Real Estate:</strong> ${topPanelObject.owner_real_estate}</p>
            <p><strong>Mobile Number:</strong> ${topPanelObject.mobile_number}</p>
            <p><strong>Location:</strong> ${topPanelObject.location}</p>
            <p><strong>Email:</strong> ${topPanelObject.e_mail}</p>
            <p><strong>Building Details:</strong> ${topPanelObject.building_details}</p>
            <p><strong>Number of Rooms:</strong> ${topPanelObject.number_of_rooms}</p>
            <p><strong>Number Of Kitchens:</strong> ${topPanelObject.number_of_kitchens}</p>
            <p><strong>Number of Other Rooms:</strong> ${topPanelObject.number_of_other_rooms}</p>
            <p><strong>Watchman Name:</strong> ${topPanelObject.watchman_name}</p>
            <p><strong>Watchman Mobile:</strong> ${topPanelObject.watchman_mobile}</p>
            <p><strong>Survey Done By Name 1:</strong> ${topPanelObject.survey_done_by_name_1}</p>
            <p><strong>Survey Done By Name 2:</strong> ${topPanelObject.survey_done_by_name_2}</p>
            <p><strong>Survey Done By Name 3:</strong> ${topPanelObject.survey_done_by_name_3}</p>
            <p><strong>Checked And Verified By:</strong> ${topPanelObject.checked_and_verified_by_name_of_supervisor}</p>
            <p><strong>Notes and type of rooms in each floor:</strong> ${topPanelObject.notes_number_type_of_rooms_in_each_floor}</p>
            <p><strong>Any other comments:</strong> ${topPanelObject.notes_any_other_comments}</p>
          </div>
      
          <div style="font-size: 16px; color: #009688; margin-top: 10px;">
            <strong>List Of Equipments:</strong>
          </div>
          ${list_of_equipments?.filter(item => item.brand || item.Qty || item.spec || item.remarks)
                .map(item => `
              <div>
                <p><strong>Brand:</strong> ${item.brand}</p>
                <p><strong>Qty:</strong> ${item.Qty}</p>
                <p><strong>Spec:</strong> ${item.spec}</p>
                <p><strong>Remarks:</strong> ${item.remarks}</p>
              </div>
            `).join('')}
            
          <div style="font-size: 16px; color: #009688; margin-top: 10px;">
            <strong>Fault/Comments:</strong>
          </div>
          ${listOfFaultsComments?.filter(item => item.location || item.reason_for_fault || item.rectification_time || item.remarks_install_replace_materials_required)
                .map(item => `
              <div>
                <p><strong>Item Description:</strong> ${item.item_description}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Reason for Fault:</strong> ${item.reason_for_fault}</p>
                <p><strong>Rectification Time:</strong> ${item.rectification_time}</p>
                <p><strong>Remarks:</strong> ${item.remarks_install_replace_materials_required}</p>
              </div>
            `).join('')}
        </div>
      `;
        const options = {
            html: htmlContent,
            fileName: `${topPanelObject.survey_no}_survey_completed`,
            directory: 'Documents',
        };

        try {
            const file = await RNHTMLtoPDF.convert(options);

            console.log('PDF created at: ', file.filePath);


            const exists = await RNFS.exists(file.filePath);
            const stats = await RNFS.stat(file.filePath);

            console.log('Exists:', exists);
            console.log('Size:', stats.size);  // Should be > 0

            uploadImage(file)

            // await Share.open({
            //     title: 'Share Order Details PDF',
            //     url: `file://${file.filePath}`,
            // });




        } catch (error) {
            console.log("error when sharing pdf", error)
        } finally {
            console.log("inside finally")
        }

    };

    return (
        <>

            {
                showPreviewContent ?

                    <ScrollView style={{ margin: 10, borderWidth: 1, borderColor: "#000000", backgroundColor: "#ffffff" }}>
                        <View style={{ backgroundColor: "#ffffff", padding: 20 }}>

                            

                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={{ fontSize: 20, color: "#000000" }}>Preview</Text>
                                <TouchableOpacity onPress={() => setShowPreview(false)} style={[{ backgroundColor: "#009688", marginVertical: 0, paddingVertical: 5, paddingHorizontal:10 }]} ><Text style={{ color: "#ffffff", fontWeight: "400", fontSize: 17 }}>Close</Text></TouchableOpacity>
                            </View>

                            <TouchableOpacity style={[{ backgroundColor: "#000000",width:100, marginVertical: 10, paddingVertical: 10,paddingHorizontal:4 , flexDirection:"row", justifyContent:"center"}]} onPress={() => createPDF()}><Text style={{color:"#ffffff"}}>Upload PDF</Text></TouchableOpacity>

                            <Text style={{marginTop:10}}> Date</Text>
                            <Text style={styles.textValue}> {currentCompletedItem.createdon ? format(new Date(currentCompletedItem.createdon), 'dd-MM-yyyy') : ""}</Text>
                            <Text > Survey Number</Text>
                            <Text style={styles.textValue}> {topPanelObject.survey_no}</Text>
                            <Text> Survey Report For</Text>
                            <Text style={styles.textValue}> {topPanelObject.survey_report_for}</Text>
                            <Text> Building Name</Text>
                            <Text style={styles.textValue}> {topPanelObject.building_name}</Text>
                            <Text> Contact Person</Text>
                            <Text style={styles.textValue}>{topPanelObject.contact_person}</Text>
                            <Text> Owner Real Estate</Text>
                            <Text style={styles.textValue}> {topPanelObject.owner_real_estate}</Text>
                            <Text> Mobile Number</Text>
                            <Text style={styles.textValue}> {topPanelObject.mobile_number}</Text>
                            <Text> Location</Text>
                            <Text style={styles.textValue}> {topPanelObject.location}</Text>
                            <Text> Email</Text>
                            <Text style={styles.textValue}> {topPanelObject.e_mail}</Text>
                            <Text> Building Details</Text>
                            <Text style={styles.textValue}> {topPanelObject.building_details}</Text>
                            <Text> Number of Rooms</Text>
                            <Text style={styles.textValue}> {topPanelObject.number_of_rooms}</Text>
                            <Text> Number Of Kitchens</Text>
                            <Text style={styles.textValue}> {topPanelObject.number_of_kitchens}</Text>
                            <Text> Number of Other Rooms</Text>
                            <Text style={styles.textValue}> {topPanelObject.number_of_other_rooms}</Text>
                            <Text> Watchman Name</Text>
                            <Text style={styles.textValue}> {topPanelObject.watchman_name}</Text>
                            <Text> Watchman Mobile</Text>
                            <Text style={styles.textValue}> {topPanelObject.watchman_mobile}</Text>
                            <Text> Survey Done By Name 1</Text>
                            <Text style={styles.textValue}> {topPanelObject.survey_done_by_name_1}</Text>
                            <Text> Survey Done By Name 2</Text>
                            <Text style={styles.textValue}> {topPanelObject.survey_done_by_name_2}</Text>
                            <Text> Survey Done By Name 3</Text>
                            <Text style={styles.textValue}> {topPanelObject.survey_done_by_name_3}</Text>
                            <Text> Checked And Verified By </Text>
                            <Text style={styles.textValue}> {topPanelObject.checked_and_verified_by_name_of_supervisor}</Text>
                            <Text> Notesand type of rooms in each floor </Text>
                            <Text style={styles.textValue}> {topPanelObject.notes_number_type_of_rooms_in_each_floor}</Text>
                            <Text> Any other comments </Text>
                            <Text style={styles.textValue}> {topPanelObject.notes_any_other_comments}</Text>




                            <Text style={{ fontSize: 16, color: "#009688", marginTop: 10 }}>List Of Equipments</Text>
                            {
                                list_of_equipments?.filter((itemFilter) => itemFilter.brand || itemFilter.Qty || itemFilter.spec || itemFilter.remarks).map((itemMap) => {

                                    return <View>
                                        <Text style={{ fontSize: 16, color: "#000000" }}>{"Brand -" + itemMap.brand}</Text>
                                        <Text style={{ fontSize: 16, color: "#000000" }}>{"Qty - " + itemMap.Qty}</Text>
                                        <Text style={{ fontSize: 16, color: "#000000" }}>{"Spec - " + itemMap.spec}</Text>
                                        <Text style={{ fontSize: 16, color: "#000000" }}>{"Remarks - " + itemMap.remarks}</Text>

                                    </View>

                                })
                            }

                            <Text style={{ fontSize: 16, color: "#009688", marginTop: 10 }}>Fault/Comments</Text>
                            {
                                listOfFaultsComments?.filter((itemFilter) => itemFilter.location || itemFilter.reason_for_fault || itemFilter.rectification_time || itemFilter.remarks_install_replace_materials_required).map((itemMap) => {
                                    return <View >
                                        <Text style={{ fontSize: 16, color: "#000000" }}>{"Item Description -" + itemMap.item_description}</Text>
                                        <Text style={{ fontSize: 16, color: "#000000" }}>{"Location - " + itemMap.location}</Text>
                                        <Text style={{ fontSize: 16, color: "#000000" }}>{"Reason for Fault - " + itemMap.reason_for_fault}</Text>
                                        <Text style={{ fontSize: 16, color: "#000000" }}>{"Rectification Time - " + itemMap.rectification_time}</Text>
                                        <Text style={{ fontSize: 16, color: "#000000" }}>{"Remarks - " + itemMap.remarks_install_replace_materials_required}</Text>
                                    </View>
                                })
                            }

                        </View>

                        <ToastManager />

                    </ScrollView>

                    :
                    <View>
                        <Text>Loading</Text>
                    </View>
            }

        </>
    )
}

const styles = StyleSheet.create({
    HomeWrap: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFEFEF'
    },
    HomeCont: {
        width: '98%',
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: '#EFEFEF',
        height: Dimensions.get('window').height - 70

    },

    CheckStockListView: {
        // backgroundColor: '#FDFDFD',
        width: '95%',
        display: 'flex',
        flexDirection: 'column',
        padding: 8
    },

    CollTableContainer: {
        width: "100%",
        marginTop: 8,
        alignItems: 'center',
        flex: 1,
    },
    ColltableRow: {
        flexDirection: 'row',
        width: '100%',
    },
    CollheaderCell: {
        backgroundColor: '#5A55CA',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 125,
        color: 'white',
        fontFamily: 'Lexend-Bold',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',

    },
    CollheaderCell_SO_Qty: {
        backgroundColor: '#5A55CA',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        flexWrap: 'nowrap',
        width: 90,
        color: 'white',
        fontFamily: 'Lexend-Bold',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
    },
    ColldataCell_SO_Qty: {
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: 90,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'Lexend-Regular'

    },
    ColldataCell: {
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        width: 125,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#dbdbdb',
        color: "black",
        fontFamily: 'Lexend-Regular'

    },

    MainScroll: {
        // width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    StockDescWrap: {
        flexDirection: 'column',
        width: '100%',
        marginTop: 8,
        backgroundColor: 'white',
        padding: 18
    },
    StockItem: {
        padding: 4,
        marginBottom: 2
    },
    StockLabel: {
        fontFamily: 'Lexend-Regular',
        color: "#2B2B2B",
        fontSize: 16
    },
    StockTextValue: {
        fontFamily: 'Lexend-Bold',
        color: "black",
        fontSize: 16
    },


    itemCountText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
    },
    RemarkInputCont: {
        width: '90%',
        backgroundColor: '#F6F6F6',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        borderRadius: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    PlaceHolderInput: {
        width: '100%',
        fontFamily: 'Lexend-Light',
        color: '#2B2B2B'
    },

    DetailsButtonWrap: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingBottom: 52
    },
    DraftButton: {
        backgroundColor: 'orange',
        borderRadius: 4,
        padding: 8
    },
    SaveButton: {
        backgroundColor: 'green',
        borderRadius: 4,
        padding: 8
    },
    ButtonLabel: {
        fontFamily: 'Lexend-Regular',
        color: "white",
        fontSize: 14
    },

    inputContainer: {
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    inputBox: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '100%',
        color: 'black'
    },


    TopBanner: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingVertical: 4,
        width: '100%'
    },

    TopBannerText: {
        fontSize: 14,
        color: '#2B2B2B',
        fontFamily: 'Lexend-Bold',
        padding: 10,
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
        // width: '60%'
        width: 'auto',
        maxWidth: '55%'
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

    Time: {
        width: 28,
        height: 28,
    },
    TitleDescBox: {
        flexDirection: 'column',
        marginLeft: 8,
        marginTop: 8
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
        alignItems: 'center'
    },
    AcceptText: {
        fontSize: 14,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },

    BottomButtonCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8
        // paddingHorizontal: 12
    },

    DetailsButton: {
        backgroundColor: '#D8D8DA',
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
        borderWidth: 0.5,
        borderColor: 'grey',
        marginLeft: 5
    },

    DetailsText: {
        fontSize: 14,
        color: 'black',
        fontFamily: 'Lexend-Regular',
    },
    AcceptButton: {
        backgroundColor: '#30B3A4',
        padding: 8,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
    },
    RejectButton: {
        backgroundColor: '#f00',
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

    SettingsWrap: {
        padding: 6
    },
    HeadIcon: {
        width: 20,
        height: 20
    },
    textValue: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600'
    },


})

export default PreviewAfterComplete