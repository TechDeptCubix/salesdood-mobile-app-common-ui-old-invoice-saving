import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderUiNew from '../HeaderUiNew';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

const getInitials = name =>
  name
    ?.trim()
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '??';

const formatDate = dateStr => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function SalesReturn({navigation}) {
  const [salesMan, setSalesMan] = useState('');
  const [deptNo, setDeptNo] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [cmpcode, setCmpCode] = useState('');

  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

  // Bottom sheet state
  const [sheetVisible, setSheetVisible] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // ── Load AsyncStorage ──────────────────────────────────────────────
  const fetchAppUrl = async () => {
    const storedUrl = await AsyncStorage.getItem('appUrl');
    const storedUserDataArray = await AsyncStorage.getItem('userDataArray');
    const parsedUserDataArray =
      (storedUserDataArray && JSON.parse(storedUserDataArray)) || [];
    const url = storedUrl ?? '';
    const code = parsedUserDataArray[0]?.cmpcode?.trim() ?? '';
    setAppUrl(url);
    setCmpCode(code);
    return {url, code};
  };

  const fetchSalesMan = async () => {
    const salesManVal = await AsyncStorage.getItem('sales_man');
    let finalSalesMan = salesManVal;
    if (salesManVal === '----') {
      const salesManDrop = await AsyncStorage.getItem('sales_man_drop');
      finalSalesMan = salesManDrop;
    }
    setSalesMan(finalSalesMan ?? '');
    return finalSalesMan ?? '';
  };

  const fetchAsyncUser = async () => {
    const deptno = await AsyncStorage.getItem('DEPTNO');
    const finalDept = deptno ?? '----';
    setDeptNo(finalDept);
    return finalDept;
  };

  // ── Fetch Invoice List ─────────────────────────────────────────────
  const fetchInvoicesWith = async (
    url,
    code,
    salesManVal,
    deptNoVal,
    isRefresh = false,
  ) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const endpoint = `${url}SalesInvoice/${code}/invoicelist/${deptNoVal}/${salesManVal}/-`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const json = await response.json();
      const raw = Array.isArray(json) ? json : json.data ?? json.result ?? [];
      const data = raw.map(inv => ({
        id: inv.INVNO?.toString(),
        customer: inv.CUSTOMER?.trim(),
        date: formatDate(inv.INV_DATE),
        total: inv.AMOUNT,
        vatAmount: inv.VATAMT,
        salesman: inv['SALES MAN'] ?? inv.SALES_MAN,
        custAcc: inv.cust_acc,
        remarks: inv.REMARKS,
        cashCred: inv.CASHCRED,
        enteredOn: formatDate(inv.ENTERED_ON),
        action: inv.ACTION,
        items: [],
      }));
      setInvoices(data);
    } catch (err) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchInvoices = (isRefresh = false) => {
    fetchInvoicesWith(appUrl, cmpcode, salesMan, deptNo, isRefresh);
  };

  // ── Fetch Invoice Items ────────────────────────────────────────────
  const fetchItems = async invoice => {
    const alreadyLoaded =
      invoices.find(i => i.id === invoice.id)?.items?.length > 0;
    if (alreadyLoaded) return;

    try {
      setLoadingItems(true);
      const url = `${appUrl}SalesInvoiceDetail/${cmpcode}/${invoice.id}/${deptNo}`;

      console.log('detail api', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const json = await response.json();
      const raw = Array.isArray(json) ? json : json.data ?? json.result ?? [];
      const items = raw.map((item, index) => ({
        id: item.ITEM_CODE?.trim() ?? index.toString(),
        name: item.DESCRIPTION?.trim(),
        qty: item.QTY,
        unit: item.UNIT?.trim(),
        price: item.PRICE,
        lineTotal: item.LINE_TOTAL,
        discount_amount: item.disc_amt,
        total_vat_from_api:item.w
      }));

      setInvoices(prev =>
        prev.map(i => (i.id === invoice.id ? {...i, items} : i)),
      );

      // update activeInvoice so sheet shows items immediately
      setActiveInvoice(prev => ({...prev, items}));
    } catch (err) {
      console.log('fetch items error:', err.message);
    } finally {
      setLoadingItems(false);
    }
  };

  // ── Initial Load ───────────────────────────────────────────────────
  useEffect(() => {
    const loadAndFetch = async () => {
      try {
        const [{url, code}, salesManVal, deptNoVal] = await Promise.all([
          fetchAppUrl(),
          fetchSalesMan(),
          fetchAsyncUser(),
        ]);
        if (url && code && salesManVal && deptNoVal) {
          await fetchInvoicesWith(url, code, salesManVal, deptNoVal);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadAndFetch();
  }, []);

  // ── Bottom Sheet ───────────────────────────────────────────────────
  const openSheet = async invoice => {
    setSelectedItems([]);
    setActiveInvoice(invoice);
    setSheetVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    await fetchItems(invoice);
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSheetVisible(false);
      setActiveInvoice(null);
      setSelectedItems([]);
    });
  };

  // ── Item Selection ─────────────────────────────────────────────────
  const toggleItem = item => {
    setSelectedItems(prev =>
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item],
    );
  };

  const toggleAll = items => {
    const allSelected = items.every(i =>
      selectedItems.find(s => s.id === i.id),
    );
    setSelectedItems(allSelected ? [] : items);
  };

  const filteredData = invoices.filter(
    i =>
      i.id?.includes(search) ||
      i.customer?.toLowerCase().includes(search.toLowerCase()) ||
      i.salesman?.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={{flex: 1, backgroundColor: '#f8fafc'}}>
        <HeaderUiNew name={'Sales Return'} />
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color="#0369a1" />
          <Text style={styles.loadingText}>Loading invoices...</Text>
        </View>
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={{flex: 1, backgroundColor: '#f8fafc'}}>
        <HeaderUiNew name={'Sales Return'} />
        <View style={styles.centerWrap}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorTitle}>Failed to load</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchInvoices()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const allSheetSelected = activeInvoice?.items?.every(i =>
    selectedItems.find(s => s.id === i.id),
  );

  // ── Main UI ────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <HeaderUiNew name={'Sales Return'} />

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          placeholder="Search invoice, customer..."
          placeholderTextColor="#94a3b8"
          style={styles.searchBar}
          onChangeText={setSearch}
          value={search}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Count row */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{filteredData.length} invoices</Text>
        {selectedItems.length > 0 && (
          <View style={styles.selCountBadge}>
            <Text style={styles.selCountText}>
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}{' '}
              selected
            </Text>
          </View>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 15}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchInvoices(true)}
            colors={['#0369a1']}
            tintColor="#0369a1"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No invoices found</Text>
            <Text style={styles.emptySub}>Try a different search term</Text>
          </View>
        }
        renderItem={({item}) => {
          const selCount =
            item.items?.filter(i => selectedItems.find(s => s.id === i.id))
              .length ?? 0;

          return (
            <TouchableOpacity
              style={[styles.row, selCount > 0 && styles.rowActive]}
              onPress={() => openSheet(item)}
              activeOpacity={0.7}>
              {/* Left accent */}
              <View
                style={[
                  styles.rowAccent,
                  selCount > 0 && styles.rowAccentActive,
                ]}
              />

              {/* Content */}
              <View style={styles.rowContent}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowInvId}>INV-{item.id}</Text>
                  <Text style={styles.rowAmount}>
                    AED {item.total?.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.rowBottom}>
                  <Text style={styles.rowCustomer} numberOfLines={1}>
                    {item.customer}
                  </Text>
                  <Text style={styles.rowDate}>{item.date}</Text>
                </View>
                <View style={styles.rowFooter}>
                  <Text style={styles.rowSalesman}>{item.salesman}</Text>
                  <View style={styles.rowTags}>
                    {selCount > 0 && (
                      <View style={styles.selTag}>
                        <Text style={styles.selTagText}>
                          {selCount} selected
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.credTag,
                        item.cashCred === 'C'
                          ? styles.credTagCredit
                          : styles.credTagCash,
                      ]}>
                      <Text
                        style={[
                          styles.credTagText,
                          item.cashCred === 'C'
                            ? styles.credTagCreditText
                            : styles.credTagCashText,
                        ]}>
                        {item.cashCred === 'C' ? 'Credit' : 'Cash'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Arrow */}
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Bottom Sheet */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="none"
        onRequestClose={closeSheet}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, {opacity: backdropAnim}]}>
          <TouchableOpacity style={{flex: 1}} onPress={closeSheet} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[styles.sheet, {transform: [{translateY: slideAnim}]}]}>
          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <View>
                <Text style={styles.sheetInvId}>INV-{activeInvoice?.id}</Text>
                <Text style={styles.sheetCustomer} numberOfLines={1}>
                  {activeInvoice?.customer}
                </Text>
              </View>
            </View>
            <View style={styles.sheetHeaderRight}>
              <Text style={styles.sheetAmount}>
                AED {activeInvoice?.total?.toFixed(2)}
              </Text>
              <Text style={styles.sheetDate}>{activeInvoice?.date}</Text>
            </View>
          </View>

          <View style={styles.sheetHeaderVertical}>
            <Text>Discount {activeInvoice?.items[0]?.discount_amount}</Text>
            <Text>VAT {activeInvoice?.items[0]?.total_vat_from_api}</Text>
          </View>

          <View style={styles.sheetDivider} />

          {/* Toolbar */}
          {!loadingItems && activeInvoice?.items?.length > 0 && (
            <View style={styles.sheetToolbar}>
              <Text style={styles.sheetItemsLabel}>
                {activeInvoice.items.length} ITEMS
              </Text>
              <TouchableOpacity
                style={styles.selAllBtn}
                onPress={() => toggleAll(activeInvoice.items)}>
                <Text style={styles.selAllText}>
                  {allSheetSelected ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Items */}
          {loadingItems ? (
            <View style={styles.sheetLoading}>
              <ActivityIndicator size="small" color="#0369a1" />
              <Text style={styles.sheetLoadingText}>Loading items...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.sheetScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: 20}}>
              {activeInvoice?.items?.length > 0 ? (
                activeInvoice.items.map(sub => {
                  const isSelected = !!selectedItems.find(i => i.id === sub.id);
                  return (
                    <TouchableOpacity
                      key={sub.id}
                      style={[
                        styles.sheetItem,
                        isSelected && styles.sheetItemSelected,
                      ]}
                      onPress={() => toggleItem(sub)}
                      activeOpacity={0.7}>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxChecked,
                        ]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.sheetItemInfo}>
                        <Text style={styles.sheetItemName}>{sub.name}</Text>
                        <Text style={styles.sheetItemCode}>{sub.id}</Text>
                      </View>
                      <View style={styles.sheetItemRight}>
                        <Text style={styles.sheetItemQty}>
                          {sub.qty} {sub.unit}
                        </Text>
                        <Text style={styles.sheetItemPrice}>
                          AED {sub.lineTotal?.toFixed(2)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.noItemsWrap}>
                  <Text style={styles.noItemsText}>No items available</Text>
                </View>
              )}

              {/* Remarks */}
              {activeInvoice?.remarks?.trim().length > 0 && (
                <View style={styles.remarksWrap}>
                  <Text style={styles.remarksLabel}>REMARKS</Text>
                  <Text style={styles.remarksText}>
                    {activeInvoice.remarks}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          {/* Sheet Submit */}
          {selectedItems.length > 0 && (
            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.sheetBtn}
                onPress={() => {
                  closeSheet();
                  navigation.navigate('SalesReturnEntry', {
                    selectedItems,
                    customer: activeInvoice.customer,
                    invoiceId: activeInvoice.id,
                    invoiceDate: activeInvoice.date,
                    invoiceDetailObject: activeInvoice,
                    salesMan: salesMan,
                  });
                }}
                activeOpacity={0.9}>
                <Text style={styles.sheetBtnText}>Process Return</Text>
                <View style={styles.sheetBtnBadge}>
                  <Text style={styles.sheetBtnBadgeText}>
                    {selectedItems.length} item
                    {selectedItems.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Loading / Error
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
  },
  errorIcon: {fontSize: 36, marginBottom: 10},
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  errorMsg: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#0369a1',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {color: '#fff', fontWeight: '600', fontSize: 14},

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 8,
  },
  searchIcon: {fontSize: 18, color: '#94a3b8', marginRight: 8},
  searchBar: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0f172a',
  },
  clearIcon: {fontSize: 13, color: '#94a3b8', paddingLeft: 8},

  // Count row
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  countText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  selCountBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  selCountText: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '600',
  },

  // List row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  rowActive: {
    borderColor: '#bfdbfe',
    backgroundColor: '#fafeff',
  },
  rowAccent: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: '#e2e8f0',
  },
  rowAccentActive: {
    backgroundColor: '#0369a1',
  },
  rowContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  rowInvId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  rowAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369a1',
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rowCustomer: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  rowDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowSalesman: {
    fontSize: 10,
    color: '#94a3b8',
    flex: 1,
  },
  rowTags: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  selTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  selTagText: {
    fontSize: 9,
    color: '#0369a1',
    fontWeight: '600',
  },
  credTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  credTagCredit: {backgroundColor: '#fef9c3'},
  credTagCash: {backgroundColor: '#dcfce7'},
  credTagText: {fontSize: 9, fontWeight: '600'},
  credTagCreditText: {color: '#854d0e'},
  credTagCashText: {color: '#166534'},
  rowArrow: {
    fontSize: 20,
    color: '#cbd5e1',
    paddingRight: 12,
    paddingLeft: 4,
  },

  // Empty
  emptyWrap: {alignItems: 'center', paddingVertical: 60},
  emptyIcon: {fontSize: 32, marginBottom: 10},
  emptyText: {fontSize: 14, color: '#64748b', fontWeight: '500'},
  emptySub: {fontSize: 12, color: '#94a3b8', marginTop: 4},

  // FAB
  fabWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: '#f8fafc',
  },
  fab: {
    backgroundColor: '#0369a1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  fabText: {color: '#fff', fontSize: 15, fontWeight: '600'},
  fabBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  fabBadgeText: {color: '#fff', fontSize: 12, fontWeight: '600'},

  // Bottom Sheet
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sheetHeaderVertical: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sheetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369a1',
  },
  sheetInvId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  sheetCustomer: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
    maxWidth: 180,
  },
  sheetHeaderRight: {alignItems: 'flex-end'},
  sheetAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0369a1',
  },
  sheetDate: {fontSize: 11, color: '#94a3b8', marginTop: 2},
  sheetDivider: {height: 0.5, backgroundColor: '#e2e8f0', marginHorizontal: 16},
  sheetToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sheetItemsLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  selAllBtn: {
    borderWidth: 0.5,
    borderColor: '#bfdbfe',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f0f9ff',
  },
  selAllText: {fontSize: 12, color: '#0369a1', fontWeight: '600'},
  sheetLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  sheetLoadingText: {fontSize: 13, color: '#94a3b8'},
  sheetScroll: {flex: 1, paddingHorizontal: 16},

  // Sheet item row
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    marginBottom: 6,
    backgroundColor: '#fff',
  },
  sheetItemSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bfdbfe',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#0369a1',
    borderColor: '#0369a1',
  },
  checkmark: {color: '#fff', fontSize: 11, fontWeight: '700'},
  sheetItemInfo: {flex: 1},
  sheetItemName: {fontSize: 13, fontWeight: '500', color: '#0f172a'},
  sheetItemCode: {fontSize: 10, color: '#94a3b8', marginTop: 1},
  sheetItemRight: {alignItems: 'flex-end', marginLeft: 8},
  sheetItemQty: {fontSize: 11, color: '#94a3b8'},
  sheetItemPrice: {fontSize: 13, fontWeight: '600', color: '#0f172a'},

  // No items
  noItemsWrap: {alignItems: 'center', paddingVertical: 30},
  noItemsText: {fontSize: 13, color: '#94a3b8'},

  // Remarks
  remarksWrap: {
    marginTop: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  remarksLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  remarksText: {fontSize: 12, color: '#64748b'},

  // Sheet footer
  sheetFooter: {
    padding: 15,
    borderTopWidth: 0.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  sheetBtn: {
    backgroundColor: '#0369a1',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sheetBtnText: {color: '#fff', fontSize: 15, fontWeight: '600'},
  sheetBtnBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sheetBtnBadgeText: {color: '#fff', fontSize: 12, fontWeight: '600'},
});
