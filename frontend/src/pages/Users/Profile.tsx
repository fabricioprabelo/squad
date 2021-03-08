import { gql, useMutation, useQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../hooks/auth";
import SweetAlert from "sweetalert2";
import Loading from "../../components/Loading";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Input, InputGroup, InputGroupAddon, Label, Row } from "reactstrap";
import { GRAPHQL_SERVER, MAX_UPLOAD_SIZE, MAX_UPLOAD_SIZE_BYTES, SITE_NAME } from "../../configs/constants";
import styled from 'styled-components';

const AvatarImage = styled.img`
  max-width: 100%;
  border-radius: 50%;
`;

const StyledDiv = styled.div`
  margin-top: 15px;
  width: 75px;
  max-width: 100%;
`;

const StyledDivNoPhoto = styled.div`
  margin-top: 15px;
`;

const StyledBtnDelete = styled.button`
  position: absolute;
  width: 32px;
  text-align: center;
  border-radius: 6px;
  cursor: pointer;
`;

const USER_PROFILE = gql`
  query profile {
    profile {
      id
      name
      surname
      email
      isActivated
      isSuperAdmin
      photo
      claims {
        claimType
        claimValue
      }
      roles {
        id
        name
        description
      }
    }
  }
`;

const SINGLE_UPLOAD_MUTATION = gql`
  mutation uploadProfilePhoto ($file: Upload!) {
    uploadProfilePhoto (file: $file) {
      photo
    }
  }
`;

export default function Profile() {
  const isMountedRef = useRef<boolean>(false);
  const { client, apolloError, setUserData } = useAuth();
  const [pageTitle, setPageTitle] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loadingChange, setLoadingChange] = useState<boolean>(false);

  const [file, setFile] = useState<File>();
  const [uploadFileMutation] = useMutation(SINGLE_UPLOAD_MUTATION);
  const [fileTarget, setFileTarget] = useState<EventTarget & HTMLInputElement>();

  const [photoUrl, setPhotoUrl] = useState<string>("");

  const { loading, error, data } = useQuery(USER_PROFILE);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingChange(true);
    let data = {
      name,
      surname,
      email,
      password,
    };

    await client.mutate({
      mutation: gql`
        mutation updateProfile($data: ProfileInput!) {
          updateProfile(data: $data) {
            id
            name
            surname
            email
            isActivated
            isSuperAdmin
            photo
            claims {
              claimType
              claimValue
            }
            roles {
              id
              name
              description
            }
          }
        }
      `,
      variables: {
        data
      },
    })
      .then(res => {
        setUserData(res.data.updateProfile);
      })
      .catch(err => apolloError(err));
    setLoadingChange(false);
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setFileTarget(e.target)
      if (file.type.startsWith("image/")) {
        setFile(file); // storing file
      } else if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        SweetAlert.fire({
          title: "Erro",
          icon: "error",
          text: `Tamanho do arquivo excede o tamanho máximo permitido de ${MAX_UPLOAD_SIZE}MB.`,
        });
        e.target.value = "";
      } else if (!file.type.startsWith("image/")) {
        SweetAlert.fire({
          title: "Erro",
          icon: "error",
          text: "O tipo de arquivo selecionado não é permitido.",
        });
        e.target.value = "";
      }
    }
  }

  async function handleUpload() {
    if (!file) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: "Você deve selecionar um arquivo primeiro.",
      });
      setLoadingChange(false);
      return;
    }
    setLoadingChange(true);
    await uploadFileMutation({ variables: { file } })
      .then(res => {
        client.resetStore();
        SweetAlert.fire({
          title: "Sucesso",
          icon: "success",
          text: "Foto de perfil atualizada com sucesso.",
        });
        setPhotoUrl(GRAPHQL_SERVER + "/upload/" + res.data.uploadProfilePhoto.photo);
        setUserData({
          ...data.profile,
          photo: res.data.uploadProfilePhoto.photo
        })
        if (fileTarget)
          fileTarget.value = "";
      })
      .catch(err => {
        if (fileTarget)
          fileTarget.value = "";
        apolloError(err);
      });
    setLoadingChange(false);
  }

  async function handleDeleteAvatar() {
    SweetAlert.fire({
      title: "Erro",
      text: "Tem certeza que deseja remover sua foto de perfil?",
      icon: "error",
      cancelButtonText: "Não",
      confirmButtonText: "Sim",
      reverseButtons: true,
      showCancelButton: true,
    })
      .then(async ({ isConfirmed }) => {
        if (isConfirmed) {
          await client.mutate({
            mutation: gql`
                mutation deleteProfilePhoto {
                  deleteProfilePhoto {
                    photo
                }
              }
            `,
          })
            .then(res => {
              setPhotoUrl("");
              setUserData({
                ...data.profile,
                photo: null
              });
            })
            .catch(err => apolloError(err));
        }
      });
  }

  useEffect(() => {
    isMountedRef.current = true;

    const title = "Meu perfil";
    setPageTitle(title);
    document.title = `${SITE_NAME} :: ${title}`;

    if (error) apolloError(error);
    setLoadingChange(loading);
    if (!loading && isMountedRef.current) {
      setName(data.profile.name || "");
      setSurname(data.profile.surname || "");
      setEmail(data.profile.email || "");
      setPhotoUrl(!!data.profile.photo ? GRAPHQL_SERVER + "/upload/" + data.profile.photo : "");
      setLoadingChange(false);
    }

    return () => { isMountedRef.current = false };
  }, [error, apolloError, data, loading]);

  return (
    <>
      <Breadcrumbs title={pageTitle} />
      <Card className="shadow mb-4">
        <CardHeader className="py-3">
          <h6 className="m-0 font-weight-bold text-primary">{pageTitle}</h6>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            {loading ? <Loading /> : (
              <>
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
                        disabled={loading || loadingChange}
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
                        disabled={loading || loadingChange}
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
                        disabled={loading || loadingChange}
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
                        disabled={loading || loadingChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <Label className="col-form-label">
                        Atualizar foto
                      </Label>
                      <InputGroup>
                        <Input
                          type="file"
                          accept=".png,.jpg,.jpeg"
                          className="form-control"
                          disabled={loading || loadingChange}
                          onChange={handleFileChange}
                        />
                        <InputGroupAddon addonType="append">
                          <Button type="button" disabled={loading || loadingChange} onClick={handleUpload} color="primary">
                            <i className="fa fa-upload"></i>
                            Upload
                          </Button>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <Label className="col-form-label">
                        Foto de perfil
                      </Label>
                      {photoUrl ? (
                        <StyledDiv>
                          <AvatarImage src={photoUrl} alt={`${name} ${surname}`} />
                          <StyledBtnDelete className="btn-danger" disabled={loading || loadingChange} type="button" onClick={handleDeleteAvatar}>
                            <i className="fa fa-times"></i>
                          </StyledBtnDelete>
                        </StyledDiv>
                      ) : (
                        <StyledDivNoPhoto>
                          Nenhuma foto foi enviada ainda.
                        </StyledDivNoPhoto>
                      )}
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col className="text-right">
                    <Button type="submit" disabled={loading || loadingChange} color="primary">
                      <i className="fa fa-save"></i>
                      Salvar
                    </Button>
                  </Col>
                </Row>
              </>
            )}
          </Form>
        </CardBody>
      </Card>
    </>
  );
}
