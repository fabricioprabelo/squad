import { gql } from "@apollo/client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import Breadcrumbs from "../../components/Breadcrumbs";
import { DATE_TIME_FORMAT, RECORDS_PER_PAGE, SITE_NAME } from "../../configs/constants";
import useAuth from "../../hooks/auth";
import Product from "../../models/Product";
import { IDataTableColumn } from "react-data-table-component";
import { useIntl } from "react-intl";
import DateTime from "../../support/DateTime";
import SweetAlert from "sweetalert2";
import Listing from "../../components/Listing";

interface ProductsFilter {
  name?: string;
}

interface IPagination {
  total: number;
  pages: number;
  perPage: number;
  currentPage: number;
}

interface IPaginatedProducts {
  paging: IPagination;
  list: Product[];
}

interface IProductsQuery {
  products: IPaginatedProducts;
}

export default function Products() {
  const intl = useIntl();
  const history = useHistory();
  const { hasPermission, client, apolloError } = useAuth();
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [toggleCleared, setToggleCleared] = useState<boolean>(false);
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(RECORDS_PER_PAGE);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<number>(1);
  const [filters, setFilters] = useState<ProductsFilter>({});
  const [filters2, setFilters2] = useState<ProductsFilter>({});
  const [canDelete] = useState<boolean>(() => hasPermission("Products:Delete"));

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoaded(false);
    setFilters2(filters);
  };

  const handleData = useCallback(async () => {
    setLoading(true);
    if (!loaded)
      await client.query<IProductsQuery>({
        query: gql`
        query products($sortDir: Int, $sortBy: String, $perPage: Int, $page: Int, $filterByName: String) {
          products(sortDir: $sortDir, sortBy: $sortBy, perPage: $perPage, page: $page, filterByName: $filterByName) {
            paging {
              total
              pages
              perPage
              currentPage
            }
            list {
              id
              createdAt
              updatedAt
              name
              description
              price
            }
          }
        }
      `,
        variables: {
          page,
          perPage,
          sortBy,
          sortDir,
          filterByName: filters2?.name
        }
      })
        .then(res => {
          setTotal(res.data.products.paging.total);
          setPage(res.data.products.paging.currentPage);
          setPerPage(res.data.products.paging.perPage);
          setData(res.data.products.list);
        })
        .catch(err => apolloError(err));
    setLoading(false);
    setLoaded(true);
  }, [client, apolloError, page, perPage, sortBy, sortDir, filters2, loaded]);

  const tableColumns: IDataTableColumn<Product>[] = [
    {
      name: "ID",
      selector: "id",
      sortable: true,
      center: false,
      width: "240px",
    },
    {
      name: "Nome",
      selector: "name",
      sortable: true,
      center: false,
    },
    {
      name: "Preço",
      selector: "price",
      sortable: true,
      center: true,
      width: "120px",
      format: (row) => {
        return intl.formatNumber(row.price, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
      }
    },
    {
      name: "Criado em",
      selector: "createdAt",
      sortable: true,
      center: false,
      width: "180px",
      format: (row) => {
        return row.createdAt
          ? DateTime.now(row.createdAt).format(DATE_TIME_FORMAT)
          : "-"
      }
    },
    {
      name: "Atualizado em",
      selector: "updatedAt",
      sortable: true,
      center: false,
      width: "180px",
      format: (row) => {
        return row.updatedAt
          ? DateTime.now(row.updatedAt).format(DATE_TIME_FORMAT)
          : "-"
      }
    },
  ];

  const handleUpdateRecord = (row: Product) => {
    if (hasPermission("Products:Product"))
      history.push(`/products/manage/${row.id}`);
  };

  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const contextActions = useMemo(() => {
    const handleDelete = () => {
      SweetAlert.fire({
        title: "Exclusão",
        text: "Tem certeza que deseja remover os registros selecionados?",
        icon: "error",
        cancelButtonText: "Não",
        confirmButtonText: "Sim",
        reverseButtons: true,
        showCancelButton: true,
      })
        .then(async ({ isConfirmed }) => {
          if (isConfirmed) {
            for (let row of selectedRows) {
              await client.mutate({
                mutation: gql`
                  mutation deleteProduct($id: String!) {
                    deleteProduct(id: $id) {
                        id
                    }
                  }
                `,
                variables: {
                  id: row.id
                },
              })
                .then(() => {
                  SweetAlert.fire({
                    title: "Sucesso",
                    icon: "success",
                    text: "Registros removidos com sucesso!",
                  });
                })
                .catch(err => apolloError(err));
            }
            setToggleCleared(!toggleCleared);
            await handleData();
          }
        });
    };

    return (
      <button key="delete" className="btn btn-danger" onClick={handleDelete}>
        Excluir
      </button>
    );
  }, [client, apolloError, selectedRows, toggleCleared, handleData]);

  useEffect(() => {
    document.title = `${SITE_NAME} :: Produtos`;
    if (!loaded)
      handleData();
  }, [handleData, loaded]);

  return (
    <>
      <Breadcrumbs title="Produtos" />
      <Card className="shadow mb-4">
        <CardHeader className="py-3">
          <h6 className="m-0 font-weight-bold text-primary">Lista de produtos</h6>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col>
                <FormGroup>
                  <Label className="col-form-label">
                    Nome
                  </Label>
                  <Input
                    type="text"
                    value={filters?.name || ""}
                    disabled={loading}
                    onChange={(e) => {
                      setFilters({ ...filters, name: e.target.value });
                    }}
                  />
                </FormGroup>
              </Col>
              <Col className="text-right">
                <FormGroup>
                  <Label className="col-form-label" style={{ display: "block", width: "100%" }}>
                    &nbsp;
                  </Label>
                  <div>
                    <Button type="submit" disabled={loading} color="secondary">
                      <i className="fa fa-search"></i> Filtrar
                    </Button>
                  </div>
                </FormGroup>
              </Col>
            </Row>
          </Form>
          <Row>
            <Col>
              <Listing
                data={data}
                total={total}
                selectable={canDelete}
                rowsPerPage={perPage}
                progressPending={loading}
                onChangePage={(page: number) => {
                  setPage(page);
                }}
                onChangeRowsPerPage={(rowsPerPage: number) => {
                  setPage(1);
                  setPerPage(rowsPerPage);
                }}
                sortServer={true}
                onSort={async (
                  column,
                  sortDir
                ) => {
                  setSortBy(String(column.selector));
                  setSortDir(sortDir === "asc" ? 1 : -1);
                }}
                columns={tableColumns}
                onRowClicked={handleUpdateRecord}
                contextActions={contextActions}
                onSelectedRowsChange={handleRowSelected}
                clearSelectedRows={toggleCleared}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
}
