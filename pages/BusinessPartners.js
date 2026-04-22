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
// BusinessPartnerListScreen
// ─────────────────────────────────────────────

const BusinessPartnerListScreen = () => {
  // ── state ──────────────────────────────────
  const [appUrl, setAppUrl]       = useState('');
  const [cmpCode, setCmpCode]     = useState('');
  const [loginUser, setLoginUser] = useState('');

  const [searchText, setSearchText]   = useState('');
  const [partners, setPartners]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [savingLimit, setSavingLimit] = useState(false);

  // ── modal state ────────────────────────────
  const [modalVisible, setModalVisible]         = useState(false);
  const [selectedPartner, setSelectedPartner]   = useState(null);
  const [newLimit, setNewLimit]                 = useState('');

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

  // ─────────────────────────────────────────────
  // SEARCH — clears list immediately, fires API after 400ms debounce
  // ─────────────────────────────────────────────

  // fetch all on load
  useEffect(() => {
    if (!appUrl || !cmpCode) return;
    fetchPartners('');
  }, [appUrl, cmpCode]);

  // fetch on search
  useEffect(() => {
    if (!appUrl || !cmpCode) return;
    setPartners([]);
    const timer = setTimeout(() => {
      fetchPartners(searchText.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  // ─────────────────────────────────────────────
  // API
  // ─────────────────────────────────────────────

  const fetchPartners = (search) => {
    setLoading(true);
    // ↓ Replace with your actual endpoint
    //const apiUrl = `${appUrl}BusinessPartners/${cmpCode}/${search || '-'}`;

    const apiUrl =  `${appUrl}CRMAccountListPage/${cmpCode}/ACCOUNTLIST/MAIN/CUSTOMERS/-/${search || '-'}/1/50`
    console.log("business partners apiUrl", apiUrl)
    axios
      .get(apiUrl)
      .then(res => setPartners(res.data || []))
      .catch(() => Alert.alert('Error', 'Failed to load partners.'))
      .finally(() => setLoading(false));
  };

  const saveCreditLimit = () => {
    if (!newLimit.trim() || isNaN(newLimit)) {
      Alert.alert('Invalid', 'Please enter a valid numeric limit.');
      return;
    }
    setSavingLimit(true);
    // ↓ Replace with your actual endpoint
    const apiUrl = `${appUrl}UpdateCreditLimit`;
    axios
      .post(apiUrl, JSON.stringify([{
        cmpcode:    cmpCode,
        cust_acc:   selectedPartner.ACCOUNT,
        creditlimit: newLimit,
        user:       loginUser,
      }]), { headers: { 'Content-Type': 'application/json' } })
      .then(res => {
        if (res.data.result === 'Saved') {
          // update locally so list reflects new value without re-fetch
          setPartners(prev =>
            prev.map(p =>
              p.ACCOUNT === selectedPartner.ACCOUNT
                ? { ...p, Credit_Limit: newLimit }
                : p,
            ),
          );
          Alert.alert('Success', 'Credit limit updated.');
          setModalVisible(false);
        } else {
          Alert.alert('Error', 'Could not save. Please try again.');
        }
      })
      .catch(() => Alert.alert('Error', 'Save failed.'))
      .finally(() => setSavingLimit(false));
  };

  // ─────────────────────────────────────────────
  // OPEN MODAL
  // ─────────────────────────────────────────────

  const openEditModal = (partner) => {
    setSelectedPartner(partner);
    setNewLimit(partner.Credit_Limit?.toString() || '0');
    setModalVisible(true);
  };

  // ─────────────────────────────────────────────
  // RENDER ROW
  // ─────────────────────────────────────────────

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openEditModal(item)}
      activeOpacity={0.75}>
      <View style={styles.cardLeft}>
        {/* Avatar circle */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.DESCRIPTION?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.partnerName} numberOfLines={1}>{item.DESCRIPTION}</Text>
          <Text style={styles.partnerSub}>Acc: {item.ACCOUNT}</Text>
          <View style={styles.row}>
            <Text style={styles.tag}>{item.Contact_No?.trim() || 'No phone'}</Text>
            <Text style={styles.tag}>{item.Sales_Person?.trim() || 'No salesperson'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.tag}>{item.Credit_Mode?.trim() || 'No credit mode'}</Text>
            <Text style={styles.tag}>Due: {item.Due_Days}d</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.limitLabel}>Balance: </Text>
            <Text style={styles.balanceValue}>
              {item.fc || 'AED'} {parseFloat(item.BALANCE || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Credit limit */}
      <View style={styles.cardRight}>
        <Text style={styles.limitLabel}>Credit Limit</Text>
        <Text style={styles.limitValue}>
          {item.fc || 'AED'} {parseFloat(item.Credit_Limit || 0).toFixed(2)}
        </Text>
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
        <Text style={styles.headerTitle}>Business Partners</Text>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or account..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={text => setSearchText(text)}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setSearchText('')}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Loader ── */}
      {loading && (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color="#1a4fa0" />
          <Text style={styles.loaderText}>Loading...</Text>
        </View>
      )}

      {/* ── Empty state ── */}
      {!loading && searchText.length > 0 && partners.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No partners found for "{searchText}"</Text>
        </View>
      )}

      {!loading && partners.length === 0 && searchText.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No business partners found</Text>
        </View>
      )}

      {/* ── List ── */}
      <FlatList
        data={partners}
        keyExtractor={item => item.ACCOUNT}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
      />

      {/* ── Edit Limit Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>Edit Credit Limit</Text>

            {/* Partner info inside modal */}
            {selectedPartner && (
              <View style={styles.modalPartnerInfo}>
                <Text style={styles.modalPartnerName}>{selectedPartner.DESCRIPTION}</Text>
                <Text style={styles.modalPartnerSub}>Acc: {selectedPartner.ACCOUNT}</Text>
                <View style={styles.row}>
                  <Text style={styles.limitLabel}>Current Limit: </Text>
                  <Text style={styles.limitValue}>
                    {selectedPartner.fc || 'AED'} {parseFloat(selectedPartner.Credit_Limit || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.limitLabel}>Balance: </Text>
                  <Text style={styles.balanceValue}>
                    {selectedPartner.fc || 'AED'} {parseFloat(selectedPartner.BALANCE || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.limitLabel}>Due Days: </Text>
                  <Text style={styles.modalInfoValue}>{selectedPartner.Due_Days}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.limitLabel}>Credit Mode: </Text>
                  <Text style={styles.modalInfoValue}>{selectedPartner.Credit_Mode?.trim() || '—'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.limitLabel}>Patron Type: </Text>
                  <Text style={styles.modalInfoValue}>{selectedPartner.Patron_Type?.trim() || '—'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.limitLabel}>TRN: </Text>
                  <Text style={styles.modalInfoValue}>{selectedPartner.trn?.trim() || '—'}</Text>
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>New Credit Limit</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={newLimit}
              onChangeText={setNewLimit}
              placeholder="Enter amount"
              placeholderTextColor="#aaa"
            />

            {/* Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={savingLimit}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, savingLimit && { opacity: 0.6 }]}
                onPress={saveCreditLimit}
                disabled={savingLimit}>
                {savingLimit
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>Save</Text>
                }
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
};

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
  searchInput:      { flex: 1, height: 44, fontSize: 14, color: '#222' },
  clearBtn:         { padding: 6 },
  clearBtnText:     { color: '#888', fontSize: 14 },

  // loader / empty
  loaderWrap:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 8 },
  loaderText:       { color: '#555', fontSize: 13 },
  emptyWrap:        { alignItems: 'center', marginTop: 40 },
  emptyText:        { color: '#aaa', fontSize: 13 },

  // card
  card:             { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, marginTop: 10, borderRadius: 10, padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardLeft:         { flex: 1, flexDirection: 'row', gap: 10 },
  cardRight:        { alignItems: 'flex-end', justifyContent: 'center', minWidth: 110 },
  avatar:           { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1a4fa0', justifyContent: 'center', alignItems: 'center' },
  avatarText:       { color: '#fff', fontWeight: '700', fontSize: 18 },
  cardInfo:         { flex: 1, gap: 3 },
  partnerName:      { fontSize: 13, fontWeight: '700', color: '#111' },
  partnerSub:       { fontSize: 11, color: '#888' },
  row:              { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  tag:              { fontSize: 10, color: '#555', backgroundColor: '#f0f3fa', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  limitLabel:       { fontSize: 11, color: '#888' },
  limitValue:       { fontSize: 13, fontWeight: '700', color: '#1a4fa0', marginTop: 2 },
  balanceValue:     { fontSize: 13, fontWeight: '700', color: '#e06000' },
  tapHint:          { fontSize: 10, color: '#aaa', marginTop: 4 },
  modalInfoValue:   { fontSize: 11, fontWeight: '600', color: '#333' },

  // modal
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modalBox:         { backgroundColor: '#fff', width: '88%', borderRadius: 12, padding: 20, elevation: 8 },
  modalTitle:       { fontSize: 16, fontWeight: '700', color: '#1a4fa0', marginBottom: 14 },
  modalPartnerInfo: { backgroundColor: '#f4f7fc', borderRadius: 8, padding: 12, marginBottom: 16, gap: 4 },
  modalPartnerName: { fontSize: 13, fontWeight: '700', color: '#111' },
  modalPartnerSub:  { fontSize: 11, color: '#888', marginBottom: 4 },
  inputLabel:       { fontSize: 12, color: '#555', marginBottom: 6 },
  modalInput:       { borderWidth: 1, borderColor: '#dde3f0', borderRadius: 8, paddingHorizontal: 12, height: 44, fontSize: 15, color: '#111', backgroundColor: '#fafbff' },
  modalBtnRow:      { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn:        { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, height: 44, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText:    { color: '#555', fontWeight: '600' },
  saveBtn:          { flex: 1, backgroundColor: '#1a4fa0', borderRadius: 8, height: 44, justifyContent: 'center', alignItems: 'center' },
  saveBtnText:      { color: '#fff', fontWeight: '700' },
});

export default BusinessPartnerListScreen;