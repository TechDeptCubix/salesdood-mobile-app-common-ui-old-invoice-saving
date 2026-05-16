import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import HeaderUiNew from './HeaderUiNew';

const { width } = Dimensions.get('window');

const ViewCart = () => {
  const [activeTab, setActiveTab] = useState('SO'); // 'SO' for Sales Order, 'SI' for Sales Invoice
  const [items, setItems] = useState([]);
  
  // Inline Editing State
  const [editingCode, setEditingCode] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Storage keys matching your existing logic
  const storageKey = activeTab === 'SO' ? 'savedItemData' : 'savedItemDataInv';

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      setItems(data ? JSON.parse(data) : []);
    } catch (error) {
      console.error("Load Error:", error);
    }
  };

  // Reload when switching tabs or focusing screen
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [activeTab])
  );

  const saveToStorage = async (newList) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newList));
      setItems(newList);
    } catch (error) {
      Alert.alert("Error", "Failed to save data");
    }
  };

  const handleDelete = (code) => {
    Alert.alert("Confirm Delete", "Remove this item from the cart?", [
      { text: "No", style: "cancel" },
      { 
        text: "Yes", 
        style: "destructive",
        onPress: () => {
          const filtered = items.filter(i => i.Code !== code);
          saveToStorage(filtered);
        }
      }
    ]);
  };

  const handleUpdate = async (item) => {
    const qty = parseFloat(editQty);
    const price = parseFloat(editPrice);

    // Basic validation
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Validation Error", "Quantity must be greater than 0");
      return;
    }

    // --- Block Price Logic ---
    // Accessing the field 'Block Price' as per your requirement
    const blockPriceVal = parseFloat(item['Block Price']);
    if (blockPriceVal > 0 && price < blockPriceVal) {
      Alert.alert(
        "Price Blocked", 
        `You cannot set a price lower than the Block Price: ${blockPriceVal.toFixed(2)}`
      );
      return;
    }

    const updatedItems = items.map(i => {
      if (i.Code === item.Code) {
        return { 
          ...i, 
          quantity: qty, 
          unitPrice: price,
          unitPriceToShowUser: price, // Syncing both fields as requested
          total: (qty * price)       // Refreshing the calculated total
        };
      }
      return i;
    });
    
    await saveToStorage(updatedItems);
    setEditingCode(null);
  };

  const renderItem = ({ item, index }) => {
    const isEditing = editingCode === item.Code;
    const currentTotal = (item.quantity * item.unitPrice).toFixed(2);

    return (
      <View style={styles.itemCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.indexText}>{index + 1}.</Text>
          <Text style={styles.descText} numberOfLines={2}>{item.Description}</Text>
          {!isEditing && <Text style={styles.totalHeader}>{currentTotal}</Text>}
        </View>

        {isEditing ? (
          <View style={styles.editSection}>
            <View style={styles.inputRow}>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Qty</Text>
                <TextInput 
                  style={styles.input} 
                  value={editQty} 
                  onChangeText={setEditQty} 
                  keyboardType="numeric" 
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.label}>Price</Text>
                <TextInput 
                  style={styles.input} 
                  value={editPrice} 
                  onChangeText={setEditPrice} 
                  keyboardType="numeric" 
                />
              </View>
            </View>
            
            <View style={styles.validationRow}>
              {parseFloat(item['Block Price']) > 0 && (
                <Text style={styles.blockPriceWarn}>Min Price: {item['Block Price']}</Text>
              )}
              <Text style={styles.liveTotal}>
                New Total: {((parseFloat(editQty) || 0) * (parseFloat(editPrice) || 0)).toFixed(2)}
              </Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.saveBtn} onPress={() => handleUpdate(item)}>
                <Text style={styles.btnTextWhite}>UPDATE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingCode(null)}>
                <Text style={styles.btnText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.viewSection}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>Qty: <Text style={styles.bold}>{item.quantity}</Text></Text>
              <Text style={styles.detailText}>Rate: <Text style={styles.bold}>{item.unitPrice}</Text></Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.editBtn} 
                onPress={() => {
                  setEditingCode(item.Code);
                  setEditQty(item.quantity.toString());
                  setEditPrice(item.unitPrice.toString());
                }}
              >
                <Text style={styles.btnText}>EDIT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.Code)}>
                <Text style={styles.btnText}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderUiNew title="Review Carts" />
      
      {/* Manual Tab Control */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'SO' && styles.activeTab]} 
          onPress={() => { setActiveTab('SO'); setEditingCode(null); }}
        >
          <Text style={[styles.tabText, activeTab === 'SO' && styles.activeTabText]}>Sales Order</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'SI' && styles.activeTab]} 
          onPress={() => { setActiveTab('SI'); setEditingCode(null); }}
        >
          <Text style={[styles.tabText, activeTab === 'SI' && styles.activeTabText]}>Sales Invoice</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.Code + index}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items found in {activeTab === 'SO' ? 'Sales Order' : 'Invoice'}</Text>
          }
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FD' },
  tabBar: { flexDirection: 'row', backgroundColor: 'white', elevation: 4 },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#1F4BB4' },
  tabText: { color: '#888', fontWeight: 'bold' },
  activeTabText: { color: '#1F4BB4' },
  itemCard: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', marginBottom: 10 },
  indexText: { fontWeight: 'bold', color: '#1F4BB4', marginRight: 5 },
  descText: { flex: 1, fontSize: 14, color: 'black', fontWeight: '500' },
  totalHeader: { fontWeight: 'bold', color: '#1F4BB4', fontSize: 15 },
  viewSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailsRow: { flexDirection: 'row' },
  detailText: { fontSize: 12, color: '#666', marginRight: 15 },
  bold: { color: 'black', fontWeight: 'bold' },
  editSection: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputWrap: { width: '48%' },
  label: { fontSize: 11, color: '#888', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, height: 40, backgroundColor: '#f9f9f9', color: 'black' },
  validationRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  blockPriceWarn: { fontSize: 11, color: 'red', fontWeight: 'bold' },
  liveTotal: { fontSize: 13, fontWeight: 'bold', color: '#2ecc71' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
  editBtn: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 6, marginRight: 8, width: 70, alignItems: 'center' },
  deleteBtn: { backgroundColor: '#FFEBEE', padding: 8, borderRadius: 6, width: 70, alignItems: 'center' },
  saveBtn: { backgroundColor: '#1F4BB4', padding: 10, borderRadius: 6, marginRight: 8, width: 95, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#eee', padding: 10, borderRadius: 6, width: 95, alignItems: 'center' },
  btnText: { fontSize: 11, fontWeight: 'bold', color: '#333' },
  btnTextWhite: { fontSize: 11, fontWeight: 'bold', color: 'white' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default ViewCart;