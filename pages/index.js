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

  const [activeTab, setActiveTab] = useState("Unsubscribe");
  const [grid, setGrid] = useState(BLANK_SHEET);
  const [email, setEmail] = useState()
  // array format with 'clean array'
  // name: 'aus', value: 'pk_23ew', conversion: 1
  const unSubscribe = async (email) => {
    console.log(email)
  }



  const handleUnsubscribe = async (email) => {
    console.log(email)

    grid.map(async line => {
      if (!line[0].readOnly && line[0].value != "") {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}unsubscribe?email=${email}&pk=${line[0].value}`)
      }
    })

    //state management is hard
    const newGrid = [
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }], [{ value: "" }],
      [{ value: "" }], [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
      [{ value: "" }],
    ];
    setGrid(newGrid);

  };

  return (
    <Container className="px-4">

      <div className="text-center mt-40">
        <h1>Accent Group - Klaviyo Portal</h1>
        <hr className="mt-40" />
      </div>
      <div>
        <Nav tabs className="no-bottom-border nav-justified mx-6">
          <NavItem>
            <NavLink
              className={classnames(
                { active: activeTab === "Unsubscribe" },
                "clickable"
              )}
              onClick={() => {
                toggle("Unsubscribe");
              }}
            >
              <h6>Suppress</h6>
            </NavLink>
          </NavItem>

        </Nav>
        <TabContent className="mx-5" activeTab={activeTab}>
          <TabPane tabId="Unsubscribe">
            <Settings grid={grid} setGrid={setGrid} handleUnsubscribe={handleUnsubscribe} />
          </TabPane>

        </TabContent>
      </div>




    </Container>
  );
}


export default MultiAccountReporting;

export const getServerSideProps = async ({ query }) => {

  return {
    props: {},
  };
};

