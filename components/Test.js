<View style={styles.bottomCont}>
  {userDataArray &&
  userDataArray[0].cmpcode.trim().toUpperCase() != 'AUTOMAX' &&
  userDataArray &&
  userDataArray[0].cmpcode.trim().toUpperCase() != 'MALBAR' &&
  userDataArray &&
  userDataArray[0].cmpcode.trim().toUpperCase() != 'SUPERLAND' ? (
    <ScrollView
      contentContainerStyle={{
        width: '100%',
        paddingBottom: 120,
        paddingTop: 16,
        paddingHorizontal: 12,
        backgroundColor: '#F5F2EE',
      }}
      horizontal={false}>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}>
        <Text>
          {console.log(
            'refreshed menu list menuNotAllowedToThisCompany ',
            menuNotAllowedToThisCompany,
          )}
        </Text>

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Stock List'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Stock List'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('CheckStock')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/srchDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Stock List</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('CheckStock')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/srchDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Stock List</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Quotation'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Quotation'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('MakeQuotation')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/listDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Quotation</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('MakeQuotation')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/listDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Quotation</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Quotation List'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Quotation List'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('QuotationList')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/listDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Quotation List</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('QuotationList')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/listDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Quotation List</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Sales Order'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Sales Order'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('MakeOrder')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/listDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Sales Order</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('MakeOrder')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/listDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Sales Order</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Order List'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Order List'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('PreviousOrders')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/clockDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Order List</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('PreviousOrders')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/clockDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Order List</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Customer'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Customer'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('CustomerDetails')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/bagDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Customer</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('CustomerDetails')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/bagDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Customer</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Receipt'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Receipt'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('Receipt')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/cashDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Receipt</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('Receipt')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/cashDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Receipt</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Material Request'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Material Request'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('MaterialRequest')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/cashDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Material Request</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('MaterialRequest')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/cashDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Material Request</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Collection'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Collection'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('NewCollections')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/cashDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Collection</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('NewCollections')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/cashDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Collection</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Sales Invoice'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Sales Invoice'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => salesInvoiceButtonClick()}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/listDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Sales Invoice</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => salesInvoiceButtonClick()}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/listDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Sales Invoice</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Invoice List'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Invoice List'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('PreviousSalesInvoice')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/todoDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Invoice List</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('PreviousSalesInvoice')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/todoDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Invoice List</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Picking'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Picking'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('PickListNew')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/todoDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Picking</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('PickListNew')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/todoDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Picking</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Checking'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Checking'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('CheckingListNew')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/todoDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Checking</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('CheckingListNew')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/todoDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Checking</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Delivery'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Delivery'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('DriversApp')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/driver.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Delivery</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('DriversApp')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/driver.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Delivery</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Collection Report'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Collection Report'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('CollectionReport')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/todoDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Collection Report</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('CollectionReport')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/todoDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Collection Report</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Lead Entry'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Lead Entry'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('LeadEntry')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/todoDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Lead Entry</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('LeadEntry')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/todoDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Lead Entry</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Site Survey'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Site Survey'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('SiteSurvey')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/todoDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Site Survey</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('SiteSurvey')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/todoDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Site Survey</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'WMS'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Site Survey'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('SelectLocation')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/todoDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>WMS</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('SelectLocation')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/todoDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>WMS</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Physical Stock'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Physical Stock'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('PhysicalStock')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/todoDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Physical Stock</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('PhysicalStock')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/todoDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Physical Stock</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Bin and Barcode Updater'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Bin and Barcode Updater'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('BarcodeLinking')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/todoDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Bin & Barcode Updater</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('BarcodeLinking')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/todoDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Bin & Barcode Updater</Text>
          </TouchableOpacity>
        )}

        {menuNotAllowedToThisCompany ? (
          menuNotAllowedToThisCompany.some(
            itemSommy =>
              itemSommy.MENUID.trim().toUpperCase() ==
              'Invoice Vs Receipt'.trim().toUpperCase(),
          ) ? null : menuAllowedToThisRole?.length == 0 ||
            menuAllowedToThisRole?.some(
              itemSommy =>
                itemSommy.MENUID.trim().toUpperCase() ==
                'Invoice Vs Receipt'.trim().toUpperCase(),
            ) ? (
            <TouchableOpacity
              style={styles.ModernItemCont}
              onPress={() => navigation.navigate('InvoiceVsReceipt')}>
              <View style={styles.ModernIconWrap}>
                <Image
                  source={require('../images/todoDark.png')}
                  style={styles.ModernIcon}
                />
              </View>
              <Text style={styles.ModernItemText}>Invoice Vs Receipt</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity
            style={styles.ModernItemCont}
            onPress={() => navigation.navigate('InvoiceVsReceipt')}>
            <View style={styles.ModernIconWrap}>
              <Image
                source={require('../images/todoDark.png')}
                style={styles.ModernIcon}
              />
            </View>
            <Text style={styles.ModernItemText}>Invoice Vs Receipt</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  ) : (
    // ... your existing else block unchanged, just replace ItemCont styles there too
    <>
      {!callingNotAvailableMenuList &&
        !isCallingMenuListAvailabletoThisRole && (
          // same structure - replace styles.ItemCont with styles.ModernItemCont
          // and innerItem/TouchablwWhiteBackg/innerText/optionText
          // with ModernIconWrap/ModernIcon/ModernItemText
          // the rest of conditions stay identical
          <ScrollView ... >
            ...
          </ScrollView>
        )}
    </>
  )}
</View>


