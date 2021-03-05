import { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { CrudParam } from "../../configs/route";
import useAuth from "../../hooks/auth";
import SweetAlert from "sweetalert2";
import { ACCESS_DENIED, SITE_NAME } from "../../configs/constants";
import { gql } from "@apollo/client";
import Role from "../../models/Role";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Input, Form, Button, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { Accordion } from "react-bootstrap";
import classnames from 'classnames';
import Loading from "../../components/Loading";
import Permission from "../../models/Permission";
import Claim from "../../models/Claim";

interface IRoleQuery {
  role: Role;
}

interface IPermissionsQuery {
  permissions: Permission[];
}

export default function RoleManage() {
  const history = useHistory();
  const { hasPermission, client, apolloError } = useAuth();
  const { id } = useParams<CrudParam>();
  const [pageTitle, setPageTitle] = useState<string>("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [claims, setClaims] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<boolean>(() => !!id);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [selectedClaims, setSelectedClaims] = useState<any>({});
  const [canView] = useState<boolean>(() => hasPermission("Roles:Role"));
  const [canCreate] = useState<boolean>(() => hasPermission("Roles:Create"));
  const [canUpdate] = useState<boolean>(() => hasPermission("Roles:Update"));

  function toggleTab(tab: number) {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const defaultRole = () => (name === 'admin' || name === 'common');
  const checkedClaim = (claim: string) => (selectedClaims.hasOwnProperty(claim) ? selectedClaims[claim] : false)

  function handleClaims(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const index = claims.indexOf(value);
    if (index >= 0) {
      claims.splice(index, 1);
      setClaims(claims);
    } else {
      claims.push(value);
      setClaims(claims);
    }
    setSelectedClaims({ ...selectedClaims, [value]: e.target.checked });
  }

  const accessDenied = () => SweetAlert.fire({
    title: "Erro",
    icon: "error",
    text: ACCESS_DENIED,
  });

  const handleData = useCallback(async () => {
    if (id) {
      if (preview && !canView) {
        accessDenied();
        history.push("/roles");
        return;
      } else if (!preview && !canUpdate) {
        accessDenied();
        history.push("/roles");
        return;
      }
      setLoading(true);
      await Promise.all([
        client.query<IPermissionsQuery>({
          query: gql`
            query permissions {
              permissions {
                module
                claims
              }
            }
          `,
        }),
        client.query<IRoleQuery>({
          query: gql`
            query role($id: String!) {
              role(id: $id) {
                name
                description
                claims {
                  claimType
                  claimValue
                }
              }
            }
          `,
          variables: {
            id
          },
        })
      ])
        .then(res => {
          setPermissions(res[0].data.permissions || []);
          setName(res[1].data.role.name || "");
          setDescription(res[1].data.role.description || "");
          if (res[1].data.role.claims?.length) {
            let claimsObj = {};
            let claimsArray: string[] = [];
            for (const claim of res[1].data.role.claims) {
              claimsArray.push(`${claim.claimType}:${claim.claimValue}`);
              claimsObj = { ...claimsObj, [`${claim.claimType}:${claim.claimValue}`]: true };
            }
            setClaims(claimsArray);
            setSelectedClaims(claimsObj);
          }
        })
        .catch(err => apolloError(err));
      setLoading(false);
    } else {
      if (!preview && !canCreate) {
        accessDenied();
        history.push("/roles");
        return;
      }
      setLoading(true);
      await client.query<IPermissionsQuery>({
        query: gql`
          query permissions {
            permissions {
              module
              claims
            }
          }
        `,
      })
        .then(res => setPermissions(res.data.permissions || []))
        .catch(err => apolloError(err));
      setLoading(false);
    }
  }, [id, preview, client, apolloError, history, canView, canCreate, canUpdate]);

  async function handleSubmit() {
    setLoading(true);

    let claimsArray: Claim[] = [];
    if (claims.length) {
      for (const claim of claims) {
        const ex = claim.split(":");
        const claimType = ex[0];
        const claimValue = ex[1];
        if (claimType && claimValue)
          claimsArray.push({
            claimType,
            claimValue,
          } as Claim);
      }
    }

    const data = {
      name,
      description,
      claims: claimsArray
    };

    if (!id) {
      await client.mutate({
        mutation: gql`
          mutation createRole($data: RoleInput!) {
            createRole(data: $data) {
                id
            }
          }
        `,
        variables: {
          data
        },
      })
        .then(res => {
          SweetAlert.fire({
            title: "Sucesso",
            icon: "success",
            text: "Regra criado com sucesso.",
          })
            .then(() => history.push(`/roles/manage/${res.data.createRole.id}`))
        })
        .catch(err => apolloError(err));
    } else {
      await client.mutate({
        mutation: gql`
          mutation updateRole($id: String!, $data: RoleInput!) {
            updateRole(id: $id, data: $data) {
                id
            }
          }
        `,
        variables: {
          id,
          data
        },
      })
        .then(() => {
          SweetAlert.fire({
            title: "Sucesso",
            icon: "success",
            text: "Regra atualizado com sucesso.",
          })
            .then(() => history.push(`/roles`));
        })
        .catch(err => apolloError(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    const title = preview
      ? "Visualizar regra"
      : id
        ? "Atualizar regra"
        : "Criar regra";
    setPageTitle(title);

    document.title = `${SITE_NAME} :: ${title}`;
    handleData();
  }, [handleData, preview, id]);

  return (
    <>
      <Breadcrumbs title={pageTitle} />
      <Card className="shadow mb-4">
        <CardHeader className="py-3">
          <h6 className="m-0 font-weight-bold text-primary">{pageTitle}</h6>
        </CardHeader>
        <CardBody>
          <Form onSubmit={(e) => e.preventDefault()}>
            {loading ? <Loading /> : (
              <>
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 1 })}
                      onClick={() => { toggleTab(1); }}
                    >
                      Dados
                </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 2 })}
                      onClick={() => { toggleTab(2); }}
                    >
                      Permissões
                </NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId={1}>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label for="name" className="col-form-label">
                            Nome
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => !defaultRole() && setName(e.target.value)}
                            disabled={preview || defaultRole()}
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col>
                        <FormGroup>
                          <Label for="description" className="col-form-label">
                            Descrição
                          </Label>
                          <Input
                            id="description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={preview}
                            required
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId={2}>
                    <Accordion defaultActiveKey="0">
                      {permissions?.map((item, index) => (
                        <Card key={`card-${index}`}>
                          <CardHeader key={`card-header-${index}`}>
                            <Accordion.Toggle as={CardHeader} eventKey="0">
                              {item.module}
                            </Accordion.Toggle>
                          </CardHeader>
                          <Accordion.Collapse eventKey="0">
                            <CardBody key={`card-body-${index}`}>
                              <Row>
                                {item.claims?.map((claim, indexClaim) => (
                                  <Col
                                    key={`card-claims-${index}-${indexClaim}`}
                                    md="3"
                                    className="mb-5"
                                  >
                                    <FormGroup
                                      key={`card-claims-form-group-${index}-${indexClaim}`}
                                    >
                                      <div
                                        key={`card-claims-form-group-div-${index}-${indexClaim}`}
                                        className="custom-control custom-checkbox small"
                                      >
                                        <Input
                                          key={`${item.module}:${claim}`}
                                          type="checkbox"
                                          value={`${item.module}:${claim}`}
                                          checked={checkedClaim(`${item.module}:${claim}`)}
                                          onChange={handleClaims}
                                          className="custom-control-input"
                                          id={`${item.module}:${claim}`}
                                          disabled={preview || defaultRole()}
                                        />
                                        <Label
                                          for={`${item.module}:${claim}`}
                                          className="custom-control-label">
                                          {claim}
                                        </Label>
                                      </div>
                                    </FormGroup>
                                  </Col>
                                ))}
                              </Row>
                            </CardBody>
                          </Accordion.Collapse>
                        </Card>
                      ))}
                    </Accordion>
                  </TabPane>
                </TabContent>
                <Row>
                  <Col>
                    <Button
                      type="button"
                      color="danger"
                      onClick={() => history.push("/roles")}
                    >
                      <i className="fa fa-arrow-left"></i>
                    Cancelar
                </Button>
                  </Col>
                  {canUpdate ? (
                    <Col className="text-right">
                      {preview ? (
                        <Button
                          type="button"
                          color="primary"
                          disabled={loading}
                          onClick={() => {
                            setPreview(!preview);
                            return false;
                          }}
                        >
                          <i className="fa fa-edit"></i>
                      Editar
                        </Button>
                      ) : (
                        <Button type="button" disabled={loading} color="primary" onClick={handleSubmit}>
                          <i className="fa fa-save"></i>
                      Salvar
                        </Button>
                      )}
                    </Col>) : ""}
                </Row>
              </>
            )}
          </Form>
        </CardBody>
      </Card>
    </>
  );
}
