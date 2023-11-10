import React from 'react'
import DataTable from 'react-data-table-component';
import moment from "moment";
import { Button, Row } from 'reactstrap'
import DataTableExtensions from '@/node_modules/react-data-table-component-extensions';
import '@/node_modules/react-data-table-component-extensions/dist/index.css';




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



