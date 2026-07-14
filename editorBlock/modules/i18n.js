const MIHU_LANGUAGE_KEY = "mihu_studio_language";

const mihuUiTranslations = {
    "pt-BR": { menu:{file:"Arquivo",tutorials:"Tutoriais"},connection:{label:"Conexão",connect:"Conectar"},actions:{send:"Enviar",run:"Executar",stop:"Parar",codeMode:"Modo Código"},workspace:{program:"Programa"},terminal:{title:"Terminal",clear:"Limpar",lock:"Travar scroll"} },
    en: { menu:{file:"File",tutorials:"Tutorials"},connection:{label:"Connection",connect:"Connect"},actions:{send:"Upload",run:"Run",stop:"Stop",codeMode:"Code Mode"},workspace:{program:"Program"},terminal:{title:"Terminal",clear:"Clear",lock:"Lock scroll"} },
    "zh-CN": { menu:{file:"文件",tutorials:"教程"},connection:{label:"连接",connect:"连接"},actions:{send:"上传",run:"运行",stop:"停止",codeMode:"代码模式"},workspace:{program:"程序"},terminal:{title:"终端",clear:"清除",lock:"锁定滚动"} },
    ru: { menu:{file:"Файл",tutorials:"Учебники"},connection:{label:"Подключение",connect:"Подключить"},actions:{send:"Загрузить",run:"Запустить",stop:"Стоп",codeMode:"Режим кода"},workspace:{program:"Программа"},terminal:{title:"Терминал",clear:"Очистить",lock:"Закрепить прокрутку"} },
    fr: { menu:{file:"Fichier",tutorials:"Tutoriels"},connection:{label:"Connexion",connect:"Connecter"},actions:{send:"Téléverser",run:"Exécuter",stop:"Arrêter",codeMode:"Mode code"},workspace:{program:"Programme"},terminal:{title:"Terminal",clear:"Effacer",lock:"Verrouiller le défilement"} },
    it: { menu:{file:"File",tutorials:"Tutorial"},connection:{label:"Connessione",connect:"Connetti"},actions:{send:"Carica",run:"Esegui",stop:"Ferma",codeMode:"Modalità codice"},workspace:{program:"Programma"},terminal:{title:"Terminale",clear:"Pulisci",lock:"Blocca scorrimento"} },
    de: { menu:{file:"Datei",tutorials:"Tutorials"},connection:{label:"Verbindung",connect:"Verbinden"},actions:{send:"Hochladen",run:"Ausführen",stop:"Stopp",codeMode:"Code-Modus"},workspace:{program:"Programm"},terminal:{title:"Terminal",clear:"Leeren",lock:"Scrollen sperren"} },
    es: { menu:{file:"Archivo",tutorials:"Tutoriales"},connection:{label:"Conexión",connect:"Conectar"},actions:{send:"Cargar",run:"Ejecutar",stop:"Detener",codeMode:"Modo código"},workspace:{program:"Programa"},terminal:{title:"Terminal",clear:"Limpiar",lock:"Bloquear desplazamiento"} }
};

const mihuExtendedUiTranslations = {
    "pt-BR": {menu:{more:"Mais"},common:{language:"Idioma",close:"Fechar",version:"Versão do MIHU Studio"},file:{new:"Novo projeto",load:"Carregar a partir do seu computador",saveAs:"Salvar como",exportPng:"Exportar .png",download:"Descarregar para o seu computador"},more:{updater:"Atualizador de firmware",controllerInfo:"Verificar informações do controlador"},connection:{groupLabel:"Conexão com a controladora",typeLabel:"Tipo de conexão"},actions:{groupLabel:"Ações do programa",sendTitle:"Enviar e salvar na controladora"},editor:{generated:"Gerado pelos blocos",custom:"Código de texto ativo",useBlocks:"Usar código dos blocos",label:"Editor de código Python"},terminal:{resize:"Arraste para redimensionar o terminal",clearTitle:"Limpar todas as mensagens do terminal",lockTitle:"Impedir que novas mensagens movam o scroll",commandPlaceholder:"Digite comando",send:"Enviar"},firmware:{searching:"Procurando firmware.bin...",address:"Endereço automático: 0x0",bootTitle:"Coloque o ESP32-S3 em modo de atualização",boot1:"Se a porta aparecer como MIHU S3, cancele a seleção.",boot2:"Segure o botão BOOT.",boot3:"Pressione e solte o botão RESET.",boot4:"Solte o botão BOOT.",boot5:"Selecione USB JTAG/serial debug unit.",imageAlt:"Localização dos botões BOOT e RESET no controlador",imagePlaceholder:"Imagem dos botões BOOT + RESET",holdRelease:"SEGURE / SOLTE BOOT",pressReset:"PRESSIONE RESET",preparing:"Preparando..."}},
    en: {menu:{more:"More"},common:{language:"Language",close:"Close",version:"MIHU Studio version"},file:{new:"New project",load:"Load from your computer",saveAs:"Save as",exportPng:"Export .png",download:"Download to your computer"},more:{updater:"Firmware updater",controllerInfo:"Check controller information"},connection:{groupLabel:"Controller connection",typeLabel:"Connection type"},actions:{groupLabel:"Program actions",sendTitle:"Upload and save to controller"},editor:{generated:"Generated from blocks",custom:"Text code active",useBlocks:"Use block code",label:"Python code editor"},terminal:{resize:"Drag to resize the terminal",clearTitle:"Clear all terminal messages",lockTitle:"Prevent new messages from moving the scroll",commandPlaceholder:"Enter command",send:"Send"},firmware:{searching:"Looking for firmware.bin...",address:"Automatic address: 0x0",bootTitle:"Put the ESP32-S3 into update mode",boot1:"If the port appears as MIHU S3, cancel the selection.",boot2:"Hold the BOOT button.",boot3:"Press and release the RESET button.",boot4:"Release the BOOT button.",boot5:"Select USB JTAG/serial debug unit.",imageAlt:"Location of the BOOT and RESET buttons on the controller",imagePlaceholder:"BOOT + RESET button image",holdRelease:"HOLD / RELEASE BOOT",pressReset:"PRESS RESET",preparing:"Preparing..."}},
    de: {menu:{more:"Mehr"},common:{language:"Sprache",close:"Schließen",version:"MIHU-Studio-Version"},file:{new:"Neues Projekt",load:"Vom Computer laden",saveAs:"Speichern unter",exportPng:"Als .png exportieren",download:"Auf den Computer herunterladen"},more:{updater:"Firmware-Aktualisierung",controllerInfo:"Controller-Informationen prüfen"},connection:{groupLabel:"Controller-Verbindung",typeLabel:"Verbindungstyp"},actions:{groupLabel:"Programmaktionen",sendTitle:"Auf den Controller laden und speichern"},editor:{generated:"Aus Blöcken erzeugt",custom:"Textcode aktiv",useBlocks:"Blockcode verwenden",label:"Python-Code-Editor"},terminal:{resize:"Ziehen, um die Terminalgröße zu ändern",clearTitle:"Alle Terminalmeldungen löschen",lockTitle:"Automatisches Scrollen verhindern",commandPlaceholder:"Befehl eingeben",send:"Senden"},firmware:{searching:"firmware.bin wird gesucht...",address:"Automatische Adresse: 0x0",bootTitle:"ESP32-S3 in den Aktualisierungsmodus versetzen",boot1:"Wenn der Anschluss als MIHU S3 erscheint, brechen Sie die Auswahl ab.",boot2:"Halten Sie die BOOT-Taste gedrückt.",boot3:"Drücken Sie kurz die RESET-Taste.",boot4:"Lassen Sie die BOOT-Taste los.",boot5:"Wählen Sie USB JTAG/serial debug unit.",imageAlt:"Position der BOOT- und RESET-Tasten am Controller",imagePlaceholder:"Abbildung der BOOT- und RESET-Tasten",holdRelease:"BOOT HALTEN / LOSLASSEN",pressReset:"RESET DRÜCKEN",preparing:"Vorbereitung..."}},
    es: {menu:{more:"Más"},common:{language:"Idioma",close:"Cerrar",version:"Versión de MIHU Studio"},file:{new:"Nuevo proyecto",load:"Cargar desde el ordenador",saveAs:"Guardar como",exportPng:"Exportar .png",download:"Descargar al ordenador"},more:{updater:"Actualizador de firmware",controllerInfo:"Comprobar información del controlador"},connection:{groupLabel:"Conexión con el controlador",typeLabel:"Tipo de conexión"},actions:{groupLabel:"Acciones del programa",sendTitle:"Cargar y guardar en el controlador"},editor:{generated:"Generado por bloques",custom:"Código de texto activo",useBlocks:"Usar código de bloques",label:"Editor de código Python"},terminal:{resize:"Arrastre para cambiar el tamaño del terminal",clearTitle:"Borrar todos los mensajes del terminal",lockTitle:"Evitar el desplazamiento automático",commandPlaceholder:"Escriba un comando",send:"Enviar"},firmware:{searching:"Buscando firmware.bin...",address:"Dirección automática: 0x0",bootTitle:"Ponga el ESP32-S3 en modo de actualización",boot1:"Si el puerto aparece como MIHU S3, cancele la selección.",boot2:"Mantenga pulsado el botón BOOT.",boot3:"Pulse y suelte el botón RESET.",boot4:"Suelte el botón BOOT.",boot5:"Seleccione USB JTAG/serial debug unit.",imageAlt:"Ubicación de los botones BOOT y RESET",imagePlaceholder:"Imagen de los botones BOOT + RESET",holdRelease:"MANTENGA / SUELTE BOOT",pressReset:"PULSE RESET",preparing:"Preparando..."}},
    fr: {menu:{more:"Plus"},common:{language:"Langue",close:"Fermer",version:"Version de MIHU Studio"},file:{new:"Nouveau projet",load:"Charger depuis l’ordinateur",saveAs:"Enregistrer sous",exportPng:"Exporter en .png",download:"Télécharger sur l’ordinateur"},more:{updater:"Mise à jour du firmware",controllerInfo:"Vérifier les informations du contrôleur"},connection:{groupLabel:"Connexion au contrôleur",typeLabel:"Type de connexion"},actions:{groupLabel:"Actions du programme",sendTitle:"Téléverser et enregistrer sur le contrôleur"},editor:{generated:"Généré par les blocs",custom:"Code texte actif",useBlocks:"Utiliser le code des blocs",label:"Éditeur de code Python"},terminal:{resize:"Faites glisser pour redimensionner le terminal",clearTitle:"Effacer tous les messages du terminal",lockTitle:"Empêcher le défilement automatique",commandPlaceholder:"Saisissez une commande",send:"Envoyer"},firmware:{searching:"Recherche de firmware.bin...",address:"Adresse automatique : 0x0",bootTitle:"Placez l’ESP32-S3 en mode mise à jour",boot1:"Si le port apparaît comme MIHU S3, annulez la sélection.",boot2:"Maintenez le bouton BOOT.",boot3:"Appuyez puis relâchez le bouton RESET.",boot4:"Relâchez le bouton BOOT.",boot5:"Sélectionnez USB JTAG/serial debug unit.",imageAlt:"Emplacement des boutons BOOT et RESET",imagePlaceholder:"Image des boutons BOOT + RESET",holdRelease:"MAINTENIR / RELÂCHER BOOT",pressReset:"APPUYER SUR RESET",preparing:"Préparation..."}},
    it: {menu:{more:"Altro"},common:{language:"Lingua",close:"Chiudi",version:"Versione MIHU Studio"},file:{new:"Nuovo progetto",load:"Carica dal computer",saveAs:"Salva con nome",exportPng:"Esporta .png",download:"Scarica sul computer"},more:{updater:"Aggiornamento firmware",controllerInfo:"Verifica informazioni controller"},connection:{groupLabel:"Connessione al controller",typeLabel:"Tipo di connessione"},actions:{groupLabel:"Azioni del programma",sendTitle:"Carica e salva sul controller"},editor:{generated:"Generato dai blocchi",custom:"Codice testuale attivo",useBlocks:"Usa codice dei blocchi",label:"Editor di codice Python"},terminal:{resize:"Trascina per ridimensionare il terminale",clearTitle:"Cancella tutti i messaggi del terminale",lockTitle:"Impedisci lo scorrimento automatico",commandPlaceholder:"Digita comando",send:"Invia"},firmware:{searching:"Ricerca di firmware.bin...",address:"Indirizzo automatico: 0x0",bootTitle:"Metti ESP32-S3 in modalità aggiornamento",boot1:"Se la porta appare come MIHU S3, annulla la selezione.",boot2:"Tieni premuto il pulsante BOOT.",boot3:"Premi e rilascia il pulsante RESET.",boot4:"Rilascia il pulsante BOOT.",boot5:"Seleziona USB JTAG/serial debug unit.",imageAlt:"Posizione dei pulsanti BOOT e RESET",imagePlaceholder:"Immagine pulsanti BOOT + RESET",holdRelease:"TIENI / RILASCIA BOOT",pressReset:"PREMI RESET",preparing:"Preparazione..."}},
    ru: {menu:{more:"Ещё"},common:{language:"Язык",close:"Закрыть",version:"Версия MIHU Studio"},file:{new:"Новый проект",load:"Загрузить с компьютера",saveAs:"Сохранить как",exportPng:"Экспортировать .png",download:"Скачать на компьютер"},more:{updater:"Обновление прошивки",controllerInfo:"Проверить сведения о контроллере"},connection:{groupLabel:"Подключение контроллера",typeLabel:"Тип подключения"},actions:{groupLabel:"Действия программы",sendTitle:"Загрузить и сохранить на контроллере"},editor:{generated:"Создано из блоков",custom:"Текстовый код активен",useBlocks:"Использовать код блоков",label:"Редактор кода Python"},terminal:{resize:"Перетащите для изменения размера терминала",clearTitle:"Очистить все сообщения терминала",lockTitle:"Запретить автоматическую прокрутку",commandPlaceholder:"Введите команду",send:"Отправить"},firmware:{searching:"Поиск firmware.bin...",address:"Автоматический адрес: 0x0",bootTitle:"Переведите ESP32-S3 в режим обновления",boot1:"Если порт отображается как MIHU S3, отмените выбор.",boot2:"Удерживайте кнопку BOOT.",boot3:"Нажмите и отпустите кнопку RESET.",boot4:"Отпустите кнопку BOOT.",boot5:"Выберите USB JTAG/serial debug unit.",imageAlt:"Расположение кнопок BOOT и RESET",imagePlaceholder:"Изображение кнопок BOOT + RESET",holdRelease:"УДЕРЖИВАТЬ / ОТПУСТИТЬ BOOT",pressReset:"НАЖАТЬ RESET",preparing:"Подготовка..."}},
    "zh-CN": {menu:{more:"更多"},common:{language:"语言",close:"关闭",version:"MIHU Studio 版本"},file:{new:"新建项目",load:"从电脑加载",saveAs:"另存为",exportPng:"导出 .png",download:"下载到电脑"},more:{updater:"固件更新",controllerInfo:"检查控制器信息"},connection:{groupLabel:"控制器连接",typeLabel:"连接类型"},actions:{groupLabel:"程序操作",sendTitle:"上传并保存到控制器"},editor:{generated:"由积木生成",custom:"文本代码已启用",useBlocks:"使用积木代码",label:"Python 代码编辑器"},terminal:{resize:"拖动以调整终端大小",clearTitle:"清除所有终端消息",lockTitle:"阻止自动滚动",commandPlaceholder:"输入命令",send:"发送"},firmware:{searching:"正在查找 firmware.bin...",address:"自动地址：0x0",bootTitle:"将 ESP32-S3 置于更新模式",boot1:"如果端口显示为 MIHU S3，请取消选择。",boot2:"按住 BOOT 按钮。",boot3:"按下并松开 RESET 按钮。",boot4:"松开 BOOT 按钮。",boot5:"选择 USB JTAG/serial debug unit。",imageAlt:"控制器上 BOOT 和 RESET 按钮的位置",imagePlaceholder:"BOOT + RESET 按钮图片",holdRelease:"按住 / 松开 BOOT",pressReset:"按 RESET",preparing:"准备中..."}}
};

Object.entries(mihuExtendedUiTranslations).forEach(([language, additions]) => {
    Object.entries(additions).forEach(([section, values]) => {
        mihuUiTranslations[language][section] = {...(mihuUiTranslations[language][section] || {}), ...values};
    });
});

const mihuStateTranslations = {
    "pt-BR": {blockMode:"Modo Blocos",codeMode:"Modo Código",running:"Executando...",sending:"Enviando...",send:"Enviar",connect:"Conectar",disconnect:"Desconectar",lockScroll:"Travar scroll",unlockScroll:"Liberar scroll",lockScrollTitle:"Impedir que novas mensagens movam o scroll",unlockScrollTitle:"Permitir que novas mensagens acompanhem o final do terminal",checking:"Verificando..."},
    en: {blockMode:"Block Mode",codeMode:"Code Mode",running:"Running...",sending:"Uploading...",send:"Upload",connect:"Connect",disconnect:"Disconnect",lockScroll:"Lock scroll",unlockScroll:"Unlock scroll",lockScrollTitle:"Prevent new messages from moving the scroll",unlockScrollTitle:"Allow new messages to follow the end of the terminal",checking:"Checking..."},
    de: {blockMode:"Block-Modus",codeMode:"Code-Modus",running:"Wird ausgeführt...",sending:"Wird hochgeladen...",send:"Hochladen",connect:"Verbinden",disconnect:"Trennen",lockScroll:"Scrollen sperren",unlockScroll:"Scrollen freigeben",lockScrollTitle:"Automatisches Scrollen verhindern",unlockScrollTitle:"Neue Meldungen automatisch anzeigen",checking:"Wird geprüft..."},
    es: {blockMode:"Modo bloques",codeMode:"Modo código",running:"Ejecutando...",sending:"Cargando...",send:"Cargar",connect:"Conectar",disconnect:"Desconectar",lockScroll:"Bloquear desplazamiento",unlockScroll:"Desbloquear desplazamiento",lockScrollTitle:"Evitar el desplazamiento automático",unlockScrollTitle:"Permitir seguir el final del terminal",checking:"Comprobando..."},
    fr: {blockMode:"Mode blocs",codeMode:"Mode code",running:"Exécution...",sending:"Téléversement...",send:"Téléverser",connect:"Connecter",disconnect:"Déconnecter",lockScroll:"Verrouiller le défilement",unlockScroll:"Déverrouiller le défilement",lockScrollTitle:"Empêcher le défilement automatique",unlockScrollTitle:"Suivre les nouveaux messages",checking:"Vérification..."},
    it: {blockMode:"Modalità blocchi",codeMode:"Modalità codice",running:"Esecuzione...",sending:"Caricamento...",send:"Carica",connect:"Connetti",disconnect:"Disconnetti",lockScroll:"Blocca scorrimento",unlockScroll:"Sblocca scorrimento",lockScrollTitle:"Impedisci lo scorrimento automatico",unlockScrollTitle:"Segui i nuovi messaggi",checking:"Verifica..."},
    ru: {blockMode:"Режим блоков",codeMode:"Режим кода",running:"Выполнение...",sending:"Загрузка...",send:"Загрузить",connect:"Подключить",disconnect:"Отключить",lockScroll:"Закрепить прокрутку",unlockScroll:"Освободить прокрутку",lockScrollTitle:"Запретить автоматическую прокрутку",unlockScrollTitle:"Показывать новые сообщения",checking:"Проверка..."},
    "zh-CN": {blockMode:"积木模式",codeMode:"代码模式",running:"正在运行...",sending:"正在上传...",send:"上传",connect:"连接",disconnect:"断开连接",lockScroll:"锁定滚动",unlockScroll:"解锁滚动",lockScrollTitle:"阻止自动滚动",unlockScrollTitle:"自动显示新消息",checking:"正在检查..."}
};

Object.entries(mihuStateTranslations).forEach(([language, state]) => {
    mihuUiTranslations[language].state = state;
});

const mihuRuntimeTranslations = {
    "pt-BR": {terminal:{welcome:"MIHU STUDIO Terminal inicializado",helpHint:"Digite 'help' para ver comandos locais. Para MicroPython, use comandos normais, por exemplo: help()"},program:{delete:"Excluir programa",deleteConfirm:'Excluir "{{name}}"?',rename:"Novo nome:",new:"Novo projeto"}},
    en: {terminal:{welcome:"MIHU STUDIO Terminal initialized",helpHint:"Type 'help' to see local commands. For MicroPython, use normal commands, for example: help()"},program:{delete:"Delete program",deleteConfirm:'Delete "{{name}}"?',rename:"New name:",new:"New project"}},
    de: {terminal:{welcome:"MIHU STUDIO Terminal initialisiert",helpHint:"Geben Sie 'help' für lokale Befehle ein. Für MicroPython verwenden Sie normale Befehle, zum Beispiel: help()"},program:{delete:"Programm löschen",deleteConfirm:'"{{name}}" löschen?',rename:"Neuer Name:",new:"Neues Projekt"}},
    es: {terminal:{welcome:"Terminal de MIHU STUDIO inicializado",helpHint:"Escriba 'help' para ver los comandos locales. Para MicroPython, use comandos normales, por ejemplo: help()"},program:{delete:"Eliminar programa",deleteConfirm:'¿Eliminar "{{name}}"?',rename:"Nuevo nombre:",new:"Nuevo proyecto"}},
    fr: {terminal:{welcome:"Terminal MIHU STUDIO initialisé",helpHint:"Saisissez 'help' pour afficher les commandes locales. Pour MicroPython, utilisez les commandes normales, par exemple : help()"},program:{delete:"Supprimer le programme",deleteConfirm:'Supprimer « {{name}} » ?',rename:"Nouveau nom :",new:"Nouveau projet"}},
    it: {terminal:{welcome:"Terminale MIHU STUDIO inizializzato",helpHint:"Digita 'help' per vedere i comandi locali. Per MicroPython, usa i comandi normali, ad esempio: help()"},program:{delete:"Elimina programma",deleteConfirm:'Eliminare "{{name}}"?',rename:"Nuovo nome:",new:"Nuovo progetto"}},
    ru: {terminal:{welcome:"Терминал MIHU STUDIO запущен",helpHint:"Введите 'help', чтобы увидеть локальные команды. Для MicroPython используйте обычные команды, например: help()"},program:{delete:"Удалить программу",deleteConfirm:'Удалить «{{name}}»?',rename:"Новое имя:",new:"Новый проект"}},
    "zh-CN": {terminal:{welcome:"MIHU STUDIO 终端已初始化",helpHint:"输入 'help' 查看本地命令。对于 MicroPython，请使用常规命令，例如：help()"},program:{delete:"删除程序",deleteConfirm:'删除“{{name}}”？',rename:"新名称：",new:"新建项目"}}
};

Object.entries(mihuRuntimeTranslations).forEach(([language, additions]) => {
    Object.entries(additions).forEach(([section, values]) => {
        mihuUiTranslations[language][section] = {...(mihuUiTranslations[language][section] || {}), ...values};
    });
});

const mihuFileManagerTranslations = {
    "pt-BR": {title:"Arquivos",refresh:"Atualizar",save:"Salvar na placa",connectHint:"Conecte a controladora para carregar os arquivos.",selectHint:"Selecione um arquivo para editar",editorLabel:"Editor de arquivos da controladora",discard:"Descartar alterações não salvas?",loading:"Carregando arquivo...",loadingTree:"Carregando árvore da placa...",empty:"Nenhum arquivo encontrado.",saving:"Salvando na controladora...",saved:"Arquivo salvo com sucesso."},
    en: {title:"Files",refresh:"Refresh",save:"Save to board",connectHint:"Connect the controller to load its files.",selectHint:"Select a file to edit",editorLabel:"Controller file editor",discard:"Discard unsaved changes?",loading:"Loading file...",loadingTree:"Loading board file tree...",empty:"No files found.",saving:"Saving to controller...",saved:"File saved successfully."},
    de: {title:"Dateien",refresh:"Aktualisieren",save:"Auf Controller speichern",connectHint:"Verbinden Sie den Controller, um Dateien zu laden.",selectHint:"Wählen Sie eine Datei zum Bearbeiten",editorLabel:"Controller-Dateieditor",discard:"Nicht gespeicherte Änderungen verwerfen?",loading:"Datei wird geladen...",loadingTree:"Dateibaum wird geladen...",empty:"Keine Dateien gefunden.",saving:"Auf Controller speichern...",saved:"Datei erfolgreich gespeichert."},
    es: {title:"Archivos",refresh:"Actualizar",save:"Guardar en la placa",connectHint:"Conecte el controlador para cargar sus archivos.",selectHint:"Seleccione un archivo para editar",editorLabel:"Editor de archivos del controlador",discard:"¿Descartar los cambios no guardados?",loading:"Cargando archivo...",loadingTree:"Cargando árbol de archivos...",empty:"No se encontraron archivos.",saving:"Guardando en el controlador...",saved:"Archivo guardado correctamente."},
    fr: {title:"Fichiers",refresh:"Actualiser",save:"Enregistrer sur la carte",connectHint:"Connectez le contrôleur pour charger ses fichiers.",selectHint:"Sélectionnez un fichier à modifier",editorLabel:"Éditeur de fichiers du contrôleur",discard:"Ignorer les modifications non enregistrées ?",loading:"Chargement du fichier...",loadingTree:"Chargement de l’arborescence...",empty:"Aucun fichier trouvé.",saving:"Enregistrement sur le contrôleur...",saved:"Fichier enregistré."},
    it: {title:"File",refresh:"Aggiorna",save:"Salva sulla scheda",connectHint:"Connetti il controller per caricare i file.",selectHint:"Seleziona un file da modificare",editorLabel:"Editor file del controller",discard:"Eliminare le modifiche non salvate?",loading:"Caricamento file...",loadingTree:"Caricamento albero file...",empty:"Nessun file trovato.",saving:"Salvataggio sul controller...",saved:"File salvato correttamente."},
    ru: {title:"Файлы",refresh:"Обновить",save:"Сохранить на плату",connectHint:"Подключите контроллер, чтобы загрузить файлы.",selectHint:"Выберите файл для редактирования",editorLabel:"Редактор файлов контроллера",discard:"Отменить несохранённые изменения?",loading:"Загрузка файла...",loadingTree:"Загрузка дерева файлов...",empty:"Файлы не найдены.",saving:"Сохранение на контроллер...",saved:"Файл успешно сохранён."},
    "zh-CN": {title:"文件",refresh:"刷新",save:"保存到控制器",connectHint:"连接控制器以加载文件。",selectHint:"选择要编辑的文件",editorLabel:"控制器文件编辑器",discard:"放弃未保存的更改？",loading:"正在加载文件...",loadingTree:"正在加载文件树...",empty:"未找到文件。",saving:"正在保存到控制器...",saved:"文件保存成功。"}
};

Object.entries(mihuFileManagerTranslations).forEach(([language, files]) => {
    mihuUiTranslations[language].files = files;
});

const mihuProgramMenuTranslations = {
    "pt-BR": {options:"Opções do projeto",renameAction:"Renomear projeto"},
    en: {options:"Project options",renameAction:"Rename project"},
    de: {options:"Projektoptionen",renameAction:"Projekt umbenennen"},
    es: {options:"Opciones del proyecto",renameAction:"Renombrar proyecto"},
    fr: {options:"Options du projet",renameAction:"Renommer le projet"},
    it: {options:"Opzioni progetto",renameAction:"Rinomina progetto"},
    ru: {options:"Параметры проекта",renameAction:"Переименовать проект"},
    "zh-CN": {options:"项目选项",renameAction:"重命名项目"}
};

Object.entries(mihuProgramMenuTranslations).forEach(([language, values]) => {
    mihuUiTranslations[language].program = {...mihuUiTranslations[language].program, ...values};
});

const mihuCategoryTranslations = {
    "pt-BR": {},
    en: {"Controle":"Control","Operadores":"Operators","Variáveis":"Variables","Os Meus Blocos":"My Blocks","motor":"Motor","sensor":"Sensors","controlador":"Controller","display":"Display","sem fio":"Wireless","input":"Input"},
    "zh-CN": {"Controle":"控制","Operadores":"运算符","Variáveis":"变量","Os Meus Blocos":"我的积木","motor":"电机","sensor":"传感器","controlador":"控制器","display":"显示","sem fio":"无线","input":"输入"},
    ru: {"Controle":"Управление","Operadores":"Операторы","Variáveis":"Переменные","Os Meus Blocos":"Мои блоки","motor":"Мотор","sensor":"Датчики","controlador":"Контроллер","display":"Дисплей","sem fio":"Беспроводная связь","input":"Ввод"},
    fr: {"Controle":"Contrôle","Operadores":"Opérateurs","Variáveis":"Variables","Os Meus Blocos":"Mes blocs","motor":"Moteur","sensor":"Capteurs","controlador":"Contrôleur","display":"Affichage","sem fio":"Sans fil","input":"Entrée"},
    it: {"Controle":"Controllo","Operadores":"Operatori","Variáveis":"Variabili","Os Meus Blocos":"I miei blocchi","motor":"Motore","sensor":"Sensori","controlador":"Controller","display":"Display","sem fio":"Wireless","input":"Ingresso"},
    de: {"Controle":"Steuerung","Operadores":"Operatoren","Variáveis":"Variablen","Os Meus Blocos":"Meine Blöcke","motor":"Motor","sensor":"Sensoren","controlador":"Controller","display":"Anzeige","sem fio":"Drahtlos","input":"Eingabe"},
    es: {"Controle":"Control","Operadores":"Operadores","Variáveis":"Variables","Os Meus Blocos":"Mis bloques","motor":"Motor","sensor":"Sensores","controlador":"Controlador","display":"Pantalla","sem fio":"Inalámbrico","input":"Entrada"}
};

const mihuPhraseTranslations = {
    en: {"esperar":"wait","segundos":"seconds","repete":"repeat","vezes":"times","repete para sempre":"repeat forever","se":"if","então":"then","senão,":"else","espera até que":"wait until","até que":"until","parar tudo":"stop all","interface do motor":"motor interface","potência":"power","sensor ultrassônico":"ultrasonic sensor","sensor de cor":"color sensor","sensor giro":"gyro sensor","Ler pino digital":"Read digital pin","Definir pino digital":"Set digital pin","Configurar pino":"Configure pin","como":"as","com valor":"with value","é falso que":"not","um valor ao acaso entre":"random value between","o comprimento de":"length of","contém":"contains"},
    "zh-CN": {"esperar":"等待","segundos":"秒","repete":"重复","vezes":"次","repete para sempre":"永远重复","se":"如果","então":"那么","senão,":"否则","parar tudo":"全部停止","potência":"功率","sensor ultrassônico":"超声波传感器","sensor de cor":"颜色传感器","sensor giro":"陀螺仪传感器"},
    ru: {"esperar":"ждать","segundos":"секунд","repete":"повторить","vezes":"раз","repete para sempre":"повторять всегда","se":"если","então":"то","senão,":"иначе","parar tudo":"остановить всё","potência":"мощность","sensor ultrassônico":"ультразвуковой датчик","sensor de cor":"датчик цвета","sensor giro":"гироскоп"},
    fr: {"esperar":"attendre","segundos":"secondes","repete":"répéter","vezes":"fois","repete para sempre":"répéter indéfiniment","se":"si","então":"alors","senão,":"sinon","parar tudo":"tout arrêter","potência":"puissance","sensor ultrassônico":"capteur à ultrasons","sensor de cor":"capteur de couleur","sensor giro":"capteur gyroscopique"},
    it: {"esperar":"attendi","segundos":"secondi","repete":"ripeti","vezes":"volte","repete para sempre":"ripeti per sempre","se":"se","então":"allora","senão,":"altrimenti","parar tudo":"ferma tutto","potência":"potenza","sensor ultrassônico":"sensore a ultrasuoni","sensor de cor":"sensore di colore","sensor giro":"sensore giroscopico"},
    de: {"esperar":"warte","segundos":"Sekunden","repete":"wiederhole","vezes":"mal","repete para sempre":"wiederhole fortlaufend","se":"wenn","então":"dann","senão,":"sonst","parar tudo":"alles stoppen","potência":"Leistung","sensor ultrassônico":"Ultraschallsensor","sensor de cor":"Farbsensor","sensor giro":"Gyrosensor"},
    es: {"esperar":"esperar","segundos":"segundos","repete":"repetir","vezes":"veces","repete para sempre":"repetir por siempre","se":"si","então":"entonces","senão,":"si no","parar tudo":"detener todo","potência":"potencia","sensor ultrassônico":"sensor ultrasónico","sensor de cor":"sensor de color","sensor giro":"sensor giroscópico"}
};

const mihuControlTranslations = {
    en: {
        "espera":"wait", "receber comandos da câmera e controlar braço":"receive camera commands and control arm", "motor vertical":"vertical motor", "motor horizontal":"horizontal motor", "motor garra":"gripper motor", "velocidade movimento":"movement speed", "velocidade garra":"gripper speed",
        "Bloco principal do programa. O Setup executa uma vez e o Loop executa continuamente.":"Main program block. Setup runs once and Loop runs continuously.", "Pausa o programa pelo tempo informado em segundos.":"Pauses the program for the specified number of seconds.", "Espera a quantidade de segundos informada.":"Waits for the specified number of seconds.", "Repete os blocos internos a quantidade de vezes informada.":"Repeats the inner blocks the specified number of times.", "Repete os blocos internos continuamente.":"Repeats the inner blocks continuously.", "Executa os blocos internos quando a condição for verdadeira.":"Runs the inner blocks when the condition is true.", "Escolhe entre dois grupos de blocos de acordo com a condição.":"Chooses between two groups of blocks according to the condition.", "Espera até que a condição seja verdadeira.":"Waits until the condition is true.", "Repete os blocos internos até que a condição seja verdadeira.":"Repeats the inner blocks until the condition is true.", "Para a execução do programa.":"Stops the program.", "Recebe comandos da câmera via USB Serial e controla o braço robótico.":"Receives camera commands through USB Serial and controls the robotic arm."
    },
    "zh-CN": {
        "espera":"等待", "receber comandos da câmera e controlar braço":"接收摄像头命令并控制机械臂", "motor vertical":"垂直电机", "motor horizontal":"水平电机", "motor garra":"夹爪电机", "velocidade movimento":"移动速度", "velocidade garra":"夹爪速度",
        "Espera a quantidade de segundos informada.":"等待指定的秒数。", "Repete os blocos internos a quantidade de vezes informada.":"按指定次数重复内部积木。", "Repete os blocos internos continuamente.":"持续重复内部积木。", "Executa os blocos internos quando a condição for verdadeira.":"当条件为真时运行内部积木。", "Escolhe entre dois grupos de blocos de acordo com a condição.":"根据条件在两组积木之间选择。", "Espera até que a condição seja verdadeira.":"等待条件变为真。", "Repete os blocos internos até que a condição seja verdadeira.":"重复内部积木直到条件为真。", "Para a execução do programa.":"停止程序运行。"
    },
    ru: {
        "espera":"ждать", "receber comandos da câmera e controlar braço":"получать команды камеры и управлять манипулятором", "motor vertical":"вертикальный мотор", "motor horizontal":"горизонтальный мотор", "motor garra":"мотор захвата", "velocidade movimento":"скорость движения", "velocidade garra":"скорость захвата",
        "Espera a quantidade de segundos informada.":"Ожидает указанное количество секунд.", "Repete os blocos internos a quantidade de vezes informada.":"Повторяет внутренние блоки указанное число раз.", "Repete os blocos internos continuamente.":"Непрерывно повторяет внутренние блоки.", "Executa os blocos internos quando a condição for verdadeira.":"Выполняет внутренние блоки, когда условие истинно.", "Escolhe entre dois grupos de blocos de acordo com a condição.":"Выбирает одну из двух групп блоков по условию.", "Espera até que a condição seja verdadeira.":"Ждёт, пока условие станет истинным.", "Repete os blocos internos até que a condição seja verdadeira.":"Повторяет внутренние блоки, пока условие не станет истинным.", "Para a execução do programa.":"Останавливает программу."
    },
    fr: {
        "espera":"attendre", "receber comandos da câmera e controlar braço":"recevoir les commandes de la caméra et contrôler le bras", "motor vertical":"moteur vertical", "motor horizontal":"moteur horizontal", "motor garra":"moteur de pince", "velocidade movimento":"vitesse de déplacement", "velocidade garra":"vitesse de la pince",
        "Espera a quantidade de segundos informada.":"Attend le nombre de secondes indiqué.", "Repete os blocos internos a quantidade de vezes informada.":"Répète les blocs internes le nombre de fois indiqué.", "Repete os blocos internos continuamente.":"Répète les blocs internes en continu.", "Executa os blocos internos quando a condição for verdadeira.":"Exécute les blocs internes lorsque la condition est vraie.", "Escolhe entre dois grupos de blocos de acordo com a condição.":"Choisit entre deux groupes de blocs selon la condition.", "Espera até que a condição seja verdadeira.":"Attend que la condition soit vraie.", "Repete os blocos internos até que a condição seja verdadeira.":"Répète les blocs internes jusqu'à ce que la condition soit vraie.", "Para a execução do programa.":"Arrête le programme."
    },
    it: {
        "espera":"attendi", "receber comandos da câmera e controlar braço":"ricevi i comandi della telecamera e controlla il braccio", "motor vertical":"motore verticale", "motor horizontal":"motore orizzontale", "motor garra":"motore pinza", "velocidade movimento":"velocità movimento", "velocidade garra":"velocità pinza",
        "Espera a quantidade de segundos informada.":"Attende il numero di secondi specificato.", "Repete os blocos internos a quantidade de vezes informada.":"Ripete i blocchi interni per il numero di volte indicato.", "Repete os blocos internos continuamente.":"Ripete continuamente i blocchi interni.", "Executa os blocos internos quando a condição for verdadeira.":"Esegue i blocchi interni quando la condizione è vera.", "Escolhe entre dois grupos de blocos de acordo com a condição.":"Sceglie tra due gruppi di blocchi in base alla condizione.", "Espera até que a condição seja verdadeira.":"Attende finché la condizione non è vera.", "Repete os blocos internos até que a condição seja verdadeira.":"Ripete i blocchi interni finché la condizione non è vera.", "Para a execução do programa.":"Arresta il programma."
    },
    de: {
        "espera":"warte", "receber comandos da câmera e controlar braço":"Kamerabefehle empfangen und Roboterarm steuern", "motor vertical":"Vertikalmotor", "motor horizontal":"Horizontalmotor", "motor garra":"Greifermotor", "velocidade movimento":"Bewegungsgeschwindigkeit", "velocidade garra":"Greifergeschwindigkeit",
        "Bloco principal do programa. O Setup executa uma vez e o Loop executa continuamente.":"Hauptblock des Programms. Setup wird einmal und Loop fortlaufend ausgeführt.", "Pausa o programa pelo tempo informado em segundos.":"Pausiert das Programm für die angegebene Zeit in Sekunden.", "Espera a quantidade de segundos informada.":"Wartet die angegebene Anzahl von Sekunden.", "Repete os blocos internos a quantidade de vezes informada.":"Wiederholt die inneren Blöcke so oft wie angegeben.", "Repete os blocos internos continuamente.":"Wiederholt die inneren Blöcke fortlaufend.", "Executa os blocos internos quando a condição for verdadeira.":"Führt die inneren Blöcke aus, wenn die Bedingung wahr ist.", "Escolhe entre dois grupos de blocos de acordo com a condição.":"Wählt abhängig von der Bedingung zwischen zwei Blockgruppen.", "Espera até que a condição seja verdadeira.":"Wartet, bis die Bedingung wahr ist.", "Repete os blocos internos até que a condição seja verdadeira.":"Wiederholt die inneren Blöcke, bis die Bedingung wahr ist.", "Para a execução do programa.":"Stoppt die Programmausführung.", "Recebe comandos da câmera via USB Serial e controla o braço robótico.":"Empfängt Kamerabefehle über USB Serial und steuert den Roboterarm."
    },
    es: {
        "espera":"esperar", "receber comandos da câmera e controlar braço":"recibir comandos de la cámara y controlar el brazo", "motor vertical":"motor vertical", "motor horizontal":"motor horizontal", "motor garra":"motor de la pinza", "velocidade movimento":"velocidad de movimiento", "velocidade garra":"velocidad de la pinza",
        "Espera a quantidade de segundos informada.":"Espera la cantidad de segundos indicada.", "Repete os blocos internos a quantidade de vezes informada.":"Repite los bloques internos la cantidad de veces indicada.", "Repete os blocos internos continuamente.":"Repite continuamente los bloques internos.", "Executa os blocos internos quando a condição for verdadeira.":"Ejecuta los bloques internos cuando la condición es verdadera.", "Escolhe entre dois grupos de blocos de acordo com a condição.":"Elige entre dos grupos de bloques según la condición.", "Espera até que a condição seja verdadeira.":"Espera hasta que la condición sea verdadera.", "Repete os blocos internos até que a condição seja verdadeira.":"Repite los bloques internos hasta que la condición sea verdadera.", "Para a execução do programa.":"Detiene la ejecución del programa."
    }
};

const blocklyLocaleFiles = {"pt-BR":"pt-br", "zh-CN":"zh-hans", ru:"ru", fr:"fr", it:"it", de:"de", es:"es"};

const mihuControlFlowTranslations = {
    en: {"espera até que":"wait until", "até que":"until"},
    "zh-CN": {"espera até que":"等待直到", "até que":"直到"},
    ru: {"espera até que":"ждать до", "até que":"до тех пор"},
    fr: {"espera até que":"attendre jusqu'à", "até que":"jusqu'à"},
    it: {"espera até que":"attendi fino a", "até que":"fino a"},
    de: {"espera até que":"warte bis", "até que":"bis"},
    es: {"espera até que":"esperar hasta", "até que":"hasta que"}
};

const mihuSystemTranslations = {
    en: {"Atualizar firmware":"Update firmware","Selecione a porta da controladora":"Select the controller port","O MIHU Studio verificará automaticamente se ela está pronta para atualização.":"MIHU Studio will automatically check whether it is ready for an update.","Verificar porta USB":"Check USB port","Firmware completo":"Complete firmware","Cancelar":"Cancel","Verificar novamente":"Check again","Seleção da porta cancelada.":"Port selection cancelled.","Selecione a porta USB exibida pelo Windows.":"Select the USB port shown by Windows.","Porta MIHU S3 detectada. Faça a sequência BOOT + RESET e verifique novamente.":"MIHU S3 port detected. Follow the BOOT + RESET procedure and check again.","USB JTAG/serial debug unit detectada. A placa está pronta para atualizar.":"USB JTAG/serial debug unit detected. The board is ready to update.","Atualização concluída":"Update complete","Conectando ao ESP32-S3...":"Connecting to ESP32-S3..."},
    de: {"Atualizar firmware":"Firmware aktualisieren","Selecione a porta da controladora":"Controller-Anschluss auswählen","O MIHU Studio verificará automaticamente se ela está pronta para atualização.":"MIHU Studio prüft automatisch, ob der Controller zur Aktualisierung bereit ist.","Verificar porta USB":"USB-Anschluss prüfen","Firmware completo":"Vollständige Firmware","Cancelar":"Abbrechen","Verificar novamente":"Erneut prüfen","Seleção da porta cancelada.":"Anschlussauswahl abgebrochen.","Selecione a porta USB exibida pelo Windows.":"Wählen Sie den von Windows angezeigten USB-Anschluss.","Porta MIHU S3 detectada. Faça a sequência BOOT + RESET e verifique novamente.":"MIHU S3-Anschluss erkannt. Führen Sie BOOT + RESET aus und prüfen Sie erneut.","USB JTAG/serial debug unit detectada. A placa está pronta para atualizar.":"USB JTAG/serial debug unit erkannt. Der Controller ist bereit.","Atualização concluída":"Aktualisierung abgeschlossen","Conectando ao ESP32-S3...":"Verbindung mit ESP32-S3..."},
    es: {"Atualizar firmware":"Actualizar firmware","Selecione a porta da controladora":"Seleccione el puerto del controlador","O MIHU Studio verificará automaticamente se ela está pronta para atualização.":"MIHU Studio comprobará automáticamente si está listo para actualizar.","Verificar porta USB":"Comprobar puerto USB","Firmware completo":"Firmware completo","Cancelar":"Cancelar","Verificar novamente":"Comprobar de nuevo","Seleção da porta cancelada.":"Selección del puerto cancelada.","Selecione a porta USB exibida pelo Windows.":"Seleccione el puerto USB mostrado por Windows.","Porta MIHU S3 detectada. Faça a sequência BOOT + RESET e verifique novamente.":"Puerto MIHU S3 detectado. Realice BOOT + RESET y vuelva a comprobar.","USB JTAG/serial debug unit detectada. A placa está pronta para atualizar.":"USB JTAG/serial debug unit detectado. La placa está lista.","Atualização concluída":"Actualización completada","Conectando ao ESP32-S3...":"Conectando al ESP32-S3..."},
    fr: {"Atualizar firmware":"Mettre à jour le firmware","Selecione a porta da controladora":"Sélectionnez le port du contrôleur","O MIHU Studio verificará automaticamente se ela está pronta para atualização.":"MIHU Studio vérifiera automatiquement si le contrôleur est prêt.","Verificar porta USB":"Vérifier le port USB","Firmware completo":"Firmware complet","Cancelar":"Annuler","Verificar novamente":"Vérifier à nouveau","Seleção da porta cancelada.":"Sélection du port annulée.","Selecione a porta USB exibida pelo Windows.":"Sélectionnez le port USB affiché par Windows.","Porta MIHU S3 detectada. Faça a sequência BOOT + RESET e verifique novamente.":"Port MIHU S3 détecté. Effectuez BOOT + RESET puis vérifiez à nouveau.","USB JTAG/serial debug unit detectada. A placa está pronta para atualizar.":"USB JTAG/serial debug unit détecté. La carte est prête.","Atualização concluída":"Mise à jour terminée","Conectando ao ESP32-S3...":"Connexion à l'ESP32-S3..."},
    it: {"Atualizar firmware":"Aggiorna firmware","Selecione a porta da controladora":"Seleziona la porta del controller","O MIHU Studio verificará automaticamente se ela está pronta para atualização.":"MIHU Studio verificherà automaticamente se il controller è pronto.","Verificar porta USB":"Verifica porta USB","Firmware completo":"Firmware completo","Cancelar":"Annulla","Verificar novamente":"Verifica di nuovo","Seleção da porta cancelada.":"Selezione della porta annullata.","Selecione a porta USB exibida pelo Windows.":"Seleziona la porta USB mostrata da Windows.","Porta MIHU S3 detectada. Faça a sequência BOOT + RESET e verifique novamente.":"Porta MIHU S3 rilevata. Esegui BOOT + RESET e verifica di nuovo.","USB JTAG/serial debug unit detectada. A placa está pronta para atualizar.":"USB JTAG/serial debug unit rilevata. La scheda è pronta.","Atualização concluída":"Aggiornamento completato","Conectando ao ESP32-S3...":"Connessione a ESP32-S3..."},
    ru: {"Atualizar firmware":"Обновить прошивку","Selecione a porta da controladora":"Выберите порт контроллера","O MIHU Studio verificará automaticamente se ela está pronta para atualização.":"MIHU Studio автоматически проверит готовность контроллера.","Verificar porta USB":"Проверить USB-порт","Firmware completo":"Полная прошивка","Cancelar":"Отмена","Verificar novamente":"Проверить снова","Seleção da porta cancelada.":"Выбор порта отменён.","Selecione a porta USB exibida pelo Windows.":"Выберите USB-порт, показанный Windows.","Porta MIHU S3 detectada. Faça a sequência BOOT + RESET e verifique novamente.":"Обнаружен порт MIHU S3. Выполните BOOT + RESET и проверьте снова.","USB JTAG/serial debug unit detectada. A placa está pronta para atualizar.":"Обнаружен USB JTAG/serial debug unit. Плата готова.","Atualização concluída":"Обновление завершено","Conectando ao ESP32-S3...":"Подключение к ESP32-S3..."},
    "zh-CN": {"Atualizar firmware":"更新固件","Selecione a porta da controladora":"选择控制器端口","O MIHU Studio verificará automaticamente se ela está pronta para atualização.":"MIHU Studio 将自动检查控制器是否可更新。","Verificar porta USB":"检查 USB 端口","Firmware completo":"完整固件","Cancelar":"取消","Verificar novamente":"重新检查","Seleção da porta cancelada.":"已取消端口选择。","Selecione a porta USB exibida pelo Windows.":"请选择 Windows 显示的 USB 端口。","Porta MIHU S3 detectada. Faça a sequência BOOT + RESET e verifique novamente.":"检测到 MIHU S3 端口。请执行 BOOT + RESET 后重新检查。","USB JTAG/serial debug unit detectada. A placa está pronta para atualizar.":"检测到 USB JTAG/serial debug unit，控制器已准备好。","Atualização concluída":"更新完成","Conectando ao ESP32-S3...":"正在连接 ESP32-S3..."}
};

function getMihuLanguage() {
    return localStorage.getItem(MIHU_LANGUAGE_KEY) || "pt-BR";
}

function loadBlocklyLanguage(language) {
    const locale = blocklyLocaleFiles[language];
    if (!locale) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://unpkg.com/blockly/msg/${locale}.js`;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Não foi possível carregar o idioma Blockly: ${locale}`));
        document.head.appendChild(script);
    });
}

function translateMihuPhrase(text) {
    const language = getMihuLanguage();
    return (mihuSystemTranslations[language] && mihuSystemTranslations[language][text])
        || (mihuControlFlowTranslations[language] && mihuControlFlowTranslations[language][text])
        || (mihuControlTranslations[language] && mihuControlTranslations[language][text])
        || (mihuPhraseTranslations[language] && mihuPhraseTranslations[language][text])
        || text;
}

function applyMihuSystemTranslations(root = document) {
    root.querySelectorAll("[data-translate]").forEach(element => {
        const source = element.dataset.translationSource || element.textContent.trim();
        element.dataset.translationSource = source;
        element.textContent = translateMihuPhrase(source);
    });
}

function installMihuBlockTranslation() {
    if (!window.Blockly || Blockly.Input.prototype.__mihuI18nInstalled) return;
    const originalAppendField = Blockly.Input.prototype.appendField;
    Blockly.Input.prototype.appendField = function(field, name) {
        return originalAppendField.call(this, typeof field === "string" ? translateMihuPhrase(field) : field, name);
    };
    Blockly.Input.prototype.__mihuI18nInstalled = true;

    const originalSetTooltip = Blockly.Block.prototype.setTooltip;
    Blockly.Block.prototype.setTooltip = function(tooltip) {
        return originalSetTooltip.call(this, typeof tooltip === "string" ? translateMihuPhrase(tooltip) : tooltip);
    };

    const originalGetOptions = Blockly.FieldDropdown.prototype.getOptions;
    Blockly.FieldDropdown.prototype.getOptions = function(useCache) {
        return originalGetOptions.call(this, useCache).map(option => [translateMihuPhrase(option[0]), option[1]]);
    };
}

function translateMihuToolbox(toolboxDocument) {
    const translations = mihuCategoryTranslations[getMihuLanguage()] || {};
    Array.from(toolboxDocument.getElementsByTagName("category")).forEach(category => {
        const originalName = category.getAttribute("name");
        category.setAttribute("name", translations[originalName] || originalName);
    });
}

function applyMihuInterfaceLanguage() {
    document.documentElement.lang = getMihuLanguage();
    document.querySelectorAll("[data-i18n]").forEach(element => {
        element.textContent = i18next.t(element.dataset.i18n);
    });
    ["title", "placeholder", "aria-label", "alt"].forEach(attribute => {
        const datasetName = `i18n${attribute.split("-").map(part => part[0].toUpperCase() + part.slice(1)).join("")}`;
        document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
            element.setAttribute(attribute, i18next.t(element.dataset[datasetName]));
        });
    });
    document.querySelectorAll("[data-language]").forEach(button => {
        button.classList.toggle("is-active", button.dataset.language === getMihuLanguage());
        button.addEventListener("click", () => {
            localStorage.setItem(MIHU_LANGUAGE_KEY, button.dataset.language);
            location.reload();
        });
    });
}

async function initializeMihuI18n() {
    const language = getMihuLanguage();
    const resources = Object.fromEntries(Object.entries(mihuUiTranslations).map(([code, translation]) => [code, {translation}]));
    await i18next.init({lng: language, fallbackLng: "pt-BR", resources, interpolation:{escapeValue:false}});
    await loadBlocklyLanguage(language);
    installMihuBlockTranslation();
    applyMihuInterfaceLanguage();
    applyMihuSystemTranslations();
}

window.initializeMihuI18n = initializeMihuI18n;
window.translateMihuToolbox = translateMihuToolbox;
window.translateMihuPhrase = translateMihuPhrase;
window.applyMihuSystemTranslations = applyMihuSystemTranslations;
window.mihuT = (key, options) => i18next.t(key, options);
