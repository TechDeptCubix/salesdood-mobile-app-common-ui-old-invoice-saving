import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeaderUiNew from './HeaderUiNew';

// ── CONFIG ─────────────────────────────────────────────────────────────────

const GUID = 'F4369B5E-8E23-4BCF-AC82-76C977991728';
// ───────────────────────────────────────────────────────────────────────────

export default function SplitItemScreen() {
  const [deptNo, setDeptNo] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [vanFromLocalStorage, setVanFromLocalStorage] = useState(null);
  const [componentData, setComponentData] = useState(null);

  const [apiLoadingComponent, setApiLoadingComponent] = useState(false);

  const [appUrl, setAppUrl] = useState('');

  const [cmpcode, setCmpCode] = useState('');

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  // ── Fetch items from API ────────────────────────────────────────────────
  const fetchItems = useCallback(
    async searchKey => {
      if (!searchKey.trim()) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      // ✅ Guard — wait until appUrl and cmpcode are ready
      if (!appUrl || !cmpcode) {
        Alert.alert('Please wait', 'App is still loading, try again.');
        return;
      }

      setSearchLoading(true);
      try {
        let locationToPassToApiBasedOnVan =
          vanFromLocalStorage == '----' ? 'MASTER' : vanFromLocalStorage;
        let modeToPassToApiBasedOnVan =
          vanFromLocalStorage == '----' ? 'MOBILE' : 'all_top1000';

        const url = `${appUrl}Search_Items/InventoryList?cmpcode=${cmpcode}&guid=${GUID}&mod=${modeToPassToApiBasedOnVan}&Loc=${locationToPassToApiBasedOnVan}&searchKey=${encodeURIComponent(
          searchKey,
        )}`;

        console.log('api to call', url);

        const response = await axios.get(url);
        setSuggestions(response.data || []);
        setShowDropdown(true);
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch items. Check your connection.');
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [appUrl, cmpcode, vanFromLocalStorage],
  );

  const handleChangeText = text => {
    setQuery(text);
    setSelectedItem(null);
    fetchItems(text);
  };

  const handleSelect = item => {
    setSelectedItem(item);
    setQuery(item.Description);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedItem(null);
    setSuggestions([]);
    setShowDropdown(false);
  };

  // ── Your action API call ────────────────────────────────────────────────
  const handleApiCall = async () => {
    if (!selectedItem) {
      Alert.alert('Error', 'Please select an item before submitting.');
      return;
    }

    if (!componentData) {
      Alert.alert('Error', 'Component data is missing. Please try again.');
      return;
    }

    if (deptNo == '----') {
      Alert.alert('Department missing');
      return;
    }

    const getTodayFormatted = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm   = String(today.getMonth() + 1).padStart(2, '0');
        const dd   = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T00:00:00`;
      };
      
      const today = getTodayFormatted();

    let locationToPass =   vanFromLocalStorage == '----' ? '' : vanFromLocalStorage;

    setApiLoading(true);
    try {
      const payload = {
        modeOp: 'SAVE',
        invNo: 0,
        ref: '',
        fc: 'AED',
        amount: 0,
        fcAmount: 0,
        account: "",
        accDesc:componentData[0].Xcode, 
        status: '',
        remarks: '',
        deptNo: deptNo,
        date: today,
        inv: '',
        shipDate: today,
        shipRef: '',
        dueDate: today,
        mawb: '',
        hwab: '',
        lcNo: '',
        docRef: '',
        cfAgent: '',
        purchAccount: '',
        purchAccDesc: '',
        rate: 1,
        local: '',
        otherCost: componentData[0]?.cost ?? 0,
        jobCode: '',
        discount: 0.0,
        fDiscount: 0.0,
        ccNo: '',
        vatAmt: componentData[0]?.qty ?? 0,
        rdOff: 0,
        costUpd: '',
        items: [
          {
            slno: '1',
            code: selectedItem.Code,
            description: selectedItem?.Description,
            locn: locationToPass,
            unit: '',
            qty: 1,
            unitCost: 0,
            unitBCCost: 0,
            amount: 0,
            othCost: 0,
            x: '',
            cntrl: '',
            frac: 1.0,
            vatPercent: 0,
            vatAmt: 0,
            mastInfo: '',
            poNo: 0,
            total: 0,
            oem: '',
            group: '',
            discPercent: 0,
            git: '0',
            salesperson: '',
            bin: '',
            remarks: '',
            wastage: 0,
          },
        ],
      };

      let urlToUpload = `${appUrl}Production?cmpcode=${cmpcode}`;
      let serializedData = JSON.stringify(payload);

      console.log(
        'serializedData to split api urlToUpload ',
        urlToUpload,
        serializedData,
      );

      

      const response = await axios.post(urlToUpload, serializedData, {
        headers: {'Content-Type': 'application/json'},
      });

      if (response.data?.message?.trim()?.toUpperCase() === 'SAVED SUCCESSFULLY') {
        Alert.alert('Success', 'Item submitted successfully!');
        // your next action e.g. navigation.goBack()
        setSelectedItem(null)
        setComponentData(null)
      }

      
    } catch (err) {
        console.log("error", err)
      Alert.alert('Something went wrong, please try later');
    } finally {
      setApiLoading(false);
    }
  };

  const fetchAppUrl = async () => {
    const van_from_local = await AsyncStorage.getItem('VAN');
    console.log('van_from_local in check stock', van_from_local);
    setVanFromLocalStorage(van_from_local);

    const appUrl = await AsyncStorage.getItem('appUrl');

    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];

    if (parsedUserDataArray) {
      setCmpCode(parsedUserDataArray[0].cmpcode.trim().toUpperCase());
    }

    if (appUrl) {
      setAppUrl(appUrl);
      console.log('appUrl in check stock', appUrl);
    }
  };

  const callComponentData = async itemCode => {
    try {
      setApiLoadingComponent(true);
      const url = `${appUrl}Search_Items/ItemComponents?compcode=${cmpcode}&type=COMPONENTS&code=${encodeURIComponent(
        itemCode,
      )}&account=-`;

      console.log('api to call loading component', url);

      const response = await axios.get(url);
      setComponentData(response.data);
    } catch (err) {
      Alert.alert('error while getting Component data');
    } finally {
      setApiLoadingComponent(false);
    }
  };

  useEffect(() => {
    if (selectedItem) {
      callComponentData(selectedItem?.Code);
    }
  }, [selectedItem]);

  const fetchAsyncUser = async () => {
    const deptno = await AsyncStorage.getItem('DEPTNO');
    const finalDept = deptno ?? '----';
    setDeptNo(finalDept);
    return finalDept;
  };
  useEffect(() => {
    fetchAppUrl();
    fetchAsyncUser();
  }, []);

  // ── Detail row helper ───────────────────────────────────────────────────
  const DetailRow = ({label, value, valueStyle}) => (
    <>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={[styles.cardValue, valueStyle]}>{value ?? '-'}</Text>
      </View>
      <View style={styles.divider} />
    </>
  );

  return (
    <View style={styles.outer_container}>
      <HeaderUiNew name={'Split Item'} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* ── Header ───────────────────────────────────────────────────────── */}
          <Text style={styles.heading}>Item Search</Text>

          {/* ── Search Input ─────────────────────────────────────────────────── */}
          <View style={styles.inputWrapper}>
            {searchLoading ? (
              <ActivityIndicator
                size="small"
                color="#2563eb"
                style={{marginRight: 8}}
              />
            ) : (
              <Text style={styles.searchIcon}>🔍</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Search by name or code…"
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={handleChangeText}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClear}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Dropdown ─────────────────────────────────────────────────────── */}
          {showDropdown && (
            <View style={styles.dropdown}>
              {suggestions.length > 0 ? (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item, index) =>
                    item.Code?.toString() ?? index.toString()
                  }
                  keyboardShouldPersistTaps="handled"
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleSelect(item)}>
                      <Text style={styles.dropdownItemId}>{item.Code}</Text>
                      <Text style={styles.dropdownItemName} numberOfLines={1}>
                        {item.Description}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                !searchLoading && (
                  <Text style={styles.noResult}>No items found</Text>
                )
              )}
            </View>
          )}

          {/* ── Item Details Card ─────────────────────────────────────────────── */}
          {selectedItem && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Item Details</Text>

              <DetailRow label="Code" value={selectedItem.Code} />
              <DetailRow label="Description" value={selectedItem.Description} />
              <DetailRow label="Barcode" value={selectedItem['BAR CODE']} />
              <DetailRow label="Unit" value={selectedItem.unit} />
              {/* <DetailRow label="Group"      value={selectedItem.Group} />
          <DetailRow label="Type"       value={selectedItem.TYPE} />

          <DetailRow
            label="Price"
            value={`AED ${parseFloat(selectedItem.price ?? 0).toFixed(2)}`}
            valueStyle={styles.priceText}
          />
          <DetailRow
            label="Cost Avg"
            value={`AED ${parseFloat(selectedItem.Cost_Avg ?? 0).toFixed(2)}`}
          /> */}

              {/* Stock badges row */}
              {/* <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Stock</Text>
            <View style={styles.badgesRow}>
              <View style={[styles.badge, selectedItem.Stock > 0 ? styles.badgeGreen : styles.badgeRed]}>
                <Text style={styles.badgeText}>Stock: {selectedItem.Stock}</Text>
              </View>
              <View style={styles.badgeGray}>
                <Text style={styles.badgeText}>Pending DO: {selectedItem.Do_Pend}</Text>
              </View>
              <View style={styles.badgeGray}>
                <Text style={styles.badgeText}>Pending PO: {selectedItem.Po_Pend}</Text>
              </View>
            </View>
          </View> */}

              <View>
                <Text style={{marginTop: 8}}>Details</Text>
                {componentData && (
                  <View>
                    <Text style={styles.just_text_Label}>Description</Text>
                    <Text style={styles.just_text_Value}>
                      {componentData[0] && componentData[0].des}
                    </Text>
                    <Text style={styles.just_text_Label}>Qty</Text>
                    <Text style={styles.just_text_Value}>
                      {componentData[0] && componentData[0].qty}
                    </Text>
                  </View>
                )}
              </View>

              {/* ── Action Button ─────────────────────────────────────────────── */}
              <TouchableOpacity
                style={[styles.button, apiLoading && styles.buttonDisabled]}
                onPress={() => setShowConfirmPopup(true)} // ← opens popup instead of direct API call
                disabled={apiLoading}>
                {apiLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit Item</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Confirmation Popup ────────────────────────────────────────────────── */}
      {showConfirmPopup && (
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            {/* Icon */}
            <Text style={styles.popupIcon}>⚠️</Text>

            {/* Title */}
            <Text style={styles.popupTitle}>Confirm Submission</Text>

            {/* Message */}
            <Text style={styles.popupMessage}>
              Are you sure you want to submit{' '}
              <Text style={styles.popupItemName}>
                {selectedItem?.Description}
              </Text>
            </Text>

            {/* Buttons */}
            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={styles.popupCancelBtn}
                onPress={() => setShowConfirmPopup(false)}>
                <Text style={styles.popupCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.popupConfirmBtn}
                onPress={() => {
                  setShowConfirmPopup(false);
                  handleApiCall(); // ← calls your API after confirm
                }}>
                <Text style={styles.popupConfirmText}>Yes, Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  outer_container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    height: 48,
    zIndex: 10,
  },
  searchIcon: {fontSize: 16, marginRight: 8},
  input: {flex: 1, fontSize: 15, color: '#111827'},
  clearBtn: {fontSize: 16, color: '#9ca3af', paddingLeft: 8},

  // Dropdown
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
    maxHeight: 220,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemId: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 10,
    width: 60,
  },
  dropdownItemName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  noResult: {padding: 16, color: '#9ca3af', textAlign: 'center'},

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardLabel: {fontSize: 13, color: '#6b7280'},
  cardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  just_text_Value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  just_text_Label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  priceText: {color: '#2563eb'},
  divider: {height: 1, backgroundColor: '#f3f4f6'},

  // Badges
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  badge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20},
  badgeGreen: {backgroundColor: '#dcfce7'},
  badgeRed: {backgroundColor: '#fee2e2'},
  badgeGray: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {fontSize: 11, fontWeight: '600', color: '#374151'},

  // Button
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonDisabled: {backgroundColor: '#93c5fd'},
  buttonText: {color: '#fff', fontSize: 15, fontWeight: '700'},
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  popupBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  popupIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  popupMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  popupItemName: {
    fontWeight: '700',
    color: '#111827',
  },
  popupButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  popupCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  popupConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
