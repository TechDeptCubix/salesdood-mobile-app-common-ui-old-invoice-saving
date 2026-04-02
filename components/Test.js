import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

const MakeQuotationPop = ({
  setShowQuotationPop,
  selectedCustomer,
  cashCustomerName,
  cashCustomerAddress,
  cashCustomerPhone,
  trn,
  savedItemData,
  cmpcode,
  currency,
  totalUnitPrice,
  discount,
  setDiscount,
  discountedTotal,
  VAT_RATE,
  makeQuotation,
  loading,
  error,
  result,
  resultClosePress,
  generatePDF,
}) => {
  return (
    <>
      <View style={styles.modalContainer}>
        {/* Added KeyboardAvoidingView to keep buttons visible when typing discount */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          
          <View style={styles.modalContent}>
            {/* 1. FIXED HEADER */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowQuotationPop(false)}>
                <Image
                  style={styles.backIcon}
                  source={require('../images/lftArr.png')}
                />
                <Text style={styles.headerTitle}>Quotation</Text>
              </TouchableOpacity>
            </View>

            {/* 2. SCROLLABLE BODY (Only this part scrolls) */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              style={styles.scrollViewStyle}>
              
              {/* Customer Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Customer Details</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>
                      {selectedCustomer
                        ? selectedCustomer.Custname
                        : cashCustomerName || '---'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={[styles.infoValue, {textAlign: 'right'}]}>
                      {selectedCustomer
                        ? `${selectedCustomer.address1 || ''} ${
                            selectedCustomer.address2 || ''
                          } ${selectedCustomer.address3 || ''}`
                        : cashCustomerAddress || '---'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>
                      {selectedCustomer
                        ? selectedCustomer.phone
                        : cashCustomerPhone || '---'}
                    </Text>
                  </View>
                  <View style={[styles.infoRow, {borderBottomWidth: 0}]}>
                    <Text style={styles.infoLabel}>TRN</Text>
                    <Text style={styles.infoValue}>{trn || '---'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Selected Items</Text>
                <Text style={styles.itemCount}>
                  {savedItemData?.length || 0} items
                </Text>
              </View>

              {/* Items List */}
              <View style={styles.itemsContainer}>
                {savedItemData &&
                  savedItemData.map((item, index) => (
                    <View key={index} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <View style={styles.itemBadge}>
                          <Text style={styles.itemBadgeText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {item.Description}
                        </Text>
                      </View>
                      <View style={styles.itemDetails}>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>Code</Text>
                          <Text style={styles.detailValue}>{item.Code}</Text>
                        </View>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>Price</Text>
                          <Text style={styles.detailValue}>
                            {parseFloat(item.unitPrice).toFixed(
                              cmpcode === 'AUTOMAX' ? 3 : 2,
                            )}
                          </Text>
                        </View>
                        <View style={styles.detailCol}>
                          <Text style={styles.detailLabel}>Qty</Text>
                          <Text style={styles.detailValue}>
                            {parseFloat(item.quantity).toFixed(0)}
                          </Text>
                        </View>
                        <View
                          style={[styles.detailCol, {alignItems: 'flex-end'}]}>
                          <Text style={styles.detailLabel}>Total</Text>
                          <Text style={styles.detailValuePrimary}>
                            {(item.unitPrice * item.quantity).toFixed(
                              cmpcode === 'AUTOMAX' ? 3 : 2,
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
              </View>

              {/* Order Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryTitle}>Order Summary</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    {currency}{' '}
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                      maximumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                    }).format(totalUnitPrice || 0)}
                  </Text>
                </View>
                <View style={styles.discountContainer}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <TextInput
                    style={styles.discountInput}
                    placeholder="0.00"
                    value={discount.toString()}
                    keyboardType="numeric"
                    onChangeText={text => {
                      const numericText = text.replace(/[^0-9.]/g, '');
                      setDiscount(numericText);
                    }}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Net Total</Text>
                  <Text style={styles.summaryValue}>
                    {currency}{' '}
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                      maximumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                    }).format(discount !== 0 ? discountedTotal : totalUnitPrice)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>VAT (5%)</Text>
                  <Text style={styles.summaryValue}>
                    {currency}{' '}
                    {(
                      (discount !== 0 ? discountedTotal : totalUnitPrice) *
                      (VAT_RATE / 100)
                    ).toFixed(cmpcode === 'AUTOMAX' ? 3 : 2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Grand Total</Text>
                  <Text style={styles.totalAmount}>
                    {currency}{' '}
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                      maximumFractionDigits: cmpcode === 'AUTOMAX' ? 3 : 2,
                    }).format(
                      (discount !== 0 ? discountedTotal : totalUnitPrice) *
                        (1 + VAT_RATE / 100),
                    )}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* 3. FIXED FOOTER BUTTONS (Outside ScrollView) */}
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowQuotationPop(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => makeQuotation()}>
                <Text style={styles.sendButtonText}>Send Quotation</Text>
              </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator size={'large'} style={{marginVertical: 10}} />}
            {error && <Text style={styles.ErrorText}>{error}</Text>}
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Success Modal Overlay */}
      {result && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent2}>
            <View>
              <Text style={styles.SuccessText}>
                InvoiceNo: {result.invoiceNo} Created successfully
              </Text>
            </View>
            <View style={styles.resultButtonsRow}>
              <TouchableOpacity
                style={styles.resultCloseBtn}
                onPress={() => resultClosePress()}>
                <Text style={styles.CancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resultSaveBtn}
                onPress={generatePDF}>
                <Text style={styles.PDFText}>Save Pdf</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    zIndex: 10,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    height: Dimensions.get('window').height * 0.9, // Fixed height for internal scrolling
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    overflow: 'hidden', // Ensures content doesn't bleed out of rounded corners
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#6366f1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 12,
    fontFamily: 'Lexend-Bold',
  },
  scrollViewStyle: {
    flex: 1, // This allows the scrollview to fill the gap between header and footer
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    fontFamily: 'Lexend-Bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Lexend-Regular',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    fontFamily: 'Lexend-Medium',
    flex: 2,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'Lexend-Bold',
  },
  itemCount: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  itemsContainer: {
    paddingHorizontal: 16,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    fontFamily: 'Lexend-Medium',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
    fontFamily: 'Lexend-Regular',
  },
  detailValue: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    fontFamily: 'Lexend-Medium',
  },
  detailValuePrimary: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '700',
    fontFamily: 'Lexend-Bold',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 3,
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'Lexend-Bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Lexend-Regular',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    fontFamily: 'Lexend-Medium',
  },
  discountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  discountInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 100,
    textAlign: 'right',
    fontSize: 14,
    color: '#1e293b',
    fontFamily: 'Lexend-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'Lexend-Bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6366f1',
    fontFamily: 'Lexend-Bold',
  },
  footerButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Proper bottom safe area
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    elevation: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Lexend-Medium',
  },
  sendButton: {
    flex: 2,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Lexend-Bold',
  },
  modalContent2: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '85%',
    padding: 24,
    alignItems: 'center',
    elevation: 20,
  },
  SuccessText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    fontFamily: 'Lexend-Bold',
    marginBottom: 20,
  },
  resultButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    width: '100%',
  },
  resultCloseBtn: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  resultSaveBtn: {
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  CancelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  PDFText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  ErrorText: {
    color: '#ef4444',
    fontSize: 14,
    fontFamily: 'Lexend-Bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default MakeQuotationPop;