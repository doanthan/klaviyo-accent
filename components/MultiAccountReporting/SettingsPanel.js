
import {
    Form, Button, Row, Col, Card,
    CardHeader, Modal, ModalBody, ModalHeader, ModalFooter, FormGroup, Label
} from "reactstrap";
import { useEffect, useState } from 'react'

import ReactDataSheet from "react-datasheet";
import { set, useForm } from "react-hook-form";



function SettingsPanel({ grid, setGrid, handleUnsubscribe }) {
    const [modal, setModal] = useState(false);
    const [email, setEmail] = useState("")
    const toggle = () => setModal(!modal);

    const { control, handleSubmit, register, reset } = useForm();

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
        console.log(email)
    }


    const unsubscribeProfile = async () => {
        console.log(email)
        console.log("HELLO!")
        await handleUnsubscribe(email);
        setEmail("")
    }

    const deleteProfile = async () => {
        console.log(email)
        console.log("HELLO!")
        await handleUnsubscribe(email, true);
        setEmail("")
        toggle()
    }



    return (
        <Form>
            <Row>

                <Col xs='8'>

                    <Card>
                        <CardHeader className='text-center'>
                            Load Klaviyo Keys
                        </CardHeader>


                        <ReactDataSheet
                            data={grid}
                            valueRenderer={(cell) => cell.value}
                            onCellsChanged={(changes) => {
                                const newGrid = grid;
                                changes.forEach(({ cell, row, col, value }) => {
                                    newGrid[row][col] = { ...newGrid[row][col], value };
                                });
                                setGrid(newGrid);
                            }}
                            onContextMenu={(e, cell, i, j) =>
                                cell.readOnly ? e.preventDefault() : null
                            }
                            className="dataSheet"
                        />




                    </Card>
                </Col>
                <Col xs='4'>
                    <FormGroup>
                        <Label for="email">Email to Suppress</Label>
                        <input className="form-control" name="email" id="email" onChange={handleEmailChange} value={email} />
                    </FormGroup>
                    <div className="text-center pb-3">
                        <Button onClick={unsubscribeProfile} color="primary">
                            Unsubscribe
                        </Button>
                    </div>
                    <div className="text-center pb-3">
                        <Button onClick={toggle} color="danger">
                            Delete Profile
                        </Button>
                    </div>
                    <Modal isOpen={modal} toggle={toggle}>
                        <ModalHeader toggle={toggle}>Delete Profile</ModalHeader>
                        <ModalBody>
                            This will delete the Profile and all their events of this email address from your Klaviyo accounts. Are you sure?
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" onClick={deleteProfile}>
                                Delete!
                            </Button>{' '}
                            <Button color="secondary" onClick={toggle}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </Modal>

                </Col>
            </Row>
        </Form>
    )
}

export default SettingsPanel