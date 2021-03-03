export interface Model {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteModel extends Model {
  deletedAt: Date | null;
}
