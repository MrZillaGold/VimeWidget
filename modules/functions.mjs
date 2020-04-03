// https://gist.github.com/realmyst/1262561#gistcomment-2299442
function declOfNum(n, titles) {
    return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2]
}

function getDate(time) {
    const currentDate = new Date(time * 1000);

    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const hours = currentDate.getUTCHours() + 3;
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    return `${pad(day)}.${pad(month)}.${year} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    function pad(s){
        return (s > 9 ? "" : "0") + s;
    }
}

export {
    declOfNum,
    getDate
};