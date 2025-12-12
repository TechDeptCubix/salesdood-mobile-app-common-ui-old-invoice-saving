export function getReadableDate(receivedDate) {
    return new Date(receivedDate).getDate() + "/" +
       (new Date(receivedDate).getMonth() + 1) + "/" +
       new Date(receivedDate).getFullYear()
 }
 
 export function getReadableDateAndMonth(receivedDate) {
    return new Date(receivedDate).getDate() + "/" +
       (new Date(receivedDate).getMonth() + 1)
 }
 
 export function getReadableDateYYYYMMDD(receivedDate) {
    return new Date(receivedDate).getFullYear() + "-" +
       ((new Date(receivedDate).getMonth() + 1) < 10 ? "0" +
          (new Date(receivedDate).getMonth() + 1) : (new Date(receivedDate).getMonth() + 1)) + "-" + new Date(receivedDate).getDate()
 
 }
 
 export function getAllDaysInMonth(year, month) {
    const date = new Date(year, month, 1);
 
    const dates = [];
 
    while (date.getMonth() === month) {
       dates.push("" + (new Date(date)).getDate());
       date.setDate(date.getDate() + 1);
    }
 
    return dates;
 }
 
 export function getReadableTime(receivedDate) {
    return new Date(receivedDate).toLocaleTimeString([], { timeStyle: "medium" })
 }
 
 export function getMonthNameFromDate(receivedDate) {
 
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return (monthNames[new Date(receivedDate).getMonth()])
 }
 
 
 
 export function consolePrint(msg) {
    console.log(msg)
 }
 