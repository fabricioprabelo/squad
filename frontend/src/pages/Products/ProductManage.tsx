import { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { CrudParam } from "../../configs/route";
import useAuth from "../../hooks/auth";
import SweetAlert from "sweetalert2";
import { ACCESS_DENIED, SITE_NAME } from "../../configs/constants";
import { gql } from "@apollo/client";
import Product from "../../models/Product";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Card, CardHeader, CardBody, Row, Col, FormGroup, Label, Input, Form, Button } from "reactstrap";
import NumberFormat from "react-number-format";

interface IProductQuery {
  product: Product;
}

export default function ProductManage() {
  const history = useHistory();
  const { hasPermission, client, apolloError } = useAuth();
  const { id } = useParams<CrudParam>();
  const [pageTitle, setPageTitle] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<boolean>(() => !!id);
  const [canView] = useState<boolean>(() => hasPermission("Products:Product"));
  const [canCreate] = useState<boolean>(() => hasPermission("Products:Create"));
  const [canUpdate] = useState<boolean>(() => hasPermission("Products:Update"));

  const accessDenied = () => SweetAlert.fire({
    title: "Erro",
    icon: "error",
    text: ACCESS_DENIED,
  });

  const handleData = useCallback(async () => {
    if (id) {
      if (preview && !canView) {
        accessDenied();
        history.push("/products");
        return;
      } else if (!preview && !canUpdate) {
        accessDenied();
        history.push("/products");
        return;
      }
      setLoading(true);
      await client.query<IProductQuery>({
        query: gql`
          query product($id: String!) {
            product(id: $id) {
              name
              description
              price
            }
          }
        `,
        variables: {
          id
        },
      })
        .then(res => {
          setName(res.data.product.name || "");
          setDescription(res.data.product.description || "");
          setPrice(res.data.product.price || 0);
        })
        .catch(err => apolloError(err));
      setLoading(false);
    } else {
      if (!preview && !canCreate) {
        accessDenied();
        history.push("/products");
        return;
      }
    }
  }, [id, preview, client, apolloError, history, canView, canCreate, canUpdate]);

  async function handleSubmit() {
    setLoading(true);
    const data = {
      name,
      description,
      price
    };

    if (!id) {
      await client.mutate({
        mutation: gql`
          mutation createProduct($data: ProductInput!) {
            createProduct(data: $data) {
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
            text: "Produto criado com sucesso.",
          })
            .then(res2 => {
              history.push(`/products/manage/${res.data.createProduct.id}`);
            })
        })
        .catch(err => apolloError(err));
    } else {
      await client.mutate({
        mutation: gql`
          mutation updateProduct($id: String!, $data: ProductInput!) {
            updateProduct(id: $id, data: $data) {
                id
            }
          }
        `,
        variables: {
          id,
          data
        },
      })
        .then(res => {
          SweetAlert.fire({
            title: "Sucesso",
            icon: "success",
            text: "Produto atualizado com sucesso.",
          })
            .then(res => {
              history.push(`/products`);
            });
        })
        .catch(err => apolloError(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    const title = preview
      ? "Visualizar produto"
      : id
        ? "Atualizar produto"
        : "Criar produto";
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
                  />
                </FormGroup>
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
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="price">
                    Preço
                </Label>
                  <NumberFormat
                    id="price"
                    className="form-control"
                    value={price}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    thousandsGroupStyle="thousand"
                    onValueChange={async ({ floatValue }) => {
                      setPrice(floatValue);
                    }}
                    disabled={preview}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button
                  type="button"
                  color="danger"
                  onClick={() => history.push("/products")}
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
          </Form>
        </CardBody>
      </Card>
    </>
  );
}
