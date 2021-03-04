import React from "react";
import DataTable, { IDataTableColumn } from "react-data-table-component";
import { DATATABLE_ROWS_PER_PAGE } from "../../configs/constants";
import NoData from "./NoData";
import Processing from "./Processing";
import ExpandedComponentDefault from "./ExpandedComponentDefault";
import "./index.css";

export interface TableProps<T = any> {
  title?: React.ReactNode;
  data: T[];
  total: number;
  rowsPerPage: number;
  disabled?: boolean;
  progressPending?: boolean;
  columns: IDataTableColumn<T>[];
  selectable?: boolean;
  sortServer?: boolean;
  paginationServer?: boolean;
  onSort?: (
    column: IDataTableColumn<T>,
    sortDirection: 'asc' | 'desc'
  ) => void;
  sortFunction?: (
    rows: T[],
    field: string,
    sortDirection: 'asc' | 'desc'
  ) => T[];
  defaultSortField?: string;
  defaultSortAsc?: boolean;
  onChangePage?: (page: number, totalRows: number) => void;
  onChangeRowsPerPage?: (
    currentRowsPerPage: number,
    currentPage: number
  ) => void;
  onRowClicked?: (row: T, e: MouseEvent) => void;
  onRowDoubleClicked?: (row: T, e: MouseEvent) => void;
  contextActions?: React.ReactNode | React.ReactNode[];
  onSelectedRowsChange?: (selectedRowState: {
    allSelected: boolean;
    selectedCount: number;
    selectedRows: T[];
  }) => void;
  clearSelectedRows?: boolean;
  expandableRows?: boolean;
  expandableRowsComponent?: React.ReactNode;
  subHeader?: React.ReactNode | React.ReactNode[];
  subHeaderAlign?: string;
  subHeaderWrap?: boolean;
  subHeaderComponent?: React.ReactNode | React.ReactNode[];
  children?: React.ReactNode;
}

export default function Listing<T = any>(
  props: TableProps<T>
): React.ReactElement {
  return (
    <>
      <DataTable
        title={props.title}
        data={props.data}
        columns={props.columns}
        striped
        disabled={props.disabled}
        responsive
        pointerOnHover
        highlightOnHover
        noDataComponent={<NoData />}
        onRowClicked={props.onRowClicked}
        onRowDoubleClicked={props.onRowDoubleClicked}
        selectableRows={props.selectable}
        fixedHeader
        progressPending={props.progressPending}
        progressComponent={<Processing />}
        persistTableHead
        subHeader={props.subHeader}
        subHeaderComponent={props.subHeaderComponent}
        subHeaderAlign={props.subHeaderAlign}
        subHeaderWrap={props.subHeaderWrap}
        onSort={props.onSort}
        sortFunction={props.sortFunction}
        defaultSortField={props.defaultSortField}
        defaultSortAsc={props.defaultSortAsc}
        sortServer={props.sortServer || true}
        pagination
        paginationServer={props.paginationServer || true}
        direction="auto"
        expandableRows={props.expandableRows}
        expandableRowsComponent={props.expandableRowsComponent || <ExpandedComponentDefault />}
        paginationTotalRows={props.total}
        paginationPerPage={props.rowsPerPage}
        paginationRowsPerPageOptions={DATATABLE_ROWS_PER_PAGE}
        paginationComponentOptions={{
          noRowsPerPage: false,
          rowsPerPageText: "Registros por página:",
          rangeSeparatorText: "de",
          selectAllRowsItem: false,
          selectAllRowsItemText: "Todos",
        }}
        onChangePage={props.onChangePage}
        onChangeRowsPerPage={props.onChangeRowsPerPage}
        contextActions={props.contextActions}
        contextMessage={{
          singular: "registro",
          plural: "registros",
          message: "selecionado",
        }}
        onSelectedRowsChange={props.onSelectedRowsChange}
        clearSelectedRows={props.clearSelectedRows}
      />
      {props.children}
    </>
  );
}
