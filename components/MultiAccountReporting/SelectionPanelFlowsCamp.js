import React, { forwardRef, useEffect, useRef, useState } from "react"
import Select from "react-select";
import { Row, Col, Label, Input, FormGroup, ListInlineItem, List } from 'reactstrap'
import axios from "axios";
import { DEFAULT_FLOW_HEADERS } from './data'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

function SelectionPanelFlowsCamp({ setColumns, columns, panelType, flowList, setFlowList, groupedMetricsList, setMetrics, metrics, setFromToDates, fromToDates, oldMetrics, setOldMetrics, cadence, setCadence, tally, setTally, results, setResults, labels, setLabels, selectedFlows, setSelectedFlows }) {

    let today = moment().endOf("day").toDate();
    let weekAgo = moment().subtract(7, "days").utc().startOf("day").toDate();
    let thirtyDaysAgo = moment()
        .subtract(30, "days")
        .utc()
        .startOf("day")
        .toDate();
    let sixMonthsAgo = moment()
        .subtract(6, "month")
        .utc()
        .startOf("month")
        .startOf("day")
        .toDate();

    let threeMonthsAgo = moment()
        .subtract(3, "month")
        .utc()
        .startOf("day")
        .toDate();


    let startDate, endDate = today

    if (fromToDates) {
        [startDate, endDate] = fromToDates;
    }

    const getBulkFlowMetricAgg = async (body, stateTally = tally) => {
        if (metrics.length > 0) {
            try {
                const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}getBulkFlowAggregates`, body)
                if (data.dates != labels) {
                    let newLabels = []
                    if (cadence === "day") {
                        newLabels = data.dates.map(days => moment(days).format("DD-MMM-YY"))
                    }
                    if (cadence === "week") {
                        newLabels = data.dates.map(days => moment(days).format("dd-MMM-YY"))
                    }
                    if (cadence === "month") {
                        newLabels = data.dates.map(days => moment(days).format("MMM"))
                    }
                    await setLabels(newLabels)

                }
                await setFlowList(data.finalResults)
            } catch (e) {
                console.log(e.message)
            }
        }
    }

    const setRange = async (fromDate, toDate) => {

        if (fromDate.getTime() != fromToDates[0].getTime() || toDate.getTime() != fromToDates[1].getTime()) {
            setFromToDates([fromDate, toDate]);
            const from = moment(fromDate).format("YYYY-MM-DDTHH:mm:ss")
            const to = moment(toDate).format("YYYY-MM-DDTHH:mm:ss")
            const body = {
                from,
                to,
                cadence,
                tally,
                metricGroups: metrics,
                panelType
            }
            await getBulkFlowMetricAgg(body)
        }

    };


    const CustomInput = forwardRef(({ value, onClick }, ref) => {
        let rangeArray = value.split(" - ");
        let displayValue;
        if (rangeArray[1]) {
            let displayStart = new Date(rangeArray[0]);
            let displayEnd = new Date(rangeArray[1]);

            if (rangeArray[0] === rangeArray[1]) {
                displayValue = moment(displayStart).format("DD-MMM-YYYY");
            } else {
                if (moment(displayStart).isAfter(displayEnd)) {
                    displayValue =
                        moment(displayStart).format("MMM D YYYY") +
                        " - " +
                        moment(displayEnd).format("MMM D YYYY")

                } else {
                    displayValue =
                        moment(displayStart).format("MMM D YYYY") +
                        " - " +
                        moment(displayEnd).format("MMM D YYYY");
                }
            }
        } else {
            let displayDate = new Date(rangeArray[0]);
            displayValue = moment(displayDate).format("MMMM Do YYYY");
        }
        return (
            <Input
                id="pickInput"
                onClick={onClick}
                ref={ref}
                value={displayValue}
                onKeyDown={(e) => {
                    if (e.keyCode === 40) {
                        document.getElementById("pickInput").click();
                    }
                }}
                readOnly
            />
        );
    });

    const changeMetrics = async (input, action) => {
        if (action.action === 'select-option') {
            const added = input[input.length - 1]
            await setOldMetrics(metrics)
            await setMetrics(input)
            await setColumns([...columns, {
                name: added.label,
                selector: row => row[added.label],
                cellExport: row => row[added.label],
            },])
        }
        if (action.action === 'remove-value') {
            await setOldMetrics(metrics)
            await setMetrics(input)
            await setColumns([...DEFAULT_FLOW_HEADERS, ...input])
        }
        if (action.action === 'clear') {
            await setOldMetrics([])
            await setMetrics([])
            await setFlowList([])
            await setColumns(DEFAULT_FLOW_HEADERS)
        }
    }


    // {integration: zendesk, label: Opened Ticket (Zendesk), name: Opened Ticket, value: "Opened Ticket (Zendesk), integration:'Klaviyo", metrics:[{value, pk}]}
    const getMetricAggregates = async (metricGroup) => {
        const from = moment(fromToDates[0]).format("YYYY-MM-DDTHH:mm:ss")
        const to = moment(fromToDates[1]).format("YYYY-MM-DDTHH:mm:ss")
        console.log(metricGroup)
        const body = { from, to, tally, cadence, metricGroup, panelType }
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}getFlowAggregates`, body)
            if (data.dates != labels) {
                let newLabels = []
                if (cadence === "day" || "week") {
                    newLabels = data.dates.map(days => moment(days).format("DD-MMM-YY"))
                }
                if (cadence === "month") {
                    newLabels = data.dates.map(days => moment(days).format("MMM"))
                }
                setLabels(newLabels)
            }



            if (tally === "sum_value") {
                console.log(data.finalResults)
                let convertedResults = []
                data.finalResults.map(result => convertedResults.push({ label: result.label, values: result.values.map(value => value * (result.conversion ? result.conversion : 1)) }))
                console.log(convertedResults)
                console.log("conversionResults!!!")
                const newFlowList = [...flowList, ...convertedResults]
                await setFlowList(newFlowList)
            } else {
                const newFlowList = [...flowList, ...data.finalResults]
                await setFlowList(newFlowList)
            }



        } catch (e) {


            console.log(e.message)

        }
    }

    const removeMetric = async (remove) => {
        const removedList = await flowList.filter(flow => flow.metricName !== remove.label)
        setFlowList(removedList)
    }

    // {integration: zendesk, label: Opened Ticket (Zendesk), name: Opened Ticket, value: "Opened Ticket (Zendesk), integration:'Klaviyo", metrics:[{value, pk}]}
    useEffect(() => {
        // // the added a metric
        if (oldMetrics?.length < metrics?.length) {
            console.log("PADDED")
            const added = metrics.filter((element) => !oldMetrics.includes(element));
            groupedMetricsList.find((element) => element.name)
            getMetricAggregates(added[0])

            console.log("ADDED")

        }
        // //they removed a metric
        if (oldMetrics?.length > metrics?.length) {
            console.log("REMOVED!")

            const removed = oldMetrics.filter((element) => !metrics.includes(element));
            console.log(removed)
            removeMetric(removed[0])
        }
    }, [metrics])


    const changeCadence = async (value) => {
        setCadence(value)
        const from = moment(fromToDates[0]).format("YYYY-MM-DDTHH:mm:ss")
        const to = moment(fromToDates[1]).format("YYYY-MM-DDTHH:mm:ss")
        const body = {
            from,
            to,
            cadence: value,
            tally,
            metricGroups: metrics,
            panelType
        }
        await getBulkFlowMetricAgg(body)

    }

    const changeTally = async (value) => {
        setTally(value)
        const from = moment(fromToDates[0]).format("YYYY-MM-DDTHH:mm:ss")
        const to = moment(fromToDates[1]).format("YYYY-MM-DDTHH:mm:ss")
        const body = {
            from,
            to,
            cadence,
            tally: value,
            metricGroups: metrics,
            panelType
        }
        await getBulkFlowMetricAgg(body, value)

    }



    return (
        <Row className='py-2'>
            <Col xs='12' >
                <Label>Select your Metrics here (max: 3) </Label>
                <Select options={groupedMetricsList} isMulti closeMenuOnSelect={false} onChange={changeMetrics} isOptionDisabled={() => metrics.length >= 3} ></Select>
            </Col>
            {/* {
                metrics.length > 0 && <Col xs='12' >
                    <Label>Select your flows here </Label>
                    <Select options={flowList} isMulti closeMenuOnSelect={false} onChange={changeResults}  ></Select>
                </Col>
            } */}

            <Col xs={6}>
                <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                        setFromToDates(update);
                    }}
                    monthsShown={2}
                    maxDate={today}
                    minDate={thirtyDaysAgo}
                    customInput={<CustomInput />}

                />
                <List type="inline">
                    <ListInlineItem
                        tag="a"
                        href="#"
                        onClick={() => setRange(weekAgo, today)}
                    >
                        Past 7 Days
                    </ListInlineItem>
                    <ListInlineItem
                        tag="a"
                        href="#"
                        onClick={() => setRange(thirtyDaysAgo, today)}
                    >
                        Past 30 Days
                    </ListInlineItem>
                </List>
            </Col>
            <Col xs='6'>
                <Row xs='12'>

                    <FormGroup className='p-2 pr-5' check>
                        <Label check>
                            <input type="radio" name="radio1" defaultValue={true} defaultChecked={true} onChange={() => changeTally("count")} /> Count
                        </Label>
                    </FormGroup>
                    <FormGroup className='p-2 pr-5' check>
                        <Label check>
                            <input type="radio" name="radio1" onChange={() => changeTally("sum_value")} /> Sum Value
                        </Label>
                    </FormGroup>
                    <FormGroup className='p-2' check>
                        <Label check>
                            <input type="radio" name="radio1" onChange={() => changeTally("unique")} /> Unique
                        </Label>
                    </FormGroup>

                </Row>
                <Row xs='12'>
                    <FormGroup className='p-2 pr-5' check>
                        <Label check>
                            <input type="radio" name="radio2" defaultValue={true} onChange={() => changeCadence("day")} /> Daily
                        </Label>
                    </FormGroup>
                    <FormGroup className='p-2 pr-5' check>
                        <Label check>
                            <input type="radio" name="radio2" onChange={() => changeCadence("week")} /> Weekly
                        </Label>
                    </FormGroup>
                </Row>

            </Col>

        </Row>
    )
}

export default SelectionPanelFlowsCamp