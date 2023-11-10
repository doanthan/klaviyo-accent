import axios from "axios";
import { useState, useEffect } from "react";
import { BLANK_SHEET } from 'components/MultiAccountReporting/data'
import moment from "moment";
import {
    Form, Button, Container, Row, Col, Card, TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Badge, CardHeader
} from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import Tabs from "components/MultiAccountReporting/Tabs"
import ReactDataSheet from "react-datasheet";
import classnames from "classnames";
function ReportingPanel({ metricsList, groupedMetricsList, getMetricCampaignStats, campaignResults, loading }) {
    return (
        <Row className='pt-5'>
            <Col xs='12'>
                <Tabs metricsList={metricsList} groupedMetricsList={groupedMetricsList} getMetricCampaignStats={getMetricCampaignStats} campaignResults={campaignResults} loading={loading}></Tabs>
            </Col>
        </Row>
    )
}

export default ReportingPanel