import React, { forwardRef, useEffect, useMemo, useState } from "react"
import Select from "react-select";
import { Row, Col, Label, Input, Button, ListInlineItem, List, Spinner } from 'reactstrap'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { DEFAULT_CAMPAIGN_HEADERS } from './data'



// const orderOptions = (values) => {
//     return values
//         .filter((v) => (v.name === "Received Email" || "Opened Email" || "Clicked Email" || "Received Email") && metric.integration === 'Klaviyo')
//         .concat(values.filter((v) => !(v.name === "Received Email" || "Opened Email" || "Clicked Email" || "Received Email") && metric.integration === 'Klaviyo'));
// };


function SelectionPanelFlowsCamp({ getMetricCampaignStats, setCampaignResults, columns, groupedMetricsList, setColumns, campaignResults, setTableCampaignResults, loading, setLoading, fromToDates, setFromToDates, metricsLoaded }) {

    const addCampaign = async (input) => {
        setTableCampaignResults([...input])
    }

    const addMetric = async (input, action) => {
        //added
        if (action.action === 'select-option') {
            const added = input[input.length - 1]
            await setColumns([...columns, {
                name: added.label,
                selector: row => row[added.label],
                cellExport: row => row[added.label],
            },])
        }
        if (action.action === 'remove-value') {
            await setColumns([...DEFAULT_CAMPAIGN_HEADERS, ...input])
        }
        if (action.action === 'clear') {
            await setColumns(DEFAULT_CAMPAIGN_HEADERS)
        }
    }

    useEffect(() => {
        console.log(columns);
    }, [columns]);

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



    const setRange = async (fromDate, toDate) => {

        if (fromDate.getTime() != fromToDates[0].getTime() || toDate.getTime() != fromToDates[1].getTime()) {
            setFromToDates([fromDate, toDate]);
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

    const loadResults = async () => {
        setLoading(true)
        setCampaignResults([])
        const from = moment(fromToDates[0]).format("YYYY-MM-DDTHH:mm:ss")
        const to = moment(fromToDates[1]).format("YYYY-MM-DDTHH:mm:ss")
        console.log(from)
        console.log(to)
        const campaignStatMetrics = []
        groupedMetricsList.map(metric => {
            if ((metric.name === "Received Email" || metric.name === "Opened Email" || metric.name === "Clicked Email") && metric.integration === 'Klaviyo') {
                campaignStatMetrics.push(metric)
            }
            if (columns.some(function (el) { return el.name === metric.label })) {
                campaignStatMetrics.push(metric)
            }
        })
        console.log(campaignStatMetrics)
        await getMetricCampaignStats(campaignStatMetrics, from, to)
        setLoading(false)
        console.log(campaignResults)
    }



    return (
        <>
            <Row className='py-2'>
                <Col xs='12' >
                    <Label>Add Placed Order Metrics here to report </Label>
                    <Select options={groupedMetricsList} isMulti closeMenuOnSelect={false} onChange={addMetric} ></Select>
                </Col>
            </Row>
            <Row className='text-center'>
                <Col xs='12' >
                    <Label className='pr-2'>Set your date range to retrieve here:</Label>
                    <DatePicker
                        selectsRange={true}
                        startDate={fromToDates[0]}
                        endDate={fromToDates[1]}
                        onChange={(update) => {
                            setFromToDates(update);
                        }}
                        monthsShown={2}
                        maxDate={today}
                        minDate={sixMonthsAgo}
                        customInput={<CustomInput />}

                    />
                    <List>

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
                    <Button onClick={loadResults} disabled={loading}> {loading ? <Spinner>
                        Loading...
                    </Spinner> : "LOAD"} </Button>
                </Col>
            </Row>
            {
                metricsLoaded && <Col xs='12' >
                    <Label>Select Email Message to report here (from the past 3 months)</Label>
                    <Select options={campaignResults} isMulti closeMenuOnSelect={false} onChange={addCampaign} ></Select>
                </Col>

            }
        </>
    )
}

export default SelectionPanelFlowsCamp

