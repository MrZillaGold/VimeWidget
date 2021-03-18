import { Widget } from "./modules/Widget";

import config from "./config.json";

config.clusters.forEach((cluster, index) => {
    cluster.index = index + 1;

    const updateWidget = () => {
        const widget = new Widget(cluster);

        widget.updateWidget();
    };

    updateWidget();

    setInterval(updateWidget, 15 * 60 * 1000);
    // Обновление виджета происходит раз в 15 минут, так как информация о гильдии обновляется раз в 10-15 минут.

});

console.log("[VimeWidget] Запущен!");