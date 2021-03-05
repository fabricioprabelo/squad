import { gql } from "@apollo/client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import Breadcrumbs from "../../components/Breadcrumbs";
import { DATE_TIME_FORMAT, RECORDS_PER_PAGE, SITE_NAME } from "../../configs/constants";
import useAuth from "../../hooks/auth";
import { IDataTableColumn } from "react-data-table-component";
import DateTime from "../../support/DateTime";
import SweetAlert from "sweetalert2";
import Listing from "../../components/Listing";
import IPagination from "../../interfaces/IPagination";
import User from "../../models/User";

interface UserFilter {
  name?: string;
  email?: string;
}

interface IPaginatedUsers {
  paging: IPagination;
  list: User[];
}

interface IUsersQuery {
  users: IPaginatedUsers;
}

export default function Users() {
  const history = useHistory();
  const { hasPermission, client, apolloError } = useAuth();
  const [selectedRows, setSelectedRows] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [toggleCleared, setToggleCleared] = useState<boolean>(false);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(RECORDS_PER_PAGE);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<number>(1);
  const [filters, setFilters] = useState<UserFilter>({});
  const [filters2, setFilters2] = useState<UserFilter>({});
  const [canDelete] = useState<boolean>(() => hasPermission("Users:Delete"));

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoaded(false);
    setFilters2(filters);
  };

  const handleData = useCallback(async () => {
    setLoading(true);
    if (!loaded)
      await client.query<IUsersQuery>({
        query: gql`
        query users($sortDir: Int, $sortBy: String, $perPage: Int, $page: Int, $filterByName: String, $filterByEmail: String) {
          users(sortDir: $sortDir, sortBy: $sortBy, perPage: $perPage, page: $page, filterByName: $filterByName, filterByEmail: $filterByEmail) {
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
              surname
              email
              isActivated
            }
          }
        }
      `,
        variables: {
          page,
          perPage,
          sortBy,
          sortDir,
          filterByName: filters2?.name,
          filterByEmail: filters2?.email
        }
      })
        .then(res => {
          setTotal(res.data.users.paging.total);
          setPage(res.data.users.paging.currentPage);
          setPerPage(res.data.users.paging.perPage);
          setData(res.data.users.list);
        })
        .catch(err => apolloError(err));
    setLoading(false);
    setLoaded(true);
  }, [client, apolloError, page, perPage, sortBy, sortDir, filters2, loaded]);

  const tableColumns: IDataTableColumn<User>[] = [
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
      name: "Sobrenome",
      selector: "surname",
      sortable: true,
      center: false,
    },
    {
      name: "E-mail",
      selector: "email",
      sortable: true,
      center: false,
    },
    {
      name: "Ativo",
      selector: "isActivated",
      sortable: true,
      center: true,
      format: (row) => {
        return row.isActivated
          ? "Sim"
          : "Não"
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

  const handleUpdateRecord = (row: User) => {
    if (hasPermission("Users:User"))
      history.push(`/users/manage/${row.id}`);
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
                  mutation deleteUser($id: String!) {
                    deleteUser(id: $id) {
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
    document.title = `${SITE_NAME} :: Usuários`;
    if (!loaded)
      handleData();
  }, [handleData, loaded]);

  return (
    <>
      <Breadcrumbs title="Usuários" />
      <Card className="shadow mb-4">
        <CardHeader className="py-3">
          <h6 className="m-0 font-weight-bold text-primary">Lista de usuários</h6>
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
              <Col>
                <FormGroup>
                  <Label className="col-form-label">
                    E-mail
                  </Label>
                  <Input
                    type="text"
                    value={filters?.email || ""}
                    disabled={loading}
                    onChange={(e) => {
                      setFilters({ ...filters, email: e.target.value });
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
