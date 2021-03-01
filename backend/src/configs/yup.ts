import * as Yup from "yup";
import { capitalize } from "./constants";

Yup.setLocale({
  mixed: {
    default: ({ path }) => `${capitalize(path)} é inválido.`,
    required: ({ path }) => `${capitalize(path)} é um campo obrigatório.`,
    oneOf: ({ path, values }) =>
      `${capitalize(path)} deve ser um dos seguintes valores: ${values}.`,
    notOneOf: ({ path, values }) =>
      `${capitalize(path)} não pode ser um dos seguintes valores: ${values}.`,
    notType: ({ path, type }) =>
      `${capitalize(path)} deve ser do tipo "${type}".`,
  },
  string: {
    length: ({ path, length }) =>
      `${capitalize(path)} deve ter exatamente ${length} caracteres.`,
    min: ({ path, min }) =>
      `${capitalize(path)} deve ter pelo menos ${min} caracteres.`,
    max: ({ path, max }) =>
      `${capitalize(path)} deve ter no máximo ${max} caracteres.`,
    matches: ({ path, regex }) =>
      `${capitalize(path)} deve corresponder ao seguinte: "${regex}".`,
    email: ({ path }) => `${capitalize(path)} tem o formato inválido.`,
    url: ({ path }) => `${capitalize(path)} deve ter um formato de URL válida.`,
    uuid: ({ path }) => `${capitalize(path)} deve ser um UUID válido.`,
    trim: ({ path }) =>
      `${capitalize(path)} não deve conter espaços no início ou no fim.`,
    lowercase: ({ path }) => `${capitalize(path)} deve estar em maiúsculo.`,
    uppercase: ({ path }) => `${capitalize(path)} deve estar em minúsculo.`,
  },
  number: {
    min: ({ path, min }) => `${capitalize(path)} deve ser no mínimo ${min}.`,
    max: ({ path, max }) => `${capitalize(path)} deve ser no máximo ${max}.`,
    lessThan: ({ path, less }) =>
      `${capitalize(path)} deve ser menor que ${less}.`,
    moreThan: ({ path, more }) =>
      `${capitalize(path)} deve ser maior que ${more}.`,
    positive: ({ path }) => `${capitalize(path)} deve ser um número posítivo.`,
    negative: ({ path }) => `${capitalize(path)} deve ser um número negativo.`,
    integer: ({ path }) => `${capitalize(path)} deve ser um número inteiro.`,
  },
  date: {
    min: ({ path, min }) =>
      `${capitalize(path)} deve ser maior que a data ${min}.`,
    max: ({ path, max }) =>
      `${capitalize(path)} deve ser menor que a data ${max}.`,
  },
  object: {
    noUnknown: ({ path }) =>
      `${capitalize(path)} campo tem chaves não especificadas.`,
  },
  array: {
    min: ({ path, min }) =>
      `${capitalize(path)} deve ter no mínimo ${min} itens.`,
    max: ({ path, max }) =>
      `${capitalize(path)} deve ter no máximo ${max} itens.`,
  },
});

export default Yup;
