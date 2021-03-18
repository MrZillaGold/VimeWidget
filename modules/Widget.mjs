import axios from "axios";

import { declOfNum, humanizeDate, ranks, TOP_TYPES } from "./utils.mjs";

const API_ENDPOINT = "https://api.vimeworld.ru";

export class Widget {

    guild = null;
    tops = {};

    widget = { // https://vk.com/dev/objects/appWidget?f=2.%20List
        title: "Гильдия - ",
        rows: [
            {
                title: "Лидер: ",
                descr: "",
                address: "",
                time: "Создана: ",
                text: ""
            },
            {
                title: "Больше всего заработали опыта:",
                text: ""
            },
            {
                title: "Больше всего вложили коинов:",
                text: ""
            }
        ],
        more: "Хочу себе такой виджет",
        more_url: "https://vk.com/@mrzillagold-vimewidget"
    };

    constructor(cluster) {
        this.cluster = cluster;

        const { icon_id } = cluster;

        this.widget.rows = this.widget.rows.map((row) => {
            row.icon_id = icon_id || null;

            return row;
        });
    }


    async updateWidget() {
        let { guild, widget, tops, cluster: { guild_id, widget_token, index } } = this;

        await axios.get(`${API_ENDPOINT}/guild/get?id=${guild_id}`) // Получаем информацию о гильдии с API VimeWorld
            .then(({ data }) => guild = data)
            .catch(console.error);

        if (guild) {
            const error = guild.error;

            if (error) {
                return console.error(`[!] Ошибка при получении информации о гильдии в кластере #${index}.\n\n${error.error_code} - ${error.error_msg}`);
            }

            widget.title += guild.name; // Имя гильдии в шапку виджета

            widget.rows[0].title += guild.members.filter((member) => member.status === "LEADER")[0].user.username; // Ищем лидера гильдии

            widget.rows[0].time += humanizeDate(guild.created); // Превращаем дату создания гильдии в человеческий вид и записываем в виджет

            widget.rows[0].address += `${declOfNum(guild.members.length, ["Участник", "Участника", "Участников"])}: ${guild.members.length}/${20 + guild.perks.MEMBERS.level * 5} | `; // Количество участников гильдии
            widget.rows[0].address += `Последний вступивший: ${guild.members.sort((a, b) => b.joined - a.joined)[0].user.username}`; // Последний вступивший в гильдию

            widget.rows[0].text += `Уровень: ${guild.level} [${this.getGuildExp(guild)}/${50000 + (guild.level - 1) * 10000}] [${Math.floor(guild.levelPercentage * 100)}%]\n`; // Информация о уровне
            widget.rows[0].text += `Коинов вложено: ${guild.totalCoins}\n`; // Информация об общих коинах
            widget.rows[0].text += `Заработано опыта: ${guild.totalExp}\n\nПодробнее: vimetop.ru/guild/${guild_id}`; // Информация об общем опыте

            await this.getTop(); // Получаем индекс гильдии в топе по уровню и коинам

            widget.rows[0].descr += `Место топа по опыту: ${tops.level || "Нет"} | Место топа по коинам: ${tops.total_coins || "Нет"}`; // Глобальный топ по коинам и уровню

            await this.sortTops(guild); // Формируем топ по коинам и уровню внутри гильдии

            axios.get(`https://api.vk.com/method/appWidgets.update?type=list&code=return ${encodeURIComponent(JSON.stringify(widget))}%3B&access_token=${widget_token}&v=5.103`) // Обновляем виджет
                .then(({ data: { error } }) => {
                    if (error) {
                        return console.log(`[!] Ошибка ВКонтакте при обновлении виджета!\nКод ошибки: ${error.error_code}\n${error.error_msg}`);
                    }

                    console.log("[VimeWidget] Виджет обновлён!");
                })
                .catch((error) => console.error(`[!] Произошла ошибка при обновлении виджета в кластере #${index}!\n${error}`));
        } else {
            return console.error(`[!] Не удалось получить информацию о гильдии в кластере #${index}, возможно произошла ошибка.`);
        }
    }

    getTop() {
        const { guild_id } = this.cluster;

        return Promise.allSettled(
            TOP_TYPES.map((type) =>
                axios.get(`${API_ENDPOINT}/leaderboard/get/guild/${type}?size=1000`)
                    .then(({ data }) => {
                        data.type = type;

                        return data;
                    })
            )
        )
            .then((results) => {
                results.forEach(({ status, value: top }) => {
                    if (status === "fulfilled" && top.records[0]) {
                        const index = top.records.findIndex(element => element.id === guild_id);

                        this.tops[top.type] = index !== -1 ? index + 1 : null;
                    }
                });
            });
    }

    sortTops(guild) {
        const sorts = [
            {
                forEach: (member) =>
                    this.widget.rows[1].text += `${this.getRank(member.user.rank)} ${member.user.username} - ${member.guildExp}\n`,
                sort: (a, b) => b.guildExp - a.guildExp
            },
            {
                forEach: (member) =>
                    this.widget.rows[2].text += `${this.getRank(member.user.rank)} ${member.user.username} - ${member.guildCoins}\n`,
                sort: (a, b) => b.guildCoins - a.guildCoins
            }
        ];

        sorts.forEach(({ sort, forEach }) =>
            guild.members.sort(sort)
                .slice(0, 3)
                .forEach(forEach)
        );
    }

    getGuildExp(guild) {
        let totalExp = guild.totalExp;

        for (let i = 0; i <= guild.level - 2; i++) {
            totalExp -= (50000 + i * 10000);
        }

        return totalExp;
    }

    getRank(rank) {
        rank = ranks.get(rank);

        return rank ? `[${rank}]` : "";
    }
}
