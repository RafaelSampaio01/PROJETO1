let selectedFirmwareFile = null;
let firmwareUpdateBusy = false;
let selectedFirmwarePort = null;
let firmwareUpdaterStep = "choose";

const ESPRESSIF_USB_JTAG_VENDOR_ID = 0x303A;
const ESPRESSIF_USB_JTAG_PRODUCT_ID = 0x1001;

function isFirmwareBootloaderPort(info = {}) {
    return info.usbVendorId === ESPRESSIF_USB_JTAG_VENDOR_ID
        && info.usbProductId === ESPRESSIF_USB_JTAG_PRODUCT_ID;
}

window.isFirmwareBootloaderPort = isFirmwareBootloaderPort;

function formatFirmwareSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function setFirmwareMessage(message, type = "") {
    const element = document.getElementById("firmwareMessage");
    if (!element) return;
    element.textContent = typeof window.translateMihuPhrase === "function" ? window.translateMihuPhrase(message) : message;
    element.className = `firmware-message${type ? ` is-${type}` : ""}`;
}

function setFirmwareProgress(percent, text) {
    document.getElementById("firmwareProgress").hidden = false;
    document.getElementById("firmwareProgressBar").style.width = `${Math.max(0, Math.min(100, percent))}%`;
    document.getElementById("firmwareProgressText").textContent = typeof window.translateMihuPhrase === "function" ? window.translateMihuPhrase(text) : text;
}

function updateSimpleFirmwareUI() {
    const connectGate = document.getElementById("firmwareConnectGate");
    const bootGuide = document.getElementById("firmwareBootGuide");
    const autoFile = document.getElementById("firmwareAutoFile");
    const startButton = document.getElementById("startFirmwareUpdate");
    const modal = document.querySelector(".firmware-modal");

    const retryButton = document.getElementById("retryFirmwarePort");
    connectGate.hidden = firmwareUpdaterStep !== "choose";
    bootGuide.hidden = firmwareUpdaterStep !== "boot";
    autoFile.hidden = firmwareUpdaterStep !== "ready";
    retryButton.hidden = firmwareUpdaterStep !== "boot";
    startButton.hidden = firmwareUpdaterStep !== "ready";
    startButton.disabled = firmwareUpdateBusy || !selectedFirmwareFile || !selectedFirmwarePort;
    modal.classList.toggle("is-boot-step", firmwareUpdaterStep === "boot");
}

async function loadAutomaticFirmware() {
    selectedFirmwareFile = null;
    try {
        const response = await fetch("/api/firmware", { cache: "no-store" });
        if (!response.ok) throw new Error("Não foi possível consultar a pasta firmware.");
        const result = await response.json();
        const files = result.files || [];
        selectedFirmwareFile = files.find(file => file.name.toLowerCase() === "firmware.bin") || files[0] || null;

        if (!selectedFirmwareFile) {
            setFirmwareMessage("Arquivo firmware.bin não encontrado na pasta firmware.", "error");
            return;
        }

        document.getElementById("firmwareAutoFileName").textContent = selectedFirmwareFile.name;
        document.getElementById("firmwareAutoFileInfo").textContent = `${formatFirmwareSize(selectedFirmwareFile.size)} • firmware completo em 0x0`;
    } catch (error) {
        setFirmwareMessage(error.message, "error");
    } finally {
        updateSimpleFirmwareUI();
    }
}

function loadBootButtonsImage() {
    const image = document.getElementById("bootButtonsImage");
    const placeholder = document.getElementById("bootButtonsImagePlaceholder");
    const wrapper = document.getElementById("bootButtonsImageWrap");
    image.onload = () => {
        image.hidden = false;
        placeholder.hidden = true;
        wrapper.classList.add("image-ready");
    };
    image.onerror = () => {
        image.hidden = true;
        placeholder.hidden = false;
        wrapper.classList.remove("image-ready");
    };
    image.src = `/firmware/boot-reset-buttons.png?v=${Date.now()}`;
}

function showBootModeStep() {
    firmwareUpdaterStep = "boot";
    selectedFirmwarePort = null;
    updateSimpleFirmwareUI();
    setFirmwareMessage("Porta MIHU S3 detectada. Faça a sequência BOOT + RESET e verifique novamente.", "info");
}

function showFirmwareReadyStep(port) {
    selectedFirmwarePort = port;
    firmwareUpdaterStep = "ready";
    updateSimpleFirmwareUI();
    setFirmwareMessage("USB JTAG/serial debug unit detectada. A placa está pronta para atualizar.", "success");
}

async function inspectFirmwarePort() {
    const button = document.getElementById("connectForFirmware");
    const retryButton = document.getElementById("retryFirmwarePort");
    button.disabled = true;
    retryButton.disabled = true;
    button.textContent = typeof window.mihuT === "function" ? window.mihuT("state.checking") : "Verificando...";
    setFirmwareMessage("Selecione a porta USB exibida pelo Windows.", "info");

    try {
        if (!navigator.serial) throw new Error("Use Chrome ou Edge com suporte a Web Serial.");
        if (typeof isSerialConnected !== "undefined" && isSerialConnected && typeof disconnectSerial === "function") {
            await disconnectSerial();
        }

        const port = await navigator.serial.requestPort();
        const info = typeof port.getInfo === "function" ? port.getInfo() : {};
        const isNativeUsbJtag = isFirmwareBootloaderPort(info);

        if (isNativeUsbJtag) showFirmwareReadyStep(port);
        else showBootModeStep();
    } catch (error) {
        const cancelled = error && (error.name === "NotFoundError" || error.name === "AbortError");
        setFirmwareMessage(cancelled ? "Seleção da porta cancelada." : `Não foi possível verificar a porta: ${error.message || error}`, cancelled ? "info" : "error");
    } finally {
        button.disabled = false;
        retryButton.disabled = false;
        button.textContent = typeof window.translateMihuPhrase === "function" ? window.translateMihuPhrase("Verificar porta USB") : "Verificar porta USB";
    }
}

async function openFirmwareUpdater() {
    const modal = document.getElementById("firmwareModal");
    modal.hidden = false;
    if (typeof window.applyMihuSystemTranslations === "function") window.applyMihuSystemTranslations(modal);
    document.body.classList.add("modal-open");
    document.getElementById("firmwareProgress").hidden = true;
    setFirmwareMessage("");
    firmwareUpdaterStep = "choose";
    selectedFirmwarePort = null;
    await loadAutomaticFirmware();
    loadBootButtonsImage();
    updateSimpleFirmwareUI();
}

async function openFirmwareUpdaterWithPort(port) {
    const modal = document.getElementById("firmwareModal");
    modal.hidden = false;
    if (typeof window.applyMihuSystemTranslations === "function") window.applyMihuSystemTranslations(modal);
    document.body.classList.add("modal-open");
    document.getElementById("firmwareProgress").hidden = true;
    setFirmwareMessage("");
    selectedFirmwarePort = port;
    firmwareUpdaterStep = "ready";
    await loadAutomaticFirmware();
    showFirmwareReadyStep(port);
}

window.openFirmwareUpdaterWithPort = openFirmwareUpdaterWithPort;

function closeFirmwareUpdater() {
    if (firmwareUpdateBusy) return;
    document.getElementById("firmwareModal").hidden = true;
    document.body.classList.remove("modal-open");
}

async function startFirmwareUpdate() {
    if (!selectedFirmwareFile) return;
    let transport = null;
    firmwareUpdateBusy = true;
    updateSimpleFirmwareUI();
    setFirmwareMessage("");
    setFirmwareProgress(0, "Selecione USB JTAG/serial debug unit...");

    try {
        if (!navigator.serial) throw new Error("Use Chrome ou Edge com suporte a Web Serial.");
        const response = await fetch(`/api/firmware/${encodeURIComponent(selectedFirmwareFile.name)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Não foi possível abrir firmware.bin.");
        const firmwareData = new Uint8Array(await response.arrayBuffer());
        const { ESPLoader, Transport } = await import("/node_modules/esptool-js/bundle.js");
        transport = new Transport(selectedFirmwarePort, true);
        const loader = new ESPLoader({
            transport,
            baudrate: 460800,
            terminal: {
                clean() {},
                writeLine(data) { if (typeof logToTerminal === "function") logToTerminal(`[Firmware] ${data}`, "sys"); },
                write(data) { if (data && typeof logToTerminal === "function") logToTerminal(`[Firmware] ${data}`, "sys"); }
            }
        });

        setFirmwareProgress(2, "Conectando ao ESP32-S3...");
        const chip = await loader.main();
        setFirmwareMessage(`Dispositivo detectado: ${chip}`, "info");
        await loader.writeFlash({
            fileArray: [{ data: firmwareData, address: 0x0 }],
            flashMode: "dio",
            flashFreq: "40m",
            flashSize: "keep",
            eraseAll: false,
            compress: true,
            reportProgress(fileIndex, written, total) {
                const percent = total ? Math.round((written / total) * 100) : 0;
                setFirmwareProgress(percent, `Atualizando firmware: ${percent}%`);
            }
        });
        setFirmwareProgress(100, "Atualização concluída");
        setFirmwareMessage("Firmware atualizado com sucesso. Reiniciando a placa...", "success");
        await loader.after("hard_reset");
    } catch (error) {
        const cancelled = error && (error.name === "NotFoundError" || error.name === "AbortError");
        setFirmwareMessage(cancelled
            ? "Seleção cancelada. Escolha USB JTAG/serial debug unit."
            : `Falha na atualização: ${error.message || error}`, cancelled ? "info" : "error");
    } finally {
        if (transport) {
            try { await transport.disconnect(); } catch (error) { console.warn("Falha ao fechar porta:", error); }
        }
        firmwareUpdateBusy = false;
        updateSimpleFirmwareUI();
    }
}

function initializeFirmwareUpdater() {
    const modal = document.getElementById("firmwareModal");
    document.getElementById("openFirmwareUpdater")?.addEventListener("click", openFirmwareUpdater);
    document.getElementById("closeFirmwareUpdater")?.addEventListener("click", closeFirmwareUpdater);
    document.getElementById("cancelFirmwareUpdater")?.addEventListener("click", closeFirmwareUpdater);
    document.getElementById("connectForFirmware")?.addEventListener("click", inspectFirmwarePort);
    document.getElementById("retryFirmwarePort")?.addEventListener("click", inspectFirmwarePort);
    document.getElementById("startFirmwareUpdate")?.addEventListener("click", startFirmwareUpdate);
    modal?.addEventListener("click", event => { if (event.target === modal) closeFirmwareUpdater(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeFirmwareUpdater(); });
}

document.addEventListener("DOMContentLoaded", initializeFirmwareUpdater);
