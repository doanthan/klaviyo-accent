
import {
    Form, Button, Row, Col, Card,
    CardHeader
} from "reactstrap";
import { useState } from 'react'

import ReactDataSheet from "react-datasheet";



function SettingsPanel({ handleSubmit, onSubmit, pkList, grid, setGrid }) {

    return (
        <Row>
            <Col xs='8'>
                <Card>
                    <CardHeader className='text-center'>
                        Load Klaviyo Keys
                    </CardHeader>

                    <Form onSubmit={handleSubmit(onSubmit)}>
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

                        <div className="text-center py-3">
                            <Button type="submit" color="primary" className="btn-lg ">
                                Submit List
                            </Button>
                        </div>
                    </Form>


                </Card>
            </Col>
            <Col xs='4'>
                <h5>Klaviyo PK's loaded {pkList.length}</h5>
                {
                    pkList.map((pk) => {
                        return <p key={pk.name}>[{pk.name}] {`pk_xxx...${pk.value.substring(33)}`} added! ✅ </p>;
                    })
                }

            </Col>
        </Row>
    )
}

export default SettingsPanel