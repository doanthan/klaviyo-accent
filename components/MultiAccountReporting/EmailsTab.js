
import React, { useState, useEffect } from 'react'
import moment from 'moment'
import SelectionPanelCamp from './SelectionPanelCamp'
import EmailDataTable from './EmailDataTable'
import { DEFAULT_CAMPAIGN_HEADERS } from './data'
import axios from 'axios'


// {
//     conversion: 5,
//         messageId: '01H6ZP3J4J8J00XQBJCKJGHNRK',
//             total: 1,
//                 accountName: 'Adidas',
//                     pk: 'pk_76f7117c80c802c78bfedaaeacdeeba0ec',
//                         metricName: 'Opened Email',
//                             tally: 'count',
//                                 label: '(Adidas)Daily Newsletter: 2023-08-04',
//                    value: '01H6ZP3J4J8J00XQBJCKJGHNRK'
// },
function EmailsTab({ groupedMetricsList }) {


    //groupd by label
    const [tableCampaignResults, setTableCampaignResults] = useState([])
    const [columns, setColumns] = useState(DEFAULT_CAMPAIGN_HEADERS)
    //selection of results
    const [campaignResults, setCampaignResults] = useState([])
    const [fromToDates, setFromToDates] = useState([moment().subtract(7, "days").utc().startOf("day").toDate(), moment().endOf("day").toDate()])
    const [loading, setLoading] = useState(false)

    const getMetricCampaignStats = async (metricGroups, from, to) => {


        const body = { metricGroups, from, to }

        console.log("GET THISSSS!!")
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}getMetricCampaignStats`, body)
            //data = []
            // {
            //     conversion: 5,
            //         messageId: '01H6ZP3J4J8J00XQBJCKJGHNRK',
            //             total: 1,
            //                 accountName: 'Adidas',
            //                     pk: 'pk_76f7117c80c802c78bfedaaeacdeeba0ec',
            //                         metricName: 'Opened Email',
            //                             tally: 'count',
            //                                 label: '(Adidas)Daily Newsletter: 2023-08-04',
            //                    value: '01H6ZP3J4J8J00XQBJCKJGHNRK'
            // },
            console.log(data.length)
            // merge the downloaded results based on label name
            const result = data.reduce((acc, value) => {
                const fIndex = acc.findIndex(v => v.label === value.label);
                if (fIndex >= 0) {
                    acc[fIndex] = {
                        ...acc[fIndex],
                        ...value
                    }
                } else {
                    acc.push(value);
                }
                return acc;
            }, []);


            //add click % for first load (no campaign results exist...)
            let finalResults = []
            await result.map(row => {
                if (row["Received Email (Klaviyo)"]) {
                    finalResults.push({ ...row, openPercent: row["Opened Email (Klaviyo)"] / row["Received Email (Klaviyo)"] * 100, clickPercent: row["Clicked Email (Klaviyo)"] / row["Received Email (Klaviyo)"] * 100 })
                }
            })
            setCampaignResults(finalResults)


        } catch (e) {
            console.log(e.message)
        }

    }

    useEffect(() => {
        //console.log(campaignResults)
    }, [campaignResults])



    return (
        <>
            <SelectionPanelCamp groupedMetricsList={groupedMetricsList} setCampaignResults={setCampaignResults} getMetricCampaignStats={getMetricCampaignStats} campaignResults={campaignResults} tableCampaignResults={tableCampaignResults} setTableCampaignResults={setTableCampaignResults} setColumns={setColumns} columns={columns} fromToDates={fromToDates} setFromToDates={setFromToDates} loading={loading} setLoading={setLoading} />
            <EmailDataTable tableCampaignResults={campaignResults} columns={columns} loading={loading} />
        </>
    )
}

export default EmailsTab