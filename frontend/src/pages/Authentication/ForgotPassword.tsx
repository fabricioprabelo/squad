import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, Card, CardBody, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { IS_DEVELOPMENT, SITE_NAME } from "../../configs/constants";
import useAuth from "../../hooks/auth";
import LoginLayout from "../../layouts/LoginLayout";
import SweetAlert from "sweetalert2";
import { gql } from "@apollo/client";
import { ForgotPassword as ForgotPasswordModel } from "../../models/Account"

interface IForgotPasswordQuery {
  forgotPassword: ForgotPasswordModel;
}

export default function ForgotPassword() {
  const isMountedRef = useRef<boolean>(false);
  const { client, apolloError } = useAuth();
  const history = useHistory();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: "E-mail e senha são obrigatórios.",
      });
      return;
    }

    const url = `${window.location.protocol}//${window.location.hostname}${(IS_DEVELOPMENT ? ":" + 3000 : "")}/reset-password?code={code}&email={email}`;

    setLoading(true);
    await client.query<IForgotPasswordQuery>({
      query: gql`
        query forgotPassword($email: String!, $url: String!) {
          forgotPassword(email: $email, url: $url) {
            code
            url
            previewUrl
            expires
          }
        }
      `,
      variables: { email, url }
    })
      .then(res => {
        SweetAlert.fire({
          title: "Sucesso",
          icon: "success",
          text: "E-mail de redefinição de senha enviado com sucesso!",
        })
          .then(() => history.push("/login"));
      })
      .catch(err => apolloError(err));
    setLoading(false);
  }

  useEffect(() => {
    isMountedRef.current = true;
    document.title = `${SITE_NAME} :: Esqueceu sua senha?`;
    return () => { isMountedRef.current = false }
  }, []);

  return (
    <LoginLayout>
      <Card className="o-hidden border-0 shadow-lg my-5">
        <CardBody className="p-0">
          <Row>
            <Col lg="6" className="d-none d-lg-block bg-password-image"></Col>
            <Col lg="6">
              <div className="p-5">
                <div className="text-center">
                  <h1 className="h4 text-gray-900 mb-4">Esqueceu sua Senha?</h1>
                  <p className="mb-4">Nós entendemos, coisas assim acontecem.
                  Basta inserir seu endereço de e-mail abaixo e enviaremos um
                  link para redefinir sua senha!</p>
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
                    />
                  </FormGroup>
                  <Button
                    type="submit"
                    color="primary"
                    className="btn-user"
                    block
                    disabled={loading}
                  >
                    Enviar
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
