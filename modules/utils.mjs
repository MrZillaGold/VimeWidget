// https://gist.github.com/realmyst/1262561#gistcomment-2299442
export function declOfNum(n, titles) {
    return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
}

export function humanizeDate(time) {
    const currentDate = new Date(time * 1000);

    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const hours = currentDate.getUTCHours() + 3;
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    return `${pad(day)}.${pad(month)}.${year} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function pad(number) {
    return (number > 9 ? "" : "0") + number;
}

export const TOP_TYPES = [
    "level",
    "total_coins"
];

export const ranks = new Map([
    ["PLAYER", ""],
    ["VIP", "VIP"],
    ["PREMIUM", "Premium"],
    ["HOLY", "Holy"],
    ["IMMORTAL", "Immortal"],
    ["BUILDER", "Билдер"],
    ["MAPLEAD", "Гл. билдер"],
    ["YOUTUBE", "YouTube"],
    ["DEV", "Dev"],
    ["ORGANIZER", "Организатор"],
    ["MODER", "Модер"],
    ["WARDEN", "Модер"],
    ["CHIEF", "Гл. модер"],
    ["ADMIN", "Гл. админ"]
]);