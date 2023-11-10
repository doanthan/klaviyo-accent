import moment from 'moment'
const BLANK_SHEET = [
    [
        { readOnly: true, value: "Account Name" },
        { readOnly: true, value: "Klaviyo PK" },
        { readOnly: true, value: "Exchange Rate (default 1)" },
    ],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
];


const COLOURS = [
    {
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
    {
        borderColor: 'rgb(25, 99, 132)',
        backgroundColor: 'rgba(25, 99, 132, 0.5)',
    },
    {
        borderColor: 'rgb(53, 162, 23)',
        backgroundColor: 'rgba(53, 162, 23, 0.5)',
    }, {
        borderColor: 'rgb(155, 99, 132)',
        backgroundColor: 'rgba(155, 99, 132, 0.5)',
    },
    {
        borderColor: 'rgb(53, 182, 235)',
        backgroundColor: 'rgba(53, 182, 235, 0.5)',
    }, {
        borderColor: 'rgb(250, 99, 132)',
        backgroundColor: 'rgba(250, 99, 132, 0.5)',
    },
    {
        borderColor: 'rgb(153, 162, 235)',
        backgroundColor: 'rgba(153, 162, 235, 0.5)',
    }, {
        borderColor: 'rgb(255, 100, 130)',
        backgroundColor: 'rgba(255, 100, 130, 0.5)',
    },
    {
        borderColor: 'rgb(53, 162, 200)',
        backgroundColor: 'rgba(53, 162, 200, 0.5)',
    }, {
        borderColor: 'rgb(99, 255, 132)',
        backgroundColor: 'rgba(99, 255, 132, 0.5)',
    },
    {
        borderColor: 'rgb(235, 162, 235)',
        backgroundColor: 'rgba(235, 162, 235, 0.5)',
    }, {
        borderColor: 'rgb(255, 255, 132)',
        backgroundColor: 'rgba(255, 255, 132, 0.5)',
    },
    {
        borderColor: 'rgb(53, 162, 53)',
        backgroundColor: 'rgba(53, 162, 53, 0.5)',
    }, {
        borderColor: 'rgb(255, 255, 132)',
        backgroundColor: 'rgba(255, 255, 132, 0.5)',
    },
    {
        borderColor: 'rgb(53, 162, 53)',
        backgroundColor: 'rgba(53, 162, 53, 0.5)',
    }, {
        borderColor: 'rgb(255, 255, 132)',
        backgroundColor: 'rgba(255, 255, 132, 0.5)',
    },
    {
        borderColor: 'rgb(53, 1=62, 153)',
        backgroundColor: 'rgba(53, 62, 153, 0.5)',
    }, {
        borderColor: 'rgb(200, 255, 255)',
        backgroundColor: 'rgba(200, 255, 255, 0.5)',
    },
    {
        borderColor: 'rgb(132, 132, 53)',
        backgroundColor: 'rgba(132, 132, 53, 0.5)',
    }, {
        borderColor: 'rgb(162, 255, 132)',
        backgroundColor: 'rgba(162, 255, 132, 0.5)',
    },
    {
        borderColor: 'rgb(53, 162, 162)',
        backgroundColor: 'rgba(53, 162, 162, 0.5)',
    },
    {
        borderColor: 'rgb(5, 3, 53)',
        backgroundColor: 'rgba(5, 3, 53, 0.5)',
    }, {
        borderColor: 'rgb(162, 10, 5)',
        backgroundColor: 'rgba(162, 10,5, 0.5)',
    },
    {
        borderColor: 'rgb(53, 22, 200)',
        backgroundColor: 'rgba(53, 22, 200, 0.5)',
    }
];


const DEFAULT_CAMPAIGN_HEADERS = [
    {
        name: 'Date Sent',
        selector: row => moment(row.send_time).format("YYYY-MM-DD"),
        cellExport: row => moment(row.send_time).format("YYYY-MM-DD"),
        sortable: true,
        grow: 3
    },
    {
        name: 'Account',
        selector: row => row.accountName,
        cellExport: row => row.accountName,
        sortable: true,
    },
    {
        name: 'Name',
        selector: row => row.messageName,
        cellExport: row => row.accountName,
        sortable: true,
        grow: 5
    },
    {
        name: 'Received',
        selector: row => row["Received Email (Klaviyo)"] ? row["Received Email (Klaviyo)"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        cellExport: row => row["Received Email (Klaviyo)"] ? row["Received Email (Klaviyo)"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        sortable: true,
    },
    {
        name: 'Opened',
        selector: row => row["Opened Email (Klaviyo)"] ? row["Opened Email (Klaviyo)"]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        cellExport: row => row["Opened Email (Klaviyo)"] ? row["Opened Email (Klaviyo)"]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        sortable: true,
    },
    {
        name: 'Open %',
        selector: row => row.openPercent.toFixed(2),
        cellExport: row => row.openPercent.toFixed(2),
        sortable: true,
    },
    {
        name: 'Clicked',
        selector: row => row["Clicked Email (Klaviyo)"] ? row["Clicked Email (Klaviyo)"]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        cellExport: row => row["Clicked Email (Klaviyo)"] ? row["Clicked Email (Klaviyo)"]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        sortable: true,
    },

    {
        name: 'Click %',
        selector: row => row.clickPercent.toFixed(2),
        cellExport: row => row.clickPercent.toFixed(2),
        sortable: true,
    },
]

const DEFAULT_FLOW_HEADERS = [
    {
        name: 'Flow',
        selector: row => row.label,
        cellExport: row => row.label,
        sortable: true,
        grow: 5
    },
    {
        name: 'Received',
        selector: row => row["Received Email (Klaviyo)"] ? row["Received Email (Klaviyo)"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        cellExport: row => row["Received Email (Klaviyo)"] ? row["Received Email (Klaviyo)"].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        sortable: true,
    },
    {
        name: 'Opened',
        selector: row => row["Opened Email (Klaviyo)"] ? row["Opened Email (Klaviyo)"]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        cellExport: row => row["Opened Email (Klaviyo)"] ? row["Opened Email (Klaviyo)"]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        sortable: true,
    },
    {
        name: 'Open %',
        selector: row => row.openPercent ? row.openPercent.toFixed(2) : 0,
        cellExport: row => row.openPercent ? row.openPercent.toFixed(2) : 0,
        sortable: true,
    },
    {
        name: 'Clicked',
        selector: row => row["Clicked Email (Klaviyo)"] ? row["Clicked Email (Klaviyo)"]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        cellExport: row => row["Clicked Email (Klaviyo)"] ? row["Clicked Email (Klaviyo)"]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0,
        sortable: true,
    },

    {
        name: 'Click %',
        selector: row => row.clickPercent ? row.clickPercent.toFixed(2) : 0,
        cellExport: row => row.clickPercent ? row.clickPercent.toFixed(2) : 0,
        sortable: true,
    },
    {
        name: 'SMS Sends',
        selector: row => row["Received SMS (Klaviyo)"] ? row["Received SMS (Klaviyo)"] : 0,
        cellExport: row => row["Received SMS (Klaviyo)"] ? row["Received SMS (Klaviyo)"] : 0,
        sortable: true,
    },
]


export { COLOURS, BLANK_SHEET, DEFAULT_CAMPAIGN_HEADERS, DEFAULT_FLOW_HEADERS };
