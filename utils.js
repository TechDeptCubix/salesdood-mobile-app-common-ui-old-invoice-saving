const formatPrice3Decimal = (price) => {

    console.log("formatPrice3Decimal ", price)

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    }).format(price);
};

export default formatPrice3Decimal