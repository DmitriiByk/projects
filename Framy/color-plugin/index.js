console.clear();

const UPDATE_COLOR_NAMES = 'UPDATE_COLOR_NAMES';
const UPDATE_FIGMA_VARIABLES = 'UPDATE_FIGMA_VARIABLES';

// Общее пространство имен для связи с плагином Экспорта/Импорта
const SHARED_NAMESPACE = 'wallet_x_ds'; 

// Функция конвертации цвета в понятный Фигме формат
function parseColor(color) {
	color = color.trim();
	const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;
	const rgbaRegex = /^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),?\s*(0|1|0?\.\d+)?\)$/;
	if (hexRegex.test(color)) {
		const hexValue = color.substring(1);
		const expandedHex = hexValue.length === 3 ? hexValue.split("").map((char) => char + char).join("") : hexValue;
		return {
			r: parseInt(expandedHex.slice(0, 2), 16) / 255,
			g: parseInt(expandedHex.slice(2, 4), 16) / 255,
			b: parseInt(expandedHex.slice(4, 6), 16) / 255,
			a: 1
		};
	} else if (rgbaRegex.test(color)) {
		const matches = rgbaRegex.exec(color);
		return {
			r: parseInt(matches[1], 10) / 255,
			g: parseInt(matches[2], 10) / 255,
			b: parseInt(matches[3], 10) / 255,
			a: matches[4] !== undefined ? parseFloat(matches[4]) : 1
		};
	} else {
		throw new Error("Invalid color format");
	}
}

const defaultCollectionName = "palette";

// Функция обновления или создания отдельной переменной (алиаса)
async function setVariable(collection, name, value, modeId) {
	const variable = await Promise.all(
		collection.variableIds.map(async (variableId) => await figma.variables.getVariableByIdAsync(variableId))
	).then(variables => variables.find(v => v.name === name));

	if (variable) {
		variable.setValueForMode(modeId, parseColor(value));
	} else {
		const newVar = figma.variables.createVariable(name, collection, "COLOR");
		newVar.setValueForMode(modeId, parseColor(value));
	}
}

// Получаем коллекцию (палитру)
async function getCollection(name = defaultCollectionName) {
	const collections = await figma.variables.getLocalVariableCollectionsAsync();
	return collections.find(c => c.name === name);
}

// Основная функция записи всех сгенерированных цветов в Фигму
async function setPalette(variables, paletteName, config) {
	let collection = await getCollection();
	if (!collection) collection = figma.variables.createVariableCollection(defaultCollectionName);
	let modeId = collection.modes[0].modeId;

	// Если переданы имя и конфиг, сохраняем их в память Фигмы
	if (paletteName && config) {
		// Пишем в НОВОЕ ОБЩЕЕ хранилище (для плагина экспорта)
		collection.setSharedPluginData(SHARED_NAMESPACE, "config_" + paletteName, JSON.stringify(config));
		// Пишем в СТАРОЕ ПРИВАТНОЕ хранилище (на всякий случай, для совместимости)
		collection.setPluginData("config_" + paletteName, JSON.stringify(config));
	}

	for (const {name, value} of variables) {
		await setVariable(collection, name, value, modeId);
	}
}

// Слушатель сообщений от интерфейса (HTML)
figma.ui.onmessage = async ({type, data}) => {
	switch (type) {
		case 'UI_READY': {
			let savedTempsStr = figma.root.getSharedPluginData(SHARED_NAMESPACE, 'temp_saves');
			if (!savedTempsStr) savedTempsStr = figma.root.getPluginData('temp_saves');
			
			if (savedTempsStr) {
				figma.ui.postMessage({ type: 'INIT_TEMP_SAVES', data: JSON.parse(savedTempsStr) });
			}
			break;
		}
		case UPDATE_COLOR_NAMES: {
			const collection = await getCollection();
			let colorNames = [];
			if (collection) {
				const variables = await Promise.all(collection.variableIds.map(id => figma.variables.getVariableByIdAsync(id)));
				colorNames = variables.reduce((acc, cur) => {
					const namePath = cur.name.split('/');
					if (namePath.length === 2 && !acc.includes(namePath[0])) acc.push(namePath[0]);
					return acc;
				}, []);
			}
			if (colorNames.length === 0) colorNames = ['neutral', 'brand', 'info', 'warning', 'positive', 'negative'];
			figma.ui.postMessage({type: UPDATE_COLOR_NAMES, data: colorNames});
			break;
		}
		case UPDATE_FIGMA_VARIABLES:
			await setPalette(data.variables, data.paletteName, data.config);
			break;
		case 'GET_PALETTE_CONFIG': {
			const collection = await getCollection();
			let configStr = null;

			if (collection) {
				configStr = collection.getSharedPluginData(SHARED_NAMESPACE, "config_" + data.paletteName);
				if (!configStr) configStr = collection.getPluginData("config_" + data.paletteName);
			}

			// УМНЫЙ ФОЛЛБЭК: Если в коллекции нет, ищем в резервных сохранениях
			if (!configStr) {
				let savedTempsStr = figma.root.getSharedPluginData(SHARED_NAMESPACE, 'temp_saves');
				if (!savedTempsStr) savedTempsStr = figma.root.getPluginData('temp_saves');
				if (savedTempsStr) {
					try {
						const tempSaves = JSON.parse(savedTempsStr);
						if (tempSaves[data.paletteName]) {
							configStr = JSON.stringify(tempSaves[data.paletteName]);
						}
					} catch(e) {}
				}
			}

			if (configStr) {
				figma.ui.postMessage({ type: 'LOAD_COLOR_SCALE_CONFIG', data: JSON.parse(configStr) });
			} else figma.ui.postMessage({ type: 'RESET_TO_DEFAULT' });
			break;
		}
		case 'RESIZE':
			figma.ui.resize(Math.max(640, data.width), 430);
			break;
		case 'SAVE_TEMP_DATA':
			figma.root.setSharedPluginData(SHARED_NAMESPACE, 'temp_saves', JSON.stringify(data));
			figma.root.setPluginData('temp_saves', JSON.stringify(data));
			break;
	}
}

figma.showUI(__html__, {width: 1100, height: 430, themeColors: true});