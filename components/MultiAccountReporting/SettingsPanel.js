
import {
    Form, Button, Row, Col, Card,
    CardHeader, Input, FormGroup, Label
} from "reactstrap";
import { useEffect } from 'react'

import ReactDataSheet from "react-datasheet";
import { set, useForm } from "react-hook-form";



function SettingsPanel({ grid, setGrid, handleUnsubscribe }) {

    const { control, handleSubmit, register, reset } = useForm();
    const test = async (formData) => {
        console.log(formData.email)
        await handleUnsubscribe(formData.email);
    }
    useEffect(() => {
        reset({
            email: "",
        })
    }, [handleUnsubscribe])
    return (
        <Form onSubmit={handleSubmit(test)}>
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
                        <input className="form-control" name="email" id="email" {...register('email')} />
                    </FormGroup>
                    <div className="text-center py-3">
                        <Button type="submit" color="primary">
                            Unsubscribe
                        </Button>
                    </div>


                </Col>
            </Row>
        </Form>
    )
}

export default SettingsPanel