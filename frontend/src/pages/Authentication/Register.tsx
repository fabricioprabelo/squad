import { FormEvent, useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Button, Card, CardBody, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { SITE_NAME } from "../../configs/constants";
import useAuth from "../../hooks/auth";
import LoginLayout from "../../layouts/LoginLayout";
import SweetAlert from "sweetalert2";
import { gql } from "@apollo/client";
import User from "../../models/User";

interface IRegisterQuery {
  register: User;
}

export default function Register() {
  const { client, apolloError } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: "Nome é obrigatório.",
      });
      return;
    }
    if (!surname.trim()) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: "Sobrenome é obrigatório.",
      });
      return;
    }
    if (!email.trim()) {
      SweetAlert.fire({
        title: "Erro",
        icon: "error",
        text: "E-mail é obrigatório.",
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

    const data = {
      name,
      surname,
      email,
      password,
      passwordConfirmation,
    };

    setLoading(true);
    await client.mutate<IRegisterQuery>({
      mutation: gql`
        mutation register($data: RegisterInput!) {
          register(data: $data) {
            email
          }
        }
      `,
      variables: { data }
    })
      .then(res => {
        SweetAlert.fire({
          title: "Sucesso",
          icon: "success",
          text: "Usuário registrado com sucesso! Você já pode efetuar conectar-se.",
        })
          .then(() => history.push("/login"));
      })
      .catch(err => apolloError(err));
    setLoading(false);
  }

  useEffect(() => {
    document.title = `${SITE_NAME} :: Cadastro`;
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
                  <h1 className="h4 text-gray-900 mb-4">Esqueceu Sua Senha?</h1>
                  <p className="mb-4">Nós entendemos, coisas assim acontecem.
                  Basta inserir seu endereço de e-mail abaixo e enviaremos um
                  link para redefinir sua senha!</p>
                </div>
                <Form className="user" onSubmit={handleSubmit}>
                  <FormGroup>
                    <Label for="name">Nome</Label>
                    <Input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-control-user"
                      placeholder="Digite seu nome.."
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="surname">Sobrenome</Label>
                    <Input
                      type="text"
                      id="surname"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className="form-control-user"
                      placeholder="Digite seu sobrenome.."
                      required
                    />
                  </FormGroup>
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
                  <FormGroup>
                    <Label for="password">Senha</Label>
                    <Input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value?.trim())}
                      className="form-control-user"
                      placeholder="Digite sua senha.."
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="passwordConfirmation">Confirmar senha</Label>
                    <Input
                      type="password"
                      id="passwordConfirmation"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value?.trim())}
                      className="form-control-user"
                      placeholder="Confirme sua senha.."
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
                    Registrar
                  </Button>
                </Form>
                <div className="text-center">
                  <hr />
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
