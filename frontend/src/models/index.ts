export interface Model {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeleteModel extends Model {
  deletedAt: string | null;
}
