import React from 'react'
import DataTable from 'react-data-table-component';
import moment from "moment";
import { Button, Row } from 'reactstrap'
import DataTableExtensions from '../../react-data-table-component-extensions';





function EmailDataTable({ tableCampaignResults, columns }) {

    const tableData = {
        columns,
        data: tableCampaignResults,
    };
    return (
        <Row>
            <DataTableExtensions
                {...tableData}
                exportHeaders={true}
            >
                <DataTable
                    columns={columns}
                    data={tableCampaignResults}
                    highlightOnHover
                />
            </DataTableExtensions>
        </Row>

    )
}

export default EmailDataTable



