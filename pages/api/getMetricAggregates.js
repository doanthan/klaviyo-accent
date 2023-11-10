import axios from "axios";

export default async function getMetrics(req, res) {
    const { privateKey, metric, from, to, tally, cadence } = req.query;

    console.log(from)
    console.log(to)
    const header = { headers: { Authorization: `Klaviyo-API-Key ${privateKey}`, revision: process.env.NEXT_PUBLIC_KLAVIYO_API_VERSION } }
    const body = {
        data: {
            type: "metric-aggregate", attributes: {
                metric_id: metric, measurements: [tally], filter: [`greater-or-equal(datetime,${from})`, `less-than(datetime,${to})`],
                page_cursor: "",
                interval: cadence,
                page_size: 500,
                by: [],
                return_fields: [],
                timezone: "UTC"
            }
        }

    }

    try {
        const { data } = await axios.post("https://a.klaviyo.com/api/metric-aggregates/", body, header)
        return res.status(200).send(data.data.attributes);
    } catch (e) {
        console.log("ERROR")
        console.log(e.response.status)
        return res.status(e.response.status).send(e.message);
    }


}
