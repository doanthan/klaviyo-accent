import axios from "axios";

const requestResults = async (url, header, body, allResponseData) => {
    try {
        const { data } = await axios.post(url, body, header)
        allResponseData.labels = data.data.attributes.dates
        allResponseData.values = [...allResponseData.values, ...data.data.attributes.data]

        //iterate through multiple linked pages
        if (!data.data.links.next) {
            return allResponseData
        }
        else {
            return requestResults(data.data.links.next, header, body, allResponseData)
        }
    } catch (e) {
        //keep retrying if 429 (rate limit)
        if (e.response?.status === 429) {
            requestResults(url, header, body, allResponseData)
        } else {
            console.log(e)
            return null
        }
    }
}

// [
//     {
//         label: 'Opened Email (Klaviyo)',
//         value: 'Opened Email (Klaviyo)',
//         name: 'Opened Email',
//         integration: 'Klaviyo',
//         metrics: [[Object], [Object], [Object]]
//     }
// ]

export default async function getMetricCampaignStats(req, res) {
    const { metricGroups, from, to } = req.body;
    console.log(from)
    console.log(to)
    // {
    //     value: 'PH3fu8',
    //         label: '[Adidas] Bounced Email (Klaviyo)',
    //             name: 'Bounced Email',
    //                 account: 'Adidas',
    //                     integration: 'Klaviyo',
    //                         pk: 'pk_76f7117c80c802c78bfedaaeacdeeba0ec',
    //                             conversion: 5
    // },
    let results = []

    let allMetrics = []
    let uniquePk = []
    metricGroups.map(metric => { metric.metrics.map(el => allMetrics.push(el.pk)) })
    function onlyUnique(value, index, array) {
        return array.indexOf(value) === index;
    }

    if (allMetrics.length > 0) {
        uniquePk = allMetrics.filter(onlyUnique);
    }
    console.log(uniquePk)




    for (let metricGroup of metricGroups) {
        const url = `https://a.klaviyo.com/api/metric-aggregates/`
        let tally = "sum_value"
        if (metricGroup) {

            // klaviyo integration should always be count!
            if (metricGroup.integration === 'Klaviyo') {
                tally = "unique"
            }
            for (let metric of metricGroup.metrics) {

                let allResponseData = { labels: "", values: [] }
                const header = { headers: { Authorization: `Klaviyo-API-Key ${metric.pk}`, revision: process.env.NEXT_PUBLIC_KLAVIYO_API_VERSION } }
                const body = {
                    data: {
                        type: "metric-aggregate", attributes: {
                            metric_id: metric.value, measurements: [tally], filter: [`greater-or-equal(datetime,${from})`, `less-than(datetime,${to})`],
                            page_cursor: "",
                            interval: "month",
                            page_size: 500,
                            // if sum_value, it will be $attributed_message
                            by: [tally === "sum_value" ? "$attributed_message" : "$message"],
                            return_fields: [],
                            timezone: "UTC"
                        }
                    }

                }

                const values = await requestResults(url, header, body, allResponseData)
                // if (metric.value === "Xw2wpw") {
                //     console.log(values)
                // }

                if (values) {
                    for (let record of values.values) {
                        //ignore blank dimensions- nobody wants to see that! (I think)
                        //console.log(record.dimensions[0])
                        if (record.dimensions[0] != "") {
                            //set the conversion rate
                            if (tally === "sum_value") {

                                results.push({ conversion: metric.conversion, messageId: record.dimensions[0], [metricGroup.label]: record.measurements.sum_value.reduce((partialSum, a) => partialSum + a, 0) * metric.conversion, accountName: metric.accountName, pk: metric.pk, metricName: metricGroup.label, tally })
                            }
                            if (tally === "count") {
                                results.push({ conversion: metric.conversion, messageId: record.dimensions[0], [metricGroup.label]: record.measurements.count.reduce((partialSum, a) => partialSum + a, 0), accountName: metric.accountName, pk: metric.pk, metricName: metricGroup.label, tally })
                            }
                            if (tally === "unique") {
                                results.push({ conversion: metric.conversion, messageId: record.dimensions[0], [metricGroup.label]: record.measurements.unique.reduce((partialSum, a) => partialSum + a, 0), accountName: metric.accountName, pk: metric.pk, metricName: metricGroup.label, tally })
                            }
                        }
                    }
                }


            }
        }

    }

    //results = [] ->
    // {
    //     conversion: 5,
    //         messageId: '01GPANTQRW4MWTJZMZ275ZQY13',
    //             total: 8801,
    //                 accountName: 'Nike',
    //                     pk: 'pk_f83b65ee77e047287f365c66ebe3cd18e0',
    //                         metricName: 'Opened Email (Klaviyo)'
    // },

    //get Message Names
    const campaignUrl = `https://a.klaviyo.com/api/campaigns/?filter=equals(messages.channel,'email'),equals(status,'Sent'),greater-or-equal(created_at,${from})&fields[campaign]=id,name,send_time`
    let campaignNameList = []
    for (let pk of uniquePk) {
        const header = { headers: { Authorization: `Klaviyo-API-Key ${pk}`, revision: process.env.NEXT_PUBLIC_KLAVIYO_API_VERSION } }
        try {
            const { data } = await axios.get(campaignUrl, header)
            campaignNameList = [...campaignNameList, ...data.data]
        } catch (e) {
            console.log(e.message)
        }

    }

    // Join the names
    let finalResults = []
    for (let result of results) {
        campaignNameList.map(campaign => {
            if (campaign.id === result.messageId) {
                finalResults.push({ ...result, label: `(${result.accountName})${campaign.attributes.name}`, value: result.messageId, send_time: campaign.attributes.send_time, messageName: campaign.attributes.name })
            }
        })
    }
    // console.log(finalResults)

    return res.status(200).send(finalResults);


    // try {
    //     const { data } = await axios.post("https://a.klaviyo.com/api/metric-aggregates/", body, header)
    //     return res.status(200).send(data.data.attributes);
    // } catch (e) {
    //     console.log("ERROR")
    //     console.log(e.response.status)
    //     return res.status(e.response.status).send(e.message);
    // }


}
