import axios from "axios";
import { useState, useEffect } from "react";

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
import Settings from "components/MultiAccountReporting/SettingsPanel";
import Reports from "components/MultiAccountReporting/ReportingPanel";
import { BLANK_SHEET } from 'components/MultiAccountReporting/data'


const MultiAccountReporting = ({ }) => {

  const [activeTab, setActiveTab] = useState("Settings");
  const [grid, setGrid] = useState(BLANK_SHEET);
  //selection of results
  const [campaignResults, setCampaignResults] = useState([])

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const [pkList, setPkList] = useState([])
  const [metricsList, setMetricsList] = useState([])
  const [groupedMetricsList, setGroupedMetricsList] = useState([])

  const [loading, setLoading] = useState(false)




  // wheb pl list changes, download new Campaigns
  useEffect(() => {
    setLoading(true)
    const campaignStatMetrics = []
    groupedMetricsList.map(metric => {
      if ((metric.name === "Received Email" || metric.name === "Opened Email" ||
        metric.name === "Clicked Email" || metric.name === "Received Email") && metric.integration === 'Klaviyo') {
        campaignStatMetrics.push(metric)
      }
    })

    getMetricCampaignStats(campaignStatMetrics)
    setLoading(false)
  }, [pkList])

  const getMetricCampaignStats = async (metricGroups, tally = "count", newAdd = false) => {

    const threeMonthsAgo = moment()
      .subtract(12, "month")
      .utc()
      .endOf("month")
      .startOf("day")
      .format("YYYY-MM-DDTHH:mm:ss");

    const today = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss");
    const body = { metricGroups, from: threeMonthsAgo, to: today, tally }

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

      // merge the downloaded results based on label name
      let res = {}
      data.forEach(a => res[a.label] = { ...res[a.label], ...a });
      res = Object.values(res);

      //add click % for first load (no campaign results exist...)

      if (!newAdd) {
        let finalResults = []
        await res.map(row => {
          if (row["Received Email (Klaviyo)"]) {
            finalResults.push({ ...row, openPercent: row["Opened Email (Klaviyo)"] / row["Received Email (Klaviyo)"] * 100, clickPercent: row["Clicked Email (Klaviyo)"] / row["Received Email (Klaviyo)"] * 100 })
          }
        })
        setCampaignResults(finalResults)
      }

      // adding a new metric campaign result
      if (newAdd) {
        const map = new Map();
        campaignResults.forEach(item => map.set(item.label, item));
        res.forEach(item => map.set(item.label, { ...map.get(item.label), ...item }));
        const mergedArr = Array.from(map.values());
        console.log(mergedArr)
        setCampaignResults(mergedArr)
      }


    } catch (e) {
      console.log(e.message)
    }

  }



  // array format with 'clean array'
  // name: 'aus', value: 'pk_23ew', conversion: 1
  const addPk = async (pkArrayToPost) => {
    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}loadMetrics`, pkArrayToPost)
    console.log(pkArrayToPost)
    setPkList([...pkList, ...pkArrayToPost])
    setMetricsList([...metricsList, ...data])

    // group by name and integration and add an array of objects
    const joinedMetrics = [...data.reduce((r, o) => {
      const key = o.name + '-' + o.integration;
      const item = r.get(key) || Object.assign({}, { label: `${o.name} (${o.integration})`, value: `${o.name} (${o.integration})`, name: o.name, integration: o.integration, metrics: [] });
      item.metrics = [...item.metrics, { conversion: o.conversion, value: o.value, pk: o.pk, accountName: o.account, integration: o.integration }]
      return r.set(key, item);
    }, new Map).values()];

    groupedMetricsList ?
      setGroupedMetricsList([...groupedMetricsList, ...joinedMetrics]) : setGroupedMetricsList([joinedMetrics])



  }

  const { control, handleSubmit } = useForm();


  const onSubmit = async () => {

    let accountList = []
    //remove if existing in state
    grid.map(async account => {
      if (!account[0].readOnly && account[0].value && account[1].value) {
        accountList.push({ name: account[0].value, value: account[1].value, conversion: account[2].value == "" ? 1 : parseFloat(account[2].value) })
      }
    })

    // remove if duplicate pk key in upload sheet
    let uploadList = [];
    accountList.filter(function (item) {
      let i = uploadList.findIndex(x => (x.value == item.value || x.name == item.name));
      if (i <= -1) {
        uploadList.push(item);
      }
      return null;
    });

    //check if already exists
    let finalUploadList = [];
    uploadList.map(account => {
      const isExistingPK = pkList.map(pk => { return pk.value }).includes(account.value)
      const isExistingName = pkList.map(pk => { return pk.name }).includes(account.name)
      if (!isExistingPK && !isExistingName) {
        finalUploadList.push(account)
      }
    })
    //state management is hard
    const newGrid = [
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
    setGrid(newGrid);
    if (finalUploadList.length > 0) {
      await addPk(finalUploadList)
    }
  };

  return (
    <Container className="px-4">

      <div className="text-center mt-40">
        <h1>Multi Account Reporting</h1>
        <hr className="mt-40" />
      </div>
      <div>
        <Nav tabs className="no-bottom-border nav-justified mx-6">
          <NavItem>
            <NavLink
              className={classnames(
                { active: activeTab === "Settings" },
                "clickable"
              )}
              onClick={() => {
                toggle("Settings");
              }}
            >
              <h6>Settings</h6>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames(
                { active: activeTab === "Reports" },
                "clickable"
              )}
              onClick={() => {
                toggle("Reports");
              }}
            >
              <h6>Reports</h6>
            </NavLink>
          </NavItem>

        </Nav>
        <TabContent className="mx-5" activeTab={activeTab}>
          <TabPane tabId="Settings">
            <Settings handleSubmit={handleSubmit} onSubmit={onSubmit} pkList={pkList} grid={grid} setGrid={setGrid} />
          </TabPane>
          <TabPane tabId="Reports">
            <Reports metricsList={metricsList} groupedMetricsList={groupedMetricsList} getMetricCampaignStats={getMetricCampaignStats} campaignResults={campaignResults} loading={loading} />
          </TabPane>


        </TabContent>
      </div>




    </Container>
  );
};

export default MultiAccountReporting;

export const getServerSideProps = async ({ query }) => {

  return {
    props: {},
  };
};

