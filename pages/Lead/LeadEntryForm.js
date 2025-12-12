import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, FlatList, Modal, Image, Button, KeyboardAvoidingView, Alert, Keyboard, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TextInput } from 'react-native-paper'
import { Checkbox } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import DocumentPicker from 'react-native-document-picker';
import { Rating } from 'react-native-ratings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { countriesData } from '../../config/country_list';
import { el, tr } from 'date-fns/locale';

// import DatePicker from 'react-native-date-picker';



const LeadEntryForm = () => {

    const [productListFromSearch, setProductListFromSearch] = useState(null)

    const navigation = useNavigation()

    const [portNo, setPortNo] = useState('')

    const [appUrl, setAppUrl] = useState('')

    const [cmpCode, setCmpCode] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        altphone: '',
        organization: '',
        status: '',
        title: '',
        leadNotes: '',
        leadSource: '',
        leadProbability: '',
        currency: '',
        bookedAmount: '',
        territory: '',
        country: '',
        streetAddress: '',
        city: '',
        apartment: '',
        location: '',
        areaName: '',
        file: '',
        priority: ''
    })

    // const [tempLeadProbability, setTempLeadProbability] = useState(formData.leadProbability);

    const [sliderKey, setSliderKey] = useState(0);

    const [submitLoader, setSubmitLoader] = useState(false)

    // productADD STATES
    const [productData, setProductData] = useState(null)

    const [showProdAddModal, setShowProAddModal] = useState(false)
    const [newProduct, setNewProduct] = useState({
        itemCode: '',
        description: '',
        unit: '',
        currentStock: '',
        quantity: '',
        price: '',
        amount: '',
        image_path: ''
    });


    const [loggedEmpId, setLoggedEmpId] = useState('')

    const [loggedEmpName, setLoggedEmpName] = useState('')

    const [salesMan, setSalesMan] = useState('')

    const [salesManName, setSalesManName] = useState('')

    const [isResetPopVisible, setResetPopVisible] = useState(false)

    // phone checkers
    const [phoneWhatsAppCheck, setPhoneWhatsAppCheck] = useState(false)
    const [altphoneWhatsAppCheck, setAltPhoneWhatsAppCheck] = useState(false)

    // modal states
    const [isStatusModalVisible, setIsStatusModalVisible] = useState(false)
    const statusItems = ['newLead', 'Qualified', 'Discovery', 'Proposed', 'Negotiation', 'Demo', 'Prospecting'];

    const [isLeadSourceModalVisible, setIsLeadSourceModalVisible] = useState(false)
    const leadSource = ['visit', 'cold call', 'direct mail', 'social media', 'website', 'advertisement', 'other'];

    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false)
    const currency = ['USD', 'AED', 'INR'];

    const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false)
    const territory = ['territory1', 'territory2', 'territory3'];

    const [isCountryModalVisible, setIsCountryModalVisible] = useState(false)
    const country = countriesData;


    const handleStatusSelectItem = (item) => {
        handleInputChange('status', item);
        setIsStatusModalVisible(false); // Close the modal
    };

    const handleLeadSourceSelectItem = (item) => {
        handleInputChange('leadSource', item);
        setIsLeadSourceModalVisible(false); // Close the modal
    };

    const handleCurrencySelectItem = (item) => {
        handleInputChange('currency', item);
        setIsCurrencyModalVisible(false); // Close the modal
    };

    const handleTerritorySelectItem = (item) => {
        handleInputChange('territory', item);
        setIsTerritoryModalVisible(false); // Close the modal
    };

    const handleCountrySelectItem = (item) => {
        handleInputChange('country', item);
        setIsCountryModalVisible(false); // Close the modal
    };


    const handlePickFile = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles], // Allow all file types
            });

            // Update the formData state with the selected file
            setFormData(prevState => ({
                ...prevState,
                file: res[0].uri, // Storing file URI in the formData
            }));
            console.log('Picked file:', res);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log('User cancelled the picker');
            } else {
                console.error('Error picking file: ', err);
            }
        }
    };

    const handleRating = (newRating) => {
        let priorityLevel;

        // Map rating value to priority
        if (newRating === 1) {
            priorityLevel = 'Low';
        } else if (newRating === 2) {
            priorityLevel = 'Medium';
        } else if (newRating === 3) {
            priorityLevel = 'High';
        }

        // Update formData with the corresponding priority
        setFormData(prevState => ({
            ...prevState,
            priority: priorityLevel,
        }));
    };


    const handleInputChange = (key, value) => {
        // console.log('Updating:', key, value);
        setFormData((prevData) => ({
            ...prevData,
            [key]: value,
        }));
        // console.log('Updated formData:', formData);
    };

    // Function to handle input changes in the modal
    const handleProdModalInputChange = (name, value) => {

        if (name == "itemCode") {
            callSearchAPI(value)
        }

        if (name == "quantity") {
            setNewProduct((prevState) => ({
                ...prevState,
                "quantity": value,
                "amount": (parseFloat(value) * parseFloat(prevState.price)) + ""
            }));
        }

        setNewProduct((prevState) => ({
            ...prevState,
            [name]: value
        }));

    };

    // Function to add the new product to the product data
    const addProduct = () => {

        console.log("productData newProduct", productData, newProduct, [{ ...newProduct, id: Date.now() }]);

        if (productData) {
            setProductData((prevData) => [...prevData, { ...newProduct, id: Date.now() }]);
        } else {
            setProductData([{ ...newProduct, id: Date.now() }])
        }

        setShowProAddModal(false);  // Close the modal after adding the product
        setNewProduct({
            itemCode: '',
            description: '',
            unit: '',
            currentStock: '',
            quantity: '',
            price: '',
            amount: ''
        }); // Reset the new product input
    };

    // asyncStorage FUNCTIONS
    // Save formData to AsyncStorage
    const saveFormDataToAsyncStorage = async () => {
        try {
            await AsyncStorage.setItem('formData', JSON.stringify(formData));
        } catch (error) {
            console.error('Error saving formData to AsyncStorage', error);
        }
    };

    // Load formData from AsyncStorage
    const loadFormDataFromAsyncStorage = async () => {
        try {
            const savedFormData = await AsyncStorage.getItem('formData');
            if (savedFormData) {
                setFormData(JSON.parse(savedFormData));
            }
        } catch (error) {
            console.error('Error loading formData from AsyncStorage', error);
        }
    };

    // useEffect hook to load formData on component mount
    useEffect(() => {
        loadFormDataFromAsyncStorage();
    }, []);

    // useEffect hook to save formData whenever it updates
    useEffect(() => {
        saveFormDataToAsyncStorage();
    }, [formData]);


    // Save productData to AsyncStorage
    const saveProductDataToAsyncStorage = async () => {
        try {
            await AsyncStorage.setItem('productData', JSON.stringify(productData));
        } catch (error) {
            console.error('Error saving productData to AsyncStorage', error);
        }
    };

    // Load productData from AsyncStorage
    const loadProductDataFromAsyncStorage = async () => {
        try {
            const savedProductData = await AsyncStorage.getItem('productData');
            if (savedProductData) {
                setProductData(JSON.parse(savedProductData));
            }
        } catch (error) {
            console.error('Error loading productData from AsyncStorage', error);
        }
    };

    // useEffect hook to load productData on component mount
    useEffect(() => {
        console.log("useEffect loadProductDataFromAsyncStorage ",)
        loadProductDataFromAsyncStorage();
    }, []);

    // useEffect hook to save productData whenever it updates
    useEffect(() => {
        saveProductDataToAsyncStorage();
        console.log("productData ", productData)
    }, [productData]);


    // Function to load saved state from AsyncStorage
    const loadCheckboxState = async () => {
        try {
            const savedPhoneCheck = await AsyncStorage.getItem('phoneWhatsAppCheck');
            const savedAltPhoneCheck = await AsyncStorage.getItem('altphoneWhatsAppCheck');

            // If values exist in AsyncStorage, set them to state
            if (savedPhoneCheck !== null) {
                setPhoneWhatsAppCheck(JSON.parse(savedPhoneCheck));
            }
            if (savedAltPhoneCheck !== null) {
                setAltPhoneWhatsAppCheck(JSON.parse(savedAltPhoneCheck));
            }
        } catch (error) {
            console.error('Error loading checkbox state from AsyncStorage', error);
        }
    };

    // Function to save state to AsyncStorage
    const saveCheckboxState = async () => {
        try {
            await AsyncStorage.setItem('phoneWhatsAppCheck', JSON.stringify(phoneWhatsAppCheck));
            await AsyncStorage.setItem('altphoneWhatsAppCheck', JSON.stringify(altphoneWhatsAppCheck));
        } catch (error) {
            console.error('Error saving checkbox state to AsyncStorage', error);
        }
    };

    // useEffect hook to load state on component mount
    useEffect(() => {
        loadCheckboxState();
    }, []);

    // useEffect hook to save state whenever it changes
    useEffect(() => {
        saveCheckboxState();
    }, [phoneWhatsAppCheck, altphoneWhatsAppCheck]);



    useEffect(() => {
        const fetchPortNo = async () => {
            try {
                // const data = await AsyncStorage.getItem("AppPortNoData");
                const data = await AsyncStorage.getItem("portNoData");

                const value = await AsyncStorage.getItem('cubix_employee_app_arrayOfLoginResult');

                const appUrl = await AsyncStorage.getItem('appUrl')

                const loginData = await AsyncStorage.getItem('loginData')

                const salesMan = await AsyncStorage.getItem('sales_man')

                const salesman_name = await AsyncStorage.getItem('salesman_name')

                if (salesman_name) {
                    setSalesManName(salesman_name)
                }

                if (salesMan === '----') {
                    const salesManDrop = await AsyncStorage.getItem('sales_man_drop')
                    setSalesMan(salesManDrop)
                } else {
                    setSalesMan(salesMan)

                }

                if (loginData) {
                    const parsedData = JSON.parse(loginData)

                    console.log('parsedLoginData', parsedData)
                }

                if (appUrl) {
                    setAppUrl(appUrl)
                }

                if (data !== null) {
                    const parsedData = JSON.parse(data);
                    // Assuming `PORTNO` is the key you want from the first object in the array
                    const portNumber = parsedData[0]?.PORTNO || "";
                    setPortNo(portNumber);
                    setCmpCode(parsedData[0].COMPID)
                }

                if (value !== null) {
                    const parsedValue = JSON.parse(value)
                    setLoggedEmpId(parsedValue[0].empid)
                    setLoggedEmpName(parsedValue[0].Name)
                }
            } catch (error) {
                console.error("Error fetching port number:", error);
            }
        };

        fetchPortNo();
    }, []);


    // Function to reset all states to default values
    const resetAllData = () => {
        setResetPopVisible(false)
        setPhoneWhatsAppCheck(false);
        setAltPhoneWhatsAppCheck(false);
        setProductData([]);
        setFormData({
            name: '',
            email: '',
            phone: '',
            altphone: '',
            organization: '',
            status: '',
            title: '',
            leadNotes: '',
            leadSource: '',
            leadProbability: '',
            currency: '',
            bookedAmount: '',
            territory: '',
            country: '',
            streetAddress: '',
            city: '',
            apartment: '',
            location: '',
            areaName: '',
            file: '',
            priority: ''
        });

        setSliderKey((prev) => prev + 1);

        // Remove all data from AsyncStorage
        AsyncStorage.removeItem('phoneWhatsAppCheck');
        AsyncStorage.removeItem('altphoneWhatsAppCheck');
        AsyncStorage.removeItem('productData');
        AsyncStorage.removeItem('formData');
    };



    const createPostBodies = async() => {

        const formatDate = () => {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };


        const currentDate = formatDate(); // Format the current date


        let postBodies;


        const deptNo = await AsyncStorage.getItem('DEPTNO')

        // NewFields
        if (productData?.length > 0) {
            // If productData has more than one product, map over the array
            postBodies = productData.map((product) => ({
                CmpCode: cmpCode,
                mode: "ENTRY",
                lead_id: 0,
                lead_entryTime: currentDate,
                lead_creatorid: salesMan,
                lead_coordinator: "",
                lead_salesperson: salesManName,
                lead_teamid: "0",
                lead_CampaignId: "",
                lead_account: "12050001",
                lead_organization: formData.organization,
                lead_notes: formData.leadNotes,
                lead_country: formData.country,
                lead_city: formData.city,
                lead_territory: formData.territory,
                lead_area: formData.areaName,
                lead_streetaddress: formData.streetAddress,
                lead_location: formData.location,
                lead_appartment: formData.apartment,
                lead_primarycontact: formData.name,
                lead_primarycontacttitle: formData.title,
                lead_phone: formData.phone,
                lead_isphonewhatsapp: phoneWhatsAppCheck ? "Y" : "N",
                lead_alt_phone: formData.altphone,
                lead_alt_isphonewhatsapp: altphoneWhatsAppCheck ? "Y" : "N",
                lead_email: formData.email,
                lead_stage: "",
                lead_probability: formData.leadProbability,
                lead_priority: formData.priority,
                lead_source: formData.leadSource,
                lead_status: formData.status,
                lead_assignedto: "",
                lead_bookedamount: parseFloat(formData.bookedAmount) || 0,
                lead_currencycode: formData.currency,
                lead_currencyrate: "1",
                deptno: deptNo,
                prod_code: product.itemCode,
                prod_Description: product.description,
                prod_Unit: product.unit,
                prod_Qty: parseInt(product.quantity) || 0,
                prod_Price: parseFloat(product.price) || 0,
                prod_Amount: parseFloat(product.amount) || 0,
                prod_Comments: product.comments || "",
                prod_imagepath: "",

            }));
        } else {

           

            postBodies = [{
                CmpCode: cmpCode,
                mode: "ENTRY",
                lead_id: 0,
                lead_entryTime: currentDate,
                lead_creatorid: salesMan,
                lead_coordinator: "",
                lead_salesperson: salesManName,
                lead_teamid: "0",
                lead_CampaignId: "",
                lead_account: "12050001",
                lead_organization: formData.organization,
                lead_notes: formData.leadNotes,
                lead_country: formData.country,
                lead_city: formData.city,
                lead_territory: formData.territory,
                lead_area: formData.areaName,
                lead_streetaddress: formData.streetAddress,
                lead_location: formData.location,
                lead_appartment: formData.apartment,
                lead_primarycontact: formData.name,
                lead_primarycontacttitle: formData.title,
                lead_phone: formData.phone,
                lead_isphonewhatsapp: phoneWhatsAppCheck ? "Y" : "N",
                lead_alt_phone: formData.altphone,
                lead_alt_isphonewhatsapp: altphoneWhatsAppCheck ? "Y" : "N",
                lead_email: formData.email,
                lead_stage: "",
                lead_probability: formData.leadProbability,
                lead_priority: formData.priority,
                lead_source: formData.leadSource,
                lead_status: formData.status,
                lead_assignedto: "",
                lead_bookedamount: parseFloat(formData.bookedAmount) || 0,
                lead_currencycode: formData.currency,
                lead_currencyrate: "1",
                deptno: deptNo,
                prod_code: "",
                prod_Description:  "",
                prod_Unit:  "",
                prod_Qty: "0",
                prod_Price:  "0",
                prod_Amount:  0,
                prod_Comments: "",
                prod_imagepath: "",
            }];
        }


        console.log("formatDate productData[0] ++ else null ++", productData, formData, postBodies)
    


        return postBodies;
    };



    // submitAPi
    const handleFormSubmit = async () => {
        setSubmitLoader(true)
        try {

            console.log(`LeadEntry ++ ${appUrl}CRM_LeadRegister`)

            let objectToSend = await createPostBodies()

            const postBody = JSON.stringify(objectToSend);


            console.log('postBody>>', postBody)

            console.log(`LeadEntry>> ${appUrl}CRM_LeadRegister`)


            const response = await axios.post(`${appUrl}CRM_LeadRegister`, postBody, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log("Response:", response.data);

            if (response.status === 200) {
                Alert.alert('Lead Submitted!')
                resetAllData()
                setSubmitLoader(false)

            }

            setSubmitLoader(false)

        } catch (error) {
            Alert.alert('Some Error Occured')
            console.log('handleFormSubmitErr', error)
            setSubmitLoader(false)

        }
    }

    const getURLOfImage = (imagePathLocal) => {

        if (imagePathLocal) {
            let result = imagePathLocal.replace('D:\\bondtime_web_app\\', '');
            let urltosendback = 'https://sunrise.dyndns-server.com:92/' + result.replace(/\\/g, '/')
            console.log("url to send back -->>>", urltosendback?.trim())
            return urltosendback?.trim()
            //return " https://cubixweberp.com:306/static/media/2_cars_below_login.6f4c3be4.png"
        } else {
            return ""
        }



    }

    // Rendering product data rows
    const renderProductData = ({ item }) => (
        <View style={styles.rowContainer} key={item.id}>

            {console.log("item in renderProductData--->>> ", item)}

            {/* https://cubixweberp.com:306/static/media/2_cars_below_login.6f4c3be4.png */}

            <View style={{ display: 'flex', flexDirection: "column" }}>
                <Text style={styles.cell}>{item?.itemCode}</Text>

                {/* <Image
                    style={{ height: 40 }}
                    source={{
                        uri: getURLOfImage(item.image_path)
                    }}
                /> */}
            </View>


            <Text style={styles.cell}>{item?.description}</Text>
            <Text style={styles.cell}>{item?.unit}</Text>
            <Text style={styles.cell}>{item?.currentStock}</Text>
            <Text style={styles.cell}>{item?.quantity}</Text>
            <Text style={styles.cell}>{item?.price}</Text>
            <Text style={styles.cell}>{item?.amount}</Text>
        </View>
    );


    // console.log('formData', formData)
    // console.log('productData', productData)

    // console.log('tempLeadProbability', tempLeadProbability)

    // console.log('portNo', portNo)

    console.log('salesMan', salesMan)

    console.log('salesManName', salesManName)


    const callSearchAPI = (searchText) => {

        const apiUrl = `${appUrl}Search_Items/${cmpCode}/Sitem/${encodeURIComponent(searchText)}`

        console.log("api lead product search ", apiUrl)

        axios.get(apiUrl).then((res) => {

            setProductListFromSearch(res.data)

        }).catch((err) => {

        })
    }

    const handleProductClick = (item) => {

        setNewProduct((prevState) => ({
            ...prevState,
            "itemCode": item.CODE,
            "description": item.DESCRIPTION,
            "currentStock": item.STOCK + "",
            "price": item.SELPRICE + "",
            "image_path": item.Imagepath
        }));

        setProductListFromSearch(null)

    }

    return (
        <KeyboardAvoidingView
            behavior='padding'
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <View>


                <ScrollView contentContainerStyle={styles.LeadEntryFormWrap} bounces={false} keyboardShouldPersistTaps="handled">

                    <View style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 8
                    }}>

                        <TouchableOpacity
                            style={{
                                padding: 8,
                                borderRadius: 4,
                                backgroundColor: 'white',
                                elevation: 5
                            }}
                            onPress={() => navigation.navigate('Home')}
                        >



                            <Image style={{
                                width: 25,
                                height: 25
                            }} source={require('../../images/HomeBondTimeMob.png')} />
                        </TouchableOpacity>


                        <TouchableOpacity
                            onPress={() => navigation.navigate('LeadList')}
                            style={[styles.AddProdButton,
                            { backgroundColor: '#2AB6A1' }
                            ]}
                        >
                            <Text style={styles.AddProdText}>View Leads</Text>
                        </TouchableOpacity>
                    </View>

                    {/* inputForm */}
                    <View style={styles.LeadEntryFormCont}>

                        <View style={styles.TitleCont}>
                            <Text style={styles.TitleText}>Lead Entry Form</Text>
                        </View>

                        <View style={styles.InputCont}>

                            <View style={styles.InputBox}>
                                <TextInput
                                    label='Name*'
                                    mode="outlined"
                                    style={styles.InputStyle}
                                    value={formData.name}
                                    onChangeText={(value) => handleInputChange('name', value)}
                                />
                            </View>
                            <View style={styles.InputBox}>
                                <TextInput
                                    label='Email*'
                                    mode="outlined"
                                    style={styles.InputStyle}
                                    value={formData.email}
                                    onChangeText={(value) => handleInputChange('email', value)}
                                />
                            </View>

                            <View style={styles.InputBox}>
                                <View style={styles.CheckerInputBox}>
                                    <TextInput
                                        label='Phone*'
                                        mode="outlined"
                                        style={[styles.InputStyle, { width: '80%' }]}
                                        value={formData.phone}
                                        onChangeText={(value) => handleInputChange('phone', value)}
                                    />

                                    <View>
                                        <Text style={styles.WhatsAppText}>Whatsapp</Text>
                                        <Checkbox
                                            status={phoneWhatsAppCheck ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                setPhoneWhatsAppCheck(!phoneWhatsAppCheck);
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.InputBox}>
                                <View style={styles.CheckerInputBox}>
                                    <TextInput
                                        label='Alternate phone'
                                        mode="outlined"
                                        style={[styles.InputStyle, { width: '80%' }]}
                                        value={formData.altphone}
                                        onChangeText={(value) => handleInputChange('altphone', value)}
                                    />

                                    <View>
                                        <Text style={styles.WhatsAppText}>Whatsapp</Text>
                                        <Checkbox
                                            status={altphoneWhatsAppCheck ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                setAltPhoneWhatsAppCheck(!altphoneWhatsAppCheck);
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.InputBox}>
                                <TextInput
                                    label='Organization'
                                    mode="outlined"
                                    style={styles.InputStyle}
                                    value={formData.organization}
                                    onChangeText={(value) => handleInputChange('organization', value)}
                                />
                            </View>

                            <View style={styles.InputBox}>
                                <TouchableOpacity
                                    // style={styles.inputContainer}
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        setIsStatusModalVisible(true)
                                    }} // Show modal on press
                                >
                                    <TextInput
                                        label={formData.status ? '' : 'Status*'}
                                        value={formData.status}
                                        style={styles.input}
                                        editable={false} // Prevent manual text input
                                        pointerEvents="none" // Pass touches to parent container
                                    />

                                    <View style={styles.DropCont}>
                                        <Image style={styles.DropIcon} source={require('../../images/DropDownS.png')} />
                                    </View>
                                </TouchableOpacity>


                                {/* Modal */}
                                <Modal
                                    visible={isStatusModalVisible}
                                    transparent={true}
                                    animationType="slide"
                                    onRequestClose={() => setIsStatusModalVisible(false)} // Close modal on back button press
                                >
                                    <View style={styles.modalOverlay}>
                                        <View
                                            bounces={false}
                                            keyboardShouldPersistTaps="handled"
                                            style={styles.modalContainer}>

                                            <FlatList
                                                data={statusItems}
                                                keyExtractor={(item, index) => index.toString()}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity

                                                        style={styles.modalItem}
                                                        onPress={() => handleStatusSelectItem(item)}
                                                    >
                                                        <Text style={styles.modalItemText}>{item == "newLead" ? "New Lead" : item}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />

                                            {/* Close Button */}
                                            <TouchableOpacity style={styles.closeButton} onPress={() => setIsStatusModalVisible(false)}>
                                                <Text style={styles.closeButtonText}>Close</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>
                            </View>

                            {/* 
                                <View style={styles.InputBox}>
                                    <Picker
                                        selectedValue={formData.status}
                                        onValueChange={(value) => handleInputChange('status', value)}
                                        style={styles.picker}
                                        itemStyle={styles.pickerItem}
                                    >
                                        <Picker.Item label="Status" value="" enabled={false} />
            
                                        <Picker.Item label="Option 1" value="option1" />
                                        <Picker.Item label="Option 2" value="option2" />
                                        <Picker.Item label="Option 3" value="option3" />
                                    </Picker>
                                </View> */}

                            <View style={styles.InputBox}>
                                <TextInput
                                    label='Title'
                                    mode="outlined"
                                    style={styles.InputStyle}
                                    value={formData.title}
                                    onChangeText={(value) => handleInputChange('title', value)}
                                />
                            </View>

                            <View style={styles.InputBox}>
                                <TextInput
                                    label='Lead Notes'
                                    mode="outlined"
                                    style={styles.InputStyle}
                                    value={formData.leadNotes}
                                    onChangeText={(value) => handleInputChange('leadNotes', value)}
                                />
                            </View>

                            <View style={styles.InputBox}>
                                <TouchableOpacity
                                    // style={styles.inputContainer}
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        setIsLeadSourceModalVisible(true)
                                    }}
                                // onPress={() => setIsLeadSourceModalVisible(true)} // Show modal on press
                                >
                                    <TextInput
                                        label={formData.leadSource ? '' : 'Lead Source'}
                                        value={formData.leadSource}
                                        style={styles.input}
                                        editable={false} // Prevent manual text input
                                        pointerEvents="none" // Pass touches to parent container
                                    />

                                    <View style={styles.DropCont}>
                                        <Image style={styles.DropIcon} source={require('../../images/DropDownS.png')} />
                                    </View>
                                </TouchableOpacity>


                                {/* Modal */}
                                <Modal
                                    visible={isLeadSourceModalVisible}
                                    transparent={true}
                                    animationType="slide"
                                    onRequestClose={() => setIsLeadSourceModalVisible(false)} // Close modal on back button press
                                >
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.modalContainer}>

                                            <FlatList
                                                data={leadSource}
                                                keyExtractor={(item, index) => index.toString()}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={styles.modalItem}
                                                        onPress={() => handleLeadSourceSelectItem(item)}
                                                    >
                                                        <Text style={styles.modalItemText}>{item}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />

                                            {/* Close Button */}
                                            <TouchableOpacity style={styles.closeButton} onPress={() => setIsLeadSourceModalVisible(false)}>
                                                <Text style={styles.closeButtonText}>Close</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>
                            </View>

                            <View style={styles.InputBox}>
                                <Text style={styles.label}>Lead Probability: {formData.leadProbability}%</Text>
                                <Slider
                                    key={sliderKey}
                                    style={styles.slider}
                                    minimumValue={0} // Minimum value (0%)
                                    maximumValue={100} // Maximum value (100%)
                                    step={5} // Step interval (5% increments)
                                    // value={formData.leadProbability ? formData.leadProbability : 0} // Current value of the slider
                                    onValueChange={(value) => handleInputChange('leadProbability', value)} // Update state when value changes                             
                                />
                            </View>


                            <View style={styles.InputBox}>
                                <View style={styles.CheckerInputBox}>
                                    <TouchableOpacity
                                        // style={styles.inputContainer}
                                        style={{ width: '30%' }}
                                        onPress={() => {
                                            Keyboard.dismiss()
                                            setIsCurrencyModalVisible(true)
                                        }}
                                    // onPress={() => setIsCurrencyModalVisible(true)} // Show modal on press
                                    >
                                        <TextInput
                                            label={formData.currency ? '' : 'Currency'}
                                            value={formData.currency}
                                            style={styles.input}
                                            editable={false} // Prevent manual text input
                                            pointerEvents="none" // Pass touches to parent container
                                        />

                                        <View style={styles.DropCont}>
                                            <Image style={styles.DropIcon} source={require('../../images/DropDownS.png')} />
                                        </View>
                                    </TouchableOpacity>

                                    <TextInput
                                        label='Booked Amount'
                                        mode="outlined"
                                        style={[styles.InputStyle, { width: '65%' }]}
                                        value={formData.bookedAmount}
                                        onChangeText={(value) => handleInputChange('bookedAmount', value)}
                                    />

                                    {/* Modal */}
                                    <Modal
                                        visible={isCurrencyModalVisible}
                                        transparent={true}
                                        animationType="slide"
                                        onRequestClose={() => setIsCurrencyModalVisible(false)} // Close modal on back button press
                                    >
                                        <View style={styles.modalOverlay}>
                                            <View style={styles.modalContainer}>

                                                <FlatList
                                                    data={currency}
                                                    keyExtractor={(item, index) => index.toString()}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity
                                                            style={styles.modalItem}
                                                            onPress={() => handleCurrencySelectItem(item)}
                                                        >
                                                            <Text style={styles.modalItemText}>{item}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                />

                                                {/* Close Button */}
                                                <TouchableOpacity style={styles.closeButton} onPress={() => setIsCurrencyModalVisible(false)}>
                                                    <Text style={styles.closeButtonText}>Close</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </Modal>
                                </View>

                            </View>


                            <View style={styles.InputBox}>
                                <TouchableOpacity
                                    // style={styles.inputContainer}
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        setIsTerritoryModalVisible(true)
                                    }}
                                // onPress={() => setIsTerritoryModalVisible(true)} // Show modal on press
                                >
                                    <TextInput
                                        label={formData.territory ? '' : 'Territory'}
                                        value={formData.territory}
                                        style={styles.input}
                                        editable={false} // Prevent manual text input
                                        pointerEvents="none" // Pass touches to parent container
                                    />

                                    <View style={styles.DropCont}>
                                        <Image style={styles.DropIcon} source={require('../../images/DropDownS.png')} />
                                    </View>
                                </TouchableOpacity>


                                {/* Modal */}
                                <Modal
                                    visible={isTerritoryModalVisible}
                                    transparent={true}
                                    animationType="slide"
                                    onRequestClose={() => setIsTerritoryModalVisible(false)} // Close modal on back button press
                                >
                                    <View style={styles.modalOverlay}>
                                        <View style={styles.modalContainer}>

                                            <FlatList
                                                data={territory}
                                                keyExtractor={(item, index) => index.toString()}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={styles.modalItem}
                                                        onPress={() => handleTerritorySelectItem(item)}
                                                    >
                                                        <Text style={styles.modalItemText}>{item}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />

                                            {/* Close Button */}
                                            <TouchableOpacity style={styles.closeButton} onPress={() => setIsTerritoryModalVisible(false)}>
                                                <Text style={styles.closeButtonText}>Close</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>
                            </View>

                            <View style={styles.InputBox}>
                                <TouchableOpacity
                                    // style={styles.inputContainer}
                                    onPress={() => {
                                        Keyboard.dismiss()
                                        setIsCountryModalVisible(true)
                                    }}
                                // onPress={() => setIsCountryModalVisible(true)} // Show modal on press
                                >
                                    <TextInput
                                        label={formData.country ? '' : 'Country'}
                                        value={formData.country}
                                        style={styles.input}
                                        editable={false} // Prevent manual text input
                                        pointerEvents="none" // Pass touches to parent container
                                    />

                                    <View style={styles.DropCont}>
                                        <Image style={styles.DropIcon} source={require('../../images/DropDownS.png')} />
                                    </View>
                                </TouchableOpacity>


                                {/* Modal */}
                                <Modal
                                    visible={isCountryModalVisible}
                                    transparent={true}
                                    animationType="slide"
                                    onRequestClose={() => setIsCountryModalVisible(false)} // Close modal on back button press
                                >
                                    <View style={styles.modalOverlay}>
                                        <View style={[styles.modalContainer, { height: 450 }]}>

                                            <FlatList
                                                data={country}
                                                keyExtractor={(item, index) => index.toString()}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={styles.modalItem}
                                                        onPress={() => handleCountrySelectItem(item.name)}
                                                    >
                                                        <Text style={styles.modalItemText}>{item.name}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />

                                            {/* Close Button */}
                                            <TouchableOpacity style={styles.closeButton} onPress={() => setIsCountryModalVisible(false)}>
                                                <Text style={styles.closeButtonText}>Close</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>
                            </View>

                            <View style={styles.InputBox}>
                                <TextInput
                                    label='Street Address'
                                    mode="outlined"
                                    style={styles.InputStyle}
                                    value={formData.streetAddress}
                                    onChangeText={(value) => handleInputChange('streetAddress', value)}
                                />
                            </View>

                            <View style={styles.InputBox}>
                                <TextInput
                                    label='City'
                                    mode="outlined"
                                    style={styles.InputStyle}
                                    value={formData.city}
                                    onChangeText={(value) => handleInputChange('city', value)}
                                />
                            </View>

                            <View style={styles.InputBox}>
                                <TextInput
                                    label='Apartment (Optional)'
                                    mode="outlined"
                                    style={styles.InputStyle}
                                    value={formData.apartment}
                                    onChangeText={(value) => handleInputChange('apartment', value)}
                                />
                            </View>

                            <View style={styles.InputBox}>
                                <TextInput
                                    label='Location'
                                    mode="outlined"
                                    style={styles.InputStyle}
                                    value={formData.location}
                                    onChangeText={(value) => handleInputChange('location', value)}
                                />
                            </View>

                            <View style={styles.InputBox}>
                                <TextInput
                                    label='Area Name'
                                    mode="outlined"
                                    style={styles.InputStyle}
                                    value={formData.areaName}
                                    onChangeText={(value) => handleInputChange('areaName', value)}
                                />
                            </View>

                            {/* <View style={styles.InputBox}>
                                <View style={styles.AttachFileCont}>

                                    <TouchableOpacity style={styles.AttachFileButton} onPress={handlePickFile} >
                                        <Text style={styles.AttachFileText}>Attach Files</Text>
                                    </TouchableOpacity>


                                    {formData.file && (
                                        <View style={styles.fileInfo}>
                                            <Text style={styles.label}>Selected File:</Text>
                                            <Text style={styles.label}>{formData.file}</Text>
                                        </View>
                                    )}
                                </View>
                            </View> */}

                            <View style={styles.InputBox}>
                                <Text style={styles.label}>Set Priority:</Text>
                                {/* Rating Component */}
                                <Rating
                                    imageSize={35} // Adjust size of the stars
                                    onFinishRating={handleRating} // Set rating value
                                    ratingCount={3} // Set rating range (1-3 stars)
                                    startingValue={formData.priority === 'High' ? 3 : formData.priority === 'Medium' ? 2 : formData.priority === 'Low' ? 1 : 0} // Pre-select the value if any
                                    // startingValue={0}
                                    style={styles.rating}

                                />
                                {/* Display the selected priority */}
                                <Text style={[styles.label, { marginVertical: 8 }]}>Selected Priority: {formData.priority}</Text>
                            </View>

                        </View>



                    </View>

                    {/* ProductInfo */}
                    <View style={styles.ProductInfoCont}>

                        <View style={styles.TitleCont}>
                            <Text style={styles.TitleText}>Product Information</Text>
                        </View>

                        <View style={styles.AddProdButtonCont}>

                            <TouchableOpacity
                                onPress={() => setShowProAddModal(true)}
                                style={styles.AddProdButton}
                            >
                                <Text style={styles.AddProdText}>Add Product</Text>
                            </TouchableOpacity>

                        </View>

                        {/* Modal for Adding Product */}
                        <KeyboardAvoidingView
                            behavior='padding'
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                        >
                            <Modal
                                visible={showProdAddModal}
                                animationType="slide"
                                transparent={true}
                                onRequestClose={() => setShowProAddModal(false)} // Close the modal when tapping outside
                            >
                                <View style={styles.modalOverlay}>
                                    <ScrollView
                                        bounces={false}
                                        keyboardShouldPersistTaps="handled"
                                        contentContainerStyle={{
                                            // width: '100%',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                        <View style={[styles.modalContainer, { width: '90%' }]}>
                                            <Text style={styles.TitleText}>Add New Product</Text>

                                            {/* Form Inputs */}
                                            {['itemCode', 'description', 'unit', 'quantity', 'price'].map((field) => (
                                                field == "itemCode" ?
                                                    <View >
                                                        <TextInput
                                                            key={field}
                                                            style={[styles.InputStyle, { marginVertical: 8 }]}
                                                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                                                            value={newProduct ? newProduct[field] : null}
                                                            onChangeText={(value) => handleProdModalInputChange(field, value)}
                                                            mode="outlined"
                                                        />
                                                        <FlatList
                                                            nestedScrollEnabled={true}
                                                            style={{ backgroundColor: "#f7f7f7", width: "100%", paddingHorizontal: "10%", maxHeight: 100 }}
                                                            renderItem={({ item }) => {
                                                                return (
                                                                    <TouchableOpacity style={{ padding: 10 }} onPress={() => handleProductClick(item)}>
                                                                        <View style={{ display: "flex", flexDirection: "column" }}>
                                                                            <Text style={{ color: "#000000", fontWeight: "700" }}>{item?.CODE}</Text>
                                                                            <Text>{item?.DESCRIPTION}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                )
                                                            }}
                                                            data={productListFromSearch}
                                                        />

                                                    </View>
                                                    :

                                                    <TextInput
                                                        key={field}
                                                        style={[styles.InputStyle, { marginVertical: 8 }]}
                                                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                                                        value={newProduct[field]}
                                                        onChangeText={(value) => handleProdModalInputChange(field, value)}
                                                        mode="outlined"
                                                    />
                                            ))}

                                            <View style={{ padding: 10 }}>
                                                <Text>Current Stock</Text><Text>{newProduct?.currentStock}</Text>
                                                <Text>Amount</Text><Text>{newProduct?.amount}</Text>
                                            </View>

                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>

                                                {/* Cancel Button */}
                                                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowProAddModal(false)}>
                                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                                </TouchableOpacity>

                                                {/* Save Button */}
                                                <TouchableOpacity style={styles.saveButton} onPress={addProduct}>
                                                    <Text style={styles.saveButtonText}>Save</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </ScrollView>
                                </View>
                            </Modal>
                        </KeyboardAvoidingView>

                        <ScrollView horizontal style={styles.TableContainer}>

                            <ScrollView nestedScrollEnabled style={{ height: '100%' }}>
                                <View style={styles.headerContainer}>
                                    <Text style={styles.headerCellPhStk}>Item Code</Text>
                                    <Text style={styles.headerCellPhStk}>Description</Text>
                                    <Text style={styles.headerCellPhStk}>Unit</Text>
                                    <Text style={styles.headerCellPhStk}>Current Stock</Text>
                                    <Text style={styles.headerCellPhStk}>Quantity</Text>
                                    <Text style={styles.headerCellPhStk}>Price</Text>
                                    <Text style={styles.headerCellPhStk}>Amount</Text>
                                </View>

                                {/* Table Data */}
                                <FlatList
                                    data={productData}
                                    renderItem={renderProductData}
                                    keyExtractor={(item) => item.id}
                                />
                                <View>

                                </View>
                            </ScrollView>

                        </ScrollView>
                    </View>


                    <View style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        {/* Add Reset Button */}
                        <TouchableOpacity
                            onPress={() => setResetPopVisible(true)}
                            // onPress={resetAllData}
                            style={{ marginTop: 20, backgroundColor: 'red', padding: 10, borderRadius: 8, width: '40%' }}>
                            <Text style={{ color: 'white', textAlign: 'center' }}>Reset All</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={submitLoader}
                            onPress={() => handleFormSubmit()}
                            style={{
                                marginTop: 20,
                                backgroundColor: '#64558E',
                                padding: 10, borderRadius: 8, width: '40%'
                            }}>
                            {
                                submitLoader ?
                                    <ActivityIndicator color={'white'} />
                                    :
                                    <Text style={{ color: 'white', textAlign: 'center' }}>Submit</Text>
                            }
                        </TouchableOpacity>

                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={isResetPopVisible}
                            onRequestClose={() => setResetPopVisible(false)} // Close modal on back press
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContainer}>
                                    <Text style={styles.modalText}>Are you sure you want to Reset Data ? this will delete all saved data.</Text>

                                    <View style={styles.modalButtons}>

                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.ResetcancelButton]}
                                            onPress={() => setResetPopVisible(false)}
                                        >
                                            <Text style={styles.buttonText}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.logoutButton]}
                                            onPress={resetAllData}
                                        >
                                            <Text style={styles.buttonText}>Reset</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>



            </View>
        </KeyboardAvoidingView>
    )
}

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        color: 'black',
        backgroundColor: 'white',
        paddingRight: 30, // to ensure the text is not clipped when the dropdown is expanded
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        color: 'black',
        backgroundColor: 'white',
        paddingRight: 30,
    },
});

const styles = StyleSheet.create({
    LeadEntryFormWrap: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 16,
        // height: Dimensions.get('window').height

        paddingBottom: 120
    },

    LeadEntryFormCont: {
        display: 'flex',
        flexDirection: 'column',
        width: '96%',
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 5,
    },

    TitleCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 12
    },

    TitleText: {
        fontFamily: 'Lexend-Bold',
        fontSize: 14,
        color: 'black'
    },

    InputCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginTop: 12,
        paddingHorizontal: 12
        // alignItems: 'flex-start'
    },

    InputBox: {
        // width: '80%'
        marginVertical: 6
    },

    CheckerInputBox: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    WhatsAppText: {
        fontFamily: 'Lexend-Light',
        fontSize: 12,
        color: 'black'
    },


    InputStyle: {
        backgroundColor: 'white',
        fontFamily: 'Lexend-Regular',
        fontSize: 12,
        color: 'black'
    },

    label: {
        fontFamily: 'Lexend-Regular',
        fontSize: 12,
        color: 'black'
    },

    picker: {
        borderColor: 'grey',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: 'white',
    },
    pickerItem: {
        fontFamily: 'Lexend-Regular', // Replace with your custom font family
        fontSize: 13,
        color: '#333',
        color: 'black'

    },

    input: {
        borderWidth: 0.5,
        borderColor: 'black',
        borderRadius: 4,
        // padding: 12,
        fontSize: 12,
        backgroundColor: 'white',
    },

    DropCont: {
        position: 'absolute',
        right: 10,
        top: 18
    },

    DropIcon: {
        width: 25,
        height: 25
    },

    slider: {
        width: '100%',
        height: 40,
    },

    AttachFileCont: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    AttachFileButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        borderRadius: 4,
        alignItems: 'center',
        width: '30%'
    },

    AttachFileText: {
        color: 'white',
        fontFamily: 'Lexend-Regular',
        fontSize: 14
    },

    fileInfo: {
        // marginTop: 20,
        width: '65%'
    },


    // productInfo

    ProductInfoCont: {
        display: 'flex',
        flexDirection: 'column',
        width: '96%',
        backgroundColor: '#93c5fd',
        borderRadius: 8,
        elevation: 5,

        marginTop: 10
    },

    AddProdButtonCont: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    AddProdButton: {
        backgroundColor: 'green',
        backgroundColor: '#64558E',
        padding: 12,
        borderRadius: 8,
        margin: 12
    },

    AddProdText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 13,
        color: 'white'
    },

    // table

    TableContainer: {
        // width: 1000,
        height: 400,
        backgroundColor: '#f9f9f9',
        // padding: 10,

        overflow: 'scroll',

        elevation: 5,
        borderRadius: 8
    },
    headerContainer: {
        flexDirection: 'row',
        // backgroundColor: '#007BFF',
        // backgroundColor: '#908CEE',
        backgroundColor: '#fcdcc3',
        paddingVertical: 10,
        // paddingHorizontal: 5,
    },
    headerCell: {
        fontFamily: 'Lexend-Bold',
        fontSize: 12,
        color: '#fff',
        color: 'black',
        width: 120,
        textAlign: 'center',
        padding: 5,
    },
    headerCellPhStk: {
        fontFamily: 'Lexend-Bold',
        fontSize: 12,
        // fontWeight: 'bold',
        color: '#fff',
        color: 'black',
        width: 120,
        textAlign: 'center',
        // padding: 5,
        // marginHorizontal: 4
    },
    rowContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    cell: {
        width: 120,
        textAlign: 'center',
        padding: 5,
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: 'black'
    },


    saveButton: {
        backgroundColor: '#64558E',
        padding: 10,
        borderRadius: 5,
        // marginBottom: 10,
        alignItems: 'center',
        width: '45%'
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '45%'
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16
    },

    LeadListCont: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },



    // MODAL
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalItemText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: 'black'
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: '#007bff',
        paddingVertical: 10,
        borderRadius: 4,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontFamily: 'Lexend-Regular',
        fontSize: 14
    },


    modalButtons: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    logoutButton: {
        backgroundColor: '#FF5C5C',
    },
    ResetcancelButton: {
        backgroundColor: '#909090',
    },

    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Lexend-Regular'
    },


    modalText: {
        fontFamily: 'Lexend-Regular',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        color: 'black'
    },

})

export default LeadEntryForm