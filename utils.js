const formatPrice3Decimal = (price) => {

    console.log("formatPrice3Decimal ", price)

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2, // earlier 3
        maximumFractionDigits: 2
    }).format(price);
};

export default formatPrice3Decimal