import React from 'react'
import DataTable from 'react-data-table-component';
import moment from "moment";
import { Button, Row } from 'reactstrap'
import DataTableExtensions from '../../react-data-table-component-extensions';





function EmailDataTable({ reportResults, columns }) {

    const tableData = {
        columns,
        data: reportResults,
    };
    return (
        <Row>
            <DataTableExtensions
                {...tableData}
            >
                <DataTable
                    columns={columns}
                    data={reportResults}
                    highlightOnHover
                />
            </DataTableExtensions>
        </Row>

    )
}

export default EmailDataTable
