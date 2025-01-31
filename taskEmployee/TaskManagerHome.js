import React, { useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import ViewJobList from '../taskEmpImages/ic_view_job_list.png'
import TaskOpen from '../taskEmpImages/task_open.png'
import Triangle from '../taskEmpImages/triangle_in_path.png'
import TaskHold from '../taskEmpImages/task_end_in_path.png'
import TaskEscalated from '../taskEmpImages/escalated.png'
import TravelStart from '../taskEmpImages/travel_start_in_path.png'
import TravelEnd from '../taskEmpImages/travel_end_in_path.png'
import TaskStart from '../taskEmpImages/task_start_in_path.png'
import TaskEnd from '../taskEmpImages/task_end.png'

// this file is not being used anywhere !!!


const TaskManagerHome = () => {

    const [activeOption, setActiveOption] = useState('All');

    const handleOptionClick = (option) => {
        setActiveOption(option);
    };


    return (
        <SafeAreaView>

            <View style={styles.TaskMangerWrapper}>

                {/* topHead Buttons */}

                <View style={styles.TaskManHomeHead}>

                    <View style={styles.NewTaskButton}>
                        <Text style={{ color: "white" }}>New Task</Text>
                    </View>

                    <View style={styles.CreateJobWrap}>
                        <View style={styles.CreateJobButton}>
                            <Text style={{ color: "black" }}>Create Job</Text>
                        </View>
                        <View style={styles.CreateJobListImgContainer}>
                            <Image source={ViewJobList} style={styles.CreateJobListImg}></Image>
                        </View>
                    </View>

                </View>

                {/* OptionsToggler */}

                <View style={styles.OptionsTogglerWrapper}>

                    <View style={styles.OptionToggleContainer}>

                        <View style={[styles.OptionImgViewCont, activeOption === 'All' && styles.activeOption]}>
                            <TouchableOpacity onPress={() => handleOptionClick('All')}>
                                <Text>All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.OptionImgViewCont, activeOption === 'TaskOpen' && styles.activeOption]}>
                            <TouchableOpacity onPress={() => handleOptionClick('TaskOpen')}>
                                <Image source={TaskOpen} style={styles.OptionSvg}></Image>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.OptionImgViewCont, activeOption === 'Triangle' && styles.activeOption]}>
                            <TouchableOpacity onPress={() => handleOptionClick('Triangle')}>
                                <Image source={Triangle} style={styles.OptionSvg} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.OptionImgViewCont, activeOption === 'TaskHold' && styles.activeOption]}>
                            <TouchableOpacity onPress={() => handleOptionClick('TaskHold')}>
                                <Image source={TaskHold} style={styles.OptionSvg} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.OptionImgViewCont, activeOption === 'TaskEscalated' && styles.activeOption]}>
                            <TouchableOpacity onPress={() => handleOptionClick('TaskEscalated')}>
                                <Image source={TaskEscalated} style={styles.OptionSvg} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.OptionImgViewCont, activeOption === 'TravelStart' && styles.activeOption]}>
                            <TouchableOpacity onPress={() => handleOptionClick('TravelStart')}>
                                <Image source={TravelStart} style={styles.OptionSvg} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.OptionImgViewCont, activeOption === 'TravelEnd' && styles.activeOption]}>
                            <TouchableOpacity onPress={() => handleOptionClick('TravelEnd')}>
                                <Image source={TravelEnd} style={styles.OptionSvg} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.OptionImgViewCont, activeOption === 'TaskStart' && styles.activeOption]}>
                            <TouchableOpacity onPress={() => handleOptionClick('TaskStart')}>
                                <Image source={TaskStart} style={styles.OptionSvg} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.OptionImgViewCont, activeOption === 'TaskEnd' && styles.activeOption]}>
                            <TouchableOpacity onPress={() => handleOptionClick('TaskEnd')}>
                                <Image source={TaskEnd} style={styles.OptionSvg} />
                            </TouchableOpacity>
                        </View>

                    </View>

                </View>


                {/* TableUi */}

                <View style={styles.container}>
                    {/* Table Header */}
                    <View style={styles.tableRow}>
                        <Text style={styles.headerCell}>Name</Text>
                        <Text style={styles.headerCell}>Status & Stage</Text>
                        <Text style={styles.headerCell}>Created on</Text>
                    </View>

                    {/* Table Data */}
                    <View style={styles.tableRow}>
                        <Text style={styles.dataCell}>Data 1</Text>
                        <Text style={styles.dataCell}>Data 2</Text>
                        <Text style={styles.dataCell}>Data 3</Text>
                    </View>

                    {/* Add more rows as needed */}
                </View>

            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    TaskMangerWrapper: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F1FB",
    },
    TaskManHomeHead: {
        width: '100%',
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 6
    },
    NewTaskButton: {
        backgroundColor: "#0B5ED7",
        borderRadius: 4,
        padding: 8
    },
    CreateJobWrap: {
        width: "40%",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    CreateJobButton: {
        backgroundColor: "#FFCA2C",
        borderRadius: 4,
        padding: 8
    },
    CreateJobListImgContainer: {
        backgroundColor: '#D3D4D5',
        paddingHorizontal: 8,
        justifyContent: 'center'
    },
    CreateJobListImg: {
        width: 26,
        height: 26
    },
    OptionsTogglerWrapper: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12
    },
    OptionToggleContainer: {
        width: "88%",
        flexDirection: "row",
        justifyContent: 'space-between',
        borderRadius: 12,
        borderWidth: 1,
        padding: 8,
        paddingHorizontal: 12,
        paddingVertical: 14
    },
    OptionSvg: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        paddingVertical: 12
    },
    activeOption: {
        borderTopWidth: 2,
        borderTopColor: 'blue',
    },
    OptionImgViewCont: {
        paddingTop: 8,
        margin: 4
    },

    container: {
        width: "100%",
        padding: 10,
        marginTop: 8
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    headerCell: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    dataCell: {
        flex: 1,
        backgroundColor: '#F3F3F3',
        padding: 10,
        textAlign: 'center',
    },
})

export default TaskManagerHome