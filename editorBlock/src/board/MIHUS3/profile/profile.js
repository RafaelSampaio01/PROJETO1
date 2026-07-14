window.MIHU_PIN_COLORS = {
    digital: "#4A90E2",
    analog: "#ff66c4",
    uart: "#d5d7dc",
    rtc: "#015ceb",
    touch: "#ff914d",
    boot: "#8c52ff"
};

window.MIHU_BOARD_PROFILE = {
    id: "MIHUS3",
    name: "MIHU S3",

    pins: {
        digital: [
            ["A0", "9"],
            ["A1/REC_IR", "8"],
            ["A2", "7"],
            ["A3", "6"],
            ["A4", "5"],
            ["A5/LED_IR", "4"]
        ],

        analog: [
            ["A0", "9"],
            ["A1/REC_IR", "8"],
            ["A2", "7"],
            ["A3", "6"],
            ["A4", "5"],
            ["A5/LED_IR", "4"]
        ],

        pwm: [
            ["P1_DIG", "22"],
            ["P2_DIG", "23"],
            ["P3_DIG", "24"]
        ],

        uart: [
            ["UART_TX", "43"],
            ["UART_RX", "44"]
        ],

        rtc: [
            ["RTC_GPIO1", "1"],
            ["RTC_GPIO2", "2"]
        ],

        touch: [
            ["TOUCH1", "1"],
            ["TOUCH2", "2"]
        ]
    },

    getDigitalPinOptions() {
        return this.pins.digital;
    },

    getAnalogPinOptions() {
        return this.pins.analog;
    },

    getPwmPinOptions() {
        return this.pins.pwm;
    },

    getUartPinOptions() {
        return this.pins.uart;
    },

    getRtcPinOptions() {
        return this.pins.rtc;
    },

    getTouchPinOptions() {
        return this.pins.touch;
    }
};