import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, FlatList, SectionList, ActivityIndicator, PermissionsAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';


const PickCheckDetailsPop = ({
    setDetailsPop, detailsPopItem, portNo,
    cmpCode, selectedValue, loginUser, deptno, appUrl, acceptPage
}) => {

    const [details, setDetails] = useState('')

    const [showLoader, setShowLoader] = useState(false)

    const [pdfUri, setPdfUri] = useState(null);

    const generatePDF = async () => {

        if (Platform.OS === 'android') {
            try {
                console.log('Requesting permission...');
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to your storage to download the PDF',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                console.log('Permission result:', granted);
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('You can use the storage');
                } else {
                    console.log('Storage permission denied');
                }
            } catch (err) {
                console.warn('Permission request error:', err);
            }
        }


        const htmlContent2 = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Table Example</title>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Lexend', sans-serif;
            margin: 0;
            padding: 0;
        }

       .statementHead {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items:center;
        }

        .dateText {
            margin-left:8px;
        }

        .CustomerDetails {
            display: flex;
            flex-direction: column;
            width: 100%;
            padding: 4px 12px;
        }

        .CustomerDetailsTab {
            display: flex;
            flex-direction: row;
            padding: 4px 12px;
        }

        .NameTag {
            width: 130px;
        }

        .ValueTag {
            margin-left: 12px;
        }

        .table-container {
            width: 100%;
            margin-top: 8px;
            align-items: center;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .table {
            width: 100%;
            overflow-x: auto;
            border-collapse: collapse;
        }

        .table-row {
            display: table-row;
        }

        .header-row {
            background-color: #5A55CA;
            color: white;
            font-weight: bold;
        }

        .header-cell, .data-cell {
            padding: 10px;
            text-align: center;
            border: 1px solid #dbdbdb;
           width: 100px;
        }

        .total-values-wrap {
            width: 100%;
            display: flex;
            flex-direction: column;
        }

        .total-cont {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            border: 1px solid #dbdbdb;
            padding-right: 12px;
        }

        .total-label {
            background-color: #5A55CA;
            color: white;
            font-weight: bold;
            text-align: center;
           width: 150px;
            padding: 10px;
        }

        .total-value-text {
            font-size: 16px;
            color: #1A6CF6;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="table-container">

        <div class="statementHead">
            <div><h2>Picking List Details</h2></div>
        </div>

        <div class="CustomerDetails">
            <div class="CustomerDetailsTab">
                <div class="NameTag">Customer Name</div>
                <div>:</div>
                <div class="ValueTag">${detailsPopItem && detailsPopItem.Customer}</div>
            </div>
            <div class="CustomerDetailsTab">
                <div class="NameTag">SO NO</div>
                <div>:</div>
                <div class="ValueTag">${detailsPopItem && detailsPopItem.SO_NO}</div>
            </div>
            <div class="CustomerDetailsTab">
                <div class="NameTag">Sales Man</div>
                <div>:</div>
                <div class="ValueTag">${detailsPopItem && detailsPopItem.sale_man}</div>
            </div>
            <div class="CustomerDetailsTab">
                <div class="NameTag">SO Date</div>
                <div>:</div>
                <div class="ValueTag">${detailsPopItem && formattedDate(detailsPopItem.so_date)}</div>
            </div>
          
        </div>


        <table class="table">
            <thead>
                <tr class="table-row header-row">
                    <th class="header-cell">SO No</th>
                    <th class="header-cell">Code</th>
                    <th class="header-cell">Description</th>
                    <th class="header-cell">Pick_Qty</th>
                    <th class="header-cell">SO_Qty</th>
                    <th class="header-cell">soUid</th>
                </tr>
            </thead>
          <tbody>
                ${details && details.map(zone => `
                    <tr class="zone-header">
                        <td colspan="6" class="zone-header-cell">Zone: ${zone.label}</td>
                    </tr>
                    ${zone.data.map(item => `
                        <tr class="table-row">
                            <td class="data-cell">${item.so_no}</td>
                            <td class="data-cell">${item.Code}</td>
                            <td class="data-cell">${item.Description}</td>
                            <td class="data-cell">${item.Pick_Qty}</td>
                            <td class="data-cell">${item.SO_Qty}</td>
                            <td class="data-cell">${item.soUid}</td>
                        </tr>
                    `).join('')}
                `).join('')}
           </tbody>
        </table>
    </div>
</body>
</html>
`;


        let options = {

            html: htmlContent2,
            fileName: 'pickingDetails',
            directory: 'Documents',
        };

        try {
            const file = await RNHTMLtoPDF.convert(options);
            setPdfUri(`file://${file.filePath}`);
            await Share.open({
                title: 'Share Order Details PDF',
                url: `file://${file.filePath}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    // const dono = detailsPopItem.do_no

    // const itemDeptno = detailsPopItem.deptno.trim()

    const fetchPickListDetail = async (sono) => {
        setShowLoader(true)
        try {
            console.log(`${appUrl}Sales_Order/${cmpCode}/PICKING_ITEM/-/${deptno}/${sono}`)
            const response = await axios.get(`${appUrl}Sales_Order/${cmpCode}/PICKING_ITEM/-/${deptno}/${sono}`)

            //
            let zoneWiseObject = {}

            response.data.forEach((item) => {

                const ZoneName = item.Zone;

                if (!zoneWiseObject[ZoneName]) {
                    zoneWiseObject[ZoneName] = []
                }

                zoneWiseObject[ZoneName].push(item)
            })

            let loopy = Object.entries(zoneWiseObject).map(([label, data]) => ({ label, data }));

            console.log("loopy +++", loopy)

            loopy.map((item) => {
                item.data.map((itemInside) => {
                    console.log("item inside lllll ", itemInside.Code
                    )
                })
            })

            //


            //setDetails(response.data)
            setDetails(loopy)
            setShowLoader(false)

        } catch (error) {
            console.log('fetchPickListDetailError', error)
            setError('Some Error Occured')
            setShowLoader(false)
        }
    }

    const fetchAcceptedPickListDetail = async (sono) => {
        setShowLoader(true)
        try {
            console.log(`${appUrl}Sales_Order/${cmpCode}/STARTED_PICKING_ITEM/-/${deptno}/${sono}`)
            const response = await axios.get(`${appUrl}Sales_Order/${cmpCode}/STARTED_PICKING_ITEM/-/${deptno}/${sono}`)

            //
            let zoneWiseObject = {}

            response.data.forEach((item) => {

                const ZoneName = item.Zone;

                if (!zoneWiseObject[ZoneName]) {
                    zoneWiseObject[ZoneName] = []
                }

                zoneWiseObject[ZoneName].push(item)
            })

            let loopy = Object.entries(zoneWiseObject).map(([label, data]) => ({ label, data }));

            console.log("loopy +++", loopy)

            loopy.map((item) => {
                item.data.map((itemInside) => {
                    console.log("item inside lllll ", itemInside.Code
                    )
                })
            })

            //

            setDetails(loopy)
            setShowLoader(false)

        } catch (error) {
            console.log('fetchPickListDetailError', error)
            setError('Some Error Occured')
            setShowLoader(false)
        }
    }

    const DATA = [
        {
            label: 'Main dishes',
            data: ['Pizza', 'Burger', 'Risotto'],
        },
        {
            label: 'Sides',
            data: ['French Fries', 'Onion Rings', 'Fried Shrimps'],
        },
        {
            label: 'Drinks',
            data: ['Water', 'Coke', 'Beer'],
        },
        {
            label: 'Desserts',
            data: ['Cheese Cake', 'Ice Cream'],
        },
    ];

    // const fetchDetails = async () => {
    //     try {
    //         console.log('fetchDetailsUrl', `https://cubixweberp.com:${portNo}/${cmpCode}/DO_DETAILS/${selectedValue}/${loginUser}/${itemDeptno}/${dono}/`)
    //         const response = await axios.get(`https://cubixweberp.com:${portNo}/${cmpCode}/DO_DETAILS/${selectedValue}/${loginUser}/${itemDeptno}/${dono}/`)

    //         if (response.status === 200) {
    //             setDetails(response.data)
    //         }
    //     } catch (error) {
    //         console.log('fetchDetailsError', error)
    //     }
    // }

    useEffect(() => {
        if (appUrl && cmpCode && deptno && detailsPopItem) {

            if (acceptPage) {
                fetchAcceptedPickListDetail(detailsPopItem['SO_NO'])
            }
            if (!acceptPage) {
                fetchPickListDetail(detailsPopItem['SO_NO'])
            }
        }
    }, [appUrl, cmpCode, deptno, detailsPopItem, acceptPage])

    console.log('details', details)
    console.log('detailsPopItem', detailsPopItem)

    const formattedDate = (date) => {
        return format(new Date(date), 'dd-MM-yy hh:mm a');
    }

    return (
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>

                <View style={styles.HomeTextCont}>
                    <TouchableOpacity style={styles.SettingsWrap} onPress={() => setDetailsPop(false)}>
                        <Image style={styles.HeadIcon} source={require('../images/lftArr.png')} />
                        <Text style={styles.HomeText}>Details</Text>
                    </TouchableOpacity>

                    {
                        details &&
                        <View style={styles.PDFWrap}>
                            <TouchableOpacity style={styles.ViewButton} onPress={() => generatePDF()}>
                                <Text style={styles.ViewText}>PRINT</Text>
                            </TouchableOpacity>
                        </View>

                    }
                </View>

                <View style={styles.StockDescWrap}>

                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Customer</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && detailsPopItem.Customer}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>SO_NO</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && detailsPopItem.SO_NO}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>Sales Man</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && detailsPopItem.sale_man}</Text>
                    </View>
                    <View style={styles.StockItem}>
                        <Text style={styles.StockLabel}>SO_Date</Text>
                        <Text style={styles.StockTextValue}>{detailsPopItem && formattedDate(detailsPopItem.so_date)}</Text>
                    </View>

                </View>

                <View style={styles.BottomListCont}>

                    <View style={styles.BottomListBanner}>
                        <View style={styles.ItemBannerCont}>
                            <Text style={styles.BannerText}>Item</Text>
                        </View>
                        <View style={styles.QtyBannerCont}>
                            <Text style={[styles.BannerText, { textAlign: 'right' }]}>Pick Qty</Text>
                        </View>
                        <View style={styles.QtyBannerCont}>
                            <Text style={[styles.BannerText, { textAlign: 'right' }]}>SO Qty</Text>
                        </View>
                    </View>

                </View>

                {
                    showLoader &&
                    <ActivityIndicator />
                }

                {
                    !showLoader &&

                    <SectionList
                        style={{ padding: 12 }}
                        sections={details}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ section }) => (
                            <FlatList
                                data={section.data}
                                horizontal={true}
                                renderItem={({ item }) =>
                                    <View style={styles.BottomListWrap}>
                                        <View style={styles.ItemBannerCont}>
                                            <Text style={[styles.BannerText, { fontFamily: 'Lexend-Regular', fontSize: 14 }]}>{item.Code}</Text>
                                            <Text style={[styles.BannerText, { fontFamily: 'Lexend-Regular', fontSize: 14 }]}>{item.BIN}</Text>
                                            <Text style={[styles.BannerText, { fontFamily: 'Lexend-Bold', fontSize: 14 }]}>{item.Description}</Text>
                                        </View>
                                        <View style={styles.QtyBannerCont}>
                                            <Text style={[styles.BannerText, { fontFamily: 'Lexend-Bold', fontSize: 14, textAlign: 'right' }]}>{item.Pick_Qty}</Text>
                                        </View>
                                        <View style={styles.QtyBannerCont}>
                                            <Text style={[styles.BannerText, { fontFamily: 'Lexend-Bold', fontSize: 14, textAlign: 'right' }]}>{item.SO_Qty}</Text>
                                        </View>
                                    </View>
                                }
                            />
                        )}
                        renderSectionHeader={({ section: { label } }) => (
                            <Text style={styles.StockTextValue}>Zone : {label}</Text>
                        )}

                        ListEmptyComponent={
                            <View>
                                <Text style={{ color: 'red' }}>No data available</Text>
                            </View>
                        }
                    />
                }


            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2,
        backgroundColor: '#00000080',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 5,
        width: '95%',
        maxHeight: Dimensions.get('window').height - 100
    },
    HomeTextCont: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#DCDBDB',
        // paddingVertical: 10,
        // paddingHorizontal: 6
    },
    HomeText: {
        fontSize: 18,
        color: '#1A6CF6',
        // borderBottomColor: 'gold',
        // borderBottomWidth: 2,
        marginTop: 6,
        marginLeft: 6,
        paddingBottom: 8,
        fontFamily: 'Lexend-Regular'
    },
    SettingsWrap: {
        // backgroundColor: '#189A2E',
        // backgroundColor: 'red',
        // borderRadius: 50,
        padding: 6,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    HeadIcon: {
        width: 20,
        height: 20
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
        fontSize: 14
    },
    StockTextValue: {
        fontFamily: 'Lexend-Bold',
        color: "black",
        fontSize: 14
    },

    TableContainer: {
        width: "100%",
        // padding: 10,
        marginTop: 8,
        alignItems: 'center',
    },

    BottomListCont: {
        flexDirection: 'column',
        justifyContent: 'center',
        // alignItems: 'center',
        width: '100%',
        paddingHorizontal: 8
    },
    BottomListBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomColor: 'grey',
        borderBottomWidth: 1
    },
    ItemBannerCont: {
        width: '70%'
    },
    QtyBannerCont: {
        width: '15%',
        textAlign: 'right'
    },
    BannerText: {
        fontFamily: 'Lexend-Bold',
        color: "#2B2B2B",
        fontSize: 12
    },
    ScrollView: {
        maxHeight: 200
    },

    BottomListWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },

    PDFWrap: {
        // width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        right: 10
        // paddingBottom: 32
    },

    ViewButton: {
        backgroundColor: '#30B3A4',
        padding: 8,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: 'grey',
    },
    ViewText: {
        fontSize: 12,
        color: 'white',
        fontFamily: 'Lexend-Regular',
    },


})

export default PickCheckDetailsPop