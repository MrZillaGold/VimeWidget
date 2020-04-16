import { Widget } from "./modules/widget";

const updateWidget = () => {
    const widget = new Widget();

    widget.UpdateWidget();
};

updateWidget();

setInterval(updateWidget, 15 * 60 * 1000); // Обновление виджета происходит раз в 15 минут, так как информация о гильдии обновляется раз в 10-15 минут.

console.log("[VimeWidget] Запущен!");

//
// Made with ♥ by MrZillaGold (https://vk.com/mrzillagold)
//
// VimeWidget доступен по лицензии Creative Commons «Attribution-NonCommercial-ShareAlike»
// («Атрибуция — Некоммерческое использование — На тех же условиях») 4.0 Всемирная.
//