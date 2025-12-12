import React, { useCallback, memo, useMemo, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { Button } from 'react-native-share';
import ic_camera from "../images/ic_camera.png"

const EquipmentItem = memo(({ item, styles, checkboxList, clickedOnCheckBox, handleInputFirstTable, uploadImage, setVisible,URI }) => {

  const [currentImageRow, setCurrentImageRow] = useState(null)
  
  const handleInputChange = useCallback(
    (field, value) => handleInputFirstTable(item.mainSlno, item.subSlno, field, value),
    [item.mainSlno, item.subSlno, handleInputFirstTable]
  );

  const uploadFromChild = useCallback(
    (mainNumber, subNumber) => uploadImage(mainNumber, subNumber),
    [item.mainSlno, item.subSlno, uploadImage]
  );

  const handleCheckboxPress = useCallback(
    (name) => clickedOnCheckBox(name),
    [clickedOnCheckBox]
  );

  useEffect(()=>{
    console.log("URI -->>++ ", URI)
  },[URI])


  const clickedOnImageUpload = useCallback(() => {
    setVisible(prev => !prev);
  }, []);

  // ✅ Memoized list of checkbox items (avoid re-generating JSX)
  const checkboxItems = useMemo(() => {
    if (!item.equipment_details) return null;

    return item.equipment_details.split(',').map((itemString, index) => {
      const trimmedItem = itemString.trim();
      const isChecked = checkboxList.find((i) => i.name === trimmedItem)?.status || false;

      return (
        <View
          key={trimmedItem}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 5,
            margin: 2,
            padding: 8,
          }}
        >
          <Text
            onPress={() => handleCheckboxPress(trimmedItem)}
            style={{ fontWeight: '600', color: '#000000' }}
          >
            {trimmedItem}
          </Text>
          <CheckBox
            value={isChecked}
            onValueChange={() => handleCheckboxPress(trimmedItem)}
            tintColors={{ true: '#000000', false: '#000000' }}
          />
        </View>
      );
    });
  }, [item.equipment_details, checkboxList, handleCheckboxPress]);

  return (
    <View style={styles.row}>
      <Text style={styles.cell_sl_no}>{item.subSlno === '1.1' ? item.mainSlno : item.subSlno}</Text>

      {item.type_of_question === 'mcq' ? (
        <View style={[styles.cell_equipment_mcq, { flexDirection: 'row', flexWrap: 'wrap' }]}>
          {checkboxItems}
        </View>
      ) : (
        <>
          <View style={[styles.cell_equipment, { flexDirection: 'row', flexWrap: 'wrap' }]}>
            <Text style={{ fontWeight: '600', color: '#000000' }}>{item.heading}</Text>
            <Text style={{ fontWeight: '600', color: '#000000' }}>{item.equipment_details}</Text>
          </View>

          <TextInput
            value={item.brand}
            onChangeText={(text) => handleInputChange('brand', text)}
            style={styles.inputCell}
          />
          <TextInput
            value={item.Qty}
            onChangeText={(text) => handleInputChange('Qty', text)}
            style={styles.inputCell}
          />
          <TextInput
            value={item.spec}
            onChangeText={(text) => handleInputChange('spec', text)}
            style={styles.inputCell}
          />
          <TextInput
            value={item.remarks}
            onChangeText={(text) => handleInputChange('remarks', text)}
            style={styles.inputCell}
          />

          <TouchableOpacity style={{ backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", borderWidth: 2, borderColor: "#000000", borderRadius: 4 }} onPress={() => {clickedOnImageUpload(); setCurrentImageRow(item.mainSlno+""+item.subSlno)}}><Image style={{ width: 20, height: 20 }} source={ic_camera} /><Text style={{ marginLeft: 4, padding: 4, color: "#000000", fontWeight: 500 }}>Select Image</Text></TouchableOpacity>

          {currentImageRow &&
           currentImageRow == item.mainSlno+""+item.subSlno  && URI != null && URI != '' &&
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
          <TouchableOpacity onPress={() => uploadFromChild(item.mainSlno, item.subSlno)} style={{ width: "50px", backgroundColor: "red", flexDirection: "row", alignItems: "center", padding: 4, borderRadius: 5, marginHorizontal: 3, marginHorizontal: "auto", flexDirection: "row", justifyContent: "center" }}><Text style={{ color: "#ffffff", fontWeight: "700" }}>Upload</Text></TouchableOpacity>

        </>
      )}
    </View>
  );
});

export default EquipmentItem;
