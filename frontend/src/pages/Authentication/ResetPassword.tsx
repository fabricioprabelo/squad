import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Button, Card, CardBody, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { SITE_NAME } from "../../configs/constants";
import useAuth from "../../hooks/auth";
import LoginLayout from "../../layouts/LoginLayout";
import SweetAlert from "sweetalert2";
import { gql } from "@apollo/client";
import queryString from "query-string";
import User from "../../models/User";

interface IResetPasswordQuery {
  resetPassword: User;
}

export default function ResetPassword() {
  const isMountedRef = useRef<boolean>(false);
  const { client, apolloError } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: "E-mail é obrigatório.",
      });
      return;
    }
    if (!code.trim()) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: "Código de redefinição é obrigatório.",
      });
      return;
    }
    if (!password.trim()) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: "Nova senha é obrigatória.",
      });
      return;
    }
    if (!passwordConfirmation.trim()) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: "Confirmar nova senha é obrigatória.",
      });
      return;
    }
    if (passwordConfirmation.trim() !== password.trim()) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: "As senhas não conferem.",
      });
      return;
    }

    setLoading(true);
    await client.mutate<IResetPasswordQuery>({
      mutation: gql`
        mutation resetPassword($email: String!, $code: String!, $password: String!) {
          resetPassword(email: $email, code: $code, password: $password) {
            id
            email
          }
        }
      `,
      variables: { email, code, password }
    })
      .then(res => {
        SweetAlert.fire({
          title: "Sucesso",
          icon: "success",
          text: "Senha redefinida com sucesso!",
        })
          .then(() => history.push("/login"));
      })
      .catch(err => apolloError(err));
    setLoading(false);
  }

  useEffect(() => {
    isMountedRef.current = true;
    document.title = `${SITE_NAME} :: Redefinição de senha`;

    const query = queryString.parse(location.search);
    const email: string = String(query?.email || "");
    let token: string = String(query?.code || "");
    token = encodeURIComponent(token);

    setEmail(email || "");
    setCode(token || "");
    return () => { isMountedRef.current = false }
  }, [location]);

  return (
    <LoginLayout>
      <Card className="o-hidden border-0 shadow-lg my-5">
        <CardBody className="p-0">
          <Row>
            <Col lg="6" className="d-none d-lg-block bg-password-image"></Col>
            <Col lg="6">
              <div className="p-5">
                <div className="text-center">
                  <h1 className="h4 text-gray-900 mb-4">Redefinir Senha</h1>
                </div>
                <Form className="user" onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="email">E-mail</Label>
                    <Input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value?.trim()?.toLowerCase())}
                      className="form-control-user"
                      placeholder="Digite seu e-mail.."
                      required
                      disabled={!!email}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="code">Código de redefinição</Label>
                    <Input
                      type="text"
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value?.trim())}
                      className="form-control-user"
                      placeholder="Digite o código de redefinição.."
                      required
                      disabled={!!code}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="password">Nova senha</Label>
                    <Input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value?.trim())}
                      className="form-control-user"
                      placeholder="Digite sua nova senha.."
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="passwordConfirmation">Confirmar nova senha</Label>
                    <Input
                      type="password"
                      id="passwordConfirmation"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value?.trim())}
                      className="form-control-user"
                      placeholder="Confirme sua nova senha.."
                      required
                    />
                  </FormGroup>
                  <Button
                    type="submit"
                    color="primary"
                    className="btn-user"
                    block
                    disabled={loading}
                  >
                    Redefinir senha
                  </Button>
                </Form>
                <div className="text-center">
                  <hr />
                  <div>
                    <Link to="/register" className="small">Cadastre-se</Link>
                  </div>
                  <div>
                    <Link
                      to="/login"
                      className="small"
                    >
                      já tem uma conta? Conecte-se!
                  </Link>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </LoginLayout>
  );
}
