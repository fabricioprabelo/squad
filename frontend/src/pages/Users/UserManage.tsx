import { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { CrudParam } from "../../configs/route";
import useAuth from "../../hooks/auth";
import SweetAlert from "sweetalert2";
import { ACCESS_DENIED, SITE_NAME } from "../../configs/constants";
import { gql } from "@apollo/client";
import User from "../../models/User";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Input, Form, Button, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { Accordion } from "react-bootstrap";
import classnames from 'classnames';
import Loading from "../../components/Loading";
import Permission from "../../models/Permission";
import Claim from "../../models/Claim";
import Role from "../../models/Role";

interface IUserQuery {
  user: User;
}

interface IPermissionsQuery {
  permissions: Permission[];
}

interface IRolesDropdownQuery {
  rolesDropdown: Role[];
}

export default function UserManage() {
  const history = useHistory();
  const { hasPermission, client, apolloError } = useAuth();
  const { id } = useParams<CrudParam>();
  const [pageTitle, setPageTitle] = useState<string>("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<boolean>(() => !!id);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<any>({});
  const [claims, setClaims] = useState<string[]>([]);
  const [selectedClaims, setSelectedClaims] = useState<any>({});
  const [canView] = useState<boolean>(() => hasPermission("Users:User"));
  const [canCreate] = useState<boolean>(() => hasPermission("Users:Create"));
  const [canUpdate] = useState<boolean>(() => hasPermission("Users:Update"));

  function toggleTab(tab: number) {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const checkedRoles = (role: string) => (selectedRoles.hasOwnProperty(role) ? selectedRoles[role] : false)
  function handleRoles(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const index = userRoles.indexOf(value);
    if (index >= 0) {
      userRoles.splice(index, 1);
      setUserRoles(userRoles);
    } else {
      userRoles.push(value);
      setUserRoles(userRoles);
    }
    setSelectedRoles({ ...selectedRoles, [value]: e.target.checked });
  }

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
        history.push("/users");
        return;
      } else if (!preview && !canUpdate) {
        accessDenied();
        history.push("/users");
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
        client.query<IRolesDropdownQuery>({
          query: gql`
            query rolesDropdown {
              rolesDropdown {
                id
                description
              }
            }
          `,
        }),
        client.query<IUserQuery>({
          query: gql`
            query user($id: String!) {
              user(id: $id) {
                name
                surname
                email
                isActivated
                roles {
                  id
                }
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
          setRoles(res[1].data.rolesDropdown || []);
          setName(res[2].data.user.name || "");
          setSurname(res[2].data.user.surname || "");
          setEmail(res[2].data.user.email || "");
          setPassword(res[2].data.user.password || "");
          setIsActivated(res[2].data.user.isActivated || false);
          if (res[2].data.user.roles?.length) {
            let rolesObj = {};
            let rolesArray: string[] = [];
            for (const role of res[2].data.user.roles) {
              rolesArray.push(role.id);
              rolesObj = { ...rolesObj, [role.id]: true };
            }
            setUserRoles(rolesArray);
            setSelectedRoles(rolesObj);
          }
          if (res[2].data.user.claims?.length) {
            let claimsObj = {};
            let claimsArray: string[] = [];
            for (const claim of res[2].data.user.claims) {
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
        history.push("/users");
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
        client.query<IRolesDropdownQuery>({
          query: gql`
            query rolesDropdown {
              rolesDropdown {
                id
                description
              }
            }
          `,
        }),
      ])
        .then(res => {
          setPermissions(res[0].data.permissions || []);
          setRoles(res[1].data.rolesDropdown || []);
        })
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
      surname,
      email,
      password,
      isActivated,
      roleIds: userRoles,
      claims: claimsArray
    };

    if (!id) {
      await client.mutate({
        mutation: gql`
          mutation createUser($data: UserInput!) {
            createUser(data: $data) {
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
            text: "Usuário criado com sucesso.",
          })
            .then(() => history.push(`/users/manage/${res.data.createUser.id}`))
        })
        .catch(err => apolloError(err));
    } else {
      await client.mutate({
        mutation: gql`
          mutation updateUser($id: String!, $data: UserInput!) {
            updateUser(id: $id, data: $data) {
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
            text: "Usuário atualizado com sucesso.",
          })
            .then(() => history.push(`/users`));
        })
        .catch(err => apolloError(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    const title = preview
      ? "Visualizar usuário"
      : id
        ? "Atualizar usuário"
        : "Criar usuário";
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
                      Regras
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === 3 })}
                      onClick={() => { toggleTab(3); }}
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
                            onChange={(e) => setName(e.target.value)}
                            disabled={preview}
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col>
                        <FormGroup>
                          <Label for="surname" className="col-form-label">
                            Sobrenome
                          </Label>
                          <Input
                            id="surname"
                            type="text"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            disabled={preview}
                            required
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label for="email" className="col-form-label">
                            E-mail
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={preview}
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col>
                        <FormGroup>
                          <Label for="password" className="col-form-label">
                            Senha
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={preview}
                            required={!!!id}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <FormGroup>
                          <div className="custom-control custom-checkbox small">
                            <Input
                              type="checkbox"
                              checked={isActivated}
                              onChange={(e) => setIsActivated(e.target.checked)}
                              className="custom-control-input" id="isActivated" />
                            <Label
                              for="isActivated"
                              className="custom-control-label">
                              Ativo
                            </Label>
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId={2}>
                    <Row>
                      {roles?.map((role, index) => (
                        <Col
                          key={`col-role-${index}`}
                          md="3"
                          className="mb-5"
                        >
                          <FormGroup
                            key={`form-group-${index}`}
                          >
                            <div
                              key={`form-group-div-${index}`}
                              className="custom-control custom-checkbox small"
                            >
                              <Input
                                key={role.id}
                                type="checkbox"
                                value={role.id}
                                checked={checkedRoles(role.id)}
                                onChange={handleRoles}
                                className="custom-control-input"
                                id={role.id}
                                disabled={preview}
                              />
                              <Label
                                for={role.id}
                                className="custom-control-label">
                                {role.description}
                              </Label>
                            </div>
                          </FormGroup>
                        </Col>
                      ))}
                    </Row>
                  </TabPane>
                  <TabPane tabId={3}>
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
                                          disabled={preview}
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
                      onClick={() => history.push("/users")}
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
