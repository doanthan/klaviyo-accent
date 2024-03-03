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

import Settings from "components/MultiAccountReporting/SettingsPanel";

import { BLANK_SHEET } from 'components/MultiAccountReporting/data'


const MultiAccountReporting = ({ }) => {

  const [responses, setResponses] = useState([]);

  const [activeTab, setActiveTab] = useState("Unsubscribe");
  const [grid, setGrid] = useState(BLANK_SHEET);
  const [loading, setLoading] = useState(false)



  const handleUnsubscribe = async (email, isForgetMe = false) => {
    setLoading(true)
    console.log(email)
    let newReponses = []
    setResponses(newReponses)
    if (!isForgetMe) {
      newReponses.push(`Unsubscribing ${email} from all accounts...`)
      for (const line of grid) {
        if (!line[0].readOnly && line[0].value != "") {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}unsubscribe?email=${email}&pk=${line[0].value}`)
          console.log(data.reponse)
          newReponses.push(`${line[0].value} has response: ${data.response}`)
        }
      }
    }

    if (isForgetMe) {
      newReponses.push(`Completely removing ${email} from all accounts...`)
      for (const line of grid) {
        if (!line[0].readOnly && line[0].value != "") {
          const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}delete?email=${email}&pk=${line[0].value}`)
          newReponses.push(`${line[0].value} has response: ${data.response}`)
        }
      }
      setResponses(newReponses)
    }

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
    setLoading(false)
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
            <Settings grid={grid} setGrid={setGrid} handleUnsubscribe={handleUnsubscribe} responses={responses} loading={loading} />
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

