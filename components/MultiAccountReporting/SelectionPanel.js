import React, { forwardRef, useEffect, useRef, useState } from "react"
import Select from "react-select";
import { Row, Col, Label, Input, FormGroup, ListInlineItem, List } from 'reactstrap'
import axios from "axios";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

function SelectionPanel({ metricsList, setMetrics, metrics, setFromToDates, fromToDates, oldMetrics, setOldMetrics, cadence, setCadence, tally, setTally, results, setResults, labels, setLabels }) {

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

    const getBulkMetricAggregates = async (body, stateTally = tally) => {
        if (metrics.length > 0) {
            try {
                const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}getBulkMetricAggregates`, body)
                const formattedDateArray = data.dateArray.map(date => moment(date).format("DD-MMM-YYY"))

                setLabels(formattedDateArray)
                if (stateTally === "sum_value") {
                    //const res = data.newResults.map(temp => metrics.map(metric => metric.label === temp.label))
                    const joined = data.newResults.map((item, i) => Object.assign({}, item, metrics[i]));
                    let conversionResults = []
                    joined.map(result => conversionResults.push({ label: result.label, values: result.values.map(value => value * result.conversion) }))
                    await setResults(conversionResults)
                } else {
                    setResults(data.newResults)
                }

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
                metrics
            }
            await getBulkMetricAggregates(body)
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

    const changeMetrics = async (newMetrics, action) => {
        if (action.action === 'clear') {
            await setOldMetrics([])
            await setMetrics([])
            await setResults([])
        } else {
            await setOldMetrics(metrics)
            await setMetrics(newMetrics)
        }

    }

    const getMetricAggregates = async (pk, metricCode, label, conversion = 1) => {
        const from = moment(fromToDates[0]).format("YYYY-MM-DDTHH:mm:ss")
        const to = moment(fromToDates[1]).format("YYYY-MM-DDTHH:mm:ss")
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}getMetricAggregates?privateKey=${pk}&metric=${metricCode}&from=${from}&to=${to}&cadence=${cadence}&tally=${tally}`)
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

            const newResults = {}
            if (tally === "count") {
                newResults = { label, values: data.data[0].measurements.count }
            }
            if (tally === "unique") {
                newResults = { label, values: data.data[0].measurements.unique }
            }
            if (tally === "sum_value") {
                const values = await data.data[0].measurements.sum_value.map(value => value * conversion)
                newResults = { label, values }
            }
            const newSet = [...results, newResults]
            await setResults(newSet)

        } catch (e) {

            // keep calling if rate limited
            if (e.response?.status === 429) {
                getMetricAggregates(pk, metricCode, label, conversion)
            } else {
                console.log(e.message)
            }
        }
    }

    const removeMetric = async (remove) => {
        const removedList = await results.filter(result => result.label !== remove.label)
        setResults(removedList)
    }


    useEffect(() => {
        // the added a metric
        if (oldMetrics?.length < metrics?.length) {
            const added = metrics.filter((element) => !oldMetrics.includes(element));
            metricsList.find((element) => element.name)
            getMetricAggregates(added[0].pk, added[0].value, added[0].label, added[0].conversion)

        }
        //they removed a metric
        if (oldMetrics?.length > metrics?.length) {
            const removed = oldMetrics.filter((element) => !metrics.includes(element));
            removeMetric(removed[0])
        }
    }, [metrics])


    const changeCadence = async (value) => {
        setCadence(value)
        const from = moment(fromToDates[0]).format("YYYY-MM-DDTHH:mm:ss")
        const to = moment(fromToDates[1]).format("YYYY-MM-DDTHH:mm:ss")
        console.log(value)
        const body = {
            cadence: value,
            from,
            to,
            value,
            tally,
            metrics
        }

        await getBulkMetricAggregates(body)
    }

    const changeTally = async (value) => {
        setTally(value)
        const from = moment(fromToDates[0]).format("YYYY-MM-DDTHH:mm:ss")
        const to = moment(fromToDates[1]).format("YYYY-MM-DDTHH:mm:ss")
        const body = {
            cadence,
            from,
            to,
            tally: value,
            metrics
        }

        await getBulkMetricAggregates(body, value)
    }


    return (
        <Row className='py-2'>
            <Col xs='12' >
                <Label>Select your Metrics here </Label>
                <Select options={metricsList} isMulti closeMenuOnSelect={false} onChange={changeMetrics}></Select>
            </Col>

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
                    minDate={sixMonthsAgo}
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
                    <ListInlineItem
                        tag="a"
                        href="#"
                        onClick={() => setRange(threeMonthsAgo, today)}
                    >
                        Past 3 Months
                    </ListInlineItem>
                    <ListInlineItem
                        tag="a"
                        href="#"
                        onClick={() => setRange(sixMonthsAgo, today)}
                    >
                        Past 6 Months
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
                    <FormGroup className='p-2' check>
                        <Label check>
                            <input type="radio" name="radio2" onChange={() => changeCadence("month")} /> Monthly
                        </Label>
                    </FormGroup>
                </Row>

            </Col>

        </Row>
    )
}

export default SelectionPanel