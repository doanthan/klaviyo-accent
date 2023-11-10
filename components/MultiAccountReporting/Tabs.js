import React, { useState } from "react";

import {
    TabContent,
    TabPane,
    Nav,
    NavItem,
    NavLink,
    Badge,

} from "reactstrap";
import classnames from "classnames";

import FlowsTab from "./FlowsTab";
import Overall from "./Overall";
import EmailsTab from "./EmailsTab";
import SavedReports from "./SavedReports";

const Tabs = ({ metricsList, groupedMetricsList, campaignResults, getMetricCampaignStats, loading }) => {
    const [activeTab, setActiveTab] = useState("Overall");

    const toggle = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    return (
        <div>
            <Nav tabs className="no-bottom-border nav-justified mx-6">
                <NavItem>
                    <NavLink
                        className={classnames(
                            { active: activeTab === "Overall" },
                            "clickable"
                        )}
                        onClick={() => {
                            toggle("Overall");
                        }}
                    >
                        <h6>Overall</h6>
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={classnames(
                            { active: activeTab === "Flows" },
                            "clickable"
                        )}
                        onClick={() => {
                            toggle("Flows");
                        }}
                    >
                        <h6>Flows</h6>
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={classnames(
                            { active: activeTab === "Email Campaigns" },
                            "clickable"
                        )}
                        onClick={() => {
                            toggle("Email Campaigns");
                        }}
                    >
                        <h6>Email Campaigns</h6>
                    </NavLink>
                </NavItem>

                {/* <NavItem>
                    <NavLink
                        className={classnames(
                            { active: activeTab === "Saved Reports" },
                            "clickable"
                        )}
                        onClick={() => {
                            toggle("Saved Reports");
                        }}
                    >
                        <h6>Saved Reports</h6>
                    </NavLink>
                </NavItem> */}
            </Nav>
            <TabContent className="mx-5" activeTab={activeTab}>
                <TabPane tabId="Overall">
                    <Overall metricsList={metricsList} />
                </TabPane>
                <TabPane tabId="Flows">
                    <FlowsTab groupedMetricsList={groupedMetricsList} />
                </TabPane>
                <TabPane tabId="Email Campaigns">
                    <EmailsTab groupedMetricsList={groupedMetricsList} campaignResults={campaignResults} loading={loading} getMetricCampaignStats={getMetricCampaignStats} />
                </TabPane>
                <TabPane tabId="Saved Reports">
                    <SavedReports />
                </TabPane>
            </TabContent>
        </div>
    );
};

export default Tabs;
