import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native'
import React from 'react'


const ApprovalPop = ({ setShowApprovals, showApprovals }) => {
    return (
        <View style={styles.ApprovalsWrapper}>
            <View style={styles.ApprovalCont}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: "#5355B4" }}>Approvals</Text>

                <TouchableOpacity onPress={() => setShowApprovals(!showApprovals)} style={styles.closeIcon}>
                    <Image style={{ width: 25, height: 25 }} source={require('../dashImages/close.png')} />
                </TouchableOpacity>
            </View>

            <ScrollView nestedScrollEnabled={true} contentContainerStyle={styles.ApprovalListCont}>
                <>
                    <View style={{
                        marginBottom: 60
                    }}>
                        <View style={styles.ApprovalItemCont}>
                            <View style={{
                                paddingVertical: 8,
                                borderBottomColor: '#DEE2EE',
                                borderBottomWidth: 1
                            }}>
                                <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>Edit needed for order 135</Text>
                            </View>

                            <View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/avatar.png')} />
                                    <Text style={{ fontSize: 16, color: '#499FED' }}>James Paul</Text>
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/calendar.png')} />
                                    <Text style={{ fontSize: 16 }}>Dec 14</Text>
                                </View>


                            </View>

                            <View style={styles.ApprovalsOptions}>
                                {/* <Text>Dec 14</Text> */}
                                <View style={styles.ApprovalsButtons}>
                                    <TouchableOpacity style={styles.RejectButton}>
                                        <Text style={{ color: 'red' }}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.ApproveButton}>
                                        <Text style={{ color: 'green' }}>Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.ApprovalItemCont}>
                            <View style={{
                                paddingVertical: 8,
                                borderBottomColor: '#DEE2EE',
                                borderBottomWidth: 1
                            }}>
                                <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>Edit needed for order 135</Text>
                            </View>

                            <View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/avatar.png')} />
                                    <Text style={{ fontSize: 16, color: '#499FED' }}>James Paul</Text>
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/calendar.png')} />
                                    <Text style={{ fontSize: 16 }}>Dec 14</Text>
                                </View>


                            </View>

                            <View style={styles.ApprovalsOptions}>
                                {/* <Text>Dec 14</Text> */}
                                <View style={styles.ApprovalsButtons}>
                                    <TouchableOpacity style={styles.RejectButton}>
                                        <Text style={{ color: 'red' }}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.ApproveButton}>
                                        <Text style={{ color: 'green' }}>Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.ApprovalItemCont}>
                            <View style={{
                                paddingVertical: 8,
                                borderBottomColor: '#DEE2EE',
                                borderBottomWidth: 1
                            }}>
                                <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>Edit needed for order 135</Text>
                            </View>

                            <View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/avatar.png')} />
                                    <Text style={{ fontSize: 16, color: '#499FED' }}>James Paul</Text>
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/calendar.png')} />
                                    <Text style={{ fontSize: 16 }}>Dec 14</Text>
                                </View>


                            </View>

                            <View style={styles.ApprovalsOptions}>
                                {/* <Text>Dec 14</Text> */}
                                <View style={styles.ApprovalsButtons}>
                                    <TouchableOpacity style={styles.RejectButton}>
                                        <Text style={{ color: 'red' }}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.ApproveButton}>
                                        <Text style={{ color: 'green' }}>Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.ApprovalItemCont}>
                            <View style={{
                                paddingVertical: 8,
                                borderBottomColor: '#DEE2EE',
                                borderBottomWidth: 1
                            }}>
                                <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>Edit needed for order 135</Text>
                            </View>

                            <View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/avatar.png')} />
                                    <Text style={{ fontSize: 16, color: '#499FED' }}>James Paul</Text>
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/calendar.png')} />
                                    <Text style={{ fontSize: 16 }}>Dec 14</Text>
                                </View>


                            </View>

                            <View style={styles.ApprovalsOptions}>
                                {/* <Text>Dec 14</Text> */}
                                <View style={styles.ApprovalsButtons}>
                                    <TouchableOpacity style={styles.RejectButton}>
                                        <Text style={{ color: 'red' }}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.ApproveButton}>
                                        <Text style={{ color: 'green' }}>Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.ApprovalItemCont}>
                            <View style={{
                                paddingVertical: 8,
                                borderBottomColor: '#DEE2EE',
                                borderBottomWidth: 1
                            }}>
                                <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>Edit needed for order 135</Text>
                            </View>

                            <View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/avatar.png')} />
                                    <Text style={{ fontSize: 16, color: '#499FED' }}>James Paul</Text>
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/calendar.png')} />
                                    <Text style={{ fontSize: 16 }}>Dec 14</Text>
                                </View>


                            </View>

                            <View style={styles.ApprovalsOptions}>
                                {/* <Text>Dec 14</Text> */}
                                <View style={styles.ApprovalsButtons}>
                                    <TouchableOpacity style={styles.RejectButton}>
                                        <Text style={{ color: 'red' }}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.ApproveButton}>
                                        <Text style={{ color: 'green' }}>Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.ApprovalItemCont}>
                            <View style={{
                                paddingVertical: 8,
                                borderBottomColor: '#DEE2EE',
                                borderBottomWidth: 1
                            }}>
                                <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>Edit needed for order 135</Text>
                            </View>

                            <View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/avatar.png')} />
                                    <Text style={{ fontSize: 16, color: '#499FED' }}>James Paul</Text>
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/calendar.png')} />
                                    <Text style={{ fontSize: 16 }}>Dec 25</Text>
                                </View>


                            </View>

                            <View style={styles.ApprovalsOptions}>
                                {/* <Text>Dec 14</Text> */}
                                <View style={styles.ApprovalsButtons}>
                                    <TouchableOpacity style={styles.RejectButton}>
                                        <Text style={{ color: 'red' }}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.ApproveButton}>
                                        <Text style={{ color: 'green' }}>Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.ApprovalItemCont}>
                            <View style={{
                                paddingVertical: 8,
                                borderBottomColor: '#DEE2EE',
                                borderBottomWidth: 1
                            }}>
                                <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>Edit needed for order 135</Text>
                            </View>

                            <View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/avatar.png')} />
                                    <Text style={{ fontSize: 16, color: '#499FED' }}>James Paul</Text>
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 4
                                }}>
                                    <Image style={{
                                        width: 20, height: 20,
                                        marginRight: 6
                                    }} source={require('../dashImages/calendar.png')} />
                                    <Text style={{ fontSize: 16 }}>Dec 14</Text>
                                </View>


                            </View>

                            <View style={styles.ApprovalsOptions}>
                                {/* <Text>Dec 14</Text> */}
                                <View style={styles.ApprovalsButtons}>
                                    <TouchableOpacity style={styles.RejectButton}>
                                        <Text style={{ color: 'red' }}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.ApproveButton}>
                                        <Text style={{ color: 'green' }}>Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                </>
            </ScrollView>
        </View>
    )
}


const styles = StyleSheet.create({

    ApprovalsWrapper: {
        backgroundColor: 'white',
        backgroundColor: '#F4F5F9',
        flex: 1,
        position: 'absolute',
        top: 50,
        left: 0,
        width: '100%',
        height: Dimensions.get('window').height - 50,
        // height: 800,
        // height: Dimensions.get('window').height,
        zIndex: 2,
        flexDirection: 'column',
        padding: 12
    },
    closeIcon: {
        position: 'absolute',
        right: 0,
        backgroundColor: '#D9D9D9',
        padding: 8

        // #ECECEC
    },
    ApprovalCont: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        height: 25
        // paddingVertical: 24
    },
    ApprovalListCont: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 8,
        marginTop: 18,
        borderRadius: 4,

    },
    ApprovalsOptions: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    ApprovalsButtons: {
        flexDirection: 'row',
        // width: '30%',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    RejectButton: {
        backgroundColor: 'white',
        backgroundColor: '#FFECEC',
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginRight: 12,
        borderColor: '#DEE2EE',
        borderWidth: 1,
        borderRadius: 4
    },
    ApproveButton: {
        backgroundColor: '#5355B4',
        backgroundColor: '#E5FFDD',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderColor: '#DEE2EE',
        borderWidth: 1,
        borderRadius: 4
    },
    ApprovalItemCont: {
        marginBottom: 12,
        marginTop: 4,
        backgroundColor: '#ECECEC',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 10,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    }
})
export default ApprovalPop