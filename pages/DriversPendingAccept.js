import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import {format} from 'date-fns';

const DriversPendingAccept = ({
  deliveryData,
  AcceptCheck,
  showAcceptLoader,
  acceptDono,
  showDetailsPopItem,
}) => {
  const formattedDate = date => {
    try {
      return format(new Date(date), 'dd MMM • hh:mm a');
    } catch (e) {
      return date;
    }
  };

  const renderItem = ({item}) => {
    const isHighPriority = item.Priority === 'high';
    const isLoading = showAcceptLoader && item.do_no === acceptDono;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {/* Main Info Area */}
          <TouchableOpacity
            style={styles.infoSection}
            onPress={() => showDetailsPopItem(item)}
            activeOpacity={0.7}>
            <View style={styles.headerRow}>
              <Text style={styles.dateText}>{formattedDate(item.do_date)}</Text>
              {isHighPriority && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentLabel}>URGENT</Text>
                </View>
              )}
            </View>

            {/* Customer Name - Fully Visible */}
            <Text style={styles.customerName}>{item.Customer}</Text>

            <View style={styles.metaRow}>
              <View style={styles.idBadge}>
                <Text style={styles.idText}>{item.do_no}</Text>
              </View>
              <Text style={styles.deptText}>Dept: {item.deptno?.trim()}</Text>
            </View>
          </TouchableOpacity>

          {/* Action Area */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[
                styles.acceptBtn,
                isHighPriority && styles.acceptBtnUrgent,
              ]}
              onPress={() => AcceptCheck(item)}
              disabled={showAcceptLoader}>
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.acceptBtnText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Re-added Section Heading */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerIndicator} />
        <Text style={styles.sectionTitle}>Pending Deliveries</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{deliveryData?.length || 0}</Text>
        </View>
      </View>

      <FlatList
        data={deliveryData}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyCont}>
            <Text style={styles.emptyText}>No pending deliveries found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  headerIndicator: {
    width: 4,
    height: 16,
    backgroundColor: '#2563EB',
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Lexend-Bold',
  },
  countBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  countText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
  listPadding: {
    paddingBottom: 120,
    paddingHorizontal: 2,
    paddingTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
  },
  infoSection: {
    flex: 1,
    paddingRight: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Lexend-Bold',
    lineHeight: 20,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  idText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '700',
  },
  deptText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  urgentBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  actionSection: {
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptBtnUrgent: {
    backgroundColor: '#EF4444',
  },
  acceptBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCont: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default DriversPendingAccept;
