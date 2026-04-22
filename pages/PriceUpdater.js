import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────
// ItemPriceUpdateScreen
// ─────────────────────────────────────────────

const PriceUpdater = () => {

  // ── app state ──────────────────────────────
  const [appUrl, setAppUrl]       = useState('');
  const [cmpCode, setCmpCode]     = useState('');
  const [loginUser, setLoginUser] = useState('');

  // ── list state ─────────────────────────────
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searchText, setSearchText] = useState('');

  // ── modal state ────────────────────────────
  const [modalVisible, setModalVisible]       = useState(false);
  const [selectedItem, setSelectedItem]       = useState(null);
  const [price1, setPrice1]                   = useState('');
  const [price2, setPrice2]                   = useState('');
  const [price3, setPrice3]                   = useState('');
  const [saving, setSaving]                   = useState(false);

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const url  = await AsyncStorage.getItem('appUrl');
      const user = await AsyncStorage.getItem('loginUserName');
      const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
      const parsed = (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];
      if (url)  setAppUrl(url);
      if (user) setLoginUser(user.trim());
      if (parsed.length) setCmpCode(parsed[0].cmpcode.trim());
    };
    init();
  }, []);

  // ── load all on mount ──────────────────────
  useEffect(() => {
    if (!appUrl || !cmpCode) return;
    fetchItems('');
  }, [appUrl, cmpCode]);

  // ── search with debounce ───────────────────
  useEffect(() => {
    if (!appUrl || !cmpCode) return;
    setItems([]);
    const timer = setTimeout(() => {
      fetchItems(searchText.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  // ─────────────────────────────────────────────
  // API
  // ─────────────────────────────────────────────

  const fetchItems = (search) => {
    setLoading(true);
    // ↓ Replace with your actual endpoint
    const apiUrl = `${appUrl}ItemPriceList/${cmpCode}/${search || '-'}/1/50`;
    axios
      .get(apiUrl)
      .then(res => setItems(res.data || []))
      .catch(() => Alert.alert('Error', 'Failed to load items.'))
      .finally(() => setLoading(false));
  };

  const savePrice = () => {
    if (!price1.trim() || !price2.trim() || !price3.trim()) {
      Alert.alert('Required', 'Please fill all three prices.');
      return;
    }
    if (isNaN(price1) || isNaN(price2) || isNaN(price3)) {
      Alert.alert('Invalid', 'Prices must be numeric values.');
      return;
    }

    setSaving(true);
    // ↓ Replace with your actual endpoint
    const apiUrl = `${appUrl}UpdateItemPrice`;
    axios
      .post(apiUrl, JSON.stringify([{
        cmpcode:  cmpCode,
        icode:    selectedItem.icode,
        price1:   price1,
        price2:   price2,
        price3:   price3,
        user:     loginUser,
      }]), { headers: { 'Content-Type': 'application/json' } })
      .then(res => {
        if (res.data.result === 'Saved') {
          // update locally — no re-fetch needed
          setItems(prev =>
            prev.map(i =>
              i.icode === selectedItem.icode
                ? { ...i, price1, price2, price3 }
                : i,
            ),
          );
          Alert.alert('Success', 'Prices updated successfully.');
          setModalVisible(false);
        } else {
          Alert.alert('Error', 'Could not save. Please try again.');
        }
      })
      .catch(() => Alert.alert('Error', 'Save failed.'))
      .finally(() => setSaving(false));
  };

  // ─────────────────────────────────────────────
  // OPEN MODAL
  // ─────────────────────────────────────────────

  const openModal = (item) => {
    setSelectedItem(item);
    setPrice1(item.price1?.toString() || '0');
    setPrice2(item.price2?.toString() || '0');
    setPrice3(item.price3?.toString() || '0');
    setModalVisible(true);
  };

  // ─────────────────────────────────────────────
  // RENDER ROW
  // ─────────────────────────────────────────────

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openModal(item)}
      activeOpacity={0.75}>

      {/* Left — item info */}
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.idesc?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.idesc}</Text>
          <Text style={styles.itemCode}>{item.icode}</Text>
          <View style={styles.tagRow}>
            {item.brand ? <Text style={styles.tag}>{item.brand}</Text> : null}
            {item.unit  ? <Text style={styles.tag}>{item.unit}</Text>  : null}
          </View>
        </View>
      </View>

      {/* Right — 3 prices */}
      <View style={styles.cardRight}>
        <PriceChip label="Price 1" value={item.price1} />
        <PriceChip label="Price 2" value={item.price2} />
        <PriceChip label="Price 3" value={item.price3} />
        <Text style={styles.tapHint}>Tap to edit</Text>
      </View>

    </TouchableOpacity>
  );

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Item Price Update</Text>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by item code or name..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Loader ── */}
      {loading && (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color="#1a4fa0" />
          <Text style={styles.loaderText}>Loading items...</Text>
        </View>
      )}

      {/* ── Empty ── */}
      {!loading && items.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            {searchText ? `No items found for "${searchText}"` : 'No items found'}
          </Text>
        </View>
      )}

      {/* ── List ── */}
      <FlatList
        data={items}
        keyExtractor={item => item.icode}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      />

      {/* ── Edit Price Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            {/* Modal header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Prices</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Item info */}
            {selectedItem && (
              <View style={styles.modalItemInfo}>
                <Text style={styles.modalItemName}>{selectedItem.idesc}</Text>
                <Text style={styles.modalItemCode}>{selectedItem.icode}</Text>
                {selectedItem.brand
                  ? <Text style={styles.modalItemSub}>Brand: {selectedItem.brand}</Text>
                  : null}
              </View>
            )}

            {/* Price inputs */}
            <PriceInput label="Price 1" value={price1} onChange={setPrice1} />
            <PriceInput label="Price 2" value={price2} onChange={setPrice2} />
            <PriceInput label="Price 3" value={price3} onChange={setPrice3} />

            {/* Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={saving}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={savePrice}
                disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>Save Prices</Text>}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
};

// ─────────────────────────────────────────────
// SUB COMPONENTS
// ─────────────────────────────────────────────

const PriceChip = ({ label, value }) => (
  <View style={styles.priceChip}>
    <Text style={styles.priceChipLabel}>{label}</Text>
    <Text style={styles.priceChipValue}>{parseFloat(value || 0).toFixed(2)}</Text>
  </View>
);

const PriceInput = ({ label, value, onChange }) => (
  <View style={styles.priceInputRow}>
    <Text style={styles.priceInputLabel}>{label}</Text>
    <TextInput
      style={styles.priceInput}
      keyboardType="numeric"
      value={value}
      onChangeText={onChange}
      placeholder="0.00"
      placeholderTextColor="#bbb"
    />
  </View>
);

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f4f6fb' },

  // header
  header:           { backgroundColor: '#1a4fa0', paddingTop: Platform.OS === 'ios' ? 52 : 20, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle:      { color: '#fff', fontSize: 18, fontWeight: '700' },

  // search
  searchWrap:       { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#dde3f0', paddingHorizontal: 12 },
  searchIcon:       { fontSize: 14, marginRight: 6 },
  searchInput:      { flex: 1, height: 44, fontSize: 14, color: '#222' },
  clearBtn:         { padding: 6 },
  clearBtnText:     { color: '#888', fontSize: 14 },

  // loader / empty
  loaderWrap:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 8 },
  loaderText:       { color: '#555', fontSize: 13 },
  emptyWrap:        { alignItems: 'center', marginTop: 50 },
  emptyText:        { color: '#aaa', fontSize: 13 },

  // card
  card:             { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, marginTop: 10, borderRadius: 10, padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardLeft:         { flex: 1, flexDirection: 'row', gap: 10 },
  cardRight:        { alignItems: 'flex-end', justifyContent: 'center', gap: 4, minWidth: 90 },
  avatar:           { width: 42, height: 42, borderRadius: 8, backgroundColor: '#1a4fa0', justifyContent: 'center', alignItems: 'center' },
  avatarText:       { color: '#fff', fontWeight: '700', fontSize: 18 },
  cardInfo:         { flex: 1, gap: 3 },
  itemName:         { fontSize: 13, fontWeight: '700', color: '#111', lineHeight: 18 },
  itemCode:         { fontSize: 11, color: '#888' },
  tagRow:           { flexDirection: 'row', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  tag:              { fontSize: 10, color: '#555', backgroundColor: '#f0f3fa', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tapHint:          { fontSize: 10, color: '#aaa', marginTop: 2 },

  // price chip (in card)
  priceChip:        { alignItems: 'flex-end' },
  priceChipLabel:   { fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
  priceChipValue:   { fontSize: 12, fontWeight: '700', color: '#1a4fa0' },

  // modal
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalBox:         { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20 },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle:       { fontSize: 16, fontWeight: '700', color: '#1a4fa0' },
  modalClose:       { fontSize: 18, color: '#888', padding: 4 },
  modalItemInfo:    { backgroundColor: '#f4f7fc', borderRadius: 8, padding: 12, marginBottom: 16 },
  modalItemName:    { fontSize: 13, fontWeight: '700', color: '#111' },
  modalItemCode:    { fontSize: 11, color: '#888', marginTop: 2 },
  modalItemSub:     { fontSize: 11, color: '#555', marginTop: 2 },

  // price inputs (in modal)
  priceInputRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  priceInputLabel:  { width: 70, fontSize: 13, fontWeight: '600', color: '#333' },
  priceInput:       { flex: 1, borderWidth: 1, borderColor: '#dde3f0', borderRadius: 8, paddingHorizontal: 12, height: 44, fontSize: 15, color: '#111', backgroundColor: '#fafbff' },

  // buttons
  modalBtnRow:      { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn:        { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, height: 44, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText:    { color: '#555', fontWeight: '600' },
  saveBtn:          { flex: 1, backgroundColor: '#1a4fa0', borderRadius: 8, height: 44, justifyContent: 'center', alignItems: 'center' },
  saveBtnText:      { color: '#fff', fontWeight: '700' },
});

export default PriceUpdater;