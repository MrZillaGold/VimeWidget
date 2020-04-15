import axios from "axios";
import config from "../config";
import { declOfNum, getDate } from "./functions";

const { guild_id, widget_token, icon_id } = config;

const API_ENDPOINT = "https://api.vimeworld.ru";

export class Widget {
    state = {
        guild: null,
        tops: [],
        widget: { // https://vk.com/dev/objects/appWidget?f=2.%20List
            title: "Гильдия - ",
            rows: [
                {
                    title: "Лидер: ",
                    descr: "",
                    address: "",
                    time: "Создана: ",
                    text: "",
                    icon_id
                },
                {
                    title: "Больше всего заработали опыта:",
                    text: "",
                    icon_id
                },
                {
                    title: "Больше всего вложили коинов:",
                    text: "",
                    icon_id
                }
            ],
            more: "Хочу себе такой виджет",
            more_url: "https://vk.com/@mrzillagold-vimewidget"
        }
    };

    async UpdateWidget() {
        let { guild, widget, tops } = this.state;

        await axios.get(`${API_ENDPOINT}/guild/get?id=${guild_id}`) // Получаем информацию о гильдии с API VimeWorld
            .then(response => guild = response.data)
            .catch(console.log);

        if (guild) {
            if (guild.error) return console.log(`[!] Ошибка при получении информации о гильдии.\n\n${guild.error.error_code} - ${guild.error.error_msg}`);

            widget.title += guild.name; // Имя гильдии в шапку виджета

            widget.rows[0].title += guild.members.filter(member => member.status === "LEADER")[0].user.username; // Ищем лидера гильдии

            widget.rows[0].time += getDate(guild.created); // Превращаем дату создания гильдии в человеческий вид и записываем в виджет

            widget.rows[0].address += `${declOfNum(guild.members.length, ["Участник", "Участника", "Участников"])}: ${guild.members.length}/${20 + guild.perks.MEMBERS.level * 5} | `; // Количество участников гильдии
            widget.rows[0].address += `Последний вступивший: ${guild.members.sort((a, b) => b.joined - a.joined)[0].user.username}`; // Последний вступивший в гильдию

            widget.rows[0].text += `Уровень: ${guild.level} [${this.GetGuildExp(guild)}/${50000 + (guild.level - 1) * 10000}] [${Math.floor(guild.levelPercentage * 100)}%]\n`; // Информация о уровне
            widget.rows[0].text += `Коинов вложено: ${guild.totalCoins}\n`; // Информация об общих коинах
            widget.rows[0].text += `Заработано опыта: ${guild.totalExp}\n\nПодробнее: vimetop.ru/guild/${guild_id}`; // Информация об общем опыте

            await this.GetTop(); // Получаем индекс гильдии в топе по уровню и коинам

            widget.rows[0].descr += `Место топа по опыту: ${tops[0] || "Нет"} | Место топа по коинам: ${tops[1] || "Нет"}`; // Глобальный топ по коинам и уровню

            await this.SortTops(guild); // Формируем топ по коинам и уровню внутри гильдии

            axios.get(`https://api.vk.com/method/appWidgets.update?type=list&code=return ${encodeURIComponent(JSON.stringify(widget))}%3B&access_token=${widget_token}&v=5.103`) // Обновляем виджет
                .then((res) => {
                    const error = res.data.error;

                    if (error) return console.log(`[!] Ошибка при обновлении виджета:\nКод ошибки: ${error.error_code}\n${error.error_msg}`);

                    console.log("[VimeWidget] Виджет обновлён!")
                })
                .catch(error => console.log(`[!] Произошла ошибка при обновлении виджета!\n${error}`));
        } else {
            return console.log("[!] Не удалось получить информацию о гильдии, возможно произошла ошибка.")
        }
    }

    async GetTop() {
        const { tops } = this.state;

        const topTypes = [
            {
                type: "level"
            },
            {
                type: "total_coins"
            }
        ];

        for (let i = 0; i <= topTypes.length - 1; i++) {
            let top = await axios.get(`${API_ENDPOINT}/leaderboard/get/guild/${topTypes[i].type}?size=1000`);

            top = top.data;

            if (top.records[0]) {
                top = top.records;

                const index = top.findIndex(element => element.id === guild_id);

                tops.push(index !== -1 ? index + 1 : null);
            }
        }
    }

    SortTops(guild) {
        let { widget } = this.state;

        const sorts = [
            {
                forEach: member => {
                    widget.rows[1].text += `${this.GetRank(member.user.rank)} ${member.user.username} - ${member.guildExp}\n`
                },
                sort: (a, b) => b.guildExp - a.guildExp
            },
            {
                forEach: member => {
                    widget.rows[2].text += `${this.GetRank(member.user.rank)} ${member.user.username} - ${member.guildCoins}\n`
                },
                sort: (a, b) => b.guildCoins - a.guildCoins
            }
        ];

        sorts.forEach(functions => guild.members.sort(functions.sort).slice(0, 3).forEach(functions.forEach))
    }

    GetGuildExp(guild) {
        let totalExp = guild.totalExp;

        for (let i = 0; i <= guild.level - 2; i++) {
            totalExp = totalExp - (50000 + i * 10000);
        }

        return totalExp;
    }

    GetRank(rank) {
        let rankName = "";

        switch (rank) {
            case "PLAYER":
                break;
            case "VIP":
                rankName = "VIP";
                break;
            case "PREMIUM":
                rankName = "Premium";
                break;
            case "HOLY":
                rankName = "Holy";
                break;
            case "IMMORTAL":
                rankName = "Immortal";
                break;
            case "BUILDER":
                rankName = "Билдер";
                break;
            case "MAPLEAD":
                rankName = "Гл. билдер";
                break;
            case "YOUTUBE":
                rankName = "YouTube";
                break;
            case "DEV":
                rankName = "Dev";
                break;
            case "ORGANIZER":
                rankName = "Организатор";
                break;
            case "MODER":
            case "WARDEN":
                rankName = "Модер";
                break;
            case "CHIEF":
                rankName = "Гл. модер";
                break;
            case "ADMIN":
                rankName = "Гл. админ";
                break;
        }

        return rankName ? `[${rankName}]` : "";
    }
}