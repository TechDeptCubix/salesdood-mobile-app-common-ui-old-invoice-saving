import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import HeaderUiNew from './HeaderUiNew';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import formatPrice3Decimal from '../utils';

const StockItem = React.memo(
  ({
    item,
    isExpanded,
    onToggleExpand,
    onAddToCart,
    selectedButton,
    onSelectButton,
    substituteData,
    modalNumberData,
    subLoader,
    modalLoader,
    cmpcode,
  }) => {
    const code = item.Code || item.code;

    const stockVal = Number(item.Stock) || 0;
    let stockColor = '#F59E0B'; // zero (orange)
    let stockBg = '#FEF3C7';
    if (stockVal > 0) {
      stockColor = '#30B3A4'; // greater than zero (green)
      stockBg = '#EBF8F6';
    } else if (stockVal < 0) {
      stockColor = '#EF4444'; // less than zero (red)
      stockBg = '#FEE2E2';
    }

    return (
      <View style={styles.card}>
        {/* ── Header Row ── */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardCode}>{code}</Text>
            <Text style={styles.cardUnit}>Unit: {item.unit || '—'}</Text>
            <Text style={styles.cardUnit}>Brand: {item.Category || '—'}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.qtyBadge, { backgroundColor: stockBg }]}>
              <Text style={[styles.qtyBadgeLabel, { color: stockColor }]}>
                Qty
              </Text>
              <Text style={[styles.qtyBadgeValue, { color: stockColor }]}>
                {item.Stock ?? '—'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.expandBtn}
              onPress={() => onToggleExpand(code, item.OEM)}
              activeOpacity={0.7}>
              <Text style={styles.expandBtnText}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Description ── */}
        <Text style={styles.cardDesc}>{item.Description}</Text>

        {/* ── Expanded Details ── */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* <View style={styles.stockContainer}>
              <View style={styles.stockGrid}>
                {item.stores_name &&
                  item.stores_name
                    .split(',')
                    .filter(Boolean)
                    .map((store, index) => {
                      const [key, ...labelParts] = store.split('-');
                      const label = labelParts.join('-');
                      return (
                        <StockLocation
                          key={index}
                          label={label || key}
                          value={item[key]}
                        />
                      );
                    })}
              </View>
            </View> */}
            {/* Price Cards */}
            <View style={styles.priceGrid}>
              <PriceCard
                label="Cash Price"
                value={formatPrice3Decimal(item.price)}
              />
              <PriceCard
                label="Credit Price"
                value={formatPrice3Decimal(item['Credit Price'])}
              />
              {cmpcode === 'STARLINK' && (
                <PriceCard
                  label="Cost"
                  value={formatPrice3Decimal(item.Cost)}
                />
              )}
              {cmpcode === 'SOCA' ? (
                <PriceCard
                  label="Special Price"
                  value={formatPrice3Decimal(item['Spcial Price'])}
                />
              ) : (
                <PriceCard
                  label="Block Price"
                  value={formatPrice3Decimal(item['Block Price'])}
                />
              )}
              {cmpcode?.toUpperCase() !== 'SOCA' &&
                cmpcode?.toUpperCase() !== 'STARLINK' && (
                  <PriceCard
                    label="Discount Price"
                    value={formatPrice3Decimal(item.Discount_Price)}
                  />
                )}
              <PriceCard label="Order Pend." value={item.Ord_pend ?? '—'} />
              <PriceCard label="BIN" value={item.BIN ?? '—'} />
            </View>

            {/* Add to Cart */}
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => onAddToCart(item)}
              activeOpacity={0.8}>
              <Text style={styles.cartBtnText}>Add to Cart</Text>
            </TouchableOpacity>

            {/* Sub / Model Tabs */}
            <View style={styles.tabRow}>
              {['Substitute', 'Model'].map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabBtn,
                    selectedButton === tab && styles.tabBtnActive,
                  ]}
                  onPress={() => onSelectButton(tab)}>
                  <Text
                    style={[
                      styles.tabBtnText,
                      selectedButton === tab && styles.tabBtnTextActive,
                    ]}>
                    {tab === 'Model' ? 'Model Number' : tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            {selectedButton === 'Substitute' && (
              <SubstituteTable data={substituteData} loading={subLoader} />
            )}
            {selectedButton === 'Model' && (
              <ModelTable data={modalNumberData} loading={modalLoader} />
            )}
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isExpanded === nextProps.isExpanded &&
      prevProps.cmpcode === nextProps.cmpcode &&
      prevProps.item === nextProps.item &&
      (nextProps.isExpanded
        ? prevProps.selectedButton === nextProps.selectedButton &&
        prevProps.substituteData === nextProps.substituteData &&
        prevProps.modalNumberData === nextProps.modalNumberData &&
        prevProps.subLoader === nextProps.subLoader &&
        prevProps.modalLoader === nextProps.modalLoader
        : true)
    );
  },
);

const StockLocation = ({ label, value }) => {
  const val = Number(value) || 0;
  let color = '#F59E0B'; // zero (orange)
  if (val > 0) color = '#10B981'; // greater than zero (green)
  else if (val < 0) color = '#EF4444'; // less than zero (red)

  return (
    <View style={styles.stockItem}>
      <Text style={styles.stockLabel}>{label}</Text>
      <Text style={[styles.stockValue, { color: color }]}>{value ?? 0}</Text>
    </View>
  );
};
const PriceCard = ({ label, value }) => (
  <View style={styles.priceCard}>
    <Text style={styles.priceCardLabel}>{label}</Text>
    <Text style={styles.priceCardValue}>{value}</Text>
  </View>
);

const SubstituteTable = ({ data, loading }) => {
  if (loading) return <ActivityIndicator style={{ marginVertical: 8 }} />;
  if (!data) return null;
  if (data.length === 0)
    return <Text style={styles.noData}>No substitutes available</Text>;

  return (
    <View style={styles.tableWrap}>
      <View style={styles.tableHeaderRow}>
        {['Part No', 'Qty', 'Price'].map(h => (
          <Text
            key={h}
            style={[styles.tableHeaderCell, { flex: h === 'Part No' ? 2 : 1 }]}>
            {h}
          </Text>
        ))}
      </View>
      <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
        {data.map((row, i) => (
          <View
            key={i}
            style={[styles.tableDataRow, i % 2 === 0 && styles.tableRowEven]}>
            <Text style={[styles.tableDataCell, { flex: 2 }]}>{row.Part_No}</Text>
            <Text style={[styles.tableDataCell, { flex: 1 }]}>{row.Balance}</Text>
            <Text style={[styles.tableDataCell, { flex: 1 }]}>
              {formatPrice3Decimal(row['Sales price'])}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ─── Model Number Table ───────────────────────────────────────────────────────

const ModelTable = ({ data, loading }) => {
  if (loading) return <ActivityIndicator style={{ marginVertical: 8 }} />;
  if (!data) return null;
  if (data.length === 0)
    return <Text style={styles.noData}>No model numbers available</Text>;

  return (
    <View style={styles.tableWrap}>
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Model Number</Text>
      </View>
      <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
        {data.map((row, i) => (
          <View
            key={i}
            style={[styles.tableDataRow, i % 2 === 0 && styles.tableRowEven]}>
            <Text style={[styles.tableDataCell, { flex: 1 }]}>
              {row.Model_Number}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CheckStock = () => {
  const [vanFromLocalStorage, setVanFromLocalStorage] = useState(null);
  const [appUrl, setAppUrl] = useState('');
  const [cmpcode, setCmpCode] = useState('');

  const [searchItem, setSearchItem] = useState('');
  const [stockData, setStockData] = useState(null);
  const [top50Items, setTop50Items] = useState(null);
  const [loading, setLoading] = useState(false);

  const [expandedCode, setExpandedCode] = useState(null);
  const [selectedButton, setSelectedButton] = useState('Substitute');

  const [modalNumberData, setModalNumberData] = useState(null);
  const [substituteData, setSubstituteData] = useState(null);
  const [modalLoader, setModalLoader] = useState(false);
  const [subLoader, setSubLoader] = useState(false);

  // Cart popup state
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [cartItem, setCartItem] = useState(null);
  const [cartQty, setCartQty] = useState('');
  const [cartPrice, setCartPrice] = useState('');
  const [cartType, setCartType] = useState('order'); // 'order' | 'invoice'

  // Debounce ref
  const debounceTimer = useRef(null);

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const van = await AsyncStorage.getItem('VAN');
      setVanFromLocalStorage(van);

      const url = await AsyncStorage.getItem('appUrl');
      if (url) setAppUrl(url);

      const raw = await AsyncStorage.getItem('userDataArray');
      const parsed = raw ? JSON.parse(raw) : [];
      if (parsed[0]?.cmpcode) {
        setCmpCode(parsed[0].cmpcode.trim().toUpperCase());
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (appUrl && cmpcode && vanFromLocalStorage !== null) {
      fetchTop50StockItems();
    }
  }, [appUrl, cmpcode, vanFromLocalStorage]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!searchItem.trim()) {
      setStockData(null);
      setLoading(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      searchStock(searchItem.trim());
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [searchItem]);

  // ── API Calls ─────────────────────────────────────────────────────────────

  const locationParam =
    vanFromLocalStorage === '----' ? 'MASTER' : vanFromLocalStorage;
  const modeParam = vanFromLocalStorage === '----' ? 'MOBILE' : 'all_top1000';
  const modeTop50 = vanFromLocalStorage === '----' ? 'MOBILE50' : 'all_top1000';

  const searchStock = async value => {
    setLoading(true);
    try {
      const encoded = encodeURIComponent(value);
      const url = `${appUrl}Search_Items/InventoryList?cmpcode=${cmpcode}&guid=F4369B5E-8E23-4BCF-AC82-76C977991728&mod=${modeParam}&Loc=${locationParam}&searchKey=${encoded}`;
      console.log('searchStock url', url);
      const res = await axios.get(url);
      setStockData(res.data);
    } catch (e) {
      console.log('searchStock error', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTop50StockItems = async () => {
    setLoading(true);
    try {
      const url = `${appUrl}Search_Items/InventoryList?cmpcode=${cmpcode}&guid=F4369B5E-8E23-4BCF-AC82-76C977991728&mod=${modeTop50}&Loc=${locationParam}&searchKey=-`;
      console.log('fetchTop50StockItems', url);
      const res = await axios.get(url);
      setTop50Items(res.data);
      // console.log('fetchTop50StockItems', res.data);
    } catch (e) {
      console.log('fetchTop50 error', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchModalNumberData = useCallback(async oem => {
    setModalLoader(true);
    setModalNumberData(null);
    try {
      const encoded = encodeURIComponent(oem);
      const res = await axios.get(
        `${appUrl}MasterList/${cmpcode}/MODELNUMBER/${encoded}`,
      );
      setModalNumberData(res.data);
    } catch (e) {
      console.log('fetchModalNumber error', e);
      setModalNumberData([]);
    } finally {
      setModalLoader(false);
    }
  }, [appUrl, cmpcode]);

  const fetchSubstituteData = useCallback(async code => {
    setSubLoader(true);
    setSubstituteData(null);
    try {
      const encoded = encodeURIComponent(code);
      const res = await axios.get(
        `${appUrl}MasterList/${cmpcode}/SUBSTITUTE/${encoded}`,
      );
      setSubstituteData(res.data);
    } catch (e) {
      console.log('fetchSubstitute error', e);
      setSubstituteData([]);
    } finally {
      setSubLoader(false);
    }
  }, [appUrl, cmpcode]);

  // ── Interactions ──────────────────────────────────────────────────────────

  const toggleExpand = useCallback(
    (code, oem) => {
      Keyboard.dismiss();
      if (expandedCode === code) {
        setExpandedCode(null);
        return;
      }
      setExpandedCode(code);
      setSelectedButton('Substitute');
      fetchSubstituteData(code);
      fetchModalNumberData(oem);
    },
    [expandedCode, fetchSubstituteData, fetchModalNumberData],
  );

  const handleAddToCart = item => {
    setCartItem(item);
    setCartQty('');
    setCartPrice(item.price ? String(item.price) : '');
    setCartModalVisible(true);
  };

  const handleCartConfirm = async () => {
    const parsedQty = parseFloat(cartQty);
    const parsedPrice = parseFloat(cartPrice);

    if (!cartQty || isNaN(parsedQty) || parsedQty <= 0) {
      Alert.alert('Please enter a valid Quantity');
      return;
    }
    if (!cartPrice || isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Please enter a valid Price');
      return;
    }

    // Block Price validation
    const blockPrice = cartItem?.['Block Price'];
    if (blockPrice && Number(blockPrice) > 0) {
      if (Number(blockPrice) >= parsedPrice) {
        Alert.alert(
          'Invalid Price',
          `Entered price must be more than the block price (${blockPrice}).`,
        );
        return;
      }
    }

    // Determine the correct AsyncStorage key based on selected cart type
    const storageKey =
      cartType === 'invoice' ? 'savedItemDataInv' : 'savedItemData';

    try {
      const savedString = await AsyncStorage.getItem(storageKey);
      const savedArray = savedString ? JSON.parse(savedString) : [];

      // Duplicate check
      const alreadyExists = savedArray.some(
        i => i.Code === (cartItem.Code || cartItem.code),
      );
      if (alreadyExists) {
        Alert.alert(
          'Item Already in Cart',
          'This item is already added to the selected cart.',
        );
        return;
      }

      const newItem = {
        ...cartItem,
        quantity: parsedQty.toFixed(2),
        unitPrice: parsedPrice.toFixed(2),
        unitPriceToShowUser: parsedPrice.toFixed(2),
        total: parsedQty * parsedPrice,
      };

      const updated = [...savedArray, newItem];
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));

      setCartModalVisible(false);
      Alert.alert(
        'Added to Cart',
        `${cartItem.Description || cartItem.Code} added to ${cartType === 'invoice' ? 'Sales Invoice' : 'Sales Order'
        } cart.`,
      );
    } catch (e) {
      console.log('handleCartConfirm error', e);
      Alert.alert('Error', 'Could not save item to cart. Please try again.');
    }
  };

  // ── Render List ───────────────────────────────────────────────────────────

  const displayData = searchItem.trim() ? stockData : top50Items;

  const renderItem = item => {
    const code = item.Code || item.code;
    const isExpanded = expandedCode === code;
    return (
      <StockItem
        key={code}
        item={item}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpand}
        onAddToCart={handleAddToCart}
        selectedButton={selectedButton}
        onSelectButton={setSelectedButton}
        substituteData={isExpanded ? substituteData : null}
        modalNumberData={isExpanded ? modalNumberData : null}
        subLoader={subLoader}
        modalLoader={modalLoader}
        cmpcode={cmpcode}
      />
    );
  };

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <HeaderUiNew name={'Check Stock'} />

      {/* ── Add to Cart Bottom Sheet ── */}
      <Modal
        visible={cartModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCartModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* Drag Handle */}
            <View style={styles.sheetHandle} />

            <Text style={styles.modalTitle}>Add to Cart</Text>
            {cartItem && (
              <Text style={styles.modalDesc} numberOfLines={2}>
                {cartItem.Description || cartItem.Code || cartItem.code}
              </Text>
            )}

            {/* Cart Type Radio */}
            <Text style={styles.modalLabel}>Save to</Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={[
                  styles.radioBtn,
                  cartType === 'order' && styles.radioBtnActive,
                ]}
                onPress={() => setCartType('order')}
                activeOpacity={0.8}>
                <View style={styles.radioCircle}>
                  {cartType === 'order' && <View style={styles.radioDot} />}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    cartType === 'order' && styles.radioLabelActive,
                  ]}>
                  Sales Order
                </Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={[
                  styles.radioBtn,
                  cartType === 'invoice' && styles.radioBtnActive,
                ]}
                onPress={() => setCartType('invoice')}
                activeOpacity={0.8}>
                <View style={styles.radioCircle}>
                  {cartType === 'invoice' && <View style={styles.radioDot} />}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    cartType === 'invoice' && styles.radioLabelActive,
                  ]}>
                  Sales Invoice
                </Text>
              </TouchableOpacity> */}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {/* Qty */}
              <View style={{ width: '48%', flexDirection: 'column' }}>
                <Text style={styles.modalLabel}>Quantity</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter quantity"
                  placeholderTextColor="#9AA3B0"
                  keyboardType="numeric"
                  value={cartQty}
                  onChangeText={setCartQty}
                />
              </View>
              <View style={{ width: '48%', flexDirection: 'column' }}>
                {/* Price */}
                <Text style={styles.modalLabel}>Price</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter price"
                  placeholderTextColor="#9AA3B0"
                  keyboardType="decimal-pad"
                  value={cartPrice}
                  onChangeText={setCartPrice}
                />

              </View>

            </View>
            {/* Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setCartModalVisible(false)}
                activeOpacity={0.8}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={handleCartConfirm}
                activeOpacity={0.8}>
                <Text style={styles.modalBtnConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal >

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
        style={styles.body}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search item by name or code…"
            placeholderTextColor="#9AA3B0"
            value={searchItem}
            onChangeText={setSearchItem}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {loading && (
            <ActivityIndicator
              size="small"
              color="#3A80EA"
              style={{ marginRight: 8 }}
            />
          )}
        </View>

        {/* Section Header */}
        {!loading && displayData && (
          <Text style={styles.sectionLabel}>
            {searchItem.trim()
              ? `${displayData.length} result${displayData.length !== 1 ? 's' : ''
              }`
              : 'Top Items'}
          </Text>
        )}

        {/* Empty State */}
        {!loading && displayData && displayData.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        )}

        {/* List */}
        {displayData && displayData.length > 0 && (
          <FlatList
            data={displayData}
            keyExtractor={(item, i) => (item.Code || item.code || i).toString()}
            renderItem={({ item }) => renderItem(item)}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Initial loading (top50 not yet loaded) */}
        {loading && !displayData && (
          <View style={styles.fullLoader}>
            <ActivityIndicator size="large" color="#3A80EA" />
            <Text style={styles.loaderText}>Loading items…</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </View >
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F4F8',
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Lexend-Regular',
    color: '#1A1A2E',
  },

  // Section
  sectionLabel: {
    fontFamily: 'Lexend-Light',
    fontSize: 13,
    color: '#7A8499',
    marginBottom: 6,
    marginLeft: 4,
  },

  // List
  list: {
    paddingBottom: 24,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardCode: {
    fontFamily: 'Lexend-Bold',
    fontSize: 13,
    color: '#3A80EA',
  },
  cardUnit: {
    fontFamily: 'Lexend-Light',
    fontSize: 12,
    color: '#9AA3B0',
    marginTop: 2,
  },
  cardDesc: {
    fontFamily: 'Lexend-Regular',
    fontSize: 14,
    color: '#1A1A2E',
    lineHeight: 20,
  },
  qtyBadge: {
    backgroundColor: '#EBF8F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  qtyBadgeLabel: {
    fontFamily: 'Lexend-Light',
    fontSize: 10,
    color: '#30B3A4',
  },
  qtyBadgeValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: 13,
    color: '#30B3A4',
  },
  expandBtn: {
    backgroundColor: '#F2F4F8',
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandBtnText: {
    fontSize: 12,
    color: '#7A8499',
  },

  // Expanded Section
  expandedSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },

  // Price Grid
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  priceCard: {
    backgroundColor: '#F7F9FF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '47%',
    borderWidth: 1,
    borderColor: '#E8EDFB',
  },
  priceCardLabel: {
    fontFamily: 'Lexend-Light',
    fontSize: 11,
    color: '#7A8499',
    marginBottom: 2,
  },
  priceCardValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: '#1A1A2E',
  },
  stockContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stockGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  stockItem: {
    width: '18.5%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stockLabel: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', // Monospace for numbers looks professional
  },
  // Cart Button
  cartBtn: {
    backgroundColor: '#3A80EA',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#3A80EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cartBtnText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F2F4F8',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontFamily: 'Lexend-Regular',
    fontSize: 13,
    color: '#7A8499',
  },
  tabBtnTextActive: {
    fontFamily: 'Lexend-Bold',
    color: '#3A80EA',
  },

  // Table
  tableWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EDFB',
    marginBottom: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#3A80EA',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontFamily: 'Lexend-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tableDataRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
  },
  tableRowEven: {
    backgroundColor: '#F7F9FF',
  },
  tableDataCell: {
    fontFamily: 'Lexend-Regular',
    fontSize: 12,
    color: '#1A1A2E',
    textAlign: 'center',
  },

  // States
  noData: {
    fontFamily: 'Lexend-Light',
    fontSize: 13,
    color: '#E05C5C',
    textAlign: 'center',
    paddingVertical: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'Lexend-Regular',
    fontSize: 16,
    color: '#9AA3B0',
  },
  fullLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    fontFamily: 'Lexend-Light',
    fontSize: 14,
    color: '#9AA3B0',
    marginTop: 10,
  },

  // ── Cart Bottom Sheet ─────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 20,
  },

  // Radio toggle
  radioRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  radioBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F7F9FF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E8EDFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  radioBtnActive: {
    borderColor: '#3A80EA',
    backgroundColor: '#EEF4FF',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#3A80EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3A80EA',
  },
  radioLabel: {
    fontFamily: 'Lexend-Regular',
    fontSize: 13,
    color: '#7A8499',
  },
  radioLabelActive: {
    fontFamily: 'Lexend-Bold',
    color: '#3A80EA',
  },
  modalTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: '#1A1A2E',
    marginBottom: 4,
  },
  modalDesc: {
    fontFamily: 'Lexend-Light',
    fontSize: 13,
    color: '#7A8499',
    marginBottom: 20,
  },
  modalLabel: {
    fontFamily: 'Lexend-Regular',
    fontSize: 13,
    color: '#3A80EA',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F7F9FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8EDFB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Lexend-Regular',
    fontSize: 15,
    color: '#1A1A2E',
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F2F4F8',
  },
  modalBtnCancelText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: '#7A8499',
  },
  modalBtnConfirm: {
    backgroundColor: '#3A80EA',
    shadowColor: '#3A80EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modalBtnConfirmText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});

export default CheckStock;
