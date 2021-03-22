import { ClassType, Field, ObjectType } from "type-graphql";
import {
  PAGING_MAX_RESULTS_PER_PAGE,
  PAGING_RESULTS_PER_PAGE,
} from "../configs/constants";

@ObjectType()
export class Paging {
  constructor(
    total: number,
    pages: number,
    perPage: number,
    currentPage: number
  ) {
    this.total = total;
    this.pages = pages;
    this.perPage = perPage;
    this.currentPage = currentPage;
  }

  @Field(() => Number)
  total: number = 0;

  @Field(() => Number)
  pages: number = 0;

  @Field(() => Number)
  perPage: number = 0;

  @Field(() => Number)
  currentPage: number = 0;
}

export class CalculatePages {
  total: number = 0;
  pages: number = 0;
  perPage: number = 0;
  currentPage: number = 0;
  offset: number = 0;

  constructor(pagina: number, perPage: number, total: number) {
    const maxPerPage = PAGING_MAX_RESULTS_PER_PAGE;
    const resultsPerPage = PAGING_RESULTS_PER_PAGE;

    const _perPage = perPage || resultsPerPage;
    perPage = _perPage > maxPerPage ? maxPerPage : _perPage;
    const totalPages = Number(Math.ceil(total / perPage));

    const _currentPage = pagina || 1;
    const currentPage = _currentPage > totalPages ? totalPages : _currentPage;
    const _pular = (currentPage - 1) * perPage;
    const pular = _pular < 0 ? 0 : _pular;

    this.total = total;
    this.pages = totalPages;
    this.perPage = perPage;
    this.currentPage = currentPage;
    this.offset = pular;
  }
}

export function PagingResult<TType>(TClass: ClassType<TType>) {
  @ObjectType({ isAbstract: true })
  abstract class PagingResultClass {
    constructor(
      total: number,
      pages: number,
      perPage: number,
      currentPage: number,
      list: TType[]
    ) {
      this.paging = new Paging(total, pages, perPage, currentPage);
      this.list = list;
    }

    @Field(() => Paging)
    paging: Paging;

    @Field(() => [TClass])
    list: TType[];
  }
  return PagingResultClass;
}
